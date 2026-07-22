import React from "react";

export default function AnimatedBackground() {
  return (
    <div className="animated-bg-container">
      {/* Subtle Grain Overlay */}
      <div className="bg-noise"></div>
      
      {/* Floating Stardust particles */}
      <div className="stardust stardust-1"></div>
      <div className="stardust stardust-2"></div>
      <div className="stardust stardust-3"></div>
      
      {/* Ambient glowing orbs */}
      <div className="orb orb-cyan"></div>
      <div className="orb orb-magenta"></div>
      <div className="orb orb-peach"></div>
      
      {/* Flowing Neon Ribbons using SVG */}
      <div className="neon-ribbons">
        <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(0, 255, 255, 0.8)" />
              <stop offset="100%" stopColor="rgba(255, 0, 255, 0.2)" />
            </linearGradient>
            <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 0, 255, 0.6)" />
              <stop offset="100%" stopColor="rgba(255, 165, 0, 0.1)" />
            </linearGradient>
            <linearGradient id="grad3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(75, 0, 130, 0.7)" />
              <stop offset="100%" stopColor="rgba(255, 105, 180, 0.2)" />
            </linearGradient>
          </defs>
        </svg>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="ribbon ribbon-1">
          <path d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z" />
        </svg>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="ribbon ribbon-2">
          <path d="M0,70 Q30,90 60,60 T100,70 L100,100 L0,100 Z" />
        </svg>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="ribbon ribbon-3">
          <path d="M0,40 Q40,10 70,50 T100,30 L100,100 L0,100 Z" />
        </svg>
      </div>
    </div>
  );
}
