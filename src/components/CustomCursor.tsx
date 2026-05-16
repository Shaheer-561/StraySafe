import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CustomCursor() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200 };
  const dotX = useSpring(mouseX, springConfig);
  const dotY = useSpring(mouseY, springConfig);
  
  const outlineX = useSpring(mouseX, { damping: 30, stiffness: 150 });
  const outlineY = useSpring(mouseY, { damping: 30, stiffness: 150 });

  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') ||
        target.classList.contains('hover-glow')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{
          left: dotX,
          top: dotY,
          x: '-50%',
          y: '-50%',
        }}
      />
      <motion.div
        className="cursor-outline"
        animate={{
          scale: isHovering ? 2 : 1,
          borderColor: isHovering ? 'rgba(255, 92, 0, 1)' : 'rgba(255, 92, 0, 0.5)',
          backgroundColor: isHovering ? 'rgba(255, 92, 0, 0.1)' : 'transparent',
        }}
        style={{
          left: outlineX,
          top: outlineY,
          x: '-50%',
          y: '-50%',
        }}
      />
    </>
  );
}
