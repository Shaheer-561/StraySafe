import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function ParallaxBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="parallax-container">
      {/* Background Blobs */}
      <motion.div
        animate={{
          x: mousePos.x * 2,
          y: mousePos.y * 2,
        }}
        className="blob w-[600px] h-[600px] bg-primary top-[-10%] left-[-10%] animate-pulse-glow"
      />
      <motion.div
        animate={{
          x: mousePos.x * -1.5,
          y: mousePos.y * -1.5,
        }}
        className="blob w-[500px] h-[500px] bg-blue-600 bottom-[-10%] right-[-10%] animate-pulse-glow"
        style={{ animationDelay: '-2s' }}
      />
      <motion.div
        animate={{
          x: mousePos.x * 3,
          y: mousePos.y * 3,
        }}
        className="blob w-[400px] h-[400px] bg-purple-600 top-[40%] left-[60%] animate-pulse-glow"
        style={{ animationDelay: '-5s' }}
      />
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />
    </div>
  );
}
