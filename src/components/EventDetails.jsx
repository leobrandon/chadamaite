import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Copy, Check, ExternalLink, Heart, Sparkles, QrCode, CalendarPlus, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from './ui/ToastProvider';
import CloudHeadingReveal from './ui/CloudHeadingReveal';

export default function EventDetails({ config, onOpenPixModal }) {
  const { addToast } = useToast();
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    const fullAddress = `${config.locationName}, ${config.address} - ${config.city}`;
    navigator.clipboard.writeText(fullAddress);
    setCopiedAddress(true);
    addToast({ message: 'Endereço copiado para a área de transferência! 📍', type: 'copy' });
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Chá de Bebê da Maitê 🌸')}&dates=20261017T153000/20261017T200000&ctz=America/Sao_Paulo&details=${encodeURIComponent('Venha comemorar conosco o Chá de Bebê da nossa amada Maitê! Esperamos por você com muito carinho. Leonardo & Isabella.')}&location=${encodeURIComponent('Espaço LC Eventos, Goiânia - GO')}`;

  const handleDownloadICS = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Cha de Bebe da Maite//PT-BR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'SUMMARY:Chá de Bebê da Maitê 🌸',
      'DESCRIPTION:Venha comemorar conosco o Chá de Bebê da nossa amada Maitê! Esperamos por você com muito carinho. Leonardo & Isabella.',
      'LOCATION:Espaço LC Eventos, Goiânia - GO',
      'DTSTART:20261017T183000Z',
      'DTEND:20261017T230000Z',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cha-de-bebe-da-maite.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    addToast({ message: 'Convite baixado para sua agenda! 📅', type: 'success' });
  };

  return (
    <section className="py-12 bg-white/60 dark:bg-slate-900/60 border-y border-blush-100 dark:border-slate-800 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading with Cloud Reveal */}
        <CloudHeadingReveal
          badge="Informações do Evento"
          badgeIcon={Sparkles}
          title="Tudo o que você"
          highlight="precisa saber ✨"
          subtitle={config.welcomeMessage}
          className="text-center max-w-2xl mx-auto mb-12"
        />

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Data & Horário */}
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
                  Data & Horário
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-1 font-medium">
                  {config.displayDate}
                </p>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs mt-2 bg-blush-50/70 dark:bg-slate-800 px-3 py-1.5 rounded-lg w-fit">
                  <Clock className="w-3.5 h-3.5 text-blush-500 dark:text-blush-400" />
                  <span>{config.displayTime}</span>
                </div>
              </div>

              {/* Adicionar à Agenda Buttons */}
              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                  Adicionar à Minha Agenda
                </span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blush-50 dark:bg-blush-950/60 hover:bg-blush-100 dark:hover:bg-blush-900/60 text-blush-700 dark:text-blush-300 transition active:scale-95 cursor-pointer"
                    title="Adicionar ao Google Agenda"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Google Agenda</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleDownloadICS}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer"
                    title="Baixar arquivo de agenda para Apple / Outlook (.ics)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Apple / Outlook (.ics)</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Localização & Endereço */}
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
                  Local da Celebração
                </h3>
                <p className="text-slate-800 dark:text-slate-100 font-semibold text-sm mb-1">
                  {config.locationName}
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  {config.address}<br />
                  {config.city}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer"
                >
                  {copiedAddress ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-300">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Endereço</span>
                    </>
                  )}
                </button>

                <a
                  href={config.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-sage-50 dark:bg-sage-950/60 hover:bg-sage-100 dark:hover:bg-sage-900/60 text-sage-700 dark:text-sage-300 transition active:scale-95 cursor-pointer"
                  title="Abrir no Google Maps"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Mapa</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Opção Pix / Mimo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="h-full"
          >
            <div className="glass-card p-6 rounded-3xl border border-blush-100 dark:border-slate-800 flex flex-col justify-between shadow-sm h-full hover:shadow-lg hover:-translate-y-1 hover:border-gold-300 dark:hover:border-slate-700 transition-all duration-200 ease-out relative overflow-hidden">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gold-100/80 dark:bg-gold-950/80 flex items-center justify-center text-gold-600 dark:text-gold-400 mb-5">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  Prefere presentear em Pix?
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-3">
                  Caso more longe ou prefira nos ajudar com cotas de fraldas em dinheiro, disponibilizamos a chave Pix dos papais.
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onOpenPixModal}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gold-400 hover:bg-gold-500 text-slate-900 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>Ver Chave Pix dos Papais</span>
                </button>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
