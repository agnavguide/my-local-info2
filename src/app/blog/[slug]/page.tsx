import { getPostData, getSortedPostsData } from '@/lib/posts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Metadata } from 'next';
import AdBanner from '@/components/AdBanner';

const BASE_URL = 'https://my-local-info2.pages.dev';

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const postData = getPostData(slug);

  if (!postData) {
    return { title: '글을 찾을 수 없습니다' };
  }

  return {
    title: `${postData.title} | 성남시 생활 정보`,
    description: postData.summary || postData.title,
    openGraph: {
      title: postData.title,
      description: postData.summary || postData.title,
      url: `${BASE_URL}/blog/${slug}/`,
      type: 'article',
      publishedTime: postData.date,
    },
  };
}

export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}


export default async function BlogPost(
  props: {
    params: Promise<{ slug: string }>;
  }
) {
  const params = await props.params;
  const { slug } = params;
  const postData = getPostData(slug);

  if (!postData) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold">Post Not Found</h1>
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": postData.title,
            "datePublished": postData.date,
            "description": postData.summary || postData.title,
            "author": {
              "@type": "Organization",
              "name": "성남시 생활 정보",
              "url": BASE_URL
            },
            "publisher": {
              "@type": "Organization",
              "name": "성남시 생활 정보",
              "logo": {
                "@type": "ImageObject",
                "url": `${BASE_URL}/favicon.ico`
              }
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "홈",
                "item": BASE_URL
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "블로그",
                "item": `${BASE_URL}/blog/`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": postData.title,
                "item": `${BASE_URL}/blog/${slug}/`
              }
            ]
          })
        }}
      />
      <article className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 prose prose-blue lg:prose-lg">
        <h1 className="text-4xl font-extrabold mb-4">{postData.title}</h1>
      <div className="text-gray-500 mb-8 flex space-x-4 border-b border-gray-200 pb-4 text-sm">
        <time>최종 업데이트: {postData.date}</time>
        {postData.category && <span>• {postData.category}</span>}
      </div>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {postData.content}
      </ReactMarkdown>
      
      <div className="mt-12 p-6 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-200">
        <p className="mb-2">⚠️ 이 글은 공공데이터포털(<a href="https://www.data.go.kr/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">data.go.kr</a>)의 정보를 바탕으로 AI가 작성하였습니다.</p>
        {postData.link ? (
          <p>정확한 내용은 <a href={postData.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">원문 링크</a>를 통해 확인해주세요.</p>
        ) : (
          <p>정확한 내용은 원문 링크를 통해 확인해주세요.</p>
        )}
      </div>

      <AdBanner />
    </article>
    </>
  );
}
