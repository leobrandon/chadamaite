import React from 'react';
import { motion } from 'motion/react';

export default function SuccessCelebration({ title, subtitle, icon = '🎉', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-4 ${className}`}>
      {/* Expanding Ripple Rings */}
      <div className="relative flex items-center justify-center mb-5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: [1, 1.4, 1.6], opacity: [0.6, 0.2, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
          className="absolute w-20 h-20 rounded-full bg-emerald-300 dark:bg-emerald-600/30 -z-10"
        />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 150 }}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 z-10"
        >
          <motion.svg
            viewBox="0 0 24 24"
            className="w-8 h-8 stroke-white fill-none stroke-[2.5]"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.path
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </motion.svg>
        </motion.div>
      </div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-serif text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1"
      >
        {title}
      </motion.h3>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-600 dark:text-slate-300 text-sm max-w-sm leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
