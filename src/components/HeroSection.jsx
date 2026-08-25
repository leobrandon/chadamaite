import React, { useState, useEffect } from 'react';
import { Gift, CalendarCheck, Heart, Sparkles, MapPin, Calendar, Clock, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import AnimatedCountdownTicker from './hero/AnimatedCountdownTicker';
import { LetterPullUp, FadeInUp } from './hero/TextRevealPullUp';

export default function HeroSection({ config, onNavigateToGifts, onNavigateToRSVP }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(`${config.date}T${config.time || '15:00'}:00`);
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [config.date, config.time]);

  const getShareUrl = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Olá! Veja o convite e lista de presentes do Chá de Bebê da Maitê: ${currentUrl}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  };

  return (
    <section id="inicio" className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
      {/* Decorative background blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-80 h-80 bg-blush-200/50 dark:bg-blush-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-gold-200/40 dark:bg-gold-900/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-sage-200/40 dark:bg-sage-900/15 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        
        {/* Floating pill badge with soft spring entry */}
        <motion.div
          initial={{ opacity: 0, y: -15, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-800/90 border border-blush-200 dark:border-slate-700 shadow-sm text-blush-700 dark:text-blush-300 text-xs sm:text-sm font-medium mb-6 animate-float"
        >
          <Heart className="w-3.5 h-3.5 fill-blush-400 text-blush-400" />
          <span>Com muito amor, esperamos por você!</span>
          <Sparkles className="w-3.5 h-3.5 text-gold-500" />
        </motion.div>

        {/* Eyebrow Label with FadeInUp */}
        <FadeInUp delay={0.1}>
          <h2 className="text-xs sm:text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 font-semibold mb-2">
            Chá de Bebê da nossa princesinha
          </h2>
        </FadeInUp>
        
        {/* Main Title with Letter Pull-Up & Smooth Blur-In */}
        <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-3">
          <span className="text-blush-600 dark:text-blush-400 block font-handwriting text-6xl sm:text-8xl md:text-9xl py-1 drop-shadow-xs">
            <LetterPullUp
              text={config.babyName || 'Maitê'}
              delay={0.25}
              speed={0.08}
            />
          </span>
        </h1>

        {/* Subtitle with FadeInUp */}
        <FadeInUp delay={0.4}>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-xl mx-auto mb-8 font-light leading-relaxed">
            À espera do maior presente de nossas vidas. Com amor,{' '}
            <strong className="font-semibold text-slate-800 dark:text-slate-100">
              {config.parents || 'Leonardo & Isabella'}
            </strong>.
          </p>
        </FadeInUp>

        {/* Quick event highlights banner with interactive hover & stagger entry */}
        <FadeInUp delay={0.5}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-10 text-slate-700 dark:text-slate-200">
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="glass-card p-3.5 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm hover:border-blush-300 dark:hover:border-blush-500/50 transition-colors"
            >
              <Calendar className="w-4 h-4 text-blush-500 dark:text-blush-400 shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{config.displayDate}</span>
            </motion.div>
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="glass-card p-3.5 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm hover:border-blush-300 dark:hover:border-blush-500/50 transition-colors"
            >
              <Clock className="w-4 h-4 text-blush-500 dark:text-blush-400 shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{config.displayTime}</span>
            </motion.div>
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="glass-card p-3.5 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm hover:border-blush-300 dark:hover:border-blush-500/50 transition-colors"
            >
              <MapPin className="w-4 h-4 text-blush-500 dark:text-blush-400 shrink-0" />
              <span className="text-xs sm:text-sm font-medium truncate" title={config.locationName}>
                {config.locationName}
              </span>
            </motion.div>
          </div>
        </FadeInUp>

        {/* Smooth Animated Countdown Ticker */}
        <AnimatedCountdownTicker timeLeft={timeLeft} />

        {/* Action Buttons with Ultra-Smooth Hover */}
        <FadeInUp delay={0.65}>
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
            <button
              type="button"
              onClick={onNavigateToGifts}
              className="h-12 px-6 rounded-full bg-blush-500 hover:bg-blush-600 active:scale-95 text-white font-bold text-sm shadow-md shadow-blush-500/25 hover:shadow-xl hover:shadow-blush-500/35 hover:-translate-y-0.5 transition-all duration-200 ease-out flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Gift className="w-4 h-4 shrink-0" />
              <span>Ver Lista de Presentes</span>
            </button>
            
            <button
              type="button"
              onClick={onNavigateToRSVP}
              className="h-12 px-6 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4 text-blush-500 dark:text-blush-400 shrink-0" />
              <span>Confirmar Presença</span>
            </button>

            <a
              href={getShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 px-5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-95 text-emerald-700 dark:text-emerald-300 font-bold text-sm border border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              title="Compartilhar convite no WhatsApp"
            >
              <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Compartilhar</span>
            </a>
          </div>
        </FadeInUp>

      </div>
    </section>
  );
}
