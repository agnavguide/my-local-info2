"use client";

import { useState, useRef, useEffect } from "react";
import chatData from "../../chat-data.json";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
}

export default function Chatbot() {
  // 💡 챗봇 색상과 이름을 변경하려면 아래 값을 수정하세요.
  const THEME_COLOR = "bg-blue-500"; // (원하는 색상) 예: bg-green-500, bg-indigo-500 등
  const HOVER_COLOR = "hover:bg-blue-600"; // 마우스를 올렸을 때 색상, 예: hover:bg-green-600
  const BOT_NAME = "(원하는 이름)";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: Date.now(), sender: "bot", text: `안녕하세요! ${BOT_NAME}입니다. 무엇을 도와드릴까요?` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleQuestionClick = (question: string, answer: string) => {
    const userMsg: Message = { id: Date.now(), sender: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    
    // 사용자가 질문한 것처럼 보이게 약간의 지연 추가
    setTimeout(() => {
      const botMsg: Message = { id: Date.now() + 1, sender: "bot", text: answer };
      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now(), sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = messages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }));
      apiMessages.push({ role: "user", content: text });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages })
      });

      const data = await response.json();
      const botMsg: Message = { 
        id: Date.now() + 1, 
        sender: "bot", 
        text: data.response || "답변을 가져오는 중 오류가 발생했습니다." 
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "bot", text: "요청 중 오류가 발생했습니다." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 플로팅 챗봇 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 ${THEME_COLOR} ${HOVER_COLOR} text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 z-50`}
        aria-label="채팅 상담 열기"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
        )}
      </button>

      {/* 채팅창 영역 */}
      <div
        className={`fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[360px] sm:h-[500px] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-40 transition-all duration-300 sm:origin-bottom-right ${
          isOpen ? "opacity-100 translate-y-0 sm:scale-100 pointer-events-auto" : "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-0 pointer-events-none"
        }`}
      >
        {/* 채팅창 상단: 헤더 */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 ${THEME_COLOR} rounded-full flex items-center justify-center shrink-0 shadow-inner`}>
              <span className="text-sm font-bold">AI</span>
            </div>
            <div>
              <div className="font-bold text-[15px]">{BOT_NAME}</div>
              <div className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-400 relative">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                </span>
                온라인
              </div>
            </div>
          </div>
          {/* 모바일 닫기 버튼 */}
          <button onClick={() => setIsOpen(false)} className="sm:hidden text-slate-300 hover:text-white p-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 채팅창 중간: 대화 내역 (말풍선) */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#f8f9fa] flex flex-col gap-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "bot" && (
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mr-2 mt-1 shadow-sm">
                  <span className="text-xs font-bold">AI</span>
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-2.5 text-[14px] leading-relaxed break-words ${
                  msg.sender === "user"
                    ? `${THEME_COLOR} text-white rounded-2xl rounded-tr-sm shadow-sm`
                    : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mr-2 mt-1 shadow-sm">
                <span className="text-xs font-bold">AI</span>
              </div>
              <div className="max-w-[75%] px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5 h-10">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 채팅창 하단: 질문 리스트 버튼 */}
        <div className="p-3 bg-white border-t border-slate-100 flex flex-col gap-2 shrink-0 max-h-[30%] overflow-y-auto">
          {chatData.map((item, index) => (
            <button
              key={index}
              onClick={() => handleQuestionClick(item.question, item.answer)}
              className="text-left py-2.5 px-3 bg-[#f8f9fa] hover:bg-slate-100 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 transition-colors"
            >
              {item.question}
            </button>
          ))}
        </div>

        {/* 직접 텍스트를 입력하는 영역 */}
        <div className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend(input);
            }}
            placeholder="직접 질문을 입력해 보세요..."
            className="flex-1 bg-slate-100 text-[14px] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={isLoading || !input.trim()}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              input.trim() ? THEME_COLOR + " text-white" : "bg-slate-200 text-slate-400"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
