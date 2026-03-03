# API Portfolio — AI Context Guide

> เอกสารนี้สรุปโครงสร้างและ convention ของโปรเจคเพื่อให้ AI เข้าใจได้ทันทีโดยไม่ต้องอ่านทุกไฟล์

---

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| ORM | Prisma v7 + `@prisma/adapter-pg` |
| Database | PostgreSQL (Supabase) |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Docs | Swagger / OpenAPI (`swagger-jsdoc` + `swagger-ui-express`) |

---

## โครงสร้างไฟล์

```
src/
├── app.ts                  Express app setup (middleware, routes, swagger)
├── server.ts               Entry point + graceful shutdown
├── config/
│   ├── env.ts              Environment variables (port, apiPrefix, jwtSecret, jwtExpiresIn)
│   ├── prisma.ts           Prisma client singleton
│   └── swagger.ts          Swagger config
├── routes/
│   ├── index.ts            รวม router ทั้งหมด
│   ├── auth.route.ts       POST /register, POST /login
│   ├── user.route.ts       CRUD /user
│   ├── project.route.ts    CRUD /project
│   └── health.route.ts     GET /health
├── controllers/            รับ req/res — validate input — เรียก service — return JSON
├── services/               Business logic + Prisma queries
├── middlewares/
│   ├── auth.middleware.ts  JWT authenticate (Bearer token)
│   └── error-handler.ts    Global error handler
└── types/
    └── app-error.ts        Custom AppError class
```

---

## Database Convention

ทุก model ใน `prisma/schema.prisma` ใช้ฟิลด์มาตรฐานนี้:

```prisma
model example {
  id         Int/BigInt @id @default(autoincrement())
  // ... business fields ...
  created_at DateTime   @default(now()) @db.Timestamptz(6)
  created_by String?    @db.VarChar
  updated_at DateTime?  @db.Timestamp(6)
  updated_by String?    @db.VarChar
  deleted_at DateTime?  @db.Timestamp(6)   // soft delete
  deleted_by String?    @db.VarChar
  isActive   Boolean?   @default(true)     // enable/disable
}
```

**กฎ:**
- `isActive` — ใช้เปิด/ปิดการใช้งาน (ส่งมาใน POST/PUT body)
- `deleted_at` / `deleted_by` — **Soft Delete** (ไม่ลบจริง ใช้ `prisma.xxx.update` set deleted_at = now())
- ทุก GET ต้อง filter `deleted_at: null` เสมอ

---

## Architecture Pattern

**Request flow:**
```
Route → authenticate? → Controller → Service → Prisma → DB
                                ↓ error
                           next(AppError) → error-handler → JSON response
```

**ชั้น Controller** — ทำแค่:
1. Parse / validate input
2. เรียก service
3. `res.json(...)` หรือ `next(error)`

**ชั้น Service** — ทำ:
1. Business logic
2. Prisma queries
3. throw `AppError` เมื่อเกิดปัญหา

---

## Error Handling

```ts
// ใน service หรือ controller
throw new AppError('message', statusCode)

// ใน controller catch block
} catch (error) { next(error) }
```

Global handler (`middlewares/error-handler.ts`) จับทุก error แล้ว return:
```json
{ "status": "error", "message": "..." }
```

---

## JWT Authentication

**Login → รับ token:**
```
POST /api/v1/login  →  { token, user }
```

**ใช้ token ใน protected route:**
```
Authorization: Bearer <token>
```

**ป้องกัน route:**
```ts
import { authenticate } from '../middlewares/auth.middleware';
router.post('/project', authenticate, createProject);
```

**payload ใน `req.user`:**
```ts
{ sub: number, username: string, iat: number, exp: number }
```

---

## CRUD Standard (user & project)

| Method | Endpoint | Body | คำอธิบาย |
|--------|----------|------|----------|
| GET | `/resource` | — | list (limit, offset, keyword) |
| GET | `/resource/:id` | — | get by id |
| POST | `/resource` | fields + `created_by`, `isActive?` | create |
| PUT | `/resource/:id` | fields + `updated_by`, `isActive?` | update + set updated_at |
| DELETE | `/resource/:id` | `deleted_by?` | soft delete |

---

## เพิ่ม Resource ใหม่ (checklist)

1. เพิ่ม model ใน `prisma/schema.prisma` (ใช้ฟิลด์มาตรฐาน)
2. `npx prisma generate`
3. สร้าง `src/services/xxx.service.ts`
   - filter `deleted_at: null` ใน list/get
   - `addXxx`, `editXxx` (set `updated_at`), `removeXxx` (soft delete)
4. สร้าง `src/controllers/xxx.controller.ts`
   - validate id ด้วย `/^\d+$/`
   - เรียก service, `next(error)` ใน catch
5. สร้าง `src/routes/xxx.route.ts`
   - Swagger JSDoc บนทุก route
6. เพิ่ม `router.use(xxxRoute)` ใน `src/routes/index.ts`

---

## Environment Variables

```env
DATABASE_URL=postgresql://...
PORT=3000
API_PREFIX=/api/v1
NODE_ENV=development
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
```

---

## Swagger UI

```
GET /api/v1/docs
```
