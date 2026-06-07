import ragService from '../services/rag.service';

// Example usage of RAG service
async function runRAGExample() {
  try {
    console.log('🔧 Initializing RAG service...');

    // 📚 Sample documents (v2 format - objects with pageContent and metadata)
    const docs = [
      { pageContent: "บริษัทเราทำระบบ ERP", metadata: { id: 1, title: "Company Overview" } },
      { pageContent: "เวลาทำงาน 9:00 - 18:00", metadata: { id: 2, title: "Working Hours" } },
      { pageContent: "ลาหยุดได้ปีละ 10 วัน", metadata: { id: 3, title: "Annual Leave" } },
      { pageContent: "มีสวัสดิการค่ารักษาพยาบาลและค่าอาหารกลางวัน", metadata: { id: 4, title: "Benefits" } },
      { pageContent: "สำนักงานตั้งอยู่ที่กรุงเทพฯ ใกล้รถไฟฟ้า BTS", metadata: { id: 5, title: "Office Location" } }
    ];

    // Initialize vector store
    await ragService.initializeVectorStore(docs);
    console.log('✅ RAG service initialized with', docs.length, 'documents');

    // Test retrieval
    console.log('\n🔍 Testing document retrieval...');
    const query = "บริษัททำอะไร?";
    const results = await ragService.retrieveDocuments(query, 2);
    
    console.log('📄 Retrieved documents:');
    results.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.pageContent}`);
    });

    // Test answer generation
    console.log('\n🤖 Testing answer generation...');
    const questions = [
      "บริษัททำอะไร?",
      "เวลาทำงานกี่โมง?",
      "ลาหยุดได้กี่วัน?",
      "มีสวัสดิการอะไรบ้าง?"
    ];

    for (const question of questions) {
      console.log(`\n❓ Question: ${question}`);
      const answer = await ragService.generateAnswer(question, 3);
      console.log(`💬 Answer: ${answer}`);
    }

    // Get status
    const status = await ragService.getStatus();
    console.log('\n📊 Service Status:', status);

  } catch (error) {
    console.error('❌ Error in RAG example:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runRAGExample();
}

export default runRAGExample;
