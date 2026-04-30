export async function onRequestPost({ request, env }) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid request payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const aiMessages = [
      { role: "system", content: "You are an AI assistant for a Korean local information blog. Answer in Korean." },
      ...messages
    ];

    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: aiMessages,
      max_tokens: 300,
    });

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
