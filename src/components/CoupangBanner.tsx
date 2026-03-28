"use client";

import React from 'react';

export default function CoupangBanner() {
  const coupangId = process.env.NEXT_PUBLIC_COUPANG_PARTNER_ID;
  const showBanner = coupangId && coupangId !== "나중에_입력" && coupangId.trim() !== "";

  if (!showBanner) return null;

  return (
    <div className="w-full flex justify-center py-4 my-8">
      {/* 
        실제 쿠팡 파트너스에서 발급받은 배너 스크립트 또는 iframe을
        이 안쪽에 삽입해 주세요. 
      */}
      <div className="bg-slate-100 border border-slate-200 text-slate-500 rounded-lg p-8 w-full max-w-3xl text-center text-sm font-medium">
        [쿠팡 파트너스 광고 영역]
        <br />
        <span className="text-xs mt-2 block font-normal">
          ID: {coupangId} 가 활성화되었습니다. 이 상자를 쿠팡 제공 코드로 교체하세요.
        </span>
      </div>
    </div>
  );
}
