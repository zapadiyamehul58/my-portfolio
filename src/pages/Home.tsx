import { Profile, Skill, Project, Achievement, Education } from "../types.js";
import Navbar from "../components/Navbar.js";
import Hero from "../components/Hero.js";
import About from "../components/About.js";
import Skills from "../components/Skills.js";
import Projects from "../components/Projects.js";
import Achievements from "../components/Achievements.js";
import EducationComponent from "../components/Education.js";
import Contact from "../components/Contact.js";
import Footer from "../components/Footer.js";
import Helmet from "../components/Helmet.js";
import AnimatedBackground from "../components/AnimatedBackground.js";
import { useEffect, useState } from "react";

interface HomeProps {
  profile: Profile | null;
  skills: Skill[];
  projects: Project[];
  achievements: Achievement[];
  education: Education[];
}

export default function Home({ profile, skills, projects, achievements, education }: HomeProps) {
  const [currentSection, setCurrentSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "skills", "projects", "achievements", "education", "contact"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setCurrentSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const personSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Mehul Zapadiya",
    "url": window.location.origin,
    "image": profile?.profile_image_url ? `${window.location.origin}${profile.profile_image_url}` : "",
    "jobTitle": "Python Developer, AI Engineer, Full Stack Web Developer",
    "worksFor": {
      "@type": "Organization",
      "name": "Freelance"
    },
    "alumniOf": {
      "@type": "CollegeOrUniversity",
      "name": "Atmiya University",
      "sameAs": "https://en.wikipedia.org/wiki/Atmiya_University"
    },
    "description": "Python Developer, AI Engineer, and Full Stack Web Developer from India.",
    "nationality": {
      "@type": "Country",
      "name": "India"
    },
    "sameAs": [
      profile?.github_url || "https://github.com/Mehul-Zapadiya",
      profile?.linkedin_url || "https://linkedin.com/in/mehul-zapadiya"
    ],
    "knowsAbout": skills.map(s => s.name)
  });

  return (
    <div className="relative min-h-screen bg-transparent text-slate-100 selection:bg-indigo-500/30 selection:text-white">
      <Helmet 
        title={profile ? `${profile.name} | Official Portfolio` : "Mehul Zapadiya | Portfolio"}
        description={profile?.hero_description || "Official Portfolio of Mehul Zapadiya - Python Developer, AI Engineer & Full Stack Web Developer."}
        image={profile?.profile_image_url ? `${window.location.origin}${profile.profile_image_url}` : undefined}
        url={window.location.href}
        schema={personSchema}
      />

      <AnimatedBackground />
      <Navbar currentSection={currentSection} />
      {profile && <Hero profile={profile} skills={skills} />}
      {profile && <About profile={profile} />}
      <Skills skills={skills} />
      <Projects projects={projects} />
      <Achievements achievements={achievements} />
      <EducationComponent education={education} />
      {profile && <Contact profile={profile} />}
      {profile && <Footer name={profile.name} />}
    </div>
  );
}
