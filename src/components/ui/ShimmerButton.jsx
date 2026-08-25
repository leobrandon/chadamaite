import React from 'react';
import { motion } from 'motion/react';

export default function ShimmerButton({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  shimmerColor = 'rgba(255, 255, 255, 0.4)',
  ...props 
}) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden group rounded-2xl transition-all ${className}`}
      {...props}
    >
      {/* Shimmer Sweep Animation */}
      {!disabled && (
        <motion.div
          className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
