/// <reference types="node" />
import translations from '../web-portfolio/i18n/translations';

interface Document {
  pageContent: string;
  metadata: Record<string, any>;
}

function createDocuments(): Document[] {
  const docs: Document[] = [];
  const langs = ['en', 'th'] as const;

  for (const lang of langs) {
    const t = translations[lang].resume;

    docs.push({
      pageContent: t.summary,
      metadata: { type: 'summary', language: lang, source: 'resume' }
    });

    for (const skill of t.skills) {
      docs.push({
        pageContent: `${skill.label}: ${skill.value}`,
        metadata: { type: 'skill', language: lang, category: skill.label, source: 'resume' }
      });
    }

    for (const exp of t.experiences) {
      const content = lang === 'en'
        ? `Company: ${exp.company}\nRole: ${exp.role}\nPeriod: ${exp.period}\nResponsibilities: ${exp.bullets.join('. ')}`
        : `บริษัท: ${exp.company}\nตำแหน่ง: ${exp.role}\nระยะเวลา: ${exp.period}\nหน้าที่รับผิดชอบ: ${exp.bullets.join('. ')}`;
      docs.push({
        pageContent: content,
        metadata: { type: 'experience', language: lang, company: exp.company, role: exp.role, source: 'resume' }
      });
    }

    for (const edu of t.education) {
      const content = lang === 'en'
        ? `School: ${edu.school}\nDegree: ${edu.degree}\nPeriod: ${edu.period}\nNote: ${edu.note}`
        : `สถาบัน: ${edu.school}\nวุฒิการศึกษา: ${edu.degree}\nระยะเวลา: ${edu.period}\nเกรดเฉลี่ย: ${edu.note}`;
      docs.push({
        pageContent: content,
        metadata: { type: 'education', language: lang, school: edu.school, degree: edu.degree, source: 'resume' }
      });
    }

    for (const project of t.projects) {
      const content = lang === 'en'
        ? `Project: ${project.name}\nDuration: ${project.duration}\nTech Stack: ${project.stack}\nOverview: ${project.overview}\nKey Features: ${project.bullets.join('. ')}`
        : `โปรเจกต์: ${project.name}\nระยะเวลา: ${project.duration}\nTech Stack: ${project.stack}\nภาพรวม: ${project.overview}\nจุดเด่น: ${project.bullets.join('. ')}`;
      docs.push({
        pageContent: content,
        metadata: { type: 'project', language: lang, project: project.name, stack: project.stack, source: 'resume' }
      });
    }
  }

  return docs;
}

async function seed() {
  const documents = createDocuments();
  console.log(`Created ${documents.length} documents`);

  const response = await fetch('http://localhost:8000/api/v1/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documents })
  });

  const result = await response.json();
  if (response.ok) {
    console.log(`RAG initialized: ${documents.length} documents`);
    console.log(result);
  } else {
    console.error('Failed:', result);
    process.exit(1);
  }
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
