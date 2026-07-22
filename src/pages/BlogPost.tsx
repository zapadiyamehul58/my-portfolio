import { useEffect, useState } from "react";
import { Blog } from "../types.js";
import Helmet from "../components/Helmet.js";
import AnimatedBackground from "../components/AnimatedBackground.js";
import Navbar from "../components/Navbar.js";
import { Loader2, ArrowLeft } from "lucide-react";

export default function BlogPost({ slug }: { slug: string }) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blogs/${slug}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) setBlog(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-white">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Blog Not Found</h1>
        <a href="/blog" className="text-indigo-400 hover:underline">Return to Blog List</a>
      </div>
    );
  }

  const articleSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.title,
    "image": blog.cover_image_url ? [`${window.location.origin}${blog.cover_image_url}`] : [],
    "datePublished": blog.created_at,
    "dateModified": blog.updated_at || blog.created_at,
    "author": [{
        "@type": "Person",
        "name": blog.author,
        "url": window.location.origin
      }]
  });

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <Helmet 
        title={`${blog.title} | Mehul Zapadiya`}
        description={blog.excerpt}
        url={`${window.location.origin}/blog/${blog.slug}`}
        schema={articleSchema}
      />
      <AnimatedBackground />
      <Navbar currentSection="blog" />

      <main className="max-w-4xl mx-auto px-4 py-32 relative z-10">
        <a href="/blog" className="inline-flex items-center text-sm font-mono text-slate-400 hover:text-indigo-400 mb-12 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Articles
        </a>
        
        <header className="mb-12 border-b border-slate-800/50 pb-8">
          <span className="text-sm font-mono text-cyan-400 uppercase tracking-widest">{blog.category}</span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mt-4 mb-6 leading-tight">{blog.title}</h1>
          <div className="flex items-center gap-4 text-slate-400 text-sm">
            <span>By {blog.author}</span>
            <span>&bull;</span>
            <span>{new Date(blog.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </header>

        <article className="prose prose-invert prose-lg prose-indigo max-w-none">
          {/* Note: In a production app, use marked or react-markdown to parse this. We use a simple placeholder approach here for the UI */}
          <div dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, "<br/>") }} />
        </article>
      </main>
    </div>
  );
}
