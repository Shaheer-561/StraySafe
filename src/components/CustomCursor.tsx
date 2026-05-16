import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

export default function CustomCursor() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const springConfig = { damping: 30, stiffness: 400, mass: 0.4 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const trailConfig = { damping: 50, stiffness: 150, mass: 0.8 };
  const trailX = useSpring(mouseX, trailConfig);
  const trailY = useSpring(mouseY, trailConfig);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setIsHovering(
        t.tagName === 'BUTTON' || t.tagName === 'A' || t.tagName === 'SELECT' || 
        t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' ||
        !!t.closest('button') || !!t.closest('a') || t.classList.contains('hover-glow')
      );
    };

    const down = () => setIsClicking(true);
    const up = () => setIsClicking(false);
    const leave = () => setIsVisible(false);

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    window.addEventListener('mouseleave', leave);
    
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('mouseleave', leave);
    };
  }, [mouseX, mouseY, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-[9999]"
        >
          {/* Outer futuristic ring with crosshair dots */}
          <motion.div
            className="absolute top-0 left-0 w-12 h-12 border border-white/10 rounded-full"
            style={{ x: trailX, y: trailY, translateX: '-50%', translateY: '-50%' }}
            animate={{
              scale: isHovering ? 1.6 : 1,
              opacity: isHovering ? 0.4 : 0.2,
              rotate: isHovering ? 90 : 0
            }}
          />

          {/* Inner primary ring */}
          <motion.div
            className="absolute top-0 left-0 rounded-full border-2 border-primary"
            style={{ x, y, translateX: '-50%', translateY: '-50%' }}
            animate={{
              width: isHovering ? 64 : 12,
              height: isHovering ? 64 : 12,
              opacity: isClicking ? 1 : 0.8,
              backgroundColor: isHovering ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
              borderWidth: isHovering ? 1 : 2
            }}
            transition={{ type: 'spring', bounce: 0.3 }}
          />

          {/* Central precision dot */}
          <motion.div
            className="absolute top-0 left-0 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{ x, y, translateX: '-50%', translateY: '-50%' }}
            animate={{
              scale: isHovering ? 0 : 1,
              opacity: isClicking ? 0.5 : 1
            }}
          />
          
          {/* Interaction glints */}
          <motion.div
            className="absolute top-0 left-0 w-8 h-[1px] bg-primary/40"
            style={{ x, y, translateX: '-50%', translateY: '-50%', rotate: 45 }}
            animate={{ scale: isHovering ? 1 : 0, opacity: isHovering ? 0.3 : 0 }}
          />
          <motion.div
            className="absolute top-0 left-0 w-8 h-[1px] bg-primary/40"
            style={{ x, y, translateX: '-50%', translateY: '-50%', rotate: -45 }}
            animate={{ scale: isHovering ? 1 : 0, opacity: isHovering ? 0.3 : 0 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
