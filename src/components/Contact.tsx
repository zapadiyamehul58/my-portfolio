import { useState, FormEvent } from "react";
import { motion } from "motion/react";
import { Mail, Phone, Github, Linkedin, Send, Loader2 } from "lucide-react";
import { Profile } from "../types.js";
import { api } from "../lib/api.js";

interface ContactProps {
  profile: Profile;
}

export default function Contact({ profile }: ContactProps) {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error" | null; text: string }>({ type: null, text: "" });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, text: "" });
    
    // Passing "" for phone since the form doesn't have a phone field
    const res = await api.submitMessage(formData.name, formData.email, "", formData.subject, formData.message);
    
    setIsSubmitting(false);
    if (res.success) {
      setSubmitStatus({ type: "success", text: "Message sent successfully!" });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitStatus({ type: null, text: "" }), 5000);
    } else {
      setSubmitStatus({ type: "error", text: res.error || "Failed to send message." });
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-transparent border-t border-white/5">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start max-w-5xl mx-auto">
          
          {/* Left: Contact Information */}
          <div className="space-y-6 flex flex-col text-left">
            <h4 className="text-2xl font-display font-bold text-white mb-2">Contact Information</h4>
            
            <div className="space-y-4">
              {/* Email Card */}
              <a href={`mailto:${profile.email || "zapadiyamehul58@gmail.com"}`} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 shadow-lg flex items-center justify-between transition-all hover:bg-slate-800/50 hover:border-cyan-500/30 hover:-translate-y-1 cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#112a32] text-cyan-400 flex items-center justify-center group-hover:bg-[#153440] transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-0.5">EMAIL</span>
                    <span className="text-sm font-semibold text-slate-200">{profile.email || "zapadiyamehul58@gmail.com"}</span>
                  </div>
                </div>
              </a>

              {/* Phone Card */}
              <a href={`tel:${profile.phone || "+919313296581"}`} className="p-4 rounded-xl bg-slate-900/40 border border-white/5 shadow-lg flex items-center justify-between transition-all hover:bg-slate-800/50 hover:border-cyan-500/30 hover:-translate-y-1 cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#112a32] text-cyan-400 flex items-center justify-center group-hover:bg-[#153440] transition-colors">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-0.5">PHONE</span>
                    <span className="text-sm font-semibold text-slate-200">{profile.phone ? `+${profile.phone}` : "+91 93132 96581"}</span>
                  </div>
                </div>
              </a>

              {/* Github Card */}
              <a href={profile.github_url || "https://github.com/zapadiyamehul58-stack"} target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-slate-900/40 border border-white/5 shadow-lg flex items-center justify-between transition-all hover:bg-slate-800/50 hover:border-cyan-500/30 hover:-translate-y-1 cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#2a1738] text-purple-400 flex items-center justify-center group-hover:bg-[#341d45] transition-colors">
                    <Github className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-0.5">GITHUB</span>
                    <span className="text-sm font-semibold text-slate-200">{(profile.github_url || "github.com/zapadiyamehul58-stack").replace("https://", "")}</span>
                  </div>
                </div>
              </a>

              {/* LinkedIn Card */}
              <a href={profile.linkedin_url || "https://www.linkedin.com/in/mehulz13"} target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl bg-slate-900/40 border border-white/5 shadow-lg flex items-center justify-between transition-all hover:bg-slate-800/50 hover:border-cyan-500/30 hover:-translate-y-1 cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-[#2a1738] text-purple-400 flex items-center justify-center group-hover:bg-[#341d45] transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-0.5">LINKEDIN</span>
                    <span className="text-sm font-semibold text-slate-200">{profile.name || "Mehul Zapadiya"}</span>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Right: Message Form panel */}
          <div className="flex flex-col">
            <div className="p-8 rounded-3xl bg-[#0f111a]/60 backdrop-blur-md border border-white/5 flex flex-col items-start justify-start text-left shadow-[0_0_40px_rgba(14,165,233,0.1)]">
              <h5 className="text-xl font-display font-bold text-white mb-8">Send a Message</h5>
              
              <form onSubmit={handleSubmit} className="w-full space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-2">FULL NAME *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-cyan-500/50 focus:outline-none text-sm text-slate-200 placeholder-slate-600 transition-colors shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-2">EMAIL ADDRESS *</label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-[#151822]/80 backdrop-blur border border-white/5 focus:border-cyan-500/50 focus:outline-none text-sm text-slate-200 placeholder-slate-600 transition-colors shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-2">SUBJECT (OPTIONAL)</label>
                  <input
                    type="text"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl bg-[#151822] border border-slate-800 focus:border-cyan-500/50 focus:outline-none text-sm text-slate-200 placeholder-slate-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-2">MESSAGE *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Your message..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl bg-[#151822] border border-slate-800 focus:border-cyan-500/50 focus:outline-none text-sm text-slate-200 placeholder-slate-600 transition-colors resize-none"
                  />
                </div>

                {submitStatus.type && (
                  <div className={`text-xs p-3 rounded-lg border ${submitStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                    {submitStatus.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] hover:from-[#00b5eb] hover:to-[#0061d9] text-white font-semibold text-sm transition-all disabled:opacity-50 mt-6 shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
