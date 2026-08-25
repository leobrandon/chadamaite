import React, { useMemo } from 'react';
import { motion } from 'motion/react';

// Conjunto de elementos flutuantes espalhados com densidade equilibrada por todo o site.
// Tipos: 'teddy' (ursinho fofo), 'heart' (coração), 'star' (estrela), 'cloud' (nuvem), 'sparkle' (brilho)
const SITE_PARTICLES = [
  // --- TOPO (Hero, Boas-vindas & Contagem Regressiva: 0% a 18%) ---
  { id: 1, type: 'teddy', top: '3%', left: '3%', size: 32, delay: 0.2, duration: 8, rotate: 10, color: 'text-amber-500/75 dark:text-amber-300/65' },
  { id: 2, type: 'heart', top: '4.5%', right: '5%', size: 24, delay: 0.5, duration: 6.5, rotate: -12, color: 'text-blush-500/80 dark:text-blush-400/70' },
  { id: 3, type: 'star', top: '7%', left: '20%', size: 22, delay: 1.2, duration: 7, rotate: 15, color: 'text-amber-500/85 dark:text-amber-300/75' },
  { id: 4, type: 'cloud', top: '8.5%', right: '18%', size: 40, delay: 0.8, duration: 9.5, rotate: -4, color: 'text-blush-400/65 dark:text-slate-400/45' },
  { id: 5, type: 'teddy', top: '11%', right: '6%', size: 30, delay: 1.6, duration: 8.2, rotate: -8, color: 'text-amber-600/70 dark:text-amber-300/60' },
  { id: 6, type: 'sparkle', top: '12.5%', left: '8%', size: 20, delay: 1.8, duration: 5.5, rotate: 45, color: 'text-rose-400/80 dark:text-rose-300/70' },
  { id: 7, type: 'heart', top: '15%', right: '28%', size: 22, delay: 2.1, duration: 6.2, rotate: 14, color: 'text-blush-500/75 dark:text-blush-400/65' },
  { id: 8, type: 'star', top: '17%', left: '12%', size: 20, delay: 0.4, duration: 6.8, rotate: -18, color: 'text-amber-500/80 dark:text-amber-300/70' },

  // --- SEÇÃO DETALHES DO EVENTO & CALENDÁRIO (19% a 36%) ---
  { id: 9, type: 'teddy', top: '20.5%', left: '4%', size: 34, delay: 1.1, duration: 8.6, rotate: 12, color: 'text-amber-500/75 dark:text-amber-300/65' },
  { id: 10, type: 'cloud', top: '22%', right: '12%', size: 38, delay: 2.4, duration: 9.2, rotate: 6, color: 'text-slate-400/55 dark:text-slate-400/40' },
  { id: 11, type: 'heart', top: '24%', left: '18%', size: 24, delay: 0.9, duration: 6.3, rotate: -10, color: 'text-rose-500/80 dark:text-rose-400/70' },
  { id: 12, type: 'star', top: '26%', right: '4%', size: 22, delay: 1.5, duration: 7.1, rotate: 20, color: 'text-amber-500/85 dark:text-amber-300/75' },
  { id: 13, type: 'teddy', top: '28.5%', right: '16%', size: 30, delay: 2.0, duration: 7.9, rotate: -6, color: 'text-amber-600/70 dark:text-amber-300/60' },
  { id: 14, type: 'sparkle', top: '30%', left: '6%', size: 22, delay: 0.7, duration: 5.4, rotate: 35, color: 'text-amber-500/80 dark:text-amber-300/70' },
  { id: 15, type: 'cloud', top: '32.5%', left: '15%', size: 42, delay: 1.9, duration: 10.2, rotate: -5, color: 'text-blush-400/65 dark:text-slate-400/45' },
  { id: 16, type: 'heart', top: '34.5%', right: '7%', size: 24, delay: 1.3, duration: 6.6, rotate: 12, color: 'text-blush-500/75 dark:text-blush-400/65' },

  // --- SEÇÃO LISTA DE PRESENTES & MIMOS (37% a 58%) ---
  { id: 17, type: 'star', top: '37.5%', left: '5%', size: 22, delay: 0.6, duration: 6.9, rotate: -15, color: 'text-amber-500/80 dark:text-amber-300/70' },
  { id: 18, type: 'teddy', top: '39.5%', right: '5%', size: 34, delay: 1.7, duration: 8.4, rotate: 10, color: 'text-amber-500/75 dark:text-amber-300/65' },
  { id: 19, type: 'heart', top: '42%', left: '16%', size: 24, delay: 2.2, duration: 6.4, rotate: -14, color: 'text-rose-500/80 dark:text-rose-400/70' },
  { id: 20, type: 'cloud', top: '44%', right: '14%', size: 40, delay: 0.5, duration: 9.6, rotate: 4, color: 'text-slate-400/55 dark:text-slate-400/40' },
  { id: 21, type: 'teddy', top: '46.5%', left: '3%', size: 30, delay: 1.4, duration: 8.1, rotate: -8, color: 'text-amber-600/70 dark:text-amber-300/60' },
  { id: 22, type: 'sparkle', top: '48.5%', right: '6%', size: 22, delay: 2.5, duration: 5.6, rotate: 45, color: 'text-blush-500/80 dark:text-blush-300/70' },
  { id: 23, type: 'star', top: '51%', left: '14%', size: 20, delay: 1.0, duration: 7.3, rotate: 22, color: 'text-amber-500/85 dark:text-amber-300/75' },
  { id: 24, type: 'heart', top: '53.5%', right: '18%', size: 22, delay: 1.8, duration: 6.1, rotate: -10, color: 'text-blush-500/75 dark:text-blush-400/65' },
  { id: 25, type: 'cloud', top: '56%', left: '6%', size: 38, delay: 2.7, duration: 9.8, rotate: -6, color: 'text-blush-400/65 dark:text-slate-400/45' },

  // --- SEÇÃO RSVP / CONFIRMAÇÃO DE PRESENÇA (59% a 78%) ---
  { id: 26, type: 'teddy', top: '59.5%', right: '4%', size: 32, delay: 0.8, duration: 8.5, rotate: 12, color: 'text-amber-500/75 dark:text-amber-300/65' },
  { id: 27, type: 'heart', top: '62%', left: '5%', size: 26, delay: 1.6, duration: 6.5, rotate: 14, color: 'text-blush-500/80 dark:text-blush-400/70' },
  { id: 28, type: 'star', top: '64.5%', right: '15%', size: 22, delay: 2.3, duration: 7.0, rotate: -16, color: 'text-amber-500/80 dark:text-amber-300/70' },
  { id: 29, type: 'teddy', top: '67%', left: '18%', size: 30, delay: 1.2, duration: 7.8, rotate: -10, color: 'text-amber-600/70 dark:text-amber-300/60' },
  { id: 30, type: 'cloud', top: '69.5%', right: '7%', size: 42, delay: 0.4, duration: 10.1, rotate: 5, color: 'text-slate-400/55 dark:text-slate-400/40' },
  { id: 31, type: 'sparkle', top: '72%', left: '7%', size: 20, delay: 2.6, duration: 5.3, rotate: 30, color: 'text-rose-400/80 dark:text-rose-300/70' },
  { id: 32, type: 'heart', top: '74.5%', right: '19%', size: 24, delay: 1.5, duration: 6.3, rotate: -12, color: 'text-rose-500/80 dark:text-rose-400/70' },
  { id: 33, type: 'star', top: '77%', left: '12%', size: 20, delay: 0.9, duration: 6.8, rotate: 18, color: 'text-amber-500/85 dark:text-amber-300/75' },

  // --- SEÇÃO MURAL DE RECADOS & RODAPÉ (79% a 98%) ---
  { id: 34, type: 'teddy', top: '80%', left: '4%', size: 32, delay: 1.9, duration: 8.3, rotate: 8, color: 'text-amber-500/75 dark:text-amber-300/65' },
  { id: 35, type: 'cloud', top: '82.5%', right: '12%', size: 40, delay: 1.1, duration: 9.4, rotate: -4, color: 'text-blush-400/65 dark:text-slate-400/45' },
  { id: 36, type: 'heart', top: '85%', left: '17%', size: 24, delay: 0.3, duration: 6.2, rotate: -15, color: 'text-blush-500/80 dark:text-blush-400/70' },
  { id: 37, type: 'teddy', top: '87.5%', right: '5%', size: 30, delay: 2.4, duration: 8.0, rotate: -9, color: 'text-amber-600/70 dark:text-amber-300/60' },
  { id: 38, type: 'star', top: '90%', left: '6%', size: 22, delay: 1.7, duration: 7.2, rotate: 20, color: 'text-amber-500/85 dark:text-amber-300/75' },
  { id: 39, type: 'sparkle', top: '92.5%', right: '18%', size: 20, delay: 2.1, duration: 5.7, rotate: -35, color: 'text-blush-400/80 dark:text-blush-300/70' },
  { id: 40, type: 'heart', top: '95%', left: '10%', size: 22, delay: 0.8, duration: 6.5, rotate: 12, color: 'text-rose-400/75 dark:text-rose-300/65' },
  { id: 41, type: 'teddy', top: '97%', right: '8%', size: 28, delay: 1.5, duration: 7.7, rotate: 10, color: 'text-amber-500/70 dark:text-amber-300/60' },
];

function ParticleIcon({ type, className }) {
  switch (type) {
    case 'teddy':
      // Ursinho delicado e fofinho em vetor com orelhinhas, focinho e laço
      return (
        <svg viewBox="0 0 32 32" fill="none" className={className}>
          {/* Orelhas com detalhe interno */}
          <circle cx="8" cy="8" r="4.5" fill="currentColor" fillOpacity="0.85" />
          <circle cx="8" cy="8" r="2.2" fill="#fff" fillOpacity="0.65" />
          <circle cx="24" cy="8" r="4.5" fill="currentColor" fillOpacity="0.85" />
          <circle cx="24" cy="8" r="2.2" fill="#fff" fillOpacity="0.65" />
          
          {/* Cabeça do Ursinho */}
          <circle cx="16" cy="15" r="9" fill="currentColor" />
          
          {/* Olhinhos fofos */}
          <circle cx="12.5" cy="13.5" r="1.3" fill="#382218" />
          <circle cx="19.5" cy="13.5" r="1.3" fill="#382218" />
          <circle cx="12.9" cy="13.1" r="0.4" fill="#fff" />
          <circle cx="19.9" cy="13.1" r="0.4" fill="#fff" />
          
          {/* Focinho */}
          <ellipse cx="16" cy="17.2" rx="4" ry="3" fill="#fff" fillOpacity="0.85" />
          <path d="M14.8 16.2C14.8 15.6 17.2 15.6 17.2 16.2C17.2 16.8 16 17.6 16 17.6C16 17.6 14.8 16.8 14.8 16.2Z" fill="#382218" />
          <path d="M16 17.6V18.8M14.7 18.5C15.2 19 16.8 19 17.3 18.5" stroke="#382218" strokeWidth="0.8" strokeLinecap="round" />
          
          {/* Bochechinhas rosadas */}
          <circle cx="10" cy="16.5" r="1.6" fill="#f43f5e" fillOpacity="0.35" />
          <circle cx="22" cy="16.5" r="1.6" fill="#f43f5e" fillOpacity="0.35" />

          {/* Patinhas ou corpinho suave */}
          <ellipse cx="16" cy="26" rx="6.5" ry="4.5" fill="currentColor" fillOpacity="0.8" />
          <ellipse cx="16" cy="25" rx="3.5" ry="2.5" fill="#fff" fillOpacity="0.45" />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      );
    case 'cloud':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
        </svg>
      );
    case 'sparkle':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      );
  }
}

export default function FloatingAmbientParticles() {
  const particles = useMemo(() => SITE_PARTICLES, []);

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute ${particle.color} transition-colors duration-500`}
          style={{
            top: particle.top,
            left: particle.left,
            right: particle.right,
            width: particle.size,
            height: particle.size,
          }}
          initial={{ opacity: 0, scale: 0.8, y: 0 }}
          animate={{
            opacity: [0.65, 0.95, 0.75, 0.65],
            y: [-12, 14, -12],
            x: [-7, 9, -7],
            rotate: [particle.rotate - 8, particle.rotate + 8, particle.rotate - 8],
            scale: [0.95, 1.1, 0.95],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: particle.delay,
          }}
        >
          <div className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.08)] dark:drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
            <ParticleIcon type={particle.type} className="w-full h-full" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
