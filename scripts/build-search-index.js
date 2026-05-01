const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

function stripMarkdown(text) {
  // 마크다운 기호 제거 (간단한 정규식)
  const plainText = text
    .replace(/[#*`~_\[\]()>-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return plainText.substring(0, 500);
}

function buildSearchIndex() {
  const index = [];

  // 1. local-info.json 데이터 로드
  const localInfoPath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
  if (fs.existsSync(localInfoPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(localInfoPath, 'utf8'));
      if (Array.isArray(data)) {
        index.push(...data);
      }
    } catch (err) {
      console.error('Failed to read local-info.json:', err);
    }
  }

  // 2. 마크다운 파일 파싱
  const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');
  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(postsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      const { data, content } = matter(fileContent);
      
      index.push({
        title: data.title || '',
        summary: data.summary || '',
        content: stripMarkdown(content),
        url: `/blog/${file.replace(/\.md$/, '')}`
      });
    }
  }

  // 3. search-index.json으로 저장
  const outDir = path.join(process.cwd(), 'public', 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outDir, 'search-index.json'),
    JSON.stringify(index, null, 2),
    'utf8'
  );

  console.log(`Search index built: ${index.length} entries`);
}

buildSearchIndex();
