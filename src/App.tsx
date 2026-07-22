import { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Profile, Skill, Project, Achievement, Education } from "./types.js";
import { api, isLoggedIn } from "./lib/api.js";

// Import landing page layouts
import Navbar from "./components/Navbar.js";
import Footer from "./components/Footer.js";
import Home from "./pages/Home.js";

// Import Admin panels
import AdminLogin from "./pages/admin/Login.js";
import AdminDashboard from "./pages/admin/Dashboard.js";
import Helmet from "./components/Helmet.js";

import BlogList from "./pages/BlogList.js";
import BlogPost from "./pages/BlogPost.js";
import ProjectDetails from "./pages/ProjectDetails.js";
import ResumePage from "./pages/Resume.js";

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  
  // Public Landing State
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Simple zero-dependency router
  const path = window.location.pathname;

  // Router logic based on window.location
  useEffect(() => {
    const handleRouteChange = () => {
      const isRelatedToAdmin = window.location.pathname.startsWith("/admin");
      setIsAdminRoute(isRelatedToAdmin);
      setIsAdminLoggedIn(isLoggedIn());
    };

    handleRouteChange();
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  // Fetch all public portfolio aggregates
  const fetchPortfolioData = async () => {
    setIsLoading(true);
    setError(null);
    const res = await api.getPortfolio();
    if (res.success && res.data) {
      setProfile(res.data.profile);
      setSkills(res.data.skills);
      setProjects(res.data.projects);
      setAchievements(res.data.achievements);
      setEducation(res.data.education);
    } else {
      setError(res.error || "Could not retrieve portfolio aggregates from server.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isAdminRoute && (path === "/" || path === "/index.html")) {
      fetchPortfolioData();
    } else {
      setIsLoading(false);
    }
  }, [isAdminRoute, path]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
        <span className="text-slate-400 font-mono text-xs uppercase tracking-wider">Loading Portfolio Experience...</span>
      </div>
    );
  }

  // Error boundary display
  if (error && !isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-center">
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 max-w-md shadow-2xl">
          <span className="text-3xl block mb-4">⚠️</span>
          <h2 className="text-xl font-display font-bold text-white mb-2">Syncing Failed</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">{error}</p>
          <button
            onClick={fetchPortfolioData}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  // Admin routing
  if (isAdminRoute) {
    if (isAdminLoggedIn) {
      return <AdminDashboard onLogout={() => setIsAdminLoggedIn(false)} />;
    } else {
      return <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />;
    }
  }

  // Website Routing
  if (path === "/" || path === "/index.html") {
    return <Home profile={profile} skills={skills} projects={projects} achievements={achievements} education={education} />;
  }

  if (path === "/blog") {
    return <BlogList />;
  }

  if (path.startsWith("/blog/")) {
    const slug = path.replace("/blog/", "");
    return <BlogPost slug={slug} />;
  }

  if (path.startsWith("/projects/")) {
    const id = path.replace("/projects/", "");
    return <ProjectDetails id={id} />;
  }

  if (path === "/resume") {
    return <ResumePage />;
  }

  // 404 Page
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-white">
      <Helmet 
        title="404 - Page Not Found | Mehul Zapadiya"
        description="The requested page could not be found."
        url={window.location.href}
      />
      <h1 className="text-6xl font-bold text-cyan-400 mb-4">404</h1>
      <p className="text-xl text-slate-300 mb-8">Lost in the digital universe.</p>
      <a href="/" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full font-semibold transition-colors">
        Return to Base
      </a>
    </div>
  );
}
