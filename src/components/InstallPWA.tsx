import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed previously
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    
    // Check for iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIosDevice) {
      setIsIOS(true);
      if (!dismissed) {
        setSupportsPWA(true);
        setTimeout(() => setShowPrompt(true), 5000); // Delay for better UX
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000); // Delay prompt
      }
    };
    
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = async () => {
    if (isIOS) {
      // Just visually acknowledge, they have to use Safari share menu
      return;
    }
    
    if (!promptInstall) return;
    
    promptInstall.prompt();
    const { outcome } = await promptInstall.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowPrompt(false);
    }
  };

  const onDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || !supportsPWA || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 p-5 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)]">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <button 
          onClick={onDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-xl bg-slate-800 p-2 border border-slate-700 shadow-inner">
            <img src="/icons/icon-192.png" alt="Mehul Portfolio" className="w-10 h-10 rounded-lg" />
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-1 tracking-tight">Install Mehul Portfolio</h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-4">
              {isIOS 
                ? "To install this portfolio, tap Share then 'Add to Home Screen'."
                : "Get quick access to my portfolio directly from your device."}
            </p>
            
            {!isIOS && (
              <div className="flex gap-2">
                <button
                  onClick={onClick}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  Install App
                </button>
                <button
                  onClick={onDismiss}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Not Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
