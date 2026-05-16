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
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {type === 'video' ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-[1.01]"
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <motion.img
          src={src}
          alt=""
          initial={{ scale: 1.1 }}
          animate={{ scale: 1.02 }}
          transition={{ duration: 30, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          className="w-full h-full object-cover"
        />
      )}
      
      {/* Dynamic Cinematic Gradient Overlays */}
      <div className={`absolute inset-0 ${overlayClass} backdrop-blur-[1px]`} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-transparent to-[#0a0908]/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0908]/20 via-transparent to-[#0a0908]/20" />
    </div>
  );
}
