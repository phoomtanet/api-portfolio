const fs = require('fs');
const http = require('http');

// อ่านข้อมูลจากไฟล์ JSON
const data = fs.readFileSync('simple-rag-data.json', 'utf8');
const documents = JSON.parse(data).documents;

// สร้าง HTTP request
const postData = JSON.stringify({
  documents: documents
});

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/v1/initialize',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log('Response:', chunk.toString());
  });
  
  res.on('end', () => {
    console.log('✅ RAG initialization completed!');
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

// ส่งข้อมูล
req.write(postData);
req.end();

console.log(`📤 Sending ${documents.length} documents to RAG API...`);
