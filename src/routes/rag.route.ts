import { Router } from 'express';
import {
  initializeRAG,
  addDocuments,
  retrieveDocuments,
  generateAnswer,
  getRAGStatus,
  resetRAG,
  getAllDocuments,
  searchDocuments
} from '../controllers/rag.controller';

const router = Router();

/**
 * @openapi
 * /rag/initialize:
 *   post:
 *     summary: Initialize RAG service with documents
 *     tags:
 *       - RAG
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documents
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - pageContent
 *                   properties:
 *                     pageContent:
 *                       type: string
 *                       description: Document content
 *                     metadata:
 *                       type: object
 *                       description: Optional metadata
 *     responses:
 *       200:
 *         description: RAG service initialized successfully
 *       400:
 *         description: Invalid documents format
 *       500:
 *         description: Internal server error
 */
router.post('/initialize', initializeRAG);

/**
 * @openapi
 * /rag/documents:
 *   post:
 *     summary: Add documents to existing RAG service
 *     tags:
 *       - RAG
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documents
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - pageContent
 *                   properties:
 *                     pageContent:
 *                       type: string
 *                       description: Document content
 *                     metadata:
 *                       type: object
 *                       description: Optional metadata
 *     responses:
 *       200:
 *         description: Documents added successfully
 *       400:
 *         description: Invalid documents format or RAG not initialized
 *       500:
 *         description: Internal server error
 */
router.post('/documents', addDocuments);

/**
 * @openapi
 * /rag/retrieve:
 *   post:
 *     summary: Retrieve relevant documents based on query
 *     tags:
 *       - RAG
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: Search query
 *               k:
 *                 type: integer
 *                 default: 3
 *                 description: Number of documents to retrieve
 *     responses:
 *       200:
 *         description: Retrieved documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 query:
 *                   type: string
 *                 k:
 *                   type: integer
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pageContent:
 *                         type: string
 *                       metadata:
 *                         type: object
 *                 resultCount:
 *                   type: integer
 *       400:
 *         description: Invalid query or RAG not initialized
 *       500:
 *         description: Internal server error
 */
router.post('/retrieve', retrieveDocuments);

/**
 * @openapi
 * /rag/generate:
 *   post:
 *     summary: Generate answer using RAG (Retrieval-Augmented Generation)
 *     tags:
 *       - RAG
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: User question
 *               k:
 *                 type: integer
 *                 default: 3
 *                 description: Number of documents to retrieve
 *     responses:
 *       200:
 *         description: Generated answer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 query:
 *                   type: string
 *                 k:
 *                   type: integer
 *                 answer:
 *                   type: string
 *       400:
 *         description: Invalid query or RAG not initialized
 *       500:
 *         description: Internal server error
 */
router.post('/generate', generateAnswer);

/**
 * @openapi
 * /rag/status:
 *   get:
 *     summary: Get RAG service status
 *     tags:
 *       - RAG
 *     responses:
 *       200:
 *         description: RAG service status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 initialized:
 *                   type: boolean
 *                 documentCount:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/status', getRAGStatus);

/**
 * @openapi
 * /rag/reset:
 *   post:
 *     summary: Reset RAG service
 *     tags:
 *       - RAG
 *     responses:
 *       200:
 *         description: RAG service reset successfully
 *       500:
 *         description: Internal server error
 */
router.post('/reset', resetRAG);

/**
 * @openapi
 * /rag/documents:
 *   get:
 *     summary: Get all documents in vector store
 *     tags:
 *       - RAG
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of documents to retrieve
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of documents to skip
 *     responses:
 *       200:
 *         description: Retrieved documents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       document:
 *                         type: object
 *                         properties:
 *                           pageContent:
 *                             type: string
 *                           metadata:
 *                             type: object
 *                       metadata:
 *                         type: object
 *                 count:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *       400:
 *         description: RAG not initialized
 *       500:
 *         description: Internal server error
 */
router.get('/documents', getAllDocuments);

/**
 * @openapi
 * /rag/documents/search:
 *   post:
 *     summary: Search documents by metadata filter
 *     tags:
 *       - RAG
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filter:
 *                 type: object
 *                 description: Metadata filter object
 *                 example:
 *                   language: "en"
 *                   type: "summary"
 *               limit:
 *                 type: integer
 *                 default: 10
 *                 description: Number of documents to retrieve
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documents:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: integer
 *                 filter:
 *                   type: object
 *       400:
 *         description: RAG not initialized
 *       500:
 *         description: Internal server error
 */
router.post('/documents/search', searchDocuments);

export default router;
