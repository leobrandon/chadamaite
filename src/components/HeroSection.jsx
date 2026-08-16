import React, { useState, useEffect } from 'react';
import { Gift, CalendarCheck, Heart, Sparkles, MapPin, Calendar, Clock, Share2 } from 'lucide-react';

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
        <div className="absolute -top-24 left-1/4 w-80 h-80 bg-blush-200/50 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-gold-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-sage-200/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        
        {/* Floating pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-blush-200 shadow-sm text-blush-700 text-xs sm:text-sm font-medium mb-6 animate-float">
          <Heart className="w-3.5 h-3.5 fill-blush-400 text-blush-400" />
          <span>Com muito amor, esperamos por você!</span>
          <Sparkles className="w-3.5 h-3.5 text-gold-500" />
        </div>

        {/* Main Title */}
        <h2 className="text-xs sm:text-sm uppercase tracking-[0.25em] text-slate-500 font-semibold mb-2">
          Chá de Bebê da nossa princesinha
        </h2>
        
        <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-bold text-slate-800 tracking-tight leading-none mb-3">
          <span className="text-blush-600 block font-handwriting text-6xl sm:text-8xl md:text-9xl py-1">
            {config.babyName || 'Maitê'}
          </span>
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto mb-8 font-light leading-relaxed">
          À espera do maior presente de nossas vidas. Com amor, <strong className="font-semibold text-slate-800">{config.parents || 'Leonardo & Isabella'}</strong>.
        </p>

        {/* Quick event highlights banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-10 text-slate-700">
          <div className="glass-card p-3.5 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm">
            <Calendar className="w-4 h-4 text-blush-500 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{config.displayDate}</span>
          </div>
          <div className="glass-card p-3.5 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm">
            <Clock className="w-4 h-4 text-blush-500 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{config.displayTime}</span>
          </div>
          <div className="glass-card p-3.5 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm">
            <MapPin className="w-4 h-4 text-blush-500 shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate" title={config.locationName}>
              {config.locationName}
            </span>
          </div>
        </div>

        {/* Countdown Timer */}
        {!timeLeft.isPast ? (
          <div className="glass-card max-w-lg mx-auto p-5 sm:p-6 rounded-3xl mb-10 shadow-sm border border-blush-200/80">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block mb-3">
              Contagem Regressiva para o Chá
            </span>
            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
              <div className="bg-white/80 p-2.5 sm:p-3 rounded-2xl shadow-sm border border-blush-100">
                <span className="text-2xl sm:text-4xl font-serif font-bold text-blush-600 block">
                  {timeLeft.days}
                </span>
                <span className="text-[10px] sm:text-xs uppercase text-slate-400 font-medium tracking-wider">Dias</span>
              </div>
              <div className="bg-white/80 p-2.5 sm:p-3 rounded-2xl shadow-sm border border-blush-100">
                <span className="text-2xl sm:text-4xl font-serif font-bold text-blush-600 block">
                  {timeLeft.hours}
                </span>
                <span className="text-[10px] sm:text-xs uppercase text-slate-400 font-medium tracking-wider">Horas</span>
              </div>
              <div className="bg-white/80 p-2.5 sm:p-3 rounded-2xl shadow-sm border border-blush-100">
                <span className="text-2xl sm:text-4xl font-serif font-bold text-blush-600 block">
                  {timeLeft.minutes}
                </span>
                <span className="text-[10px] sm:text-xs uppercase text-slate-400 font-medium tracking-wider">Min</span>
              </div>
              <div className="bg-white/80 p-2.5 sm:p-3 rounded-2xl shadow-sm border border-blush-100">
                <span className="text-2xl sm:text-4xl font-serif font-bold text-blush-600 block">
                  {timeLeft.seconds}
                </span>
                <span className="text-[10px] sm:text-xs uppercase text-slate-400 font-medium tracking-wider">Seg</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card max-w-md mx-auto p-4 rounded-2xl mb-10 text-center text-blush-700 font-medium">
            🎉 O grande dia chegou! Estamos muito felizes em celebrar juntos!
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto">
          <button
            onClick={onNavigateToGifts}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-blush-500 hover:bg-blush-600 text-white font-semibold text-sm sm:text-base shadow-lg shadow-blush-500/25 hover:shadow-blush-500/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <Gift className="w-5 h-5" />
            <span>Ver Lista de Presentes</span>
          </button>
          
          <button
            onClick={onNavigateToRSVP}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm sm:text-base border border-slate-200 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            <CalendarCheck className="w-5 h-5 text-blush-500" />
            <span>Confirmar Presença</span>
          </button>

          <a
            href={getShareUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-sm sm:text-base border border-emerald-200 shadow-sm hover:shadow hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            title="Compartilhar convite no WhatsApp"
          >
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span>Compartilhar</span>
          </a>
        </div>

      </div>
    </section>
  );
}
