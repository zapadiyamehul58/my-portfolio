import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Code2, 
  Cpu, 
  Wrench, 
  LayoutGrid, 
  Database,
  FileCode2,
  Terminal,
  Layers,
  BarChart3,
  Globe,
  Settings,
  Server,
  Braces
} from "lucide-react";
import { Skill } from "../types.js";

interface SkillsProps {
  skills: Skill[];
}

export default function Skills({ skills }: SkillsProps) {
  const [activeTab, setActiveTab] = useState<string>("All");

  const categories = ["All", "Language", "Framework", "AI/ML", "Tools"];

  // Helper to format tab label for display
  const getTabLabel = (cat: string) => {
    if (cat === "Language") return "Languages";
    if (cat === "Framework") return "Frameworks";
    if (cat === "AI/ML") return "AI / ML";
    if (cat === "Tools") return "Tools & Infrastructure";
    return cat;
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Language": return <Code2 className="h-4 w-4" />;
      case "Framework": return <LayoutGrid className="h-4 w-4" />;
      case "AI/ML": return <Cpu className="h-4 w-4" />;
      case "Tools": return <Wrench className="h-4 w-4" />;
      default: return <Code2 className="h-4 w-4" />;
    }
  };

  // Select appropriate icon for specific skills
  const getSkillIcon = (skillName: string, category: string) => {
    const name = skillName.toLowerCase();
    if (name.includes("python") || name.includes("javascript") || name.includes("php")) return <FileCode2 className="h-5 w-5" />;
    if (name.includes("sql") || name.includes("database")) return <Database className="h-5 w-5" />;
    if (name.includes("html") || name.includes("css")) return <Globe className="h-5 w-5" />;
    if (name.includes("react") || name.includes("laravel") || name.includes("django") || name.includes("flask")) return <Layers className="h-5 w-5" />;
    if (name.includes("data") || name.includes("model") || name.includes("analytics") || name.includes("scikit") || name.includes("pandas")) return <BarChart3 className="h-5 w-5" />;
    if (name.includes("git") || name.includes("github")) return <Terminal className="h-5 w-5" />;
    if (name.includes("api")) return <Server className="h-5 w-5" />;
    if (category === "Language") return <Braces className="h-5 w-5" />;
    if (category === "Tools") return <Settings className="h-5 w-5" />;
    if (category === "AI/ML") return <Cpu className="h-5 w-5" />;
    return <Code2 className="h-5 w-5" />;
  };

  const filteredSkills = skills.filter((s) => {
    if (activeTab === "All") return true;
    return s.category === activeTab;
  });

  return (
    <section id="skills" className="py-24 sm:py-32 relative bg-transparent scroll-mt-20">
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
            02 / Expertise
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-display font-bold text-slate-100 tracking-tight uppercase"
          >
            Skills & Technologies
          </motion.h3>
          <div className="h-1 w-12 bg-indigo-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 max-w-4xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              aria-pressed={activeTab === cat}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                activeTab === cat
                  ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] font-semibold border border-transparent"
                  : "bg-slate-900/60 text-slate-300 border border-white/10 backdrop-blur hover:text-white hover:bg-slate-800/80 shadow-md"
              }`}
            >
              {cat !== "All" && getCategoryIcon(cat)}
              {getTabLabel(cat)}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 min-h-[400px] content-start">
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill, idx) => (
              <motion.div
                layout="position"
                key={skill.id}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 25, 
                  delay: idx * 0.03 
                }}
                className="group flex flex-col justify-center h-full min-h-[90px] p-5 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-md shadow-lg text-left transition-all duration-300 hover:shadow-[0_8px_30px_rgba(14,165,233,0.15)] hover:border-cyan-500/30 hover:-translate-y-1 hover:bg-slate-800/80 cursor-default"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5 text-cyan-400 group-hover:text-cyan-300 transition-transform duration-300 group-hover:scale-110">
                    {getSkillIcon(skill.name, skill.category)}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-semibold text-slate-100 whitespace-normal break-words leading-tight mb-1 group-hover:text-white transition-colors">
                      {skill.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      {getTabLabel(skill.category)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredSkills.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-16 text-slate-400 font-mono text-sm"
          >
            No skills available under this category.
          </motion.div>
        )}
      </div>
    </section>
  );
}
