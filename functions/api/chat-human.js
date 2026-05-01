export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    
    // 프론트엔드에서는 text로 보내고, 명세에서는 message를 요구하므로 호환성을 위해 둘 다 지원
    const sender = data.sender || "user";
    const message = data.message || data.text || "";

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const timestamp = Date.now();
    // 요청에 따라 key: "msg_" + Date.now()
    // (동시성을 위해 랜덤값을 붙이는 게 좋지만 명세대로 구현)
    const key = "msg_" + timestamp + "_" + Math.floor(Math.random() * 1000); 
    
    const value = JSON.stringify({ 
      message, 
      text: message, // Chatbot.tsx가 msg.text를 기대하므로 추가
      sender, 
      timestamp 
    });

    await env.CHAT_KV.put(key, value);

    return new Response(JSON.stringify({ success: true, key }), {
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
