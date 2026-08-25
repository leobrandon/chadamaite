import React from 'react';
import { motion } from 'motion/react';

export default function LiquidProgressBar({ current = 0, total = 5, className = '' }) {
  const percentage = Math.min(100, Math.max(0, (current / Math.max(1, total)) * 100));

  return (
    <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden relative ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-blush-400 via-rose-400 to-blush-500 rounded-full relative"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Continuous shimmering sweep */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'linear',
          }}
        />
      </motion.div>
    </div>
  );
}
