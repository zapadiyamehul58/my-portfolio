export interface Profile {
  id: number;
  name: string;
  hero_titles: string[];
  hero_description: string;
  about_paragraphs: string[];
  stats: { label: string; value: string }[];
  profile_image_url: string;
  resume_url: string;
  email: string;
  phone: string;
  github_url: string;
  linkedin_url: string;
  twitter_url?: string;
  leetcode_url?: string;
  instagram_url?: string;
}

export interface Skill {
  id: number;
  name: string;
  category: "Language" | "Framework" | "AI/ML" | "Tools";
  show_in_hero: boolean;
  order: number;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  image_url: string;
  github_url: string;
  live_url?: string;
  tech_stack: string[];
  featured: boolean;
  order: number;
  created_at?: string;
}

export interface Achievement {
  id: number;
  title: string;
  link: string;
  image_url?: string;
  icon: string; // lucide icon name fallback
  category: string;
  order: number;
}

export interface Education {
  id: number;
  institute: string;
  role: string; // degree / position
  description: string;
  duration: string;
  order: number;
}

export interface MessageReply {
  body: string;
  created_at: string;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  read: boolean;
  created_at: string;
  replies?: MessageReply[];
}

export interface DashboardStats {
  projectsCount: number;
  skillsCount: number;
  achievementsCount: number;
  unreadMessagesCount: number;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  category: string;
  content: string; // Markdown or HTML
  excerpt: string;
  cover_image_url?: string;
  author: string;
  created_at: string;
  updated_at?: string;
  published: boolean;
}
