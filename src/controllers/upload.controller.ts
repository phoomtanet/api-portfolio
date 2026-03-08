import { NextFunction, Request, Response } from 'express';
import { uploadFile } from '../services/upload.service';

export async function uploadFileHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ status: 'error', message: 'ไม่พบไฟล์ที่อัปโหลด' });
      return;
    }

    const folder = (req.query.folder as string) || 'chat';
    const result = await uploadFile(req.file, folder);

    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
}
