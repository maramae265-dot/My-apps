import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw, X } from 'lucide-react';

export const OrientationWarning: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait || dismissed) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-md bg-slate-900/95 border-2 border-cyan-500 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3 text-white pointer-events-auto animate-bounce-short">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-cyan-500/20 rounded-xl text-cyan-400">
          <RotateCw className="w-6 h-6 animate-spin-slow" />
        </div>
        <div>
          <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider">
            MODO HORIZONTAL RECOMENDADO
          </h4>
          <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
            Gira tu dispositivo en horizontal para tener visibilidad 3D panorámica y botones laterales ergonómicos.
          </p>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white shrink-0"
        title="Continuar en vertical"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
