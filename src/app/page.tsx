import React from 'react';
import Link from 'next/link';
import localData from '../../public/data/local-info.json';
import AdBanner from '@/components/AdBanner';

export default function Home() {
  const { events, benefits } = localData;

  // 오늘 날짜 가져오기 (마지막 업데이트용)
  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  const currentYear = today.getFullYear();
  const parseToISO = (dateStr: string, fallbackMonth?: number) => {
    if (!dateStr || dateStr === '상시') return null;
    const mMatch = dateStr.match(/(\d+)월/);
    const dMatch = dateStr.match(/(\d+)일/);
    const month = mMatch ? parseInt(mMatch[1], 10) : (fallbackMonth || 1);
    const day = dMatch ? parseInt(dMatch[1], 10) : 1;
    return `${currentYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T09:00:00+09:00`;
  };

  const eventSchemas = events.map(item => {
    const mMatch = item.startDate.match(/(\d+)월/);
    const fallbackMonth = mMatch ? parseInt(mMatch[1], 10) : undefined;
    const startIso = parseToISO(item.startDate) || `${currentYear}-01-01T09:00:00+09:00`;
    const endIso = parseToISO(item.endDate, fallbackMonth) || startIso;

    return {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": item.title,
      "startDate": startIso,
      "endDate": endIso,
      "eventStatus": "https://schema.org/EventScheduled",
      "image": [
        "https://agnavguide.com/default-event.jpg"
      ],
      "description": item.summary,
      "offers": {
        "@type": "Offer",
        "url": `https://agnavguide.com${item.link}`,
        "price": "0",
        "priceCurrency": "KRW",
        "availability": "https://schema.org/InStock"
      },
      "performer": {
        "@type": "Organization",
        "name": "성남시"
      },
      "location": {
        "@type": "Place",
        "name": item.location,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": item.location,
          "addressLocality": "성남시",
          "addressRegion": "경기도",
          "addressCountry": "KR"
        }
      }
    };
  });

  const serviceSchemas = benefits.map(item => ({
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    "name": item.title,
    "description": item.summary,
    "provider": {
      "@type": "GovernmentOrganization",
      "name": item.location
    }
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([...eventSchemas, ...serviceSchemas])
        }}
      />
      {/* 1. 상단 헤더 */}
      <header className="bg-blue-900 text-white py-12 px-6 shadow-xl border-b-8 border-blue-600">
        <div className="max-w-5xl mx-auto flex flex-col items-start gap-4">
          <div className="inline-block bg-blue-600 text-blue-50 font-bold px-4 py-1.5 rounded-full text-sm tracking-widest shadow-inner uppercase">
            Local Info
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            성남시 생활 정보
          </h1>
          <p className="text-blue-200 text-lg sm:text-xl font-medium max-w-2xl mt-2 leading-relaxed">
            매일 업데이트되는 우리 동네 알짜배기 혜택과 즐거운 행사 소식을 한눈에 확인하세요.
          </p>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-5xl mx-auto px-6 py-16 space-y-24">
        
        {/* 2. 이번 달 행사/축제 */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              이번 달 
              <span className="text-blue-700 ml-2">행사/축제</span>
            </h2>
            <span className="text-sm font-bold text-slate-600 bg-slate-200 px-3 py-1 rounded-md">
              총 {events.length}건
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((item) => (
              <div key={item.id} className="group bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 transition-all duration-300 flex flex-col h-full">
                 <div className="flex justify-between items-center mb-4">
                   <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full">{item.category}</span>
                   <Link href="/blog" className="text-xs font-bold text-slate-400 hover:text-blue-700 transition-colors">자세히 보기 &rarr;</Link>
                 </div>
                 
                 <h3 className="text-2xl font-black mb-4 leading-snug group-hover:text-blue-700 transition-colors">{item.title}</h3>
                 
                 <div className="space-y-3 text-sm text-slate-600 font-medium mb-8 flex-grow">
                   <p className="flex items-start gap-3">
                     <span className="text-blue-600 shrink-0">📅</span> 
                     <span>{item.startDate} ~ {item.endDate}</span>
                   </p>
                   <p className="flex items-start gap-3">
                     <span className="text-blue-600 shrink-0">📍</span> 
                     <span>{item.location}</span>
                   </p>
                   <p className="flex items-start gap-3">
                     <span className="text-blue-600 shrink-0">👤</span> 
                     <span>{item.target}</span>
                   </p>
                 </div>
                 
                 <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-6 flex-grow">
                    <p className="text-slate-700 font-bold leading-relaxed">{item.summary}</p>
                 </div>
                 
                 <Link href="/blog" className="block w-full text-center bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-colors shadow-md">
                   관련 정보 확인
                 </Link>
              </div>
            ))}
          </div>
        </section>

        <div className="w-full h-px bg-slate-200 my-12"></div>
        
        <AdBanner />

        {/* 3. 지원금/혜택 정보 */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-4 mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              놓치면 아쉬운 
              <span className="text-indigo-700 ml-2">지원금/혜택</span>
            </h2>
             <span className="text-sm font-bold text-slate-600 bg-slate-200 px-3 py-1 rounded-md">
              총 {benefits.length}건
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((item) => (
               <div key={item.id} className="relative overflow-hidden bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] border-l-[12px] border-indigo-600 hover:-translate-y-2 transition-all duration-300">
                 
                 <div className="mb-4">
                   <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">{item.category}</span>
                 </div>
                 
                 <h3 className="text-3xl font-black mb-6 leading-tight text-slate-900">{item.title}</h3>
                 
                 <div className="space-y-4 text-slate-600 font-medium mb-8">
                   <p className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                     <span className="text-indigo-600 font-bold text-sm w-16 shrink-0">신청기간</span> 
                     <span className="text-slate-800">{item.startDate} ~ {item.endDate}</span>
                   </p>
                   <p className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                     <span className="text-indigo-600 font-bold text-sm w-16 shrink-0">신청방법</span> 
                     <span className="text-slate-800">{item.location}</span>
                   </p>
                   <p className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                     <span className="text-indigo-600 font-bold text-sm w-16 shrink-0">지원대상</span> 
                     <span className="text-slate-800">{item.target}</span>
                   </p>
                 </div>
                 
                 <div className="bg-indigo-600 text-white p-5 rounded-2xl mb-8 shadow-inner">
                    <p className="font-extrabold text-lg flex items-center gap-2">
                       <span className="text-2xl">💰</span> {item.summary}
                    </p>
                 </div>
                 
                 <Link href="/blog" className="block w-full text-center bg-indigo-50 text-indigo-700 border-2 border-indigo-100 font-black py-4 rounded-2xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all text-lg shadow-sm">
                   상세 조건 알아보기
                 </Link>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 4. 하단 푸터 */}
      <footer className="bg-slate-950 text-slate-400 py-16 text-center border-t-4 border-blue-900">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
          <div className="bg-slate-900 px-6 py-3 rounded-full mb-8 inline-block shadow-inner">
             <p className="font-black tracking-widest text-lg text-white">우리 동네 생활 정보</p>
          </div>
          
          <div className="space-y-2 mb-8">
             <p className="text-sm font-medium">이 사이트는 공공데이터를 기반으로 운영됩니다.</p>
             <p className="text-sm font-bold text-slate-300">데이터 출처: 공공데이터포털(data.go.kr)</p>
          </div>
          
          <div className="w-12 h-1 bg-slate-700 rounded-full mb-8"></div>
          
          <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            마지막 업데이트: {formattedDate}
          </p>
        </div>
      </footer>
    </div>
  );
}
