import { useState } from "react";
import { motion } from "motion/react";
import { Code2, Cpu, Wrench, LayoutGrid, CheckCircle } from "lucide-react";
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
    if (cat === "Tools") return "Tools & Infra";
    return cat;
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Language":
        return <Code2 className="h-4 w-4" />;
      case "Framework":
        return <LayoutGrid className="h-4 w-4" />;
      case "AI/ML":
        return <Cpu className="h-4 w-4" />;
      case "Tools":
        return <Wrench className="h-4 w-4" />;
      default:
        return <Code2 className="h-4 w-4" />;
    }
  };

  const filteredSkills = skills.filter((s) => {
    if (activeTab === "All") return true;
    return s.category === activeTab;
  });

  return (
    <section id="skills" className="py-32 relative overflow-hidden bg-transparent">

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
            className="text-3xl sm:text-4xl font-display font-bold text-text-primary tracking-tight"
          >
            Skills & Technologies
          </motion.h3>
          <div className="h-1 w-12 bg-indigo-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                activeTab === cat
                  ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] font-semibold border border-transparent"
                  : "bg-slate-900/40 text-slate-300 border border-white/5 backdrop-blur hover:text-white hover:bg-slate-800/60 shadow-lg"
              }`}
            >
              {cat !== "All" && getCategoryIcon(cat)}
              {getTabLabel(cat)}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <motion.div
          key={activeTab}
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
            hidden: {}
          }}
        >
          {filteredSkills.map((skill, idx) => (
            <motion.div
              layout
              key={skill.id}
              variants={{
                hidden: { opacity: 0, scale: 0.8, y: 15 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 15 } }
              }}
              whileHover={{ y: -3, backgroundColor: "rgba(30, 41, 59, 0.6)" }}
              className="p-4 rounded-xl bg-slate-900/40 border border-white/5 backdrop-blur-md shadow-lg flex items-center gap-3 text-left transition-all hover:shadow-[0_0_20px_rgba(14,165,233,0.2)] group cursor-default"
            >
              <div className="flex-shrink-0 text-cyan-400 group-hover:text-cyan-400 transition-colors">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-text-primary group-hover:text-text-primary truncate font-sans">
                  {skill.name}
                </span>
                <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">
                  {skill.category}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredSkills.length === 0 && (
          <div className="text-center py-12 text-text-secondary font-mono text-sm">
            No skills available under this category.
          </div>
        )}
      </div>
    </section>
  );
}
