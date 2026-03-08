import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

const DEFAULT_MAX_SIZE_MB = 10;

/**
 * สร้าง multer middleware สำหรับ upload ไฟล์
 * @param allowedMimeTypes - ประเภทไฟล์ที่อนุญาต เช่น ['image/jpeg', 'application/pdf']
 * @param maxSizeMB        - ขนาดสูงสุด (MB) default = 10
 */
export function createUploadMiddleware(
  allowedMimeTypes: string[],
  maxSizeMB = DEFAULT_MAX_SIZE_MB
) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (
      _req: Request,
      file: Express.Multer.File,
      cb: FileFilterCallback
    ) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`ประเภทไฟล์ไม่ถูกต้อง อนุญาตเฉพาะ: ${allowedMimeTypes.join(', ')}`));
      }
    },
  });
}

// preset สำเร็จรูปสำหรับใช้งานทั่วไป
export const uploadImage = createUploadMiddleware(
  ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  5
);

export const uploadPdf = createUploadMiddleware(
  ['application/pdf'],
  20
);

export const uploadImageOrPdf = createUploadMiddleware(
  ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  20
);
