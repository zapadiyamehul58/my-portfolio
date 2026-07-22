import { motion } from "motion/react";
import { Github, ExternalLink, Code2 } from "lucide-react";
import { Project } from "../types.js";

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  // Sort projects: featured first, then by order
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.order - b.order;
  });

  // Unique tech badge colors
  const getBadgeStyle = (tech: string) => {
    const t = tech.toLowerCase();
    if (t.includes("python")) return "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
    if (t.includes("react")) return "bg-cyan-500/10 text-cyan-300 border-cyan-500/20";
    if (t.includes("flask") || t.includes("django")) return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
    if (t.includes("tensor") || t.includes("scikit")) return "bg-violet-500/10 text-violet-300 border-violet-500/20";
    if (t.includes("streamlit")) return "bg-amber-500/10 text-amber-300 border-amber-500/20";
    return "bg-slate-800/50 text-slate-200 border-white/10";
  };

  return (
    <section id="projects" className="py-32 relative overflow-hidden bg-transparent">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mb-3"
          >
            03 / Portfolio Showcase
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-display font-bold text-text-primary tracking-tight"
          >
            Featured Projects
          </motion.h3>
          <div className="h-1 w-12 bg-indigo-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* Projects Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
            hidden: {}
          }}
        >
          {sortedProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
              }}
              whileHover={{ y: -8 }}
              className="group rounded-2xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 backdrop-blur-md overflow-hidden flex flex-col h-full shadow-lg hover:shadow-[0_0_30px_rgba(14,165,233,0.15)] transition-all"
            >
              {/* Project Image Frame */}
              <div className="relative h-48 w-full bg-transparent overflow-hidden border-b border-white/5">
                {project.image_url ? (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/40 flex flex-col items-center justify-center p-6 text-center select-none">
                    <Code2 className="h-10 w-10 text-cyan-500/50 mb-3 group-hover:scale-110 group-hover:text-cyan-400 transition-all duration-300" />
                    <span className="font-display font-bold text-text-primary group-hover:text-text-primary transition-colors">{project.title}</span>
                    <span className="text-[10px] font-mono text-text-secondary mt-1 uppercase tracking-widest">Workspace Project</span>
                  </div>
                )}
                {/* Featured Badge */}
                {project.featured && (
                  <div className="absolute top-4 left-4 bg-indigo-600/95 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider text-white shadow-md uppercase">
                    Featured
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-grow text-left">
                <h4 className="text-lg font-display font-bold text-text-primary group-hover:text-cyan-400 transition-colors mb-2">
                  {project.title}
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed mb-6 line-clamp-3 flex-grow">
                  {project.description}
                </p>

                {/* Tech chips */}
                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {project.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-medium border ${getBadgeStyle(tech)}`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Links */}
                <div className="flex items-center gap-3 mt-auto border-t border-white/5 pt-4">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold font-mono text-text-secondary hover:text-text-primary transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      <span>CODE ON GITHUB</span>
                    </a>
                  )}

                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-xs font-semibold font-mono text-cyan-400 hover:text-indigo-300 transition-colors"
                    >
                      <span>LIVE DEMO</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
