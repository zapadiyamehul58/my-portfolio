import { useEffect, useState } from "react";
import { Blog } from "../types.js";
import { api } from "../lib/api.js";
import Helmet from "../components/Helmet.js";
import AnimatedBackground from "../components/AnimatedBackground.js";
import Navbar from "../components/Navbar.js";
import { Loader2, ArrowRight } from "lucide-react";

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We fetch blogs directly
    fetch("/api/blogs")
      .then(r => r.json())
      .then(res => {
        if (res.success) setBlogs(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const breadcrumbSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": window.location.origin
    },{
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": `${window.location.origin}/blog`
    }]
  });

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <Helmet 
        title="Mehul Zapadiya | Official Blog"
        description="Technical articles on Python, AI, Machine Learning, and Web Development."
        url={`${window.location.origin}/blog`}
        schema={breadcrumbSchema}
      />
      <AnimatedBackground />
      <Navbar currentSection="blog" />

      <main className="max-w-5xl mx-auto px-4 py-32 relative z-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">The Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Journal</span></h1>
        <p className="text-lg text-slate-400 mb-12 max-w-2xl">Thoughts, tutorials, and deep dives into Artificial Intelligence, Data Science, and modern web architectures.</p>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogs.map(blog => (
              <a href={`/blog/${blog.slug}`} key={blog.id} className="group relative block bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">{blog.category}</span>
                  <span className="text-xs text-slate-500 font-mono">&bull; {new Date(blog.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-100 mb-3 group-hover:text-indigo-300 transition-colors">{blog.title}</h3>
                <p className="text-slate-400 mb-6 line-clamp-3">{blog.excerpt}</p>
                <div className="flex items-center text-indigo-400 font-medium text-sm group-hover:text-indigo-300">
                  Read Article <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
