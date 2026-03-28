"use client";

import React, { useEffect } from 'react';

interface AdBannerProps {
  dataAdSlot?: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
}

export default function AdBanner({
  dataAdSlot = "1234567890", // 임시 슬롯 ID, 나중에 실제 ID로 변경
  dataAdFormat = "auto",
  dataFullWidthResponsive = true,
}: AdBannerProps) {
  const adSenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const showAds = adSenseId && adSenseId !== "나중에_입력" && adSenseId.trim() !== "";

  useEffect(() => {
    if (showAds) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [showAds]);

  if (!showAds) return null;

  return (
    <div className="w-full flex justify-center py-4 my-8">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minWidth: '300px', width: '100%' }}
        data-ad-client={adSenseId}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
      />
    </div>
  );
}
