import { NextFunction, Request, Response } from 'express';
import { uploadFile } from '../services/upload.service';
import { sendError, sendSuccess } from '../utils/response';

export async function uploadFileHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      sendError(res, 'ไม่พบไฟล์ที่อัปโหลด', 400);
      return;
    }

    const folder = (req.query.folder as string) || 'chat';
    const result = await uploadFile(req.file, folder);

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
