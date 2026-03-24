const fs = require('fs');
const path = require('path');

const DATA_FILE_PATH = path.join(__dirname, '../public/data/local-info2.json');
const POSTS_DIR = path.join(__dirname, '../src/content/posts');

async function generateBlogPost() {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    console.error("GEMINI_API_KEY가 설정되지 않았습니다.");
    return;
  }

  try {
    // [1단계] 최신 데이터 확인
    if (!fs.existsSync(DATA_FILE_PATH)) {
      console.error("데이터 파일(local-info2.json)이 없습니다.");
      return;
    }

    const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContent);

    if (!Array.isArray(data) || data.length === 0) {
      console.error("데이터가 비어 있습니다.");
      return;
    }

    // 마지막 항목 가져오기
    const latestItem = data[data.length - 1];

    if (!fs.existsSync(POSTS_DIR)) {
      fs.mkdirSync(POSTS_DIR, { recursive: true });
    }

    // 기존 파일들과 비교해서 이미 같은 이름(name)을 포함한 본문이 있는지 확인
    const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.md'));
    let alreadyExists = false;

    for (const file of files) {
      const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
      if (content.includes(latestItem.name) || content.includes(latestItem.서비스명)) {
        alreadyExists = true;
        break;
      }
    }

    if (alreadyExists) {
      console.log("이미 작성된 글입니다");
      return;
    }

    // [2단계] Gemini AI로 블로그 글 생성
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    
    const prompt = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(latestItem, null, 2)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: (오늘 날짜 YYYY-MM-DD)
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API 에러: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    let resultText = geminiData.candidates[0].content.parts[0].text;

    // [3단계] 파일 저장
    const filenameMatch = resultText.match(/FILENAME:\s*([^\s]+)/);
    let filename = "";
    
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1];
      // 본문에서 FILENAME 줄 텍스트 제거
      resultText = resultText.replace(filenameMatch[0], '').trim();
    } else {
      const today = new Date().toISOString().split('T')[0];
      filename = `${today}-service-info`;
    }

    if (!filename.endsWith('.md')) {
      filename += '.md';
    }

    const postFilePath = path.join(POSTS_DIR, filename);

    // 불필요한 마크다운 코드블록 제거
    if (resultText.startsWith("```markdown")) {
        resultText = resultText.replace(/^```markdown\n/, '').replace(/\n```$/, '').trim();
    } else if (resultText.startsWith("```")) {
        resultText = resultText.replace(/^```\n/, '').replace(/\n```$/, '').trim();
    }

    fs.writeFileSync(postFilePath, resultText, 'utf-8');
    console.log(`성공: 새로운 블로그 글이 생성되었습니다 (${filename})`);

  } catch (error) {
    console.error("실행 중 에러 발생:", error.message);
  }
}

generateBlogPost();
