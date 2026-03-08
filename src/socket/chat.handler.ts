import http from 'http';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import env from '../config/env';
import prisma from '../config/prisma';
import { deleteFile } from '../services/upload.service';
import { JwtPayload } from '../middlewares/auth.middleware';

// ── helpers ──────────────────────────────────────────────────────────────────

function truncateFileName(name: string, max = 100): string {
  if (name.length <= max) return name;
  const dot = name.lastIndexOf('.');
  if (dot === -1) return name.slice(0, max);
  const ext = name.slice(dot);
  return name.slice(0, max - ext.length) + ext;
}

function serializeMsg(m: {
  id: bigint;
  room_id: bigint;
  sender: string;
  is_admin: boolean;
  content: string;
  file_url: string | null;
  file_name: string | null;
  is_read: boolean;
  created_at: Date;
}) {
  return {
    id: m.id.toString(),
    roomId: m.room_id.toString(),
    sender: m.sender,
    isAdmin: m.is_admin,
    content: m.content,
    fileUrl: m.file_url ?? null,
    fileName: m.file_name ?? null,
    isRead: m.is_read,
    createdAt: m.created_at,
  };
}

function serializeRoom(
  r: { id: bigint; room_key: string; username: string; created_at: Date },
  lastMsg?: { sender: string; content: string; created_at: Date } | null,
  unreadCount = 0
) {
  return {
    roomKey: r.room_key,
    username: r.username,
    createdAt: r.created_at,
    unreadCount,
    lastMessage: lastMsg
      ? { sender: lastMsg.sender, content: lastMsg.content, createdAt: lastMsg.created_at }
      : null,
  };
}

// ── setup ─────────────────────────────────────────────────────────────────────

export function setupSocket(httpServer: http.Server) {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // decode JWT if provided
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (token) {
      try {
        socket.data.user = jwt.verify(token, env.jwtSecret) as unknown as JwtPayload;
      } catch {}
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    const me = socket.data.user as JwtPayload | undefined;

    // ── USER: join own room ──────────────────────────────────────────────────
    socket.on('user_join', async () => {
      if (!me || me.isAdmin) return;

      const roomKey = `user:${me.username}`;

      // upsert room
      let room = await prisma.chat_room.findFirst({
        where: { room_key: roomKey, is_active: true },
      });

      const isNew = !room;
      if (!room) {
        room = await prisma.chat_room.create({
          data: { room_key: roomKey, username: me.username, user_id: me.sub },
        });
      }

      socket.join(`room:${roomKey}`);

      // send history
      const msgs = await prisma.chat_message.findMany({
        where: { room_id: room.id, is_active: true },
        orderBy: { created_at: 'asc' },
        take: 100,
      });
      socket.emit('room_joined', { roomKey, messages: msgs.map(serializeMsg) });

      // notify admins of new room
      if (isNew) {
        io.to('admins').emit('room_created', serializeRoom(room, null));
      }
    });

    // ── ADMIN: connect ───────────────────────────────────────────────────────
    socket.on('admin_join', async () => {
      if (!me?.isAdmin) return;

      socket.join('admins');

      const rooms = await prisma.chat_room.findMany({
        where: { is_active: true, NOT: { user: { is_admin: true } } },
        include: {
          messages: { where: { is_active: true }, orderBy: { created_at: 'desc' }, take: 1 },
          _count: { select: { messages: { where: { is_read: false, is_admin: false, is_active: true } } } },
        },
        orderBy: { created_at: 'desc' },
      });

      socket.emit(
        'room_list',
        rooms.map((r) => serializeRoom(r, r.messages[0] ?? null, r._count.messages))
      );
    });

    // ── ADMIN: open a specific room ──────────────────────────────────────────
    socket.on('admin_open_room', async ({ roomKey }: { roomKey: string }) => {
      if (!me?.isAdmin) return;

      socket.join(`room:${roomKey}`);

      const room = await prisma.chat_room.findFirst({ where: { room_key: roomKey } });
      if (!room) return;

      // mark all unread user messages as read
      await prisma.chat_message.updateMany({
        where: { room_id: room.id, is_admin: false, is_read: false },
        data: { is_read: true },
      });

      // notify the user that admin has read their messages
      socket.to(`room:${roomKey}`).emit('messages_read', { roomKey });

      // notify all admin sockets (both panels) to clear unread for this room
      io.to('admins').emit('room_read', { roomKey });

      const msgs = await prisma.chat_message.findMany({
        where: { room_id: room.id, is_active: true },
        orderBy: { created_at: 'asc' },
      });
      socket.emit('room_history', { roomKey, messages: msgs.map(serializeMsg) });
    });

    // ── ADMIN: leave room view ───────────────────────────────────────────────
    socket.on('admin_leave_room', ({ roomKey }: { roomKey: string }) => {
      socket.leave(`room:${roomKey}`);
    });

    // ── SEND MESSAGE (user or admin) ─────────────────────────────────────────
    socket.on(
      'send_message',
      async ({ roomKey, content, fileUrl, fileName }: { roomKey: string; content: string; fileUrl?: string; fileName?: string }) => {
        const trimmed = content?.trim() ?? '';
        if (!me || (!trimmed && !fileUrl)) return;

        const room = await prisma.chat_room.findFirst({
          where: { room_key: roomKey, is_active: true },
        });
        if (!room) return;

        // if admin sends, mark all unread user messages as read
        if (me.isAdmin) {
          await prisma.chat_message.updateMany({
            where: { room_id: room.id, is_admin: false, is_read: false },
            data: { is_read: true },
          });
          socket.to(`room:${roomKey}`).emit('messages_read', { roomKey });
        }

        const saved = await prisma.chat_message.create({
          data: {
            room_id: room.id,
            sender: me.username,
            is_admin: me.isAdmin ?? false,
            content: trimmed,
            file_url: fileUrl ?? null,
            file_name: fileName ? truncateFileName(fileName) : null,
          },
        });

        const payload = serializeMsg(saved);

        // broadcast to room members (user + admin who opened this room)
        io.to(`room:${roomKey}`).emit('new_message', payload);

        // also ping all admins so unread badge updates even if they haven't opened the room
        if (!me.isAdmin) {
          io.to('admins').emit('room_new_message', { ...payload, roomKey });
        }
      }
    );

    socket.on(
      'delete_message',
      async ({ roomKey, messageId }: { roomKey: string; messageId: string }) => {
        if (!me || !roomKey || !messageId || !/^\d+$/.test(messageId)) return;

        const room = await prisma.chat_room.findFirst({ where: { room_key: roomKey, is_active: true } });
        if (!room) return;

        const message = await prisma.chat_message.findFirst({
          where: { id: BigInt(messageId), room_id: room.id },
        });
        if (!message || message.sender !== me.username) return;

        await prisma.chat_message.update({
          where: { id: message.id },
          data: { is_active: false },
        });

        // ลบไฟล์จาก S3 ถ้ามี
        if (message.file_url) {
          const marker = `/object/public/${env.s3.bucket}/`;
          const idx = message.file_url.indexOf(marker);
          if (idx !== -1) {
            const key = message.file_url.slice(idx + marker.length);
            deleteFile(key).catch(() => {});
          }
        }

        const latest = await prisma.chat_message.findFirst({
          where: { room_id: room.id, is_active: true },
          orderBy: { created_at: 'desc' },
        });

        const lastMessage = latest
          ? { sender: latest.sender, content: latest.content, createdAt: latest.created_at }
          : null;

        const payload = { messageId: message.id.toString(), roomKey, lastMessage };
        io.to(`room:${roomKey}`).emit('message_deleted', payload);
        io.to('admins').emit('message_deleted', payload);
      }
    );
  });

  return io;
}
