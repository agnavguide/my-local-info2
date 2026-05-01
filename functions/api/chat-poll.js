export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const filterSender = url.searchParams.get("sender");

    // 1. KV의 모든 키 가져오기
    const list = await env.CHAT_KV.list();
    const keys = list.keys;

    // 2. 키들을 이용해 데이터 동시에 전부 불러오기
    const promises = keys.map(key => env.CHAT_KV.get(key.name));
    const values = await Promise.all(promises);

    // 3. JSON 변환 및 유효한 데이터 필터링
    let messages = values
      .filter(v => v !== null)
      .map(v => JSON.parse(v));

    // 4. 발신자(sender) 파라미터가 있다면 필터링
    if (filterSender) {
      messages = messages.filter(msg => msg.sender === filterSender);
    }

    // 5. 시간순 정렬 (옛날 메시지부터 최신 메시지 순서)
    messages.sort((a, b) => a.timestamp - b.timestamp);

    // 6. 결과 응답 (프론트엔드 호환성을 위해 text 속성 보장)
    const formattedMessages = messages.map(msg => ({
      ...msg,
      text: msg.text || msg.message
    }));

    return new Response(JSON.stringify(formattedMessages), {
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
