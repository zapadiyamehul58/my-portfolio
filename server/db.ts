import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Profile, Skill, Project, Achievement, Education, Message } from "../src/types.js";

const DB_FILE = path.join(process.cwd(), "data", "db.json");

interface DatabaseSchema {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  achievements: Achievement[];
  education: Education[];
  messages: Message[];
  blogs: Blog[];
  admin: {
    email: string;
    passwordHash: string; // SHA-256 + salt based
    salt: string;
  };
}

// Default hash function using crypto
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

const DEFAULT_SALT = "mehul_portfolio_salt_2026";
const DEFAULT_PASSWORD_HASH = hashPassword("admin@123", DEFAULT_SALT);

const SEED_DATA: DatabaseSchema = {
  profile: {
    id: 1,
    name: "Mehul Zapadiya",
    hero_titles: [
      "Python Developer",
      "AI Engineer",
      "Data Analytics Enthusiast",
      "Full-Stack Web Developer"
    ],
    hero_description: "I build intelligent, data-driven, and scalable digital solutions using Python, Artificial Intelligence, Data Analytics, and modern web technologies—transforming ideas into impactful real-world applications.",
    about_paragraphs: [
      "I'm a BCA student at Atmiya University, Rajkot with a strong passion for building intelligent, real-world applications using Python, AI/ML, and modern web technologies.",
      "Over the past 2+ years, I've developed multiple full-stack projects — from high-speed file sharing platforms to AI-powered image generators and prompt extraction tools. I actively participate in hackathons, earning certificates from national-level coding competitions and AI summits.",
      "My toolkit includes React, TypeScript, Python, Pandas, TensorFlow, and Scikit-learn. I'm driven by curiosity and always exploring the intersection of data science, AI automation, and creative web experiences."
    ],
    stats: [
      { label: "Years Coding", value: "3+" },
      { label: "Projects Built", value: "5+" },
      { label: "Skills Gained", value: "41+" },
      { label: "Qualifications", value: "3+" }
    ],
    profile_image_url: "",
    resume_url: "",
    email: "zapadiyamehul58@gmail.com",
    phone: "9313296581",
    github_url: "https://github.com/zapadiyamehul58-stack",
    linkedin_url: "https://www.linkedin.com/in/mehulz13/"
  },
  skills: [
    // Languages
    { id: 1, name: "Python", category: "Language", show_in_hero: true, order: 1 },
    { id: 2, name: "SQL", category: "Language", show_in_hero: true, order: 2 },
    { id: 3, name: "HTML", category: "Language", show_in_hero: false, order: 3 },
    { id: 4, name: "JavaScript", category: "Language", show_in_hero: true, order: 4 },
    { id: 5, name: "CSS", category: "Language", show_in_hero: false, order: 5 },
    { id: 6, name: "C", category: "Language", show_in_hero: false, order: 6 },
    { id: 7, name: "C#", category: "Language", show_in_hero: false, order: 7 },
    { id: 8, name: "React", category: "Language", show_in_hero: true, order: 8 },
    { id: 9, name: "PHP", category: "Language", show_in_hero: false, order: 9 },
    { id: 10, name: "Laravel", category: "Language", show_in_hero: false, order: 10 },
    { id: 11, name: "Java", category: "Language", show_in_hero: false, order: 11 },

    // Frameworks
    { id: 12, name: "Flask", category: "Framework", show_in_hero: true, order: 12 },
    { id: 13, name: "Streamlit", category: "Framework", show_in_hero: true, order: 13 },
    { id: 14, name: "Basic Web App Deployment", category: "Framework", show_in_hero: false, order: 14 },
    { id: 15, name: "REST API Integration", category: "Framework", show_in_hero: false, order: 15 },
    { id: 16, name: "Basic React", category: "Framework", show_in_hero: false, order: 16 },
    { id: 17, name: "Basic Django", category: "Framework", show_in_hero: false, order: 17 },
    { id: 18, name: "Power BI", category: "Framework", show_in_hero: true, order: 18 },

    // AI / ML
    { id: 19, name: "Scikit-learn", category: "AI/ML", show_in_hero: true, order: 19 },
    { id: 20, name: "Model Evaluation", category: "AI/ML", show_in_hero: false, order: 20 },
    { id: 21, name: "Feature Engineering", category: "AI/ML", show_in_hero: false, order: 21 },
    { id: 22, name: "TypeScript", category: "AI/ML", show_in_hero: false, order: 22 },
    { id: 23, name: "Machine Learning Models", category: "AI/ML", show_in_hero: true, order: 23 },
    { id: 24, name: "Data Preprocessing", category: "AI/ML", show_in_hero: false, order: 24 },
    { id: 25, name: "TensorFlow", category: "AI/ML", show_in_hero: true, order: 25 },
    { id: 26, name: "Pandas", category: "AI/ML", show_in_hero: true, order: 26 },
    { id: 27, name: "NumPy", category: "AI/ML", show_in_hero: true, order: 27 },
    { id: 28, name: "Matplotlib", category: "AI/ML", show_in_hero: false, order: 28 },
    { id: 29, name: "Data Visualization With R", category: "AI/ML", show_in_hero: false, order: 29 },

    // Tools
    { id: 30, name: "Jupyter Lab", category: "Tools", show_in_hero: false, order: 30 },
    { id: 31, name: "Jupyter Notebook", category: "Tools", show_in_hero: false, order: 31 },
    { id: 32, name: "Google Colab", category: "Tools", show_in_hero: false, order: 32 },
    { id: 33, name: "VS Code", category: "Tools", show_in_hero: false, order: 33 },
    { id: 34, name: "Antigravity", category: "Tools", show_in_hero: false, order: 34 },
    { id: 35, name: "GitHub", category: "Tools", show_in_hero: true, order: 35 },
    { id: 36, name: "GitLab", category: "Tools", show_in_hero: false, order: 36 }
  ],
  projects: [
    {
      id: 1,
      title: "Prompt Extractor",
      description: "An intelligent, high-performance tool for extracting prompts and structuring complex inputs for large language models.",
      image_url: "",
      github_url: "https://github.com/zapadiyamehul58-stack/Prompt-Extractor",
      live_url: "",
      tech_stack: ["Python", "Streamlit", "Gemini API", "Regex"],
      featured: true,
      order: 1
    },
    {
      id: 2,
      title: "Image Generator",
      description: "An AI-powered generator utilizing deep learning models to synthesize stunning, customized visual imagery.",
      image_url: "",
      github_url: "https://github.com/zapadiyamehul58-stack/Image-Generator",
      live_url: "",
      tech_stack: ["Python", "TensorFlow", "Flask", "React"],
      featured: true,
      order: 2
    },
    {
      id: 3,
      title: "India Fileshare",
      description: "A high-speed, secure, and decentralized file-sharing platform designed for seamless resource distribution.",
      image_url: "",
      github_url: "https://github.com/zapadiyamehul58-stack/india_fileshare",
      live_url: "",
      tech_stack: ["Python", "Flask", "HTML/CSS", "SQLite"],
      featured: true,
      order: 3
    },
    {
      id: 4,
      title: "Gujarat Eco Grid",
      description: "An eco-friendly, green computing grid tracking data-driven infrastructure and regional emissions patterns.",
      image_url: "",
      github_url: "https://github.com/zapadiyamehul58-stack/Gujrat-eco-grid",
      live_url: "",
      tech_stack: ["Python", "Pandas", "Matplotlib", "Streamlit"],
      featured: false,
      order: 4
    },
    {
      id: 5,
      title: "DS with Python",
      description: "A comprehensive laboratory repository of data science algorithms, feature engineering, and predictive models.",
      image_url: "",
      github_url: "https://github.com/zapadiyamehul58-stack/DS-with-Python",
      live_url: "",
      tech_stack: ["Python", "Jupyter", "Scikit-Learn", "Pandas"],
      featured: false,
      order: 5
    },
    {
      id: 6,
      title: "SwiftShare",
      description: "A streamlined, low-latency client-server sharing application crafted for real-time asset transmission.",
      image_url: "",
      github_url: "https://github.com/zapadiyamehul58-stack/swiftshere",
      live_url: "",
      tech_stack: ["C#", "Socket Programming", "WPF"],
      featured: false,
      order: 6
    }
  ],
  achievements: [
    {
      id: 1,
      title: "Cyber (Cyber Treasure Hunt)",
      link: "https://drive.google.com/file/d/1bMq5mOXj9hIk81kRicNCTRTKhhv1SlwR/view?usp=sharing",
      icon: "Trophy",
      category: "Competition",
      order: 1
    },
    {
      id: 2,
      title: "AI Summit Participation",
      link: "https://drive.google.com/file/d/1d3CI_d25zn5Pa5zncc79LskemoMUpeiQ/view?usp=sharing",
      icon: "Cpu",
      category: "Summit",
      order: 2
    },
    {
      id: 3,
      title: "Code Carnival Achiever",
      link: "https://drive.google.com/file/d/1IBrd5rJOVwsIl_iXQo7aLdHKEIOXHWEM/view?usp=sharing",
      icon: "Award",
      category: "Coding Hackathon",
      order: 3
    },
    {
      id: 4,
      title: "PPT Activity Winner",
      link: "https://drive.google.com/file/d/15W9dShnBQxPYB8P21nPKeS1_F8O7uQro/view?usp=sharing",
      icon: "Presentation",
      category: "Presentation",
      order: 4
    },
    {
      id: 5,
      title: "Sanskriti Youth Festival",
      link: "https://drive.google.com/file/d/1FyHKSmIdIP9SXLCbwuxPSvDfYTAuVgOl/view?usp=sharing",
      icon: "GraduationCap",
      category: "Academic Cultural",
      order: 5
    },
    {
      id: 6,
      title: "Avasar Coding Contest",
      link: "https://drive.google.com/file/d/1VL7gxIeoBHIHRKWSBbl-jF8fASUE9-A9/view?usp=sharing",
      icon: "Award",
      category: "Competition",
      order: 6
    },
    {
      id: 7,
      title: "Kali Linux Cybersecurity training",
      link: "https://drive.google.com/file/d/1XmhFj5wQNhUNHCoCGRSBiXMhPan7B6W3/view?usp=sharing",
      icon: "Shield",
      category: "Security Training",
      order: 7
    },
    {
      id: 8,
      title: "OOP Java Certification",
      link: "https://drive.google.com/file/d/1N-uLII0jdTxJLlev5jyaLPNAXKjntSLj/view?usp=sharing",
      icon: "Code",
      category: "Certification",
      order: 8
    },
    {
      id: 9,
      title: "Google Blogging & SEO training",
      link: "https://drive.google.com/file/d/1ZsgJ_XiIKfJvuBEGPrG7GRmn1DanehFJ/view?usp=sharing",
      icon: "FileText",
      category: "SEO Certification",
      order: 9
    },
    {
      id: 10,
      title: "Google Chat Developers session",
      link: "https://drive.google.com/file/d/1cblhcjLafoiZP2k1lBCfv5qnneHI8RX7/view?usp=sharing",
      icon: "MessageSquare",
      category: "Development",
      order: 10
    },
    {
      id: 11,
      title: "Aufest Event Decoration Lead",
      link: "https://drive.google.com/file/d/1fGFy9N2EiTOsmb17debeDFYrZEF-f5Jf/view?usp=sharing",
      icon: "Sparkles",
      category: "Leadership Award",
      order: 11
    },
    {
      id: 12,
      title: "Hackathon 2.0 Runner Up",
      link: "https://docs.google.com/presentation/d/1ZCKifG5vlgweN7BltvrrGIA6Dc_lt5MEFfoyLF70EYc/edit?usp=sharing",
      icon: "Award",
      category: "Hackathon",
      order: 12
    }
  ],
  education: [
    {
      id: 1,
      institute: "Imbusoft, Rajkot",
      role: "Data Science Intern",
      duration: "2025",
      description: "Worked on real-world Data Science and Machine Learning tasks using Python. Performed data cleaning, preprocessing, and visualization using Pandas and Matplotlib. Assisted in building ML models for prediction-based projects. Gained practical experience in project workflow and deployment concepts. Collaborated with team members to improve model accuracy and project structure.",
      order: 1
    },
    {
      id: 2,
      institute: "Atmiya University",
      role: "Bachelor of Computer Applications (BCA)",
      duration: "2024–2027",
      description: "Focus Areas: Data Science, Artificial Intelligence, Web Development. Built AI/ML and Streamlit-based real-world projects. Participated in hackathons and technical project development. CGPA: 8.83 (Overall GPA: 9.60 up to 4th semester).",
      order: 2
    },
    {
      id: 3,
      institute: "JPS School",
      role: "Higher Secondary Education (Commerce)",
      duration: "2022–2024",
      description: "Studied Mathematics/Statistics/Computer (Commerce stream). Developed strong interest in programming and technology. Started learning basic coding and logical problem solving. Achieved 93.71 percentile rank.",
      order: 3
    }
  ],
  messages: [],
  blogs: [
    {
      id: 1,
      title: "How I Built the Prompt Extractor using Streamlit and Gemini",
      slug: "how-i-built-prompt-extractor",
      category: "Artificial Intelligence",
      content: "In this article, I will explain the architecture behind the Prompt Extractor and how it leverages the power of the Gemini API to systematically organize inputs...",
      excerpt: "Learn how the Prompt Extractor works and why Streamlit is amazing for fast AI prototyping.",
      author: "Mehul Zapadiya",
      created_at: new Date().toISOString(),
      published: true
    }
  ],
  admin: {
    email: "zapadiyamehul58@gmail.com",
    passwordHash: DEFAULT_PASSWORD_HASH,
    salt: DEFAULT_SALT
  }
};

export class Database {
  private data!: DatabaseSchema;

  constructor() {
    this.load();
  }

  private load() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (err) {
        console.warn("Could not create data directory (expected in read-only environments like Vercel).");
      }
    }

    if (!fs.existsSync(DB_FILE)) {
      this.data = SEED_DATA;
      try {
        this.save();
      } catch (err) {}
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(raw);
        // Ensure standard fields exist in case of partial reads or legacy schema
        if (!this.data.profile) this.data.profile = SEED_DATA.profile;
        if (!this.data.skills) this.data.skills = SEED_DATA.skills;
        if (!this.data.projects) this.data.projects = SEED_DATA.projects;
        if (!this.data.achievements) this.data.achievements = SEED_DATA.achievements;
        if (!this.data.education) this.data.education = SEED_DATA.education;
        if (!this.data.messages) this.data.messages = [];
        if (!this.data.blogs) this.data.blogs = SEED_DATA.blogs;
        if (!this.data.admin) this.data.admin = SEED_DATA.admin;
      } catch (err) {
        console.error("Error reading database file, using seeds:", err);
        this.data = SEED_DATA;
        this.save();
      }
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Error writing database file:", err);
    }
  }

  // Profile operations
  getProfile(): Profile {
    return this.data.profile;
  }

  updateProfile(profile: Partial<Profile>): Profile {
    this.data.profile = { ...this.data.profile, ...profile, id: 1 };
    this.save();
    return this.data.profile;
  }

  // Skills operations
  getSkills(): Skill[] {
    return [...this.data.skills].sort((a, b) => a.order - b.order);
  }

  getSkill(id: number): Skill | undefined {
    return this.data.skills.find(s => s.id === id);
  }

  createSkill(skill: Omit<Skill, "id">): Skill {
    const nextId = this.data.skills.length > 0 ? Math.max(...this.data.skills.map(s => s.id)) + 1 : 1;
    const newSkill: Skill = { ...skill, id: nextId };
    this.data.skills.push(newSkill);
    this.save();
    return newSkill;
  }

  updateSkill(id: number, skillUpdate: Partial<Skill>): Skill | undefined {
    const idx = this.data.skills.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    this.data.skills[idx] = { ...this.data.skills[idx], ...skillUpdate, id };
    this.save();
    return this.data.skills[idx];
  }

  deleteSkill(id: number): boolean {
    const lengthBefore = this.data.skills.length;
    this.data.skills = this.data.skills.filter(s => s.id !== id);
    if (this.data.skills.length < lengthBefore) {
      this.save();
      return true;
    }
    return false;
  }

  // Projects operations
  getProjects(): Project[] {
    return [...this.data.projects].sort((a, b) => a.order - b.order);
  }

  getProject(id: number): Project | undefined {
    return this.data.projects.find(p => p.id === id);
  }

  createProject(project: Omit<Project, "id">): Project {
    const nextId = this.data.projects.length > 0 ? Math.max(...this.data.projects.map(p => p.id)) + 1 : 1;
    const newProject: Project = { ...project, id: nextId, created_at: new Date().toISOString() };
    this.data.projects.push(newProject);
    this.save();
    return newProject;
  }

  updateProject(id: number, projectUpdate: Partial<Project>): Project | undefined {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.data.projects[idx] = { ...this.data.projects[idx], ...projectUpdate, id };
    this.save();
    return this.data.projects[idx];
  }

  deleteProject(id: number): boolean {
    const lengthBefore = this.data.projects.length;
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    if (this.data.projects.length < lengthBefore) {
      this.save();
      return true;
    }
    return false;
  }

  // Achievements operations
  getAchievements(): Achievement[] {
    return [...this.data.achievements].sort((a, b) => a.order - b.order);
  }

  getAchievement(id: number): Achievement | undefined {
    return this.data.achievements.find(a => a.id === id);
  }

  createAchievement(achievement: Omit<Achievement, "id">): Achievement {
    const nextId = this.data.achievements.length > 0 ? Math.max(...this.data.achievements.map(a => a.id)) + 1 : 1;
    const newAchievement: Achievement = { ...achievement, id: nextId };
    this.data.achievements.push(newAchievement);
    this.save();
    return newAchievement;
  }

  updateAchievement(id: number, achievementUpdate: Partial<Achievement>): Achievement | undefined {
    const idx = this.data.achievements.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    this.data.achievements[idx] = { ...this.data.achievements[idx], ...achievementUpdate, id };
    this.save();
    return this.data.achievements[idx];
  }

  deleteAchievement(id: number): boolean {
    const lengthBefore = this.data.achievements.length;
    this.data.achievements = this.data.achievements.filter(a => a.id !== id);
    if (this.data.achievements.length < lengthBefore) {
      this.save();
      return true;
    }
    return false;
  }

  // Education operations
  getEducation(): Education[] {
    return [...this.data.education].sort((a, b) => a.order - b.order);
  }

  getEducationItem(id: number): Education | undefined {
    return this.data.education.find(e => e.id === id);
  }

  createEducation(edu: Omit<Education, "id">): Education {
    const nextId = this.data.education.length > 0 ? Math.max(...this.data.education.map(e => e.id)) + 1 : 1;
    const newEdu: Education = { ...edu, id: nextId };
    this.data.education.push(newEdu);
    this.save();
    return newEdu;
  }

  updateEducation(id: number, eduUpdate: Partial<Education>): Education | undefined {
    const idx = this.data.education.findIndex(e => e.id === id);
    if (idx === -1) return undefined;
    this.data.education[idx] = { ...this.data.education[idx], ...eduUpdate, id };
    this.save();
    return this.data.education[idx];
  }

  deleteEducation(id: number): boolean {
    const lengthBefore = this.data.education.length;
    this.data.education = this.data.education.filter(e => e.id !== id);
    if (this.data.education.length < lengthBefore) {
      this.save();
      return true;
    }
    return false;
  }

  // Messages operations
  getMessages(): Message[] {
    return [...this.data.messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getMessage(id: number): Message | undefined {
    return this.data.messages.find(m => m.id === id);
  }

  createMessage(msg: Omit<Message, "id" | "read" | "created_at">): Message {
    const nextId = this.data.messages.length > 0 ? Math.max(...this.data.messages.map(m => m.id)) + 1 : 1;
    const newMessage: Message = {
      ...msg,
      id: nextId,
      read: false,
      created_at: new Date().toISOString()
    };
    this.data.messages.push(newMessage);
    this.save();
    return newMessage;
  }

  updateMessage(id: number, messageUpdate: Partial<Message>): Message | undefined {
    const idx = this.data.messages.findIndex(m => m.id === id);
    if (idx === -1) return undefined;
    this.data.messages[idx] = { ...this.data.messages[idx], ...messageUpdate, id };
    this.save();
    return this.data.messages[idx];
  }

  deleteMessage(id: number): boolean {
    const lengthBefore = this.data.messages.length;
    this.data.messages = this.data.messages.filter(m => m.id !== id);
    if (this.data.messages.length < lengthBefore) {
      this.save();
      return true;
    }
    return false;
  }

  // Blog operations
  getBlogs(): Blog[] {
    return [...this.data.blogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getBlog(id: number): Blog | undefined {
    return this.data.blogs.find(b => b.id === id);
  }

  getBlogBySlug(slug: string): Blog | undefined {
    return this.data.blogs.find(b => b.slug === slug);
  }

  createBlog(blog: Omit<Blog, "id" | "created_at" | "updated_at">): Blog {
    const nextId = this.data.blogs.length > 0 ? Math.max(...this.data.blogs.map(b => b.id)) + 1 : 1;
    const newBlog: Blog = {
      ...blog,
      id: nextId,
      created_at: new Date().toISOString()
    };
    this.data.blogs.push(newBlog);
    this.save();
    return newBlog;
  }

  updateBlog(id: number, blogUpdate: Partial<Blog>): Blog | undefined {
    const idx = this.data.blogs.findIndex(b => b.id === id);
    if (idx === -1) return undefined;
    this.data.blogs[idx] = { 
      ...this.data.blogs[idx], 
      ...blogUpdate, 
      id,
      updated_at: new Date().toISOString() 
    };
    this.save();
    return this.data.blogs[idx];
  }

  deleteBlog(id: number): boolean {
    const lengthBefore = this.data.blogs.length;
    this.data.blogs = this.data.blogs.filter(b => b.id !== id);
    if (this.data.blogs.length < lengthBefore) {
      this.save();
      return true;
    }
    return false;
  }

  // Admin authentication operations
  getAdmin() {
    return this.data.admin;
  }

  updateAdminPassword(newPasswordHash: string, newSalt: string) {
    this.data.admin.passwordHash = newPasswordHash;
    this.data.admin.salt = newSalt;
    this.save();
  }
}

export const db = new Database();
