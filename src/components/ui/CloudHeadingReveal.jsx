import React from 'react';
import { motion } from 'motion/react';

export default function CloudHeadingReveal({ 
  badge, 
  badgeIcon: BadgeIcon, 
  title, 
  highlight, 
  subtitle,
  className = "text-center max-w-2xl mx-auto mb-12"
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Soft Pastel Left Cloud */}
      <motion.div
        initial={{ opacity: 0, x: -40, scale: 0.8 }}
        whileInView={{ opacity: [0, 0.45, 0.25], x: [-40, -15, -25], scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="absolute -top-6 -left-8 sm:-left-16 w-24 h-14 sm:w-32 sm:h-18 bg-gradient-to-r from-blush-200/40 via-white/60 to-transparent dark:from-blush-900/20 dark:via-slate-800/40 rounded-full blur-md pointer-events-none -z-10"
      />

      {/* Soft Pastel Right Cloud */}
      <motion.div
        initial={{ opacity: 0, x: 40, scale: 0.8 }}
        whileInView={{ opacity: [0, 0.45, 0.25], x: [40, 15, 25], scale: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.1 }}
        className="absolute -bottom-4 -right-8 sm:-right-16 w-24 h-14 sm:w-32 sm:h-18 bg-gradient-to-l from-sage-200/40 via-white/60 to-transparent dark:from-sage-900/20 dark:via-slate-800/40 rounded-full blur-md pointer-events-none -z-10"
      />

      {/* Badge Pill */}
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blush-100/90 dark:bg-blush-950/90 text-blush-600 dark:text-blush-300 text-xs font-bold mb-3 shadow-2xs"
        >
          {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
          <span>{badge}</span>
        </motion.div>
      )}

      {/* Main Title with Smooth Cloud Fade In */}
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-slate-100 tracking-tight"
      >
        {title}{' '}
        {highlight && (
          <span className="text-blush-500 dark:text-blush-400">
            {highlight}
          </span>
        )}
      </motion.h2>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
