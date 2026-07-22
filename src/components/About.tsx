import { motion } from "motion/react";
import { Terminal, Shield, Award, GraduationCap } from "lucide-react";
import { Profile } from "../types.js";

interface AboutProps {
  profile: Profile;
}

export default function About({ profile }: AboutProps) {
  const paragraphs = profile.about_paragraphs && profile.about_paragraphs.length > 0
    ? profile.about_paragraphs
    : [
        "I'm a BCA student at Atmiya University, Rajkot with a strong passion for building intelligent, real-world applications using Python, AI/ML, and modern web technologies.",
        "Over the past 2+ years, I've developed multiple full-stack projects — from high-speed file sharing platforms to AI-powered image generators and prompt extraction tools. I actively participate in hackathons, earning certificates from national-level coding competitions and AI summits.",
        "My toolkit includes React, TypeScript, Python, Pandas, TensorFlow, and Scikit-learn. I'm driven by curiosity and always exploring the intersection of data science, AI automation, and creative web experiences."
      ];

  const defaultStats = [
    { label: "Years Coding", value: "3+", sub: "Developing Systems & Building Projects", icon: Terminal },
    { label: "Projects Built", value: "5+", sub: "Models & Dynamic Dashboards", icon: Award },
    { label: "Skills Gained", value: "41+", sub: "Languages, Models & Tech Stack", icon: Shield },
    { label: "Qualifications", value: "3+", sub: "University Degrees & Certs", icon: GraduationCap }
  ];

  // Map dynamic stats values if profile has them
  const displayStats = defaultStats.map((item, idx) => {
    if (profile.stats && profile.stats[idx]) {
      return {
        ...item,
        label: profile.stats[idx].label,
        value: profile.stats[idx].value
      };
    }
    return item;
  });

  return (
    <section id="about" className="py-32 relative overflow-hidden bg-transparent">

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
            01 / Personal Story
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-display font-bold text-text-primary tracking-tight"
          >
            About Me
          </motion.h3>
          <div className="h-1 w-12 bg-indigo-500 mx-auto mt-4 rounded-full" />
        </div>

        {/* Story & Stats Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Narrative Paragraphs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6 text-text-primary text-base sm:text-lg leading-relaxed text-left"
          >
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/40 backdrop-blur-md shadow-xl border border-white/5">
              <span className="text-cyan-400 font-mono text-xs block mb-4 uppercase tracking-wider font-semibold">BCA Student & AI Innovator</span>
              {paragraphs.map((para, idx) => (
                <p key={idx} className={idx > 0 ? "mt-4" : ""}>
                  {para}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Stat Cards Container */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
            {displayStats.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md shadow-lg border border-white/5 hover:border-cyan-500/30 hover:bg-slate-800/40 hover:-translate-y-1 transition-all flex flex-col text-left group"
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-800/50 flex items-center justify-center border border-white/5 text-cyan-400 mb-5 group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:text-white transition-all duration-300 shadow-inner">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl sm:text-4xl font-display font-bold text-text-primary tracking-tight mb-2">
                    {item.value}
                  </span>
                  <span className="text-sm font-semibold text-text-primary font-display mb-1">
                    {item.label}
                  </span>
                  <span className="text-xs text-text-secondary leading-normal">
                    {item.sub}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
