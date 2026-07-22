import { useEffect, useState } from "react";
import { Project } from "../types.js";
import { api } from "../lib/api.js";
import Helmet from "../components/Helmet.js";
import AnimatedBackground from "../components/AnimatedBackground.js";
import Navbar from "../components/Navbar.js";
import { Loader2, ArrowLeft, Github, ExternalLink, Code } from "lucide-react";

export default function ProjectDetails({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app we'd fetch this project directly. We'll fetch all and filter.
    api.getPortfolio().then(res => {
      if (res.success && res.data) {
        const found = res.data.projects.find(p => p.id === Number(id));
        setProject(found || null);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-white">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Project Not Found</h1>
        <a href="/#projects" className="text-indigo-400 hover:underline">Return to Portfolio</a>
      </div>
    );
  }

  const projectSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": project.title,
    "description": project.description,
    "applicationCategory": "WebApplication",
    "author": {
      "@type": "Person",
      "name": "Mehul Zapadiya"
    },
    "url": window.location.href,
    "sameAs": project.github_url || undefined,
    "operatingSystem": "Any"
  });

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <Helmet 
        title={`${project.title} | Projects | Mehul Zapadiya`}
        description={project.description}
        image={project.image_url ? `${window.location.origin}${project.image_url}` : undefined}
        url={window.location.href}
        schema={projectSchema}
      />
      <AnimatedBackground />
      <Navbar currentSection="" />

      <main className="max-w-5xl mx-auto px-4 py-32 relative z-10">
        <a href="/#projects" className="inline-flex items-center text-sm font-mono text-slate-400 hover:text-indigo-400 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </a>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">{project.title}</h1>
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tech_stack.map(tech => (
                  <span key={tech} className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-mono border border-indigo-500/20">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4 shrink-0">
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noreferrer" className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-800 hover:bg-indigo-600 transition-colors border border-slate-700 hover:border-transparent text-slate-300 hover:text-white" aria-label="GitHub Repository">
                  <Github className="h-5 w-5" />
                </a>
              )}
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 transition-colors font-semibold shadow-lg shadow-indigo-500/25" aria-label="Live Demo">
                  <span>Live Demo</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {project.image_url && (
            <div className="w-full aspect-video rounded-xl overflow-hidden mb-12 border border-slate-700/50">
              <img src={project.image_url} alt={`${project.title} preview`} className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}

          <div className="prose prose-invert prose-indigo max-w-none">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-2 mb-6 flex items-center gap-2">
              <Code className="text-indigo-400" /> Project Overview
            </h2>
            <p className="text-lg leading-relaxed text-slate-300">{project.description}</p>
            
            <h3 className="text-xl font-bold text-white mt-10 mb-4">The Challenge</h3>
            <p className="text-slate-400">Developing scalable, high-performance applications requires meticulous architecture. This project tackles complex data handling and provides an intuitive interface for end users while maintaining strict security and speed.</p>
            
            <h3 className="text-xl font-bold text-white mt-10 mb-4">The Solution</h3>
            <p className="text-slate-400">Leveraging modern frameworks and API-driven design, the solution offers real-time responsiveness and seamless integrations. Core logic is highly optimized for production environments.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
