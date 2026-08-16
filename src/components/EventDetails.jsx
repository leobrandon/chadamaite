import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Copy, Check, ExternalLink, Heart, Sparkles, QrCode } from 'lucide-react';

export default function EventDetails({ config, onOpenPixModal }) {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = () => {
    const fullAddress = `${config.locationName}, ${config.address} - ${config.city}`;
    navigator.clipboard.writeText(fullAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  return (
    <section className="py-12 bg-white/60 border-y border-blush-100 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-blush-600 font-semibold text-xs uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Informações do Evento</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-800">
            Tudo o que você precisa saber
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            {config.welcomeMessage}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Data & Horário */}
          <div className="glass-card p-6 rounded-3xl border border-blush-100 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blush-100/80 flex items-center justify-center text-blush-600 mb-5">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-800 mb-2">
                Data & Horário
              </h3>
              <p className="text-slate-600 text-sm mb-1 font-medium">
                {config.displayDate}
              </p>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-2 bg-blush-50/70 px-3 py-1.5 rounded-lg w-fit">
                <Clock className="w-3.5 h-3.5 text-blush-500" />
                <span>{config.displayTime}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-6 border-t border-slate-100 pt-3">
              Chegue no horário para não perder as brincadeiras e o jantar! 🌭
            </p>
          </div>

          {/* Card 2: Localização & Endereço */}
          <div className="glass-card p-6 rounded-3xl border border-blush-100 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sage-100/80 flex items-center justify-center text-sage-600 mb-5">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-800 mb-1">
                Local da Celebração
              </h3>
              <p className="text-slate-800 font-semibold text-sm mb-1">
                {config.locationName}
              </p>
              <p className="text-slate-600 text-xs leading-relaxed">
                {config.address}<br />
                {config.city}
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={handleCopyAddress}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                {copiedAddress ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiado!</span>
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
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-sage-50 hover:bg-sage-100 text-sage-700 transition"
                title="Abrir no Google Maps"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Mapa</span>
              </a>
            </div>
          </div>

          {/* Card 3: Opção Pix / Mimo */}
          <div className="glass-card p-6 rounded-3xl border border-blush-100 flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-gold-100/60 rounded-full blur-xl pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gold-100/80 flex items-center justify-center text-gold-600 mb-5">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-800 mb-2">
                Prefere presentear em Pix?
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-3">
                Caso more longe ou prefira nos ajudar com cotas de fraldas em dinheiro, disponibilizamos a chave Pix dos papais.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100">
              <button
                onClick={onOpenPixModal}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gold-400 hover:bg-gold-500 text-slate-900 shadow-sm transition"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>Ver Chave Pix dos Papais</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
