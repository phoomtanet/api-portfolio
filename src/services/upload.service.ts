import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import s3 from '../config/s3';
import env from '../config/env';
import AppError from '../types/app-error';

export interface UploadResult {
  key: string;       // path ใน bucket  e.g. "uploads/abc123.pdf"
  url: string;       // public URL
  originalName: string;
  mimetype: string;
  size: number;
}

/**
 * อัปโหลดไฟล์เดียวไปยัง S3 / Supabase Storage
 * @param file   - Express.Multer.File (memory storage)
 * @param folder - โฟลเดอร์ปลายทางใน bucket เช่น "resumes", "projects"
 */
export async function uploadFile(
  file: Express.Multer.File,
  folder = 'uploads'
): Promise<UploadResult> {
  const ext = extname(file.originalname).toLowerCase();
  const key = `${folder}/${randomUUID()}${ext}`;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: env.s3.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
      })
    );
  } catch (err) {
    console.error('[upload] S3 PutObject error:', err);
    throw new AppError('อัปโหลดไฟล์ไม่สำเร็จ', 500);
  }

  // Supabase public URL: replace /s3 suffix with /object/public/{bucket}/{key}
  const publicBase = env.s3.uploadFileUrl.replace(/\/s3$/, '');
  const url = `${publicBase}/object/public/${env.s3.bucket}/${key}`;

  return {
    key,
    url,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  };
}

/**
 * ลบไฟล์ออกจาก S3 / Supabase Storage
 * @param key - path ใน bucket เช่น "uploads/abc123.pdf"
 */
export async function deleteFile(key: string): Promise<void> {
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: env.s3.bucket,
        Key: key,
      })
    );
  } catch {
    throw new AppError('ลบไฟล์ไม่สำเร็จ', 500);
  }
}
