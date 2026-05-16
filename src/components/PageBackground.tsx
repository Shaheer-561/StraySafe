import React from 'react';
import { motion } from 'framer-motion';

interface PageBackgroundProps {
  type: 'video' | 'image';
  src: string;
  overlay?: 'light' | 'dark' | 'warm';
}

export default function PageBackground({ type, src, overlay = 'dark' }: PageBackgroundProps) {
  const overlayClass = 
    overlay === 'light' ? 'bg-black/30' :
    overlay === 'warm'  ? 'bg-[#1a1510]/70' :
                          'bg-black/50';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {type === 'video' ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-[1.02]"
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <motion.img
          src={src}
          alt=""
          initial={{ scale: 1.15 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 30, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          className="w-full h-full object-cover"
        />
      )}
      
      {/* Cinematic Grain/Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
      
      {/* Dynamic Cinematic Gradient Overlays */}
      <div className={`absolute inset-0 ${overlayClass} backdrop-blur-[2px]`} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0a] via-transparent to-[#0f0d0a]/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f0d0a]/20 via-transparent to-[#0f0d0a]/20" />
    </div>
  );
}
