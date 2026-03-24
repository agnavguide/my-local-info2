import { getPostData, getSortedPostsData } from '@/lib/posts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    <article className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 prose prose-blue lg:prose-lg">
      <h1 className="text-4xl font-extrabold mb-4">{postData.title}</h1>
      <div className="text-gray-500 mb-8 flex space-x-4 border-b border-gray-200 pb-4 text-sm">
        <time>{postData.date}</time>
        {postData.category && <span>• {postData.category}</span>}
      </div>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {postData.content}
      </ReactMarkdown>
    </article>
  );
}
