const fs = require('fs');
const path = require('path');

const DATA_FILE_PATH = path.join(__dirname, '../public/data/local-info2.json');

async function fetchPublicData() {
  const apiKey = process.env.PUBLIC_DATA_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !geminiApiKey) {
    console.error("API 키가 설정되지 않았습니다.");
    return;
  }

  try {
    // [1단계] 공공데이터포털 API에서 데이터 가져오기
    const url = "https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&returnType=JSON";
    const response = await fetch(url, {
      headers: {
        'Authorization': `Infuser ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`공공데이터 API 에러: ${response.status}`);
    }

    const data = await response.json();
    const items = data.data || [];

    if (items.length === 0) {
      console.log("공공데이터 결과가 없습니다.");
      return;
    }

    // 1. "성남" 포함 항목 필터링
    let filteredItems = items.filter(item => 
      (item.서비스명 && item.서비스명.includes('성남')) ||
      (item.서비스목적요약 && item.서비스목적요약.includes('성남')) ||
      (item.지원대상 && item.지원대상.includes('성남')) ||
      (item.소관기관명 && item.소관기관명.includes('성남'))
    );

    // 2. "성남" 없으면 "경기" 포함 항목 필터링
    if (filteredItems.length === 0) {
      filteredItems = items.filter(item => 
        (item.서비스명 && item.서비스명.includes('경기')) ||
        (item.서비스목적요약 && item.서비스목적요약.includes('경기')) ||
        (item.지원대상 && item.지원대상.includes('경기')) ||
        (item.소관기관명 && item.소관기관명.includes('경기'))
      );
    }

    // 3. "경기"도 없으면 전체 데이터 사용
    if (filteredItems.length === 0) {
      filteredItems = items;
    }

    // [2단계] 기존 데이터와 비교
    let existingData = [];
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      existingData = JSON.parse(fileContent);
    }

    const existingNames = new Set(existingData.map(item => item.name));
    
    let newItemRaw = null;
    for (const item of filteredItems) {
      if (!existingNames.has(item.서비스명)) {
        newItemRaw = item;
        break; // 1건만 찾으면 중단
      }
    }

    if (!newItemRaw) {
      console.log("새로운 데이터가 없습니다");
      return;
    }

    // [3단계] Gemini AI로 새 항목 1개 가공
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const prompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜, endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

데이터:
${JSON.stringify(newItemRaw, null, 2)}`;

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

    // 마크다운 코드블록 제거
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // JSON 파싱
    const processedItem = JSON.parse(resultText);

    // ID 매기기 (기존 가장 큰 ID + 1)
    const maxId = existingData.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0);
    processedItem.id = maxId + 1;

    // [4단계] 기존 데이터에 추가
    existingData.push(processedItem);

    // 파일 저장
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(existingData, null, 2), 'utf-8');
    
    console.log(`성공: 새로운 데이터 1건이 추가되었습니다 (${processedItem.name})`);

  } catch (error) {
    console.error("실행 중 에러 발생 (기존 데이터 유지):", error.message);
  }
}

fetchPublicData();
