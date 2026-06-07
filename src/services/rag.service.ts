import { GoogleGenerativeAI } from '@google/generative-ai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { randomUUID } from 'crypto';
import AppError from '../types/app-error';

interface Document {
  pageContent: string;
  metadata: Record<string, any>;
}

class RAGService {
  private genAI: GoogleGenerativeAI;
  private qdrantClient: QdrantClient;
  private readonly collectionName = 'rag-documents';
  private readonly VECTOR_SIZE = 3072; // gemini-embedding-001

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const qdrantUrl = process.env.QDRANT_URL || 'http://localhost:6333';
    this.qdrantClient = new QdrantClient({ url: qdrantUrl });
  }

  private async embedQuery(text: string): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  }

  private async embedDocuments(texts: string[]): Promise<number[][]> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const BATCH_SIZE = 5;
    const results: number[][] = [];
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map(text => model.embedContent(text)));
      results.push(...batchResults.map(r => r.embedding.values));
    }
    return results;
  }

  private async collectionExists(): Promise<boolean> {
    const collections = await this.qdrantClient.getCollections();
    return collections.collections.some(c => c.name === this.collectionName);
  }

  private async assertInitialized(): Promise<void> {
    const exists = await this.collectionExists();
    if (!exists) {
      throw new AppError('Vector store not initialized. Call initializeVectorStore first.', 400);
    }
  }

  private async upsertDocuments(docs: Document[]): Promise<void> {
    const vectors = await this.embedDocuments(docs.map(d => d.pageContent));
    const points = docs.map((doc, i) => ({
      id: randomUUID(),
      vector: vectors[i],
      payload: { pageContent: doc.pageContent, metadata: doc.metadata }
    }));
    await this.qdrantClient.upsert(this.collectionName, { points });
  }

  async initializeVectorStore(docs: Document[]): Promise<void> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new AppError('Gemini API key is required', 500);
      }
      const exists = await this.collectionExists();
      if (exists) {
        const info = await this.qdrantClient.getCollection(this.collectionName);
        if ((info.points_count ?? 0) > 0) return;
        // collection exists but empty — skip recreation, just upsert
      } else {
        await this.qdrantClient.createCollection(this.collectionName, {
          vectors: { size: this.VECTOR_SIZE, distance: 'Cosine' }
        });
      }
      await this.upsertDocuments(docs);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to initialize vector store', 500);
    }
  }

  async addDocuments(docs: Document[]): Promise<void> {
    try {
      await this.assertInitialized();
      await this.upsertDocuments(docs);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to add documents', 500);
    }
  }

  async retrieveDocuments(query: string, k: number = 3): Promise<Document[]> {
    try {
      await this.assertInitialized();
      if (!query?.trim()) throw new AppError('Query is required', 400);

      const queryVector = await this.embedQuery(query);
      const results = await this.qdrantClient.search(this.collectionName, {
        vector: queryVector,
        limit: k,
        with_payload: true,
        with_vector: false
      });

      return results.map(r => ({
        pageContent: (r.payload?.pageContent as string) || '',
        metadata: (r.payload?.metadata as Record<string, any>) || {}
      }));
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to retrieve documents', 500);
    }
  }

  async retrieveDocumentsWithScores(query: string, k: number = 3, filter?: Record<string, any>): Promise<Array<{ document: Document; score: number }>> {
    try {
      await this.assertInitialized();
      if (!query?.trim()) throw new AppError('Query is required', 400);

      const queryVector = await this.embedQuery(query);
      const results = await this.qdrantClient.search(this.collectionName, {
        vector: queryVector,
        limit: k,
        with_payload: true,
        with_vector: false,
        filter: filter ? this.buildFilter(filter) : undefined
      });

      return results.map(r => ({
        document: {
          pageContent: (r.payload?.pageContent as string) || '',
          metadata: (r.payload?.metadata as Record<string, any>) || {}
        },
        score: r.score
      }));
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to retrieve documents with scores', 500);
    }
  }

  async getRetriever(k: number = 3) {
    await this.assertInitialized();
    return {
      invoke: async (query: string) => this.retrieveDocuments(query, k)
    };
  }

  async generateAnswer(query: string, k: number = 3): Promise<string> {
    try {
      if (!process.env.GEMINI_API_KEY) throw new AppError('Gemini API key is required', 500);

      const results = await this.retrieveDocuments(query, k);
      const context = results.map(doc => doc.pageContent).join('\n');
      const prompt = `คุณคือ AI ผู้ช่วยที่ตอบคำถามเกี่ยวกับ ภูมิธเนศ อินทยุง (Phoomtanet Intayung) นักพัฒนา Full Stack
ใช้เฉพาะข้อมูลที่ให้มาด้านล่างในการตอบ อย่าคาดเดาหรือสร้างข้อมูลขึ้นเอง
หากข้อมูลที่ให้มาไม่มีรายละเอียดที่ถามถึง ให้ตอบว่า "ไม่มีข้อมูลเกี่ยวกับ [หัวข้อนั้น] ของภูมิธเนศ อินทยุง"
อ้างถึงบุคคลนี้ด้วยชื่อ "ภูมิธเนศ" หรือ "ภูมิธเนศ อินทยุง" ไม่ใช่ "คุณ"

ข้อมูลอ้างอิง:
${context}

คำถาม: ${query}

คำตอบ:`;

      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('generateAnswer error:', error);
      throw new AppError('Failed to generate answer', 500);
    }
  }

  async getStatus(): Promise<{ initialized: boolean; documentCount?: number; collectionName?: string }> {
    try {
      const exists = await this.collectionExists();
      if (!exists) return { initialized: false };

      const collectionInfo = await this.qdrantClient.getCollection(this.collectionName);
      return {
        initialized: true,
        documentCount: collectionInfo.points_count || undefined,
        collectionName: this.collectionName
      };
    } catch (error) {
      console.error('Error getting status:', error);
      return { initialized: false };
    }
  }

  async reset(): Promise<void> {
    await this.qdrantClient.deleteCollection(this.collectionName);
  }

  async getAllDocuments(limit: number = 10, offset: number = 0): Promise<Array<{ id: string; document: Document }>> {
    try {
      await this.assertInitialized();

      const scrollResult = await this.qdrantClient.scroll(this.collectionName, {
        limit,
        offset,
        with_payload: true,
        with_vector: false
      });

      return scrollResult.points.map(point => ({
        id: point.id?.toString() || '',
        document: {
          pageContent: (point.payload?.pageContent as string) || '',
          metadata: (point.payload?.metadata as Record<string, any>) || {}
        }
      }));
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to get documents', 500);
    }
  }

  async searchDocuments(filter: Record<string, any>, limit: number = 10): Promise<Array<{ id: string; document: Document }>> {
    try {
      await this.assertInitialized();

      const qdrantFilter = this.buildFilter(filter);
      const scrollResult = await this.qdrantClient.scroll(this.collectionName, {
        limit,
        filter: qdrantFilter,
        with_payload: true,
        with_vector: false
      });

      return scrollResult.points.map(point => ({
        id: point.id?.toString() || '',
        document: {
          pageContent: (point.payload?.pageContent as string) || '',
          metadata: (point.payload?.metadata as Record<string, any>) || {}
        }
      }));
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to search documents', 500);
    }
  }

  private buildFilter(filter: Record<string, any>): any {
    const conditions = Object.entries(filter).map(([key, value]) => ({
      key: `metadata.${key}`,
      match: { value }
    }));
    return conditions.length > 0 ? { must: conditions } : {};
  }

  async getDetailedStats(): Promise<{
    initialized: boolean;
    documentCount?: number;
    collectionName?: string;
    vectorSize?: number;
    distance?: string;
    documentsByType?: Record<string, number>;
    documentsByLanguage?: Record<string, number>;
  }> {
    try {
      const exists = await this.collectionExists();
      if (!exists) return { initialized: false };

      const collectionInfo = await this.qdrantClient.getCollection(this.collectionName);

      const allDocs: Array<{ id: string; document: Document }> = [];
      const batchSize = 100;
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const batch = await this.getAllDocuments(batchSize, offset);
        allDocs.push(...batch);
        hasMore = batch.length === batchSize;
        offset += batchSize;
      }

      const docsByType: Record<string, number> = {};
      const docsByLanguage: Record<string, number> = {};

      allDocs.forEach(({ document: doc }) => {
        const type = doc.metadata.type || 'unknown';
        const language = doc.metadata.language || 'unknown';
        docsByType[type] = (docsByType[type] || 0) + 1;
        docsByLanguage[language] = (docsByLanguage[language] || 0) + 1;
      });

      return {
        initialized: true,
        documentCount: collectionInfo.points_count || undefined,
        collectionName: this.collectionName,
        vectorSize: this.VECTOR_SIZE,
        distance: 'Cosine',
        documentsByType: docsByType,
        documentsByLanguage: docsByLanguage
      };
    } catch (error) {
      console.error('Error getting detailed stats:', error);
      return { initialized: false };
    }
  }
}

const ragService = new RAGService();

export default ragService;
export type { Document };
export { RAGService };
