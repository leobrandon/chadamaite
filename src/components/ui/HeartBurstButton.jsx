import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';

export default function HeartBurstButton({ isLiked, likesCount, onClick, className = '' }) {
  const [particles, setParticles] = useState([]);

  const handleClick = (e) => {
    e.stopPropagation();

    // Trigger burst particles if liking
    if (!isLiked) {
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        angle: (i * 60 * Math.PI) / 180,
        distance: 18 + Math.random() * 12,
        scale: 0.6 + Math.random() * 0.5,
      }));
      setParticles(newParticles);
      setTimeout(() => setParticles([]), 700);
    }

    onClick();
  };

  return (
    <div className="relative inline-flex items-center">
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.06 }}
        onClick={handleClick}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold transition cursor-pointer shadow-xs relative z-10 ${
          isLiked
            ? 'bg-blush-500 text-white shadow-blush-500/25 ring-2 ring-blush-200 dark:ring-blush-900'
            : 'bg-white/90 dark:bg-slate-800/90 text-blush-700 dark:text-blush-300 hover:bg-white dark:hover:bg-slate-800 hover:text-blush-800 dark:hover:text-blush-200 border border-blush-200/70 dark:border-slate-700'
        } ${className}`}
        title={isLiked ? 'Você curtiu este recado (clique para remover)' : 'Curtir recadinho'}
        aria-label={isLiked ? 'Você curtiu este recado (clique para remover)' : 'Curtir recadinho'}
      >
        <motion.div
          animate={isLiked ? { scale: [1, 1.35, 1], rotate: [0, -15, 15, 0] } : { scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isLiked ? 'fill-white text-white' : 'fill-blush-400 text-blush-400 dark:fill-blush-400'
            }`}
          />
        </motion.div>
        <span className="tabular-nums font-bold">{likesCount || 0}</span>
      </motion.button>

      {/* Floating exploding heart burst particles */}
      <AnimatePresence>
        {particles.map((p) => {
          const x = Math.cos(p.angle) * p.distance;
          const y = Math.sin(p.angle) * p.distance - 10;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{ opacity: 0, scale: p.scale, x, y }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute left-3 top-2 pointer-events-none text-blush-500 text-[10px] z-20"
            >
              ❤️
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
