import { Router } from 'express';
import { uploadFileHandler } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { uploadImageOrPdf } from '../middlewares/upload.middleware';

const router = Router();

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: อัปโหลดไฟล์รูปภาพหรือ PDF
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: โฟลเดอร์ปลายทางใน bucket (default = chat)
 *     responses:
 *       200:
 *         description: อัปโหลดสำเร็จ
 */
router.post('/upload', authenticate, uploadImageOrPdf.single('file'), uploadFileHandler);

export default router;
