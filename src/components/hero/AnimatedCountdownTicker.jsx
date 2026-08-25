import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

function TickerUnit({ value, label }) {
  // Garante que o valor tenha 2 dígitos para consistência visual
  const formattedValue = String(value).padStart(2, '0');

  return (
    <div className="bg-white/85 dark:bg-slate-800/90 p-3 sm:p-4 rounded-2xl shadow-xs border border-blush-100 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden transition-colors">
      <div className="h-8 sm:h-11 flex items-center justify-center overflow-hidden relative w-full">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={formattedValue}
            initial={{ y: 20, opacity: 0, filter: 'blur(3px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: -20, opacity: 0, filter: 'blur(3px)' }}
            transition={{
              duration: 0.35,
              ease: [0.23, 1, 0.32, 1], // easeOutQuint suave
            }}
            className="text-2xl sm:text-4xl font-serif font-bold text-blush-600 dark:text-blush-400 block tabular-nums text-center select-none"
          >
            {formattedValue}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[10px] sm:text-xs uppercase text-slate-400 dark:text-slate-400 font-medium tracking-wider mt-1 select-none">
        {label}
      </span>
    </div>
  );
}

export default function AnimatedCountdownTicker({ timeLeft }) {
  if (timeLeft.isPast) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card max-w-md mx-auto p-4 rounded-2xl mb-10 text-center text-blush-700 dark:text-blush-300 font-medium border border-blush-200 dark:border-blush-900/50 shadow-sm"
      >
        🎉 O grande dia chegou! Estamos muito felizes em celebrar juntos!
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass-card max-w-lg mx-auto p-5 sm:p-6 rounded-3xl mb-10 shadow-sm border border-blush-200/80 dark:border-slate-800 backdrop-blur-md"
    >
      <div className="flex items-center justify-center gap-2 mb-3.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blush-500 animate-ping" />
        <span className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-400 font-semibold">
          Contagem Regressiva para o Chá
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3.5 text-center">
        <TickerUnit value={timeLeft.days} label="Dias" />
        <TickerUnit value={timeLeft.hours} label="Horas" />
        <TickerUnit value={timeLeft.minutes} label="Min" />
        <TickerUnit value={timeLeft.seconds} label="Seg" />
      </div>
    </motion.div>
  );
}
