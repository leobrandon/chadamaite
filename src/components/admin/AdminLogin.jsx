import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin({ pinInput, setPinInput, pinError, setPinError, onLogin }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="p-8 sm:p-14 text-center max-w-md mx-auto space-y-6">
      <div className="w-16 h-16 rounded-full bg-blush-50 dark:bg-blush-950/40 text-blush-500 dark:text-blush-400 mx-auto flex items-center justify-center">
        <Lock className="w-8 h-8" />
      </div>
      <div>
        <h4 className="font-serif text-2xl font-bold text-slate-800 dark:text-white">
          Área Restrita aos Pais
        </h4>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Digite a senha de acesso dos papais para gerenciar o Chá
        </p>
      </div>

      <form onSubmit={onLogin} className="space-y-4">
        <div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              maxLength={25}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              placeholder="Digite a senha do painel"
              className={`w-full text-center tracking-widest font-mono text-xl py-3 px-10 rounded-2xl border outline-none transition bg-white dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 ${
                pinError
                  ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900'
                  : 'border-slate-300 dark:border-slate-700 focus:border-blush-500 dark:focus:border-blush-400 focus:ring-2 focus:ring-blush-200 dark:focus:ring-blush-950'
              }`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg transition"
              title={showPassword ? 'Ocultar senha' : 'Ver senha'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {pinError && (
            <p className="text-xs text-rose-500 dark:text-rose-400 font-bold mt-2">
              ❌ Senha incorreta. Verifique a senha digitada e tente novamente.
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-blush-600 hover:bg-slate-800 dark:hover:bg-blush-500 text-white font-bold text-sm shadow-md transition"
        >
          Entrar no Painel
        </button>
      </form>
    </div>
  );
}
