import { useState, FormEvent } from "react";
import { Shield, Lock, Mail, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { api } from "../../lib/api.js";
import AnimatedBackground from "../../components/AnimatedBackground.js";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    const res = await api.login(email, password);
    setIsLoading(false);

    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.error || "Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      {/* Back to Site Button */}
      <a
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>BACK TO PORTFOLIO</span>
      </a>

      {/* Card wrapper */}
      <div className="relative w-full max-w-md p-8 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md shadow-[0_0_50px_rgba(99,102,241,0.15)]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-600/20">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">Mehul Zapadiya</h1>
          <p className="text-slate-400 text-xs font-mono mt-1 uppercase tracking-wider flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span>Administrative Gateway</span>
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="p-3 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@portfolio.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-white/5 focus:border-indigo-500/60 focus:outline-none text-slate-200 placeholder-slate-600 text-sm font-sans transition-colors shadow-inner"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-white/5 focus:border-indigo-500/60 focus:outline-none text-slate-200 placeholder-slate-600 text-sm font-sans transition-colors shadow-inner"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-semibold text-white text-sm shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <span>Unlock Admin Panel</span>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-slate-600 font-mono text-[10px] uppercase tracking-wider">
          Secured with SHA-256 pbkdf2
        </div>
      </div>
    </div>
  );
}
