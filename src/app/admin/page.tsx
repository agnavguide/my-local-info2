"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: number | string;
  sender: "user" | "admin" | "bot";
  text: string;
}

export default function AdminChatPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedMessages = useRef(new Set<string>());

  const THEME_COLOR = "bg-slate-800";
  const HOVER_COLOR = "hover:bg-slate-700";

  // 스크롤 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 주기적으로 새 메시지 확인 (폴링)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAuthenticated) {
      interval = setInterval(async () => {
        try {
          const res = await fetch("/api/chat-poll");
          if (!res.ok) return;
          const data = await res.json();
          
          const msgs = Array.isArray(data) ? data : (data.messages || []);
          msgs.forEach((msg: any) => {
            const msgKey = msg.text + "_" + msg.sender;
            if (msg.text && !processedMessages.current.has(msgKey)) {
              processedMessages.current.add(msgKey);
              setMessages(prev => [...prev, { 
                id: Date.now() + Math.random(), 
                sender: msg.sender, 
                text: msg.text 
              }]);
            }
          });
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin1234") {
      setIsAuthenticated(true);
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    // UI에 먼저 추가
    const adminMsg: Message = { id: Date.now(), sender: "admin", text: input };
    const msgKey = input + "_admin";
    processedMessages.current.add(msgKey);
    setMessages((prev) => [...prev, adminMsg]);
    
    setInput("");
    setIsLoading(true);

    try {
      await fetch("/api/chat-human", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "admin", text: adminMsg.text })
      });
    } catch (e) {
      alert("메시지 전송에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm flex flex-col gap-5">
          <div className="text-center">
            <div className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold text-slate-800">상담원 관리자 접속</h1>
            <p className="text-xs text-slate-500 mt-1">고객 응대를 위해 비밀번호를 입력해 주세요.</p>
          </div>
          
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
          <button type="submit" className="bg-slate-800 text-white rounded-lg py-3 font-semibold hover:bg-slate-700 transition-colors shadow-md">
            접속하기
          </button>
        </form>
      </div>
    );
  }

  // 상담 화면
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md h-[650px] max-h-screen rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* 상단 헤더 */}
        <div className="bg-slate-800 text-white p-4 flex items-center gap-3 shrink-0 shadow-sm relative z-10">
          <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center shrink-0 shadow-inner font-bold text-xs ring-2 ring-slate-700">
            ADMIN
          </div>
          <div>
            <div className="font-bold text-[16px] tracking-wide">실시간 고객 상담</div>
            <div className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-400 relative">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
              </span>
              고객 메시지 수신중 (보안 적용)
            </div>
          </div>
        </div>

        {/* 대화 내역 (말풍선 영역) */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#f8f9fa] flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="text-center mt-12 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
              <span className="text-2xl mb-2 block">💬</span>
              <p className="text-sm font-bold text-slate-700">접속을 환영합니다!</p>
              <p className="text-xs text-slate-500 mt-1">고객이 첫 메시지를 남기면 여기에 표시됩니다.</p>
            </div>
          )}
          
          {messages.map((msg) => {
            // 요청 조건: sender가 "user"면 오른쪽, "admin"이면 왼쪽
            const isUser = msg.sender === "user";
            
            return (
              <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 mr-2 mt-1 shadow-sm font-extrabold text-[10px]">
                    나
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2.5 text-[14px] leading-relaxed break-words ${
                    isUser
                      ? "bg-blue-500 text-white rounded-2xl rounded-tr-sm shadow-sm"
                      : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력창 */}
        <div className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="상담 내용을 입력하세요..."
            className="flex-1 bg-slate-100 text-[14px] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-slate-400"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              input.trim() ? THEME_COLOR + " text-white" : "bg-slate-200 text-slate-400"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-0.5 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
