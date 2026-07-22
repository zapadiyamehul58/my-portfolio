import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight, Download, Send, Sparkles } from "lucide-react";
import { Profile, Skill } from "../types.js";

interface HeroProps {
  profile: Profile;
  skills: Skill[];
}

export default function Hero({ profile, skills }: HeroProps) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const roles = profile.hero_titles && profile.hero_titles.length > 0
    ? profile.hero_titles
    : ["Python Developer", "AI Engineer", "Data Analytics Enthusiast", "Full-Stack Web Developer"];

  // Typing effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentFullRole = roles[roleIndex];
    const typingSpeed = isDeleting ? 30 : 80;

    if (!isDeleting && displayedText === currentFullRole) {
      // Pause at full text
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayedText === "") {
      setIsDeleting(false);
      setRoleIndex((prev) => (prev + 1) % roles.length);
    } else {
      timer = setTimeout(() => {
        setDisplayedText(
          isDeleting
            ? currentFullRole.substring(0, displayedText.length - 1)
            : currentFullRole.substring(0, displayedText.length + 1)
        );
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, roleIndex, roles]);

  const marqueeSkills = skills.filter(s => s.show_in_hero);
  // Duplicate skills to make the marquee flow infinitely seamless
  const extendedMarquee = [...marqueeSkills, ...marqueeSkills, ...marqueeSkills, ...marqueeSkills];

  const handleScrollToSection = (sectionId: string) => {
    const target = document.querySelector(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col justify-center pt-24 pb-12 overflow-hidden"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Text Content */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/40 backdrop-blur-md text-xs text-cyan-400 font-medium mb-5 shadow-xl"
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>Welcome to my digital space</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-text-primary mb-4"
          >
            Hello, I'm <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
              {profile.name || "Mehul Zapadiya"}
            </span>
          </motion.h1>

          {/* Typing/Rotating text container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-10 text-lg sm:text-xl md:text-2xl font-mono text-indigo-300 font-medium flex items-center mb-6"
          >
            <span>{displayedText}</span>
            <span className="w-1.5 h-6 bg-indigo-400 ml-1.5 animate-pulse" style={{ animationDuration: "0.8s" }} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-text-primary max-w-2xl leading-relaxed mb-10"
          >
            {profile.hero_description ||
              "I build intelligent, data-driven, and scalable digital solutions using Python, Artificial Intelligence, Data Analytics, and modern web technologies—transforming ideas into impactful real-world applications."}
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4 w-full sm:w-auto"
          >
            <button
              onClick={() => handleScrollToSection("#projects")}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-medium text-white text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>View Projects</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {profile.resume_url ? (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-slate-900/40 hover:bg-slate-800/60 backdrop-blur-md text-sm font-medium text-slate-200 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                <Download className="h-4 w-4" />
                <span>Download Resume</span>
              </a>
            ) : (
              <button
                onClick={() => handleScrollToSection("#contact")}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-slate-900/40 hover:bg-slate-800/60 backdrop-blur-md text-sm font-medium text-slate-200 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                <Download className="h-4 w-4" />
                <span>Download Resume</span>
              </button>
            )}

            <button
              onClick={() => handleScrollToSection("#contact")}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-slate-900/20 hover:bg-slate-800/50 backdrop-blur-md text-sm font-medium text-slate-300 hover:text-cyan-400 hover:scale-[1.02] transition-all cursor-pointer shadow-lg"
            >
              <Send className="h-4 w-4" />
              <span>Contact Me</span>
            </button>
          </motion.div>
        </div>

        {/* Right: Avatar/Image Display */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative group cursor-pointer"
          >
            {/* Pulsing Aura Rings */}
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/30 to-cyan-500/30 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0.5 bg-gradient-to-tr from-violet-500 to-cyan-500 rounded-full opacity-60 animate-spin" style={{ animationDuration: "12s" }} />

            {/* Profile Frame */}
            <div className="relative h-64 w-64 sm:h-72 sm:w-72 md:h-80 md:w-80 rounded-full p-2 bg-slate-900/30 overflow-hidden backdrop-blur-md shadow-[0_0_40px_rgba(99,102,241,0.2)]">
              <img
                src={
                  profile.profile_image_url ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
                }
                alt={profile.name || "Mehul Zapadiya"}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover rounded-full filter grayscale hover:grayscale-0 transition-all duration-500 hover:scale-105"
              />
            </div>

            {/* Status indicator badge */}
            <div className="absolute bottom-4 right-4 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono tracking-wider font-semibold text-text-primary uppercase">Available for work</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Marquee Streaming skill tags */}
      {marqueeSkills.length > 0 && (
        <div className="mt-20 w-full bg-slate-900/20 py-5 overflow-hidden z-10 backdrop-blur-md shadow-2xl">
          <div className="relative flex w-full">
            <div className="animate-marquee whitespace-nowrap flex gap-4 text-xs font-mono font-medium text-text-secondary">
              {extendedMarquee.map((skill, index) => (
                <div
                  key={`${skill.id}-${index}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/50 backdrop-blur-md text-slate-200 hover:bg-slate-800/70 hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all cursor-default"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <span>{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
