import React, { useRef, useState } from 'react';
import { motion, useMotionValue } from 'motion/react';

export default function SpotlightCard({ 
  children, 
  className = '', 
  spotlightColor = 'rgba(247, 121, 158, 0.12)', 
  darkSpotlightColor = 'rgba(247, 121, 158, 0.18)' 
}) {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Interactive Spotlight Radial Gradient Layer */}
      <motion.div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity: isFocused ? 1 : 0,
          background: `radial-gradient(400px circle at ${mouseX.get()}px ${mouseY.get()}px, var(--spotlight-color, ${spotlightColor}), transparent 80%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
