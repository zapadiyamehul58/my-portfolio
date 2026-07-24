import { Profile, Skill, Project, Achievement, Education, Message, DashboardStats } from "../types.js";

const API_BASE = "/api";

// Simple state storage for Auth
let authToken: string | null = localStorage.getItem("admin_token");

export function setToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem("admin_token", token);
  } else {
    localStorage.removeItem("admin_token");
  }
}

export function getToken(): string | null {
  return authToken || localStorage.getItem("admin_token");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const headers = new Headers(options.headers || {});
  
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  // Automatically set Content-Type to application/json for body payloads
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const text = await res.text();
    let json: any = {};
    try {
      json = JSON.parse(text);
    } catch {
      // Not JSON
    }

    if (!res.ok) {
      if (res.status === 401) {
        // Token expired or invalid, clear local auth
        setToken(null);
      }
      return {
        success: false,
        error: json.error || `Server responded with status ${res.status}`
      };
    }

    return {
      success: true,
      data: json.data
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network request failed"
    };
  }
}

export const api = {
  // Public Portfolio fetches
  getPortfolio: () => request<{
    profile: Profile;
    skills: Skill[];
    projects: Project[];
    achievements: Achievement[];
    education: Education[];
  }>("/portfolio"),

  getProfile: () => request<Profile>("/profile"),
  getSkills: () => request<Skill[]>("/skills"),
  getProjects: () => request<Project[]>("/projects"),
  getAchievements: () => request<Achievement[]>("/achievements"),
  getEducation: () => request<Education[]>("/education"),

  submitMessage: (name: string, email: string, phone: string, subject: string, message: string) =>
    request<Message>("/messages", {
      method: "POST",
      body: JSON.stringify({ name, email, phone, subject, message })
    }),

  // Admin Auth
  login: async (email: string, password: string) => {
    const res = await request<{ token: string; email: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (res.success && res.data?.token) {
      setToken(res.data.token);
    }
    return res;
  },

  getMe: () => request<{ email: string }>("/auth/me"),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword })
    }),

  getDashboardStats: () => request<DashboardStats>("/dashboard/stats"),

  sendReply: (messageId: number, body: string) =>
    request<{ message: string }>("/messages/send-reply", {
      method: "POST",
      body: JSON.stringify({ messageId, body })
    }),

  // Profile Updates
  updateProfile: (profile: Partial<Profile>) =>
    request<Profile>("/profile", {
      method: "PUT",
      body: JSON.stringify(profile)
    }),

  // Skills
  createSkill: (skill: Omit<Skill, "id">) =>
    request<Skill>("/skills", {
      method: "POST",
      body: JSON.stringify(skill)
    }),

  updateSkill: (id: number, skill: Partial<Skill>) =>
    request<Skill>(`/skills/${id}`, {
      method: "PUT",
      body: JSON.stringify(skill)
    }),

  deleteSkill: (id: number) =>
    request<{ id: number }>(`/skills/${id}`, {
      method: "DELETE"
    }),

  // Projects
  createProject: (project: Omit<Project, "id">) =>
    request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(project)
    }),

  updateProject: (id: number, project: Partial<Project>) =>
    request<Project>(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(project)
    }),

  deleteProject: (id: number) =>
    request<{ id: number }>(`/projects/${id}`, {
      method: "DELETE"
    }),

  // Achievements
  createAchievement: (achievement: Omit<Achievement, "id">) =>
    request<Achievement>("/achievements", {
      method: "POST",
      body: JSON.stringify(achievement)
    }),

  updateAchievement: (id: number, achievement: Partial<Achievement>) =>
    request<Achievement>(`/achievements/${id}`, {
      method: "PUT",
      body: JSON.stringify(achievement)
    }),

  deleteAchievement: (id: number) =>
    request<{ id: number }>(`/achievements/${id}`, {
      method: "DELETE"
    }),

  // Education
  createEducation: (edu: Omit<Education, "id">) =>
    request<Education>("/education", {
      method: "POST",
      body: JSON.stringify(edu)
    }),

  updateEducation: (id: number, edu: Partial<Education>) =>
    request<Education>(`/education/${id}`, {
      method: "PUT",
      body: JSON.stringify(edu)
    }),

  deleteEducation: (id: number) =>
    request<{ id: number }>(`/education/${id}`, {
      method: "DELETE"
    }),

  // Messages inbox
  getMessages: () => request<Message[]>("/messages"),

  markMessageRead: (id: number, read: boolean) =>
    request<Message>(`/messages/${id}`, {
      method: "PUT",
      body: JSON.stringify({ read })
    }),

  deleteMessage: (id: number) =>
    request<{ id: number }>(`/messages/${id}`, {
      method: "DELETE"
    }),

  // File Upload
  uploadFile: (filename: string, base64Data: string) =>
    request<{ url: string }>("/upload", {
      method: "POST",
      body: JSON.stringify({ filename, base64Data })
    })
};
