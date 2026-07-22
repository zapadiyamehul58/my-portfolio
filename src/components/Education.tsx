import { motion } from "motion/react";
import { GraduationCap, Briefcase, Calendar } from "lucide-react";
import { Education as EduType } from "../types.js";

interface EducationProps {
  education: EduType[];
}

export default function Education({ education }: EducationProps) {
  // Sort by order
  const sortedEdu = [...education].sort((a, b) => a.order - b.order);

  const getTimelineIcon = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes("intern") || r.includes("work") || r.includes("developer")) {
      return <Briefcase className="h-5 w-5" />;
    }
    return <GraduationCap className="h-5 w-5" />;
  };

  return (
    <section id="education" className="py-32 relative overflow-hidden bg-transparent">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mb-3"
          >
            05 / Journey & Milestones
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-display font-bold text-text-primary tracking-tight"
          >
            Education & Internships
          </motion.h3>
          <div className="h-1 w-12 bg-indigo-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* Vertical Timeline */}
        <div className="relative border-l border-white/10 ml-4 sm:ml-6 md:ml-32 space-y-12 pb-6">
          {sortedEdu.map((item, idx) => (
            <div key={item.id} className="relative pl-8 sm:pl-10">
              {/* Timeline Icon Node */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="absolute -left-[18px] top-1 h-9 w-9 rounded-full bg-slate-950 border border-white/10 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              >
                {getTimelineIcon(item.role)}
              </motion.div>

              {/* Sidebar Left Duration column (desktop only) */}
              <div className="hidden md:block absolute -left-36 top-1 text-right w-24">
                <span className="text-xs font-mono font-bold tracking-wider text-text-secondary uppercase block mt-1">
                  {item.duration}
                </span>
              </div>

              {/* Content Panel Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 backdrop-blur-md text-left transition-all hover:bg-slate-800/40 hover:-translate-y-1 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-lg font-display font-bold text-text-primary leading-snug">
                      {item.role}
                    </h4>
                    <span className="text-sm font-semibold text-cyan-400 block mt-0.5">
                      {item.institute}
                    </span>
                  </div>

                  {/* Duration fallback (mobile/tablet only) */}
                  <div className="md:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/50 border border-white/5 w-fit">
                    <Calendar className="h-3 w-3 text-text-secondary" />
                    <span className="text-[10px] font-mono tracking-wider text-text-secondary font-bold uppercase">
                      {item.duration}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed font-sans whitespace-pre-wrap">
                  {item.description}
                </p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
