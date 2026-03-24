import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';

export default function BlogList() {
  const posts = getSortedPostsData();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">블로그</h1>
      <div className="space-y-8">
        {posts.length === 0 ? (
          <p className="text-gray-500">아직 작성된 글이 없습니다.</p>
        ) : (
          posts.map((post) => (
            <article key={post.slug} className="border-b border-gray-200 pb-6 mb-6">
              <Link href={`/blog/${post.slug}`} className="block group">
                <h2 className="text-2xl font-semibold group-hover:text-blue-600 transition-colors mb-2">{post.title}</h2>
                <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
                  <time>{post.date}</time>
                  {post.category && <span>{post.category}</span>}
                </div>
                <p className="text-gray-700 leading-relaxed">{post.summary}</p>
              </Link>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
