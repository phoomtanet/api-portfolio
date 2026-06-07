import { Request, Response } from 'express';
import ragService from '../services/rag.service';
import AppError from '../types/app-error';

// Initialize RAG service with documents
export const initializeRAG = async (req: Request, res: Response) => {
  try {
    const { documents } = req.body;

    if (!Array.isArray(documents)) {
      return res.status(400).json({ error: 'Documents must be an array' });
    }

    if (documents.length === 0) {
      return res.status(400).json({ error: 'At least one document is required' });
    }

    // Validate document structure
    const validDocs = documents.every(doc => 
      doc && typeof doc === 'object' && typeof doc.pageContent === 'string' && doc.pageContent.trim()
    );

    if (!validDocs) {
      return res.status(400).json({ 
        error: 'Each document must have a pageContent property with non-empty string' 
      });
    }

    await ragService.initializeVectorStore(documents);

    res.json({ 
      message: 'RAG service initialized successfully',
      documentCount: documents.length
    });
  } catch (error) {
    console.error('Error initializing RAG:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add documents to existing RAG service
export const addDocuments = async (req: Request, res: Response) => {
  try {
    const { documents } = req.body;

    if (!Array.isArray(documents)) {
      return res.status(400).json({ error: 'Documents must be an array' });
    }

    if (documents.length === 0) {
      return res.status(400).json({ error: 'At least one document is required' });
    }

    // Validate document structure
    const validDocs = documents.every(doc => 
      doc && typeof doc === 'object' && typeof doc.pageContent === 'string' && doc.pageContent.trim()
    );

    if (!validDocs) {
      return res.status(400).json({ 
        error: 'Each document must have a pageContent property with non-empty string' 
      });
    }

    await ragService.addDocuments(documents);

    res.json({ 
      message: 'Documents added successfully',
      documentCount: documents.length
    });
  } catch (error) {
    console.error('Error adding documents:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Retrieve documents based on query
export const retrieveDocuments = async (req: Request, res: Response) => {
  try {
    const { query, k = 3 } = req.body;

    if (!query?.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const kNum = parseInt(k);
    if (isNaN(kNum) || kNum < 1) {
      return res.status(400).json({ error: 'k must be a positive integer' });
    }

    const results = await ragService.retrieveDocuments(query.trim(), kNum);

    res.json({
      query: query.trim(),
      k: kNum,
      results,
      resultCount: results.length
    });
  } catch (error) {
    console.error('Error retrieving documents:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Generate answer using RAG
export const generateAnswer = async (req: Request, res: Response) => {
  try {
    console.log('generateAnswer request body:', JSON.stringify(req.body));
    const { query, k = 3 } = req.body;

    if (!query?.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const kNum = parseInt(k);
    if (isNaN(kNum) || kNum < 1) {
      return res.status(400).json({ error: 'k must be a positive integer' });
    }

    const answer = await ragService.generateAnswer(query.trim(), kNum);

    res.json({
      query: query.trim(),
      k: kNum,
      answer
    });
  } catch (error) {
    console.error('Error generating answer:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get RAG service status
export const getRAGStatus = async (req: Request, res: Response) => {
  try {
    const status = await ragService.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting RAG status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reset RAG service
export const resetRAG = async (req: Request, res: Response) => {
  try {
    await ragService.reset();
    res.json({ message: 'RAG service reset successfully' });
  } catch (error) {
    console.error('Error resetting RAG:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all documents in vector store
export const getAllDocuments = async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const limitNum = parseInt(limit as string) || 10;
    const offsetNum = parseInt(offset as string) || 0;
    
    const documents = await ragService.getAllDocuments(limitNum, offsetNum);
    
    res.json({
      documents,
      count: documents.length,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Error getting all documents:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Search documents with metadata
export const searchDocuments = async (req: Request, res: Response) => {
  try {
    const { filter, limit = 10 } = req.body;
    
    const limitNum = parseInt(limit) || 10;
    
    const documents = await ragService.searchDocuments(filter, limitNum);
    
    res.json({
      documents,
      count: documents.length,
      filter
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
