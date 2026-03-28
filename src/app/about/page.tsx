import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '소개 | 성남시 생활 정보',
  description: '성남시 생활 정보 사이트 운영 목적 및 콘텐츠 안내입니다.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 prose prose-blue lg:prose-lg">
      <h1 className="text-4xl font-extrabold mb-8">성남시 생활 정보 소개</h1>
      <p>
        성남시 생활 정보 웹사이트는 지역 주민들에게 <strong>유익한 생활, 행사, 복지, 혜택 정보</strong>를 빠르고 편리하게 제공하기 위해 운영되고 있습니다.
      </p>
      
      <h2>데이터 출처</h2>
      <p>
        본 사이트에 등록되는 모든 정보의 원본 데이터는 국가 공공데이터포털(<a href="https://www.data.go.kr/" target="_blank" rel="noopener noreferrer">data.go.kr</a>) 및 관련 지자체 사이트 등에서 제공하는 공신력 있는 데이터를 활용합니다.
      </p>

      <h2>콘텐츠 생성 방식</h2>
      <p>
        수집된 원본 데이터는 <strong>인공지능(AI) 기술</strong>을 활용하여 더 알기 쉽고 읽기 편한 블로그 포맷으로 재가공됩니다. 
        데이터 누락이나 오류가 발생할 수 있으므로, 각 게시물 하단의 <strong>원문 링크</strong>를 참조하여 정확한 정보를 다시 한 번 확인하시기를 권장합니다.
      </p>
    </div>
  );
}
