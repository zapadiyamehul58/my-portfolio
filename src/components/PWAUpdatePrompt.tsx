import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export default function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // We can check for updates periodically here if we want
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  if (!needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-cyan-500/40 p-5 shadow-[0_0_30px_-10px_rgba(34,211,238,0.3)]">
        <button 
          onClick={() => setNeedRefresh(false)}
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5 text-cyan-400">
            <RefreshCw size={24} className="animate-spin-slow" />
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-1 tracking-tight">Update Available</h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-4">
              A new version of the portfolio is available. Update now to see the latest changes.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => updateServiceWorker(true)}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Update App
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
