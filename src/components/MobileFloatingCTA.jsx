import React, { useState, useEffect } from 'react';
import { Gift, CalendarCheck } from 'lucide-react';

export default function MobileFloatingCTA({ onNavigateToGifts, onNavigateToRSVP }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Show after scrolling past hero (~320px) and hide when at the very bottom (near footer)
      const pastHero = scrollY > 320;
      const nearBottom = scrollY + windowHeight > docHeight - 120;

      setIsVisible(pastHero && !nearBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      id="mobile-sticky-cta"
      className="fixed bottom-0 left-0 right-0 z-35 sm:hidden px-3 pt-2 pb-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-blush-200/90 dark:border-slate-800 shadow-2xl animate-slide-up"
    >
      <div className="max-w-md mx-auto flex items-center gap-2">
        {/* Button 1: Gifts */}
        <button
          type="button"
          id="btn-sticky-presentes"
          onClick={onNavigateToGifts}
          className="flex-1 py-2.5 px-3 rounded-xl bg-blush-50 dark:bg-slate-800 border border-blush-200 dark:border-slate-700 text-blush-800 dark:text-blush-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shadow-xs"
        >
          <Gift className="w-4 h-4 text-blush-600 dark:text-blush-400 shrink-0" />
          <span className="truncate">Escolher Presente</span>
        </button>

        {/* Button 2: RSVP */}
        <button
          type="button"
          id="btn-sticky-rsvp"
          onClick={onNavigateToRSVP}
          className="flex-1 py-2.5 px-3 rounded-xl bg-blush-500 hover:bg-blush-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-blush-500/25"
        >
          <CalendarCheck className="w-4 h-4 shrink-0" />
          <span className="truncate">Confirmar Presença</span>
        </button>
      </div>
    </div>
  );
}
