import { useEffect, useState } from "react";
import { Profile } from "../types.js";
import { api } from "../lib/api.js";
import Helmet from "../components/Helmet.js";
import AnimatedBackground from "../components/AnimatedBackground.js";
import Navbar from "../components/Navbar.js";
import { Loader2, ArrowLeft, Download, FileText } from "lucide-react";

export default function ResumePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPortfolio().then(res => {
      if (res.success && res.data) {
        setProfile(res.data.profile);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const profilePageSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": profile?.name || "Mehul Zapadiya",
      "description": profile?.hero_description || "Software Engineer Resume",
      "url": window.location.origin
    }
  });

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      <Helmet 
        title={`Resume | ${profile?.name || "Mehul Zapadiya"}`}
        description="View and download the professional resume of Mehul Zapadiya."
        url={`${window.location.origin}/resume`}
        schema={profilePageSchema}
      />
      <AnimatedBackground />
      <Navbar currentSection="" />

      <main className="max-w-4xl mx-auto px-4 py-32 relative z-10 flex flex-col items-center text-center">
        <a href="/" className="inline-flex items-center text-sm font-mono text-slate-400 hover:text-indigo-400 mb-8 transition-colors self-start">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </a>

        <div className="mb-12">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6">
            <FileText className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Curriculum Vitae</h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            My resume highlights my experience in Data Science, Full Stack Web Development, and Artificial Intelligence.
          </p>
        </div>

        <div className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
          {profile?.resume_url ? (
            <div className="w-full flex flex-col items-center">
              <a href={profile.resume_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full font-semibold text-white transition-all shadow-lg hover:shadow-indigo-500/25 mb-8">
                <Download className="h-5 w-5" /> Download PDF Resume
              </a>
              <div className="w-full aspect-[1/1.4] bg-slate-800/50 rounded-xl border border-slate-700 flex items-center justify-center overflow-hidden">
                <iframe src={profile.resume_url} className="w-full h-full opacity-90" title="Resume Preview"></iframe>
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center text-slate-500">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <p>Resume document is currently being updated.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
