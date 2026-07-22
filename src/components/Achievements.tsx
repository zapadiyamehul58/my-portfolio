import { motion } from "motion/react";
import {
  Trophy,
  Cpu,
  Award,
  Presentation,
  GraduationCap,
  Shield,
  Code,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { ComponentType } from "react";

const Icons: Record<string, ComponentType<any>> = {
  Trophy,
  Cpu,
  Award,
  Presentation,
  GraduationCap,
  Shield,
  Code,
  FileText,
  MessageSquare,
  Sparkles,
  ArrowUpRight
};
import { Achievement } from "../types.js";

interface AchievementsProps {
  achievements: Achievement[];
}

export default function Achievements({ achievements }: AchievementsProps) {
  // Safe icon resolver using lucide-react exports
  const getIcon = (iconName: string) => {
    const IconComp = (Icons as any)[iconName];
    if (IconComp) {
      return <IconComp className="h-5 w-5" />;
    }
    return <Icons.Award className="h-5 w-5" />; // default fallback
  };

  return (
    <section id="achievements" className="py-24 md:py-32 relative overflow-hidden bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mb-3"
          >
            04 / Credentials & Honors
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-100 tracking-tight"
          >
            Achievements & Certificates
          </motion.h3>
          <div className="h-1 w-12 bg-indigo-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((item, idx) => {
            
            // Dynamic styling for top 3
            let rankContainerClass = "border-white/5 bg-slate-900/40 hover:border-cyan-500/30 hover:bg-slate-800/60 shadow-lg";
            let rankNumberClass = "text-slate-600 group-hover:text-cyan-400";
            let iconContainerClass = "bg-slate-800/50 border-white/5 text-cyan-400 group-hover:bg-indigo-600";
            
            if (idx === 0) { // 1st - Gold
              rankContainerClass = "border-yellow-400/50 bg-yellow-400/5 hover:border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.15)] hover:shadow-[0_0_20px_rgba(250,204,21,0.3)]";
              rankNumberClass = "text-yellow-400 group-hover:text-yellow-300 text-lg";
              iconContainerClass = "bg-yellow-400/20 border-yellow-400/50 text-yellow-400 group-hover:bg-yellow-400 group-hover:text-yellow-900";
            } else if (idx === 1) { // 2nd - Silver
              rankContainerClass = "border-slate-300/50 bg-slate-300/5 hover:border-slate-300 shadow-[0_0_15px_rgba(203,213,225,0.1)] hover:shadow-[0_0_20px_rgba(203,213,225,0.2)]";
              rankNumberClass = "text-slate-300 group-hover:text-white text-base";
              iconContainerClass = "bg-slate-300/20 border-slate-300/50 text-slate-300 group-hover:bg-slate-300 group-hover:text-slate-900";
            } else if (idx === 2) { // 3rd - Bronze
              rankContainerClass = "border-amber-600/50 bg-amber-600/5 hover:border-amber-500 shadow-[0_0_15px_rgba(217,119,6,0.1)] hover:shadow-[0_0_20px_rgba(217,119,6,0.2)]";
              rankNumberClass = "text-amber-500 group-hover:text-amber-400 text-base";
              iconContainerClass = "bg-amber-600/20 border-amber-600/50 text-amber-500 group-hover:bg-amber-500 group-hover:text-amber-950";
            }

            return (
              <motion.a
                href={item.link || "#"}
                target={item.link ? "_blank" : undefined}
                rel={item.link ? "noreferrer" : undefined}
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
                className={`p-4 rounded-xl border backdrop-blur-md flex items-center justify-between gap-4 group transition-all duration-300 ${rankContainerClass}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Icon / Avatar preview */}
                  <div className={`h-12 w-12 shrink-0 rounded-lg border flex items-center justify-center group-hover:text-white group-hover:scale-105 transition-all duration-300 shadow-inner ${iconContainerClass}`}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      getIcon(item.icon)
                    )}
                  </div>

                  {/* Text Info */}
                  <div className="flex flex-col min-w-0 overflow-hidden">
                    <h4 className="text-[15px] font-semibold text-slate-100 group-hover:text-white truncate">
                      {item.title}
                    </h4>
                    <p className={`text-[12px] mt-0.5 truncate font-mono tracking-wide uppercase ${idx < 3 ? 'opacity-90' : 'text-cyan-400/80'}`}>
                      {item.category || "Honor"}
                    </p>
                  </div>
                </div>

                {/* Ranking Number */}
                <div className={`font-mono font-bold transition-colors shrink-0 pr-2 ${rankNumberClass}`}>
                  #{idx + 1}
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
