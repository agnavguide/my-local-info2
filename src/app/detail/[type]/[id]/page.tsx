import React from 'react';
import Link from 'next/link';
import localData from '../../../../../public/data/local-info.json';

// 정적 페이지 내보내기를 위한 설정 (output: 'export')
export function generateStaticParams() {
  const events = localData.events.map((e) => ({
    type: 'events',
    id: e.id.toString(),
  }));
  const benefits = localData.benefits.map((b) => ({
    type: 'benefits',
    id: b.id.toString(),
  }));
  return [...events, ...benefits];
}

// NextJS 15: params는 Promise입니다.
export default async function DetailPage(props: { params: Promise<{ type: string; id: string }> }) {
  const params = await props.params;
  const { type, id } = params;

  let dataItem = null;
  if (type === 'events') {
    dataItem = localData.events.find((item) => item.id.toString() === id);
  } else if (type === 'benefits') {
    dataItem = localData.benefits.find((item) => item.id.toString() === id);
  }

  // 찾고자 하는 데이터가 없을 때 표시할 화면
  if (!dataItem) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">페이지를 찾을 수 없습니다</h1>
        <p className="text-slate-600 mb-8">존재하지 않거나 삭제된 정보입니다.</p>
        <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md">
          메인 화면으로 돌아가기
        </Link>
      </div>
    );
  }

  // 행사인지 혜택인지에 따라 테마 색상 결정
  const isEvent = type === 'events';
  const navBg = isEvent ? 'bg-blue-900' : 'bg-indigo-900';
  const topBar = isEvent ? 'bg-blue-600' : 'bg-indigo-600';
  const tagBox = isEvent ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200';
  const quoteLine = isEvent ? 'border-blue-500' : 'border-indigo-500';
  const headingColor = isEvent ? 'text-blue-900' : 'text-indigo-900';

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-slate-300">
      {/* 상단 네비게이션바 */}
      <nav className={`text-white py-5 px-6 shadow-md ${navBg}`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-lg flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span>&larr;</span> 돌아가기
          </Link>
          <span className="text-xs font-black tracking-widest uppercase opacity-70 bg-black/20 px-3 py-1 rounded-full">Local Info</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <article className="bg-white rounded-3xl shadow-[0_10px_30px_rgb(0,0,0,0.05)] overflow-hidden border border-slate-100 mb-8">
           {/* 상단 띠 디자인 */}
          <div className={`h-4 w-full ${topBar}`}></div>
          
          <div className="p-8 sm:p-12">
            
            {/* 카테고리 태그 */}
            <div className={`inline-block px-4 py-2 rounded-full text-xs font-black mb-8 border ${tagBox}`}>
              {dataItem.category}
            </div>
            
            {/* 메인 타이틀 */}
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-10">
              {dataItem.title}
            </h1>
            
            {/* 요약 박스 */}
            <div className={`bg-slate-50 border-l-8 p-6 sm:p-8 rounded-r-2xl mb-12 ${quoteLine}`}>
              <p className="text-lg sm:text-xl font-bold text-slate-700">“{dataItem.summary}”</p>
            </div>
            
            {/* 상세 일정/장소 등 요약 정보 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12 mb-12 p-8 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <dt className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <span className="text-lg">📅</span> {isEvent ? '일정' : '신청기간'}
                </dt>
                <dd className="text-slate-900 font-bold text-lg">{dataItem.startDate} ~ {dataItem.endDate}</dd>
              </div>
              <div>
                <dt className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <span className="text-lg">📍</span> {isEvent ? '장소' : '신청방법'}
                </dt>
                <dd className="text-slate-900 font-bold text-lg">{dataItem.location}</dd>
              </div>
              <div className="sm:col-span-2 mt-4 pt-6 border-t border-slate-200">
                <dt className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <span className="text-lg">👤</span> 지원/참여 대상
                </dt>
                <dd className="text-slate-900 font-bold text-lg">{dataItem.target}</dd>
              </div>
            </div>

            <hr className="border-slate-100 mb-10" />
            
            {/* 긴 줄글 형식의 상세 안내 코너 */}
            <div>
              <h3 className={`text-2xl font-black mb-6 flex items-center gap-3 ${headingColor}`}>
                <span className="bg-slate-100 p-2 rounded-lg text-xl">💡</span> 상세 내용 안내
              </h3>
              <div className="text-slate-700 leading-relaxed text-lg bg-white">
                <p>{(dataItem as any).content}</p>
              </div>
            </div>
            
          </div>
        </article>
      </main>
    </div>
  );
}
