import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function UnwrappingRibbon({ isOpen }) {
  const [unwrapped, setUnwrapped] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUnwrapped(false);
      const timer = setTimeout(() => {
        setUnwrapped(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-x-0 top-0 h-16 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {!unwrapped && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="relative w-full h-full"
          >
            {/* Horizontal Ribbon Stripe Left */}
            <motion.div
              initial={{ scaleX: 1 }}
              exit={{ scaleX: 0, originX: 0, opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-4 left-0 w-1/2 h-2.5 bg-gradient-to-r from-blush-400 via-blush-300 to-blush-400 shadow-sm border-y border-blush-200/50"
            />

            {/* Horizontal Ribbon Stripe Right */}
            <motion.div
              initial={{ scaleX: 1 }}
              exit={{ scaleX: 0, originX: 1, opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-4 right-0 w-1/2 h-2.5 bg-gradient-to-r from-blush-400 via-blush-300 to-blush-400 shadow-sm border-y border-blush-200/50"
            />

            {/* Central Ribbon Bow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.3, opacity: 0, y: -12, filter: 'blur(4px)' }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center justify-center"
            >
              {/* Left Loop */}
              <motion.div
                exit={{ rotate: -25, x: -15, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                className="w-5 h-6 rounded-full border-2 border-blush-400 bg-gradient-to-tr from-blush-300 to-blush-200 shadow-xs -mr-1.5 transform -rotate-12"
              />
              
              {/* Center Knot */}
              <div className="w-3.5 h-3.5 rounded-full bg-blush-500 border border-blush-300 shadow-md z-10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
              </div>

              {/* Right Loop */}
              <motion.div
                exit={{ rotate: 25, x: 15, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                className="w-5 h-6 rounded-full border-2 border-blush-400 bg-gradient-to-tl from-blush-300 to-blush-200 shadow-xs -ml-1.5 transform rotate-12"
              />

              {/* Hanging Ribbons Tails */}
              <motion.div
                exit={{ scaleY: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute top-3 flex gap-1 -z-1"
              >
                <div className="w-1.5 h-5 bg-blush-400 rounded-b-xs transform -rotate-20 origin-top shadow-2xs" />
                <div className="w-1.5 h-5 bg-blush-400 rounded-b-xs transform rotate-20 origin-top shadow-2xs" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
