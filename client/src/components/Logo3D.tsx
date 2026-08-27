import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

interface Logo3DProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo3D: React.FC<Logo3DProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0, shineX: 50, shineY: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: { box: 'w-8 h-8 rounded-xl', text: 'text-xl', glow: 'blur-md' },
    md: { box: 'w-10 h-10 rounded-2xl', text: 'text-2xl', glow: 'blur-lg' },
    lg: { box: 'w-14 h-14 rounded-3xl', text: 'text-3xl', glow: 'blur-xl' },
    xl: { box: 'w-36 h-36 rounded-[32px]', text: 'text-5xl', glow: 'blur-2xl' },
  }[size];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate max tilt angle (-15 deg to +15 deg)
    const rotateX = -((y - centerY) / centerY) * 16;
    const rotateY = ((x - centerX) / centerX) * 16;

    // Calculate dynamic specular light reflection position %
    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;

    setTilt({ x: rotateX, y: rotateY, shineX, shineY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0, shineX: 50, shineY: 50 });
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <Link to="/" className="group inline-block" title="FrameTrail Home">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            perspective: '800px',
          }}
          className="relative cursor-pointer"
        >
          {/* 🌟 3D Holographic Outer Ambient Pulsating Glow */}
          <div
            className={`absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-2xl ${sizeClasses.glow} opacity-65 transition-all duration-300 ${
              isHovered ? 'opacity-100 scale-110' : 'animate-pulse'
            }`}
          ></div>

          {/* 🧊 Interactive 3D Tilted Card Body */}
          <div
            style={{
              transform: isHovered
                ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.08, 1.08, 1.08)`
                : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
              transition: isHovered ? 'transform 0.1s cubic-bezier(0.2, 0, 0, 1)' : 'transform 0.5s ease-out',
              transformStyle: 'preserve-3d',
            }}
            className={`relative ${sizeClasses.box} bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-2 border-indigo-400/60 shadow-2xl shadow-indigo-500/30 overflow-hidden flex items-center justify-center p-0.5`}
          >
            {/* Dynamic Specular Glass Light Sheen Layer */}
            <div
              style={{
                background: isHovered
                  ? `radial-gradient(circle at ${tilt.shineX}% ${tilt.shineY}%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)`
                  : 'none',
              }}
              className="absolute inset-0 z-20 pointer-events-none transition-opacity duration-200"
            ></div>

            {/* Inner Metallic Border Line */}
            <div className="absolute inset-0.5 rounded-[inherit] border border-cyan-400/30 z-10 pointer-events-none"></div>

            {/* Main Logo Image with 3D Depth Elevation */}
            <img
              src="/img5.png"
              alt="FrameTrail 3D Logo"
              style={{
                transform: isHovered ? 'translateZ(18px)' : 'translateZ(0px)',
                transition: 'transform 0.2s ease-out',
              }}
              className="w-full h-full object-cover object-center rounded-[inherit] shadow-md z-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/IMG_20240423_000718.png';
              }}
            />
          </div>
        </div>
      </Link>

      {/* Brand Typography Text (Optional) */}
      {showText && (
        <Link to="/" className="group">
          <span className={`font-display font-black ${sizeClasses.text} text-white tracking-tight drop-shadow-md`}>
            Frame<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-300">Trail</span>
          </span>
        </Link>
      )}
    </div>
  );
};
