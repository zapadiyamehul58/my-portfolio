import { useState, useEffect, FormEvent, ChangeEvent, Fragment, ComponentType } from "react";
import {
  LayoutDashboard,
  User,
  Code2,
  Cpu,
  Trophy,
  GraduationCap,
  Mail,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Check,
  Eye,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  FileText,
  Upload,
  AlertCircle,
  Award,
  Presentation,
  Shield,
  Code,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import AnimatedBackground from "../../components/AnimatedBackground.js";

const Icons: Record<string, ComponentType<any>> = {
  LayoutDashboard,
  User,
  Code2,
  Cpu,
  Trophy,
  GraduationCap,
  Mail,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Check,
  Eye,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  FileText,
  Upload,
  AlertCircle,
  Award,
  Presentation,
  Shield,
  Code,
  MessageSquare,
  Sparkles
};
import { Profile, Skill, Project, Achievement, Education, Message, DashboardStats } from "../../types.js";
import { api, setToken } from "../../lib/api.js";

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [expandedMessageId, setExpandedMessageId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [skillsFilter, setSkillsFilter] = useState<string>("All");
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null; text: string }>({
    type: null,
    text: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal / Editing states
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Partial<Achievement> | null>(null);
  const [editingEducation, setEditingEducation] = useState<Partial<Education> | null>(null);
  
  // Security settings state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // Load all initial data on mount
  const loadAllData = async () => {
    setIsLoading(true);
    const res = await api.getPortfolio();
    if (res.success && res.data) {
      setProfile(res.data.profile);
      setSkills(res.data.skills);
      setProjects(res.data.projects);
      setAchievements(res.data.achievements);
      setEducation(res.data.education);
    }
    
    const statsRes = await api.getDashboardStats();
    if (statsRes.success && statsRes.data) {
      setStats(statsRes.data);
    }

    const messagesRes = await api.getMessages();
    if (messagesRes.success && messagesRes.data) {
      setMessages(messagesRes.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const triggerStatus = (type: "success" | "error", text: string) => {
    setSaveStatus({ type, text });
    setTimeout(() => setSaveStatus({ type: null, text: "" }), 4000);
  };

  const handleLogout = () => {
    setToken(null);
    onLogout();
  };

  // Helper for Base64 Conversions and backend uploads
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, onUploadComplete: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = reader.result as string;
      setIsSubmitting(true);
      const res = await api.uploadFile(file.name, base64);
      setIsSubmitting(false);
      if (res.success && res.data) {
        onUploadComplete(res.data.url);
        triggerStatus("success", `File "${file.name}" uploaded successfully.`);
      } else {
        triggerStatus("error", res.error || "Failed to upload file.");
      }
    };
  };

  // ==================== PROFILE ACTIONS ====================
  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);
    const res = await api.updateProfile(profile);
    setIsSubmitting(false);
    if (res.success && res.data) {
      setProfile(res.data);
      triggerStatus("success", "Profile updated successfully.");
    } else {
      triggerStatus("error", res.error || "Failed to update profile.");
    }
  };

  // ==================== SKILLS CRUD ====================
  const handleSkillSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;
    setIsSubmitting(true);
    let res;
    if (editingSkill.id) {
      res = await api.updateSkill(editingSkill.id, editingSkill);
    } else {
      res = await api.createSkill(editingSkill as Omit<Skill, "id">);
    }
    setIsSubmitting(false);
    if (res.success && res.data) {
      setEditingSkill(null);
      loadAllData();
      triggerStatus("success", "Skill saved successfully.");
    } else {
      triggerStatus("error", res.error || "Failed to save skill.");
    }
  };

  const handleSkillDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;
    const res = await api.deleteSkill(id);
    if (res.success) {
      loadAllData();
      triggerStatus("success", "Skill deleted.");
    } else {
      triggerStatus("error", res.error || "Failed to delete skill.");
    }
  };

  // ==================== PROJECTS CRUD ====================
  const handleProjectSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setIsSubmitting(true);
    let res;
    if (editingProject.id) {
      res = await api.updateProject(editingProject.id, editingProject);
    } else {
      res = await api.createProject(editingProject as Omit<Project, "id">);
    }
    setIsSubmitting(false);
    if (res.success && res.data) {
      setEditingProject(null);
      loadAllData();
      triggerStatus("success", "Project saved successfully.");
    } else {
      triggerStatus("error", res.error || "Failed to save project.");
    }
  };

  const handleProjectDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const res = await api.deleteProject(id);
    if (res.success) {
      loadAllData();
      triggerStatus("success", "Project deleted.");
    } else {
      triggerStatus("error", res.error || "Failed to delete project.");
    }
  };

  // ==================== ACHIEVEMENTS CRUD ====================
  const handleAchievementSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingAchievement) return;
    setIsSubmitting(true);
    let res;
    if (editingAchievement.id) {
      res = await api.updateAchievement(editingAchievement.id, editingAchievement);
    } else {
      res = await api.createAchievement(editingAchievement as Omit<Achievement, "id">);
    }
    setIsSubmitting(false);
    if (res.success && res.data) {
      setEditingAchievement(null);
      loadAllData();
      triggerStatus("success", "Achievement saved successfully.");
    } else {
      triggerStatus("error", res.error || "Failed to save achievement.");
    }
  };

  const handleAchievementDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this achievement/certificate?")) return;
    const res = await api.deleteAchievement(id);
    if (res.success) {
      loadAllData();
      triggerStatus("success", "Achievement deleted.");
    } else {
      triggerStatus("error", res.error || "Failed to delete achievement.");
    }
  };

  // ==================== EDUCATION CRUD ====================
  const handleEducationSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingEducation) return;
    setIsSubmitting(true);
    let res;
    if (editingEducation.id) {
      res = await api.updateEducation(editingEducation.id, editingEducation);
    } else {
      res = await api.createEducation(editingEducation as Omit<Education, "id">);
    }
    setIsSubmitting(false);
    if (res.success && res.data) {
      setEditingEducation(null);
      loadAllData();
      triggerStatus("success", "Education timeline saved successfully.");
    } else {
      triggerStatus("error", res.error || "Failed to save education timeline.");
    }
  };

  const handleEducationDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this education or internship milestone?")) return;
    const res = await api.deleteEducation(id);
    if (res.success) {
      loadAllData();
      triggerStatus("success", "Milestone deleted.");
    } else {
      triggerStatus("error", res.error || "Failed to delete milestone.");
    }
  };

  // ==================== MESSAGES CRUD ====================
  const handleMessageMarkRead = async (id: number, read: boolean) => {
    const res = await api.markMessageRead(id, read);
    if (res.success) {
      loadAllData();
    }
  };

  const handleMessageDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    const res = await api.deleteMessage(id);
    if (res.success) {
      loadAllData();
      triggerStatus("success", "Message deleted from inbox.");
    }
  };

  const buildGmailComposeUrl = (to: string, subject: string, body: string) => {
    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      to,
      su: subject,
      body
    });
    return `https://mail.google.com/mail/?${params.toString()}`;
  };

  // ==================== SECURITY PASSWORD ACTIONS ====================
  const handlePasswordChangeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      triggerStatus("error", "New passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    const res = await api.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    setIsSubmitting(false);
    if (res.success) {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      triggerStatus("success", "Admin password changed successfully.");
    } else {
      triggerStatus("error", res.error || "Failed to change password.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#151822]/80 backdrop-blur flex flex-col justify-center items-center">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">Syncing Admin Workspace...</span>
      </div>
    );
  }

  const sidebarItems = [
    { id: "overview", name: "Dashboard Overview", icon: LayoutDashboard },
    { id: "profile", name: "Profile & Hero", icon: User },
    { id: "skills", name: "Skills Registry", icon: Code2 },
    { id: "projects", name: "Project Portfolio", icon: Cpu },
    { id: "achievements", name: "Achievements & Certs", icon: Trophy },
    { id: "education", name: "Education Journey", icon: GraduationCap },
    { id: "messages", name: `Inbox Submissions (${messages.filter(m => !m.read).length})`, icon: Mail },
    { id: "security", name: "Password Security", icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col md:flex-row relative">
      <AnimatedBackground />
      {/* Toast Alert Banner */}
      {saveStatus.type && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl border text-sm font-sans flex items-center gap-2 shadow-[0_0_50px_rgba(14,165,233,0.1)] backdrop-blur-md animate-bounce ${
            saveStatus.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
              : "bg-rose-500/15 border-rose-500/25 text-rose-400"
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          <span>{saveStatus.text}</span>
        </div>
      )}

      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-[#0f111a]/60 backdrop-blur-md/60 border-r border-white/5 p-5 flex flex-col justify-between flex-shrink-0 backdrop-blur">
        <div>
          {/* Header */}
          <div className="flex items-center gap-2.5 pb-6 border-b border-white/5 mb-8">
            <div className="h-8 w-8 rounded-lg overflow-hidden border border-indigo-500/30 flex items-center justify-center shadow-lg">
              <img src="/favicon.png" alt="Mehul Admin Logo" className="h-full w-full object-cover" />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-sm text-white block">Mehul Zapadiya</span>
              <span className="text-[10px] font-mono tracking-wider font-semibold text-indigo-400 uppercase">ADMIN PLATFORM</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setEditingSkill(null);
                    setEditingProject(null);
                    setEditingAchievement(null);
                    setEditingEducation(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all text-left cursor-pointer ${
                    activeTab === item.id
                      ? "text-indigo-400 bg-indigo-500/10 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="pt-6 border-t border-white/5 mt-8 space-y-3">
          <a
            href="/"
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/5 text-xs font-mono font-bold text-slate-400 hover:text-white hover:bg-[#0f111a]/60 backdrop-blur-md transition-all"
          >
            <span>VIEW LIVE SITE</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all text-left cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-5xl mx-auto w-full">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="text-left">
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">Console Overview</h2>
              <p className="text-slate-400 text-xs font-mono mt-1 uppercase tracking-wider">Operational Telemetry Summary</p>
            </div>

            {/* Quick Stats widget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: "Active Projects", value: stats?.projectsCount ?? 0, icon: Cpu, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
                { label: "Skills Registered", value: stats?.skillsCount ?? 0, icon: Code2, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
                { label: "Certs & Honors", value: stats?.achievementsCount ?? 0, icon: Trophy, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                { label: "Unread Messages", value: stats?.unreadMessagesCount ?? 0, icon: Mail, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" }
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="p-6 rounded-2xl bg-[#0f111a]/60 backdrop-blur-md border border-white/5 backdrop-blur flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-3xl font-display font-bold text-white block mb-1">{stat.value}</span>
                      <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
                    </div>
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center border ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Messages overview */}
            <div className="p-6 rounded-2xl bg-[#0f111a]/60 backdrop-blur-md border border-white/5 text-left">
              <h3 className="text-base font-semibold text-white mb-5 flex items-center justify-between">
                <span>Recent Inbox Messages</span>
                <button onClick={() => setActiveTab("messages")} className="text-xs font-mono text-indigo-400 hover:text-indigo-300">
                  VIEW FULL INBOX &rarr;
                </button>
              </h3>
              
              <div className="divide-y divide-slate-800/60 space-y-3">
                {messages.slice(0, 3).map((msg) => (
                  <div key={msg.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${msg.read ? "bg-slate-700" : "bg-emerald-500 animate-pulse"}`} />
                        <span className="text-sm font-semibold text-slate-200">{msg.name}</span>
                        <span className="text-xs text-slate-500 font-mono">({msg.email})</span>
                      </div>
                      <p className="text-xs text-slate-400 font-sans pl-4 line-clamp-1">{msg.message}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 uppercase">{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-xs text-slate-500 font-mono py-4">No submissions received yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE & HERO */}
        {activeTab === "profile" && profile && (
          <form onSubmit={handleProfileSave} className="space-y-8 text-left">
            <div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">Edit Profile & Hero</h2>
              <p className="text-slate-400 text-xs font-mono mt-1 uppercase tracking-wider">Dynamic Showcase Meta</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Image & Resume PDF uploads */}
              <div className="p-6 rounded-2xl bg-[#0f111a]/60 backdrop-blur-md border border-white/5 space-y-5">
                <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase block">Digital Assets</span>
                
                {/* Profile Pic preview and file dialog */}
                <div className="space-y-3">
                  <label className="text-xs text-slate-400 font-medium block">Mehul's Avatar Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden border border-white/5 flex-shrink-0">
                      <img src={profile.profile_image_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"} alt="avatar" className="h-full w-full object-cover" />
                    </div>
                    <label className="px-4 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-xs font-medium text-slate-300 hover:text-white cursor-pointer flex items-center gap-2 hover:bg-[#0f111a]/60 backdrop-blur-md transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Avatar</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (url) => setProfile(p => p ? { ...p, profile_image_url: url } : null))}
                      />
                    </label>
                  </div>
                  {profile.profile_image_url && <span className="text-[10px] font-mono text-slate-500 break-all block">{profile.profile_image_url}</span>}
                </div>

                {/* Resume PDF upload */}
                <div className="space-y-3 pt-4 border-t border-white/5/60">
                  <label className="text-xs text-slate-400 font-medium block">Resume CV Document</label>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 flex items-center justify-center text-rose-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <label className="px-4 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-xs font-medium text-slate-300 hover:text-white cursor-pointer flex items-center gap-2 hover:bg-[#0f111a]/60 backdrop-blur-md transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload PDF Document</span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, (url) => setProfile(p => p ? { ...p, resume_url: url } : null))}
                      />
                    </label>
                  </div>
                  {profile.resume_url && <span className="text-[10px] font-mono text-slate-500 break-all block">{profile.resume_url}</span>}
                </div>
              </div>

              {/* Core Information form */}
              <div className="p-6 rounded-2xl bg-[#0f111a]/60 backdrop-blur-md border border-white/5 space-y-4">
                <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase block">Basic Details</span>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Developer Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-indigo-500/60 focus:outline-none text-sm text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Contact Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-indigo-500/60 focus:outline-none text-sm text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-indigo-500/60 focus:outline-none text-sm text-slate-200"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Social channels editing */}
            <div className="p-6 rounded-2xl bg-[#0f111a]/60 backdrop-blur-md border border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="col-span-full">
                <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase block">Social Channels</span>
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1.5">GitHub Profile Link</label>
                <input
                  type="url"
                  value={profile.github_url}
                  onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-indigo-500/60 focus:outline-none text-sm text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1.5">LinkedIn Profile Link</label>
                <input
                  type="url"
                  value={profile.linkedin_url}
                  onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-indigo-500/60 focus:outline-none text-sm text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1.5">LeetCode Profile Link (Optional)</label>
                <input
                  type="url"
                  value={profile.leetcode_url || ""}
                  onChange={(e) => setProfile({ ...profile, leetcode_url: e.target.value })}
                  placeholder="https://leetcode.com/..."
                  className="w-full px-4 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-indigo-500/60 focus:outline-none text-sm text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Twitter / X Profile Link (Optional)</label>
                <input
                  type="url"
                  value={profile.twitter_url || ""}
                  onChange={(e) => setProfile({ ...profile, twitter_url: e.target.value })}
                  placeholder="https://twitter.com/..."
                  className="w-full px-4 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-indigo-500/60 focus:outline-none text-sm text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Instagram Profile Link (Optional)</label>
                <input
                  type="url"
                  value={profile.instagram_url || ""}
                  onChange={(e) => setProfile({ ...profile, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-indigo-500/60 focus:outline-none text-sm text-slate-200"
                />
              </div>
            </div>

            {/* Hero Copy fields */}
            <div className="p-6 rounded-2xl bg-[#0f111a]/60 backdrop-blur-md border border-white/5 space-y-4">
              <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase block">Hero Descriptions</span>
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Hero Title Roles (Comma-separated list)</label>
                <input
                  type="text"
                  value={profile.hero_titles.join(", ")}
                  onChange={(e) => setProfile({ ...profile, hero_titles: e.target.value.split(",").map(s => s.trim()) })}
                  className="w-full px-4 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-indigo-500/60 focus:outline-none text-sm text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Hero Descriptive Narrative</label>
                <textarea
                  value={profile.hero_description}
                  onChange={(e) => setProfile({ ...profile, hero_description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-indigo-500/60 focus:outline-none text-sm text-slate-200 resize-none"
                  required
                />
              </div>
            </div>

            {/* About Narrative Paragraphs */}
            <div className="p-6 rounded-2xl bg-[#0f111a]/60 backdrop-blur-md border border-white/5 space-y-4">
              <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase block">About Me Bio blocks</span>
              {profile.about_paragraphs.map((para, i) => (
                <div key={i}>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 block mb-1">Paragraph {i + 1}</label>
                  <textarea
                    value={para}
                    onChange={(e) => {
                      const updatedParas = [...profile.about_paragraphs];
                      updatedParas[i] = e.target.value;
                      setProfile({ ...profile, about_paragraphs: updatedParas });
                    }}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-indigo-500/60 focus:outline-none text-sm text-slate-200 resize-none"
                    required
                  />
                </div>
              ))}
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              <span>Commit Profile Changes</span>
            </button>
          </form>
        )}

        {/* TAB 3: SKILLS CRUD */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-2xl font-display font-bold text-white tracking-tight">Skills Registry</h2>
                <p className="text-slate-400 text-xs font-mono mt-1 uppercase tracking-wider">Dynamic Skill Matrix</p>
              </div>
              <button
                onClick={() => setEditingSkill({ name: "", category: "Language", show_in_hero: false, order: skills.length + 1 })}
                className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold flex items-center gap-1.5 text-white cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Skill</span>
              </button>
            </div>

            {/* Modal Creator Form */}
            {editingSkill && (
              <form onSubmit={handleSkillSave} className="p-6 rounded-2xl bg-[#0f111a]/60 backdrop-blur-md border border-white/5 space-y-4 text-left animate-fadeIn">
                <h3 className="text-base font-bold text-white mb-2">{editingSkill.id ? "Edit Skill" : "Register New Skill"}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Skill Name</label>
                    <input
                      type="text"
                      value={editingSkill.name || ""}
                      onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                      placeholder="e.g. Scikit-learn"
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Category Group</label>
                    <select
                      value={editingSkill.category || "Language"}
                      onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none text-slate-300"
                    >
                      <option value="Language">Languages</option>
                      <option value="Framework">Frameworks</option>
                      <option value="AI/ML">AI / ML</option>
                      <option value="Tools">Tools & Infra</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Order Priority</label>
                    <input
                      type="number"
                      value={editingSkill.order ?? 0}
                      onChange={(e) => setEditingSkill({ ...editingSkill, order: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingSkill.show_in_hero}
                      onChange={(e) => setEditingSkill({ ...editingSkill, show_in_hero: e.target.checked })}
                      className="rounded bg-[#151822]/80 backdrop-blur border-white/5 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Stream in Hero Marquee</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white inline-flex items-center gap-1 cursor-pointer"
                  >
                    {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    <span>Save Skill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSkill(null)}
                    className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-white/5/60">
              {["All", "Language", "Framework", "AI/ML", "Tools"].map((cat) => {
                const label = cat === "Language" ? "Languages" : cat === "Framework" ? "Frameworks" : cat === "Tools" ? "Tools & Infra" : cat === "AI/ML" ? "AI / ML" : "All Skills";
                const count = cat === "All" ? skills.length : skills.filter(s => s.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSkillsFilter(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                      skillsFilter === cat
                        ? "bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/20"
                        : "bg-[#0f111a]/60 backdrop-blur-md border border-white/5 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{label} ({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Grid of Skill Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills
                .filter(s => skillsFilter === "All" || s.category === skillsFilter)
                .sort((a, b) => a.order - b.order)
                .map((skill) => (
                  <div
                    key={skill.id}
                    className="p-5 rounded-2xl bg-[#0f111a]/60 backdrop-blur-md border border-white/5 hover:border-indigo-500/30 backdrop-blur-md flex flex-col justify-between group transition-all duration-300 relative"
                  >
                    <div className="space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500 font-semibold">Priority #{skill.order}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono tracking-wider font-semibold text-cyan-400 bg-cyan-500/5 border border-cyan-500/10 uppercase">
                          {skill.category === "Language" ? "Language" : skill.category === "Framework" ? "Framework" : skill.category === "Tools" ? "Tool" : "AI/ML"}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-white tracking-tight">{skill.name}</h4>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5/60">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${skill.show_in_hero ? "bg-emerald-500 animate-pulse" : "bg-slate-700"}`} />
                        <span className="text-[10px] font-mono text-slate-400">{skill.show_in_hero ? "Hero Marquee" : "Standard"}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingSkill(skill)}
                          className="p-1.5 rounded-lg border border-white/5 text-slate-400 hover:text-white hover:bg-[#151822]/80 backdrop-blur transition-colors cursor-pointer"
                          title="Edit Skill"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSkillDelete(skill.id)}
                          className="p-1.5 rounded-lg border border-white/5 text-rose-500 hover:text-rose-400 hover:bg-[#151822]/80 backdrop-blur transition-colors cursor-pointer"
                          title="Delete Skill"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              {skills.filter(s => skillsFilter === "All" || s.category === skillsFilter).length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 font-mono text-xs border border-dashed border-white/5 rounded-2xl">
                  No skills listed in this category.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PROJECTS PORTFOLIO */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-2xl font-display font-bold text-white tracking-tight">Project Portfolio</h2>
                <p className="text-slate-400 text-xs font-mono mt-1 uppercase tracking-wider">Showcase Registrations</p>
              </div>
              <button
                onClick={() => setEditingProject({ title: "", description: "", image_url: "", github_url: "", live_url: "", tech_stack: [], featured: false, order: projects.length + 1 })}
                className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold flex items-center gap-1.5 text-white cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Project</span>
              </button>
            </div>

            {/* Modal Editor Form */}
            {editingProject && (
              <form onSubmit={handleProjectSave} className="p-6 rounded-2xl bg-[#0f111a]/60 backdrop-blur-md border border-white/5 space-y-4 text-left animate-fadeIn">
                <h3 className="text-base font-bold text-white mb-2">{editingProject.id ? "Edit Project Details" : "Register New Project"}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Project Title</label>
                    <input
                      type="text"
                      value={editingProject.title || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                      placeholder="e.g. Prompt Extractor"
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Priority Order</label>
                    <input
                      type="number"
                      value={editingProject.order ?? 0}
                      onChange={(e) => setEditingProject({ ...editingProject, order: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Project Description</label>
                  <textarea
                    value={editingProject.description || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    rows={3}
                    placeholder="Provide a concise 2-sentence summary of model objectives and stack implementations..."
                    className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">GitHub Repository Link</label>
                    <input
                      type="url"
                      value={editingProject.github_url || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, github_url: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Live Demo Deployment Link (Optional)</label>
                    <input
                      type="url"
                      value={editingProject.live_url || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, live_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Tech Stack Tags (Comma-separated)</label>
                    <input
                      type="text"
                      value={editingProject.tech_stack?.join(", ") || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, tech_stack: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                      placeholder="Python, Streamlit, Pandas"
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Project Thumbnail image</label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {editingProject.image_url && (
                          <div className="h-10 w-16 rounded overflow-hidden bg-[#151822]/80 backdrop-blur border border-white/5 flex-shrink-0 flex items-center justify-center">
                            <img src={editingProject.image_url} alt="preview" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <input
                          type="text"
                          value={editingProject.image_url || ""}
                          onChange={(e) => setEditingProject({ ...editingProject, image_url: e.target.value })}
                          placeholder="Paste image URL (e.g. /uploads/... or http://...)"
                          className="flex-1 px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex-1 px-3 py-1.5 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 hover:border-slate-700 text-xs text-slate-400 focus-within:border-indigo-500/60 transition-colors flex items-center justify-between cursor-pointer">
                          <span className="truncate">Upload File Instead</span>
                          <Upload className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, (url) => setEditingProject(p => p ? { ...p, image_url: url } : null))}
                          />
                        </label>
                        {editingProject.image_url && (
                          <button
                            type="button"
                            onClick={() => setEditingProject({ ...editingProject, image_url: "" })}
                            className="px-3 py-1.5 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 hover:border-rose-500/40 text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingProject.featured}
                      onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                      className="rounded bg-[#151822]/80 backdrop-blur border-white/5 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Highlight as Featured Project</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white inline-flex items-center gap-1 cursor-pointer"
                  >
                    {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    <span>Save Project</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* List Table of Projects */}
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0f111a]/60 backdrop-blur-md/30">
              <table className="w-full text-left border-collapse text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 bg-[#151822]/80 backdrop-blur/50 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="p-4 font-semibold">Priority</th>
                    <th className="p-4 font-semibold">Project Title</th>
                    <th className="p-4 font-semibold">Tech Stack</th>
                    <th className="p-4 font-semibold">Featured Badge</th>
                    <th className="p-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-[#0f111a]/60 backdrop-blur-md">
                      <td className="p-4 font-mono font-semibold text-slate-500">#{proj.order}</td>
                      <td className="p-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-12 rounded bg-[#151822]/80 backdrop-blur overflow-hidden border border-white/5 flex-shrink-0 flex items-center justify-center">
                            {proj.image_url ? (
                              <img src={proj.image_url} alt="project" className="h-full w-full object-cover" />
                            ) : (
                              <Cpu className="h-4 w-4 text-slate-600" />
                            )}
                          </div>
                          <span>{proj.title}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {proj.tech_stack.map((t) => (
                            <span key={t} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-850 border border-slate-850 text-slate-400 uppercase">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`h-2 w-2 inline-block rounded-full ${proj.featured ? "bg-indigo-500 animate-pulse" : "bg-slate-700"}`} />
                        <span className="text-xs font-mono ml-2">{proj.featured ? "Featured" : "Standard"}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => setEditingProject(proj)}
                            className="p-1.5 rounded-lg border border-white/5 text-slate-400 hover:text-white hover:bg-[#151822]/80 backdrop-blur transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleProjectDelete(proj.id)}
                            className="p-1.5 rounded-lg border border-white/5 text-rose-500 hover:text-rose-400 hover:bg-[#151822]/80 backdrop-blur transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {projects.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-mono text-xs">No project submissions listed.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ACHIEVEMENTS & CERTIFICATES */}
        {activeTab === "achievements" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-2xl font-display font-bold text-white tracking-tight">Achievements & Certificates</h2>
                <p className="text-slate-400 text-xs font-mono mt-1 uppercase tracking-wider">Honor & Credentials Matrix</p>
              </div>
              <button
                onClick={() => setEditingAchievement({ title: "", link: "", icon: "Award", category: "Certification", order: achievements.length + 1 })}
                className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold flex items-center gap-1.5 text-white cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Achievement</span>
              </button>
            </div>

            {/* Modal Editor Form */}
            {editingAchievement && (
              <form onSubmit={handleAchievementSave} className="p-6 rounded-2xl bg-[#0f111a]/60 backdrop-blur-md border border-white/5 space-y-4 text-left animate-fadeIn">
                <h3 className="text-base font-bold text-white mb-2">{editingAchievement.id ? "Edit Achievement Details" : "Register New Achievement"}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Achievement Title</label>
                    <input
                      type="text"
                      value={editingAchievement.title || ""}
                      onChange={(e) => setEditingAchievement({ ...editingAchievement, title: e.target.value })}
                      placeholder="e.g. Cyber Treasure Hunt Winner"
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Drive/Sourced Document URL</label>
                    <input
                      type="url"
                      value={editingAchievement.link || ""}
                      onChange={(e) => setEditingAchievement({ ...editingAchievement, link: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Category Group</label>
                    <input
                      type="text"
                      value={editingAchievement.category || ""}
                      onChange={(e) => setEditingAchievement({ ...editingAchievement, category: e.target.value })}
                      placeholder="e.g. Competition, Hackathon"
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Icon Indicator (Lucide fallback)</label>
                    <select
                      value={editingAchievement.icon || "Award"}
                      onChange={(e) => setEditingAchievement({ ...editingAchievement, icon: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none text-slate-300"
                    >
                      <option value="Award">Award Badge</option>
                      <option value="Trophy">Trophy Cup</option>
                      <option value="Cpu">CPU Chip</option>
                      <option value="Presentation">Presentation Screen</option>
                      <option value="Shield">Shield Lock</option>
                      <option value="GraduationCap">Graduation Cap</option>
                      <option value="Code">Coding Code</option>
                      <option value="Sparkles">Sparkles Magic</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Priority Order</label>
                    <input
                      type="number"
                      value={editingAchievement.order ?? 0}
                      onChange={(e) => setEditingAchievement({ ...editingAchievement, order: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Credentials Preview / Custom Image (Optional)</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {editingAchievement.image_url && (
                        <div className="h-10 w-10 rounded-xl overflow-hidden bg-[#151822]/80 backdrop-blur border border-white/5 flex-shrink-0 flex items-center justify-center">
                          <img src={editingAchievement.image_url} alt="preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <input
                        type="text"
                        value={editingAchievement.image_url || ""}
                        onChange={(e) => setEditingAchievement({ ...editingAchievement, image_url: e.target.value })}
                        placeholder="Paste image URL (e.g. /uploads/... or http://...)"
                        className="flex-1 px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 px-3 py-1.5 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 hover:border-slate-700 text-xs text-slate-400 focus-within:border-indigo-500/60 transition-colors flex items-center justify-between cursor-pointer">
                        <span className="truncate">Upload File Instead</span>
                        <Upload className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, (url) => setEditingAchievement(a => a ? { ...a, image_url: url } : null))}
                        />
                      </label>
                      {editingAchievement.image_url && (
                        <button
                          type="button"
                          onClick={() => setEditingAchievement(a => a ? { ...a, image_url: "" } : null)}
                          className="px-3 py-1.5 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 hover:border-rose-500/40 text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white inline-flex items-center gap-1 cursor-pointer"
                  >
                    {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    <span>Save Achievement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingAchievement(null)}
                    className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* List Table of Achievements */}
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0f111a]/60 backdrop-blur-md/30">
              <table className="w-full text-left border-collapse text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 bg-[#151822]/80 backdrop-blur/50 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="p-4 font-semibold">Priority</th>
                    <th className="p-4 font-semibold">Achievement / Award Name</th>
                    <th className="p-4 font-semibold">Category Group</th>
                    <th className="p-4 font-semibold">Fallback Icon</th>
                    <th className="p-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {achievements.map((ach) => (
                    <tr key={ach.id} className="hover:bg-[#0f111a]/60 backdrop-blur-md">
                      <td className="p-4 font-mono font-semibold text-slate-500">#{ach.order}</td>
                      <td className="p-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-[#151822]/80 backdrop-blur overflow-hidden border border-white/5 flex-shrink-0 flex items-center justify-center">
                            {ach.image_url ? (
                              <img src={ach.image_url} alt="ach" className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-indigo-400">
                                {(() => {
                                  const IconComp = (Icons as any)[ach.icon];
                                  return IconComp ? <IconComp className="h-4 w-4" /> : <Icons.Award className="h-4 w-4" />;
                                })()}
                              </span>
                            )}
                          </div>
                          <a href={ach.link} target="_blank" rel="noreferrer" className="hover:text-indigo-400 inline-flex items-center gap-1.5 transition-colors">
                            <span>{ach.title}</span>
                            <ArrowUpRight className="h-3 w-3 text-slate-500" />
                          </a>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold text-cyan-400 bg-cyan-500/5 border border-cyan-500/10 uppercase">
                          {ach.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-500">{ach.icon}</td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => setEditingAchievement(ach)}
                            className="p-1.5 rounded-lg border border-white/5 text-slate-400 hover:text-white hover:bg-[#151822]/80 backdrop-blur transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleAchievementDelete(ach.id)}
                            className="p-1.5 rounded-lg border border-white/5 text-rose-500 hover:text-rose-400 hover:bg-[#151822]/80 backdrop-blur transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {achievements.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-mono text-xs">No honors recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: EDUCATION & TIMELINE */}
        {activeTab === "education" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-2xl font-display font-bold text-white tracking-tight">Education Journey</h2>
                <p className="text-slate-400 text-xs font-mono mt-1 uppercase tracking-wider">Milestones & Internship Log</p>
              </div>
              <button
                onClick={() => setEditingEducation({ institute: "", role: "", description: "", duration: "", order: education.length + 1 })}
                className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold flex items-center gap-1.5 text-white cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Milestone</span>
              </button>
            </div>

            {/* Modal Editor Form */}
            {editingEducation && (
              <form onSubmit={handleEducationSave} className="p-6 rounded-2xl bg-[#0f111a]/60 backdrop-blur-md border border-white/5 space-y-4 text-left animate-fadeIn">
                <h3 className="text-base font-bold text-white mb-2">{editingEducation.id ? "Edit Journey Details" : "Register New Journey Milestone"}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Institute Name</label>
                    <input
                      type="text"
                      value={editingEducation.institute || ""}
                      onChange={(e) => setEditingEducation({ ...editingEducation, institute: e.target.value })}
                      placeholder="e.g. Atmiya University"
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Role / Degree / Position</label>
                    <input
                      type="text"
                      value={editingEducation.role || ""}
                      onChange={(e) => setEditingEducation({ ...editingEducation, role: e.target.value })}
                      placeholder="e.g. Bachelor of Computer Applications"
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Duration period</label>
                    <input
                      type="text"
                      value={editingEducation.duration || ""}
                      onChange={(e) => setEditingEducation({ ...editingEducation, duration: e.target.value })}
                      placeholder="e.g. 2024–2027"
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Priority Order</label>
                    <input
                      type="number"
                      value={editingEducation.order ?? 0}
                      onChange={(e) => setEditingEducation({ ...editingEducation, order: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1">Descriptive Details</label>
                  <textarea
                    value={editingEducation.description || ""}
                    onChange={(e) => setEditingEducation({ ...editingEducation, description: e.target.value })}
                    rows={4}
                    placeholder="Focus areas, model deliverables, overall scores, hackathon details..."
                    className="w-full px-3 py-2 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 text-sm focus:border-indigo-500/60 focus:outline-none resize-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white inline-flex items-center gap-1 cursor-pointer"
                  >
                    {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                    <span>Save Milestone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingEducation(null)}
                    className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* List Table of Journeys */}
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0f111a]/60 backdrop-blur-md/30">
              <table className="w-full text-left border-collapse text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 bg-[#151822]/80 backdrop-blur/50 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="p-4 font-semibold">Priority</th>
                    <th className="p-4 font-semibold">Institute</th>
                    <th className="p-4 font-semibold">Role / Degree</th>
                    <th className="p-4 font-semibold">Duration Period</th>
                    <th className="p-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {education.map((edu) => (
                    <tr key={edu.id} className="hover:bg-[#0f111a]/60 backdrop-blur-md">
                      <td className="p-4 font-mono font-semibold text-slate-500">#{edu.order}</td>
                      <td className="p-4 font-semibold text-white">{edu.institute}</td>
                      <td className="p-4 text-slate-300">{edu.role}</td>
                      <td className="p-4 text-slate-400 font-mono text-xs font-bold">{edu.duration}</td>
                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => setEditingEducation(edu)}
                            className="p-1.5 rounded-lg border border-white/5 text-slate-400 hover:text-white hover:bg-[#151822]/80 backdrop-blur transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleEducationDelete(edu.id)}
                            className="p-1.5 rounded-lg border border-white/5 text-rose-500 hover:text-rose-400 hover:bg-[#151822]/80 backdrop-blur transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {education.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-mono text-xs">No educational milestones listed.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: MESSAGES INBOX */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            <div className="text-left">
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">Inbox Messages</h2>
              <p className="text-slate-400 text-xs font-mono mt-1 uppercase tracking-wider">Form submissions database</p>
            </div>

            {/* List Table of Messages */}
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0f111a]/60 backdrop-blur-md/30 text-left">
              <table className="w-full border-collapse text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-white/5 bg-[#151822]/80 backdrop-blur/50 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Sender details</th>
                    <th className="p-4 font-semibold">Message text</th>
                    <th className="p-4 font-semibold">Received</th>
                    <th className="p-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {messages.map((msg) => {
                    const isExpanded = expandedMessageId === msg.id;
                    const cleanPhone = msg.phone ? msg.phone.replace(/[^0-9]/g, "") : "";

                    return (
                      <Fragment key={msg.id}>
                        <tr className={`hover:bg-[#0f111a]/60 backdrop-blur-md border-b border-white/5/40 transition-colors ${msg.read ? "opacity-75" : "font-semibold text-white bg-indigo-500/5"}`}>
                          <td className="p-4">
                            <button
                              onClick={() => handleMessageMarkRead(msg.id, !msg.read)}
                              className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                                msg.read
                                  ? "border-white/5 text-slate-600 hover:border-slate-700"
                                  : "border-emerald-500 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                              }`}
                            >
                              <Check className="h-2.5 w-2.5" />
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-slate-200">{msg.name}</span>
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`mailto:${msg.email}`}
                                  className="text-xs text-indigo-400 font-mono hover:underline inline-flex items-center gap-1"
                                  title="Open Gmail/Compose"
                                >
                                  <Mail className="h-3 w-3 text-slate-500" />
                                  <span>{msg.email}</span>
                                </a>
                              </div>
                              {msg.phone && (
                                <a
                                  href={`https://wa.me/${cleanPhone}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-emerald-400 font-mono hover:underline inline-flex items-center gap-1 mt-0.5"
                                  title="Open WhatsApp Chat"
                                >
                                  <MessageSquare className="h-3 w-3 text-emerald-500" />
                                  <span>{msg.phone}</span>
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="p-4 max-w-[280px]">
                            <p
                              onClick={() => {
                                setExpandedMessageId(isExpanded ? null : msg.id);
                                setReplyText("");
                              }}
                              className="text-xs text-slate-300 truncate cursor-pointer hover:text-indigo-300 transition-colors"
                              title="Click to view message and reply"
                            >
                              {msg.message}
                            </p>
                          </td>
                          <td className="p-4 font-mono text-xs text-slate-500">
                            {new Date(msg.created_at).toLocaleString()}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              <button
                                onClick={() => {
                                  setExpandedMessageId(isExpanded ? null : msg.id);
                                  setReplyText("");
                                }}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  isExpanded
                                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                                    : "border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                }`}
                                title={isExpanded ? "Collapse reply drawer" : "Open reply drawer"}
                              >
                                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                onClick={() => handleMessageDelete(msg.id)}
                                className="p-1.5 rounded-lg border border-white/5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Delete submission"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-[#151822]/80 backdrop-blur/40">
                            <td colSpan={5} className="p-5 border-b border-white/5 bg-[#151822]/80 backdrop-blur/20">
                              <div className="space-y-4 max-w-3xl animate-fadeIn text-left">
                                <div className="p-4 rounded-xl bg-[#0f111a]/60 backdrop-blur-md/50 border border-white/5">
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-1">Original Message</span>
                                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                </div>

                                <div className="space-y-3">
                                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                                    Direct Response Console
                                  </label>
                                  <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={`Write your response to ${msg.name} here...`}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-indigo-500/60 focus:outline-none text-slate-200 placeholder-slate-600 text-sm font-sans transition-colors resize-none"
                                  />
                                  <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={async () => {
                                          setIsSubmitting(true);
                                          try {
                                            const res = await api.sendReply(
                                              msg.email,
                                              "Re: Portfolio Message - Mehul Zapadiya",
                                              replyText || `Hi ${msg.name},\n\n`
                                            );
                                            
                                            if (res.success) {
                                              if (!msg.read) await handleMessageMarkRead(msg.id, true);
                                              triggerStatus("success", "Message sent successfully in the background!");
                                              setReplyText("");
                                              setExpandedMessageId(null);
                                            } else {
                                              triggerStatus("error", res.error || "Failed to send message.");
                                            }
                                          } catch (error: any) {
                                            console.error("Failed to send:", error);
                                            triggerStatus("error", `Error: ${error.message || error}`);
                                          } finally {
                                            setIsSubmitting(false);
                                          }
                                        }}
                                      disabled={isSubmitting}
                                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white inline-flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <Mail className="h-3.5 w-3.5" />
                                      <span>{isSubmitting ? "Sending..." : "Send"}</span>
                                    </button>
                                    {msg.phone && (
                                      <a
                                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(replyText || `Hi ${msg.name}, `)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={() => {
                                          if (!msg.read) handleMessageMarkRead(msg.id, true);
                                        }}
                                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white inline-flex items-center gap-1.5 shadow-lg shadow-emerald-600/10 active:scale-95 transition-all"
                                      >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        <span>Send via WhatsApp</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                  {messages.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-mono text-xs">Your operational inbox is empty.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: SECURITY SETTINGS */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordChangeSubmit} className="space-y-6 text-left max-w-lg">
            <div>
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">Console Access Security</h2>
              <p className="text-slate-400 text-xs font-mono mt-1 uppercase tracking-wider">Dynamic Password Rotation</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f111a]/60 backdrop-blur-md border border-white/5 space-y-4">
              <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase block mb-2">Change Password</span>
              
              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-indigo-500/60 focus:outline-none text-sm text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1.5">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-indigo-500/60 focus:outline-none text-sm text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-indigo-500/60 focus:outline-none text-sm text-slate-200"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white inline-flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              <span>Rotate Credentials</span>
            </button>
          </form>
        )}

      </main>
    </div>
  );
}
