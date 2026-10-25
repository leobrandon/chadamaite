import React from 'react';
import { MapPin, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import CloudHeadingReveal from './ui/CloudHeadingReveal';

export default function EventDetails({ config }) {
  return (
    <section id="nosso-cha" className="py-12 bg-white/60 dark:bg-slate-900/60 border-y border-blush-100 dark:border-slate-800 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Heading with Cloud Reveal */}
        <CloudHeadingReveal
          badge="Nosso chá"
          badgeIcon={Sparkles}
          title="Um dia que ficou"
          highlight="na memória 💕"
          subtitle="Uma lembrança cheia de afeto, sorrisos e carinho compartilhado."
          className="text-center max-w-2xl mx-auto mb-12"
        />

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Data do encontro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="h-full"
          >
            <div className="glass-card p-6 rounded-3xl border border-blush-100 dark:border-slate-800 flex flex-col justify-between shadow-sm h-full hover:shadow-lg hover:-translate-y-1 hover:border-blush-300 dark:hover:border-slate-700 transition-all duration-200 ease-out">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blush-100/80 dark:bg-blush-950/80 flex items-center justify-center text-blush-600 dark:text-blush-400 mb-5">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  Quando aconteceu
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-1 font-medium">
                  {config.displayDate}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Local do encontro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="h-full"
          >
            <div className="glass-card p-6 rounded-3xl border border-blush-100 dark:border-slate-800 flex flex-col justify-between shadow-sm h-full hover:shadow-lg hover:-translate-y-1 hover:border-sage-300 dark:hover:border-slate-700 transition-all duration-200 ease-out">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sage-100/80 dark:bg-sage-950/80 flex items-center justify-center text-sage-600 dark:text-sage-400 mb-5">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                  Onde celebramos
                </h3>
                <p className="text-slate-800 dark:text-slate-100 font-semibold text-sm mb-1">
                  {config.locationName}
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  {config.address}<br />
                  {config.city}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
