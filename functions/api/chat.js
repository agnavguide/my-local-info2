function stripMarkdown(text) {
  if (!text) return "";
  return text.replace(/[#*`~_\[\]()>-]/g, '').replace(/\s+/g, ' ').trim();
}

function calculateScore(item, keywords) {
  const searchText = `${item.title || ''} ${item.summary || ''} ${item.content || ''}`.toLowerCase();
  let score = 0;
  keywords.forEach(kw => {
    if (searchText.includes(kw)) score++;
  });
  return score;
}

export async function onRequestPost({ request, env }) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid request payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 1. search-index 가져오기
    const indexUrl = new URL(request.url).origin + "/data/search-index.json";
    let blogData = "";
    
    try {
      const idxRes = await fetch(indexUrl);
      if (idxRes.ok) {
        const searchIndex = await idxRes.json();
        
        // 사용자 질문 키워드 추출
        const lastMessage = messages[messages.length - 1];
        const userQuery = lastMessage ? lastMessage.content.toLowerCase() : "";
        const keywords = userQuery.split(/\s+/).filter(k => k.trim().length > 0);

        // 검색 매칭 점수 계산
        const scoredItems = searchIndex.map(item => ({
          ...item,
          score: calculateScore(item, keywords)
        })).filter(item => item.score > 0);

        // 상위 3개 아이템 추출
        scoredItems.sort((a, b) => b.score - a.score);
        const topItems = scoredItems.slice(0, 3);
        
        if (topItems.length > 0) {
          blogData = topItems.map(item => `${item.title}: ${item.summary}`).join("\n");
        }
      }
    } catch (e) {
      console.error("Failed to fetch search index:", e);
    }

    // 시스템 프롬프트 교체
    const systemPrompt = `You are an AI assistant for a Korean local information blog.
Answer ONLY in Korean. Keep answers to 2-3 sentences maximum.
Do NOT use any markdown symbols (**, *, #, -). Plain text only.
Base your answer ONLY on the following blog data. If not relevant, reply: 해당 내용은 블로그에서 확인이 어렵습니다. 다른 질문을 해주세요.

[블로그 데이터]
${blogData}`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: aiMessages,
      max_tokens: 150,
    });

    // 응답에서 마크다운 제거
    if (response && response.response) {
      response.response = stripMarkdown(response.response);
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
