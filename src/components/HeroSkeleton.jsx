import React from 'react';

const Block = ({ className = '' }) => (
  <div className={`animate-pulse rounded-full bg-blush-200/60 dark:bg-slate-800 ${className}`} />
);

export default function HeroSkeleton() {
  return (
    <div className="min-h-screen bg-baby-pattern flex flex-col" aria-busy="true">
      <header className="h-16 border-b border-blush-100/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Block className="w-9 h-9" />
            <div className="space-y-1.5">
              <Block className="w-20 h-3.5" />
              <Block className="w-28 h-2.5" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Block className="w-11 h-11" />
            <Block className="w-11 h-11 md:hidden" />
          </div>
        </div>
      </header>

      <main className="flex-1 pt-8 pb-16 md:pt-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
          <p role="status" className="sr-only">Carregando as informações do evento...</p>
          <Block className="w-56 h-8 mb-6" />
          <Block className="w-64 h-3.5 mb-4" />
          <Block className="w-44 sm:w-64 h-20 sm:h-28 mb-6 !rounded-3xl" />
          <Block className="w-full max-w-xl h-3.5 mb-2" />
          <Block className="w-4/5 max-w-md h-3.5 mb-10" />
          <div className="flex flex-wrap justify-center gap-3">
            <Block className="w-32 h-12" />
            <Block className="w-40 h-12" />
          </div>
        </div>
      </main>
    </div>
  );
}
