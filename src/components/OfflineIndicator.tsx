import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showBackOnline) {
    return null;
  }

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 animate-in fade-in slide-in-from-top-4 ${isOnline ? 'bg-emerald-500/90' : 'bg-red-500/90'} backdrop-blur-md px-4 py-2 rounded-full shadow-lg border ${isOnline ? 'border-emerald-400/50' : 'border-red-400/50'} flex items-center gap-2`}>
      {isOnline ? (
        <>
          <Wifi size={14} className="text-white" />
          <span className="text-white text-xs font-medium">Back online</span>
        </>
      ) : (
        <>
          <WifiOff size={14} className="text-white animate-pulse" />
          <span className="text-white text-xs font-medium">You're currently offline. Some content may be unavailable.</span>
        </>
      )}
    </div>
  );
}
