import { MouseEvent } from "react";

interface FooterProps {
  name: string;
}

export default function Footer({ name }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleSmoothScroll = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer className="bg-transparent border-t border-border-subtle py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand/Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg overflow-hidden border border-indigo-500/30 flex items-center justify-center shadow-lg">
              <img src="/favicon.png" alt="Mehul Footer Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-display font-bold text-text-primary tracking-tight">
              {name || "Mehul Zapadiya"}
            </span>
          </div>

          {/* Quick Footer Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-mono text-text-secondary">
            <a
              href="#home"
              onClick={(e) => handleSmoothScroll(e, "#home")}
              className="hover:text-text-primary transition-colors"
            >
              HOME
            </a>
            <a
              href="#about"
              onClick={(e) => handleSmoothScroll(e, "#about")}
              className="hover:text-text-primary transition-colors"
            >
              ABOUT
            </a>
            <a
              href="#skills"
              onClick={(e) => handleSmoothScroll(e, "#skills")}
              className="hover:text-text-primary transition-colors"
            >
              SKILLS
            </a>
            <a
              href="#projects"
              onClick={(e) => handleSmoothScroll(e, "#projects")}
              className="hover:text-text-primary transition-colors"
            >
              PROJECTS
            </a>
            <a
              href="#achievements"
              onClick={(e) => handleSmoothScroll(e, "#achievements")}
              className="hover:text-text-primary transition-colors"
            >
              ACHIEVEMENTS
            </a>
            <a
              href="#education"
              onClick={(e) => handleSmoothScroll(e, "#education")}
              className="hover:text-text-primary transition-colors"
            >
              EDUCATION
            </a>
            <a
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, "#contact")}
              className="hover:text-text-primary transition-colors"
            >
              CONTACT
            </a>
          </div>

          {/* Copyright text */}
          <div className="text-xs font-mono text-text-secondary">
            Built by {name || "Mehul Zapadiya"} &copy; {currentYear}
          </div>
        </div>
      </div>
    </footer>
  );
}
