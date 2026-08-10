import { motion } from "motion/react";
import { Code2, Cpu, Wrench, LayoutGrid, Database } from "lucide-react";
import { Skill } from "../types.js";

interface SkillsProps {
  skills: Skill[];
}

export default function Skills({ skills }: SkillsProps) {
  // Group skills by category
  const groupedSkills: Record<string, Skill[]> = {
    "AI/ML": [],
    "Language": [],
    "Framework": [],
    "Tools": []
  };

  skills.forEach(skill => {
    if (groupedSkills[skill.category]) {
      groupedSkills[skill.category].push(skill);
    } else {
      groupedSkills[skill.category] = [skill];
    }
  });

  const getCategoryConfig = (cat: string) => {
    switch (cat) {
      case "AI/ML": return { title: "AI, ML & Automation", icon: <Cpu className="h-5 w-5 text-[#dfb78c]" />, colSpan: "lg:col-span-1" };
      case "Language": return { title: "Languages", icon: <Code2 className="h-5 w-5 text-[#dfb78c]" />, colSpan: "lg:col-span-1" };
      case "Framework": return { title: "Frameworks", icon: <LayoutGrid className="h-5 w-5 text-[#dfb78c]" />, colSpan: "lg:col-span-1" };
      case "Tools": return { title: "Databases & Tools", icon: <Database className="h-5 w-5 text-[#dfb78c]" />, colSpan: "lg:col-span-1" };
      default: return { title: cat, icon: <Wrench className="h-5 w-5 text-[#dfb78c]" />, colSpan: "lg:col-span-1" };
    }
  };

  const displayOrder = ["AI/ML", "Language", "Framework", "Tools"];

  return (
    <section id="skills" className="py-32 relative overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="mb-16">
          <motion.h3
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight leading-tight"
          >
            Technical Skills &<br />Technologies
          </motion.h3>
        </div>

        {/* Skills Grid - Bento Box Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayOrder.map((cat, idx) => {
            const config = getCategoryConfig(cat);
            const catSkills = groupedSkills[cat] || [];
            
            if (catSkills.length === 0) return null;

            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`p-7 rounded-[1.5rem] bg-[#111111]/80 backdrop-blur-sm border border-white/5 hover:border-[#dfb78c]/30 transition-colors group ${config.colSpan}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  {config.icon}
                  <h4 className="text-[1.1rem] font-bold text-white tracking-wide">{config.title}</h4>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {catSkills.map(skill => (
                    <span 
                      key={skill.id}
                      className="px-4 py-2 rounded-full bg-[#1c1c1c] border border-white/5 text-[13px] text-gray-300 font-medium hover:text-white hover:border-white/20 hover:bg-[#252525] transition-all cursor-default"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
