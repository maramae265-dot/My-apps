import React, { useEffect } from 'react';
import { Trophy, Skull, RotateCcw, Home, Smartphone, Award, Coins, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../audio/soundEngine';

interface MatchEndModalProps {
  isOpen: boolean;
  result: 'victory' | 'defeat';
  kills: number;
  deaths: number;
  score: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
  onOpenDownloadApk: () => void;
}

export const MatchEndModal: React.FC<MatchEndModalProps> = ({
  isOpen,
  result,
  kills,
  deaths,
  score,
  onPlayAgain,
  onBackToMenu,
  onOpenDownloadApk,
}) => {
  const isVictory = result === 'victory';

  useEffect(() => {
    if (isOpen) {
      if (isVictory) {
        soundEngine.playPurchaseSuccess();
        // Golden victory confetti blast
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#facc15', '#f59e0b', '#06b6d4', '#10b981'],
        });
      } else {
        soundEngine.playKillSound();
      }
    }
  }, [isOpen, isVictory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 pointer-events-auto">
      <div className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-2xl overflow-hidden flex flex-col items-center text-center animate-scale-in ${
        isVictory
          ? 'bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-900 border-amber-500 shadow-amber-500/20'
          : 'bg-gradient-to-b from-red-950/60 via-slate-900 to-slate-900 border-red-500/60 shadow-red-500/20'
      }`}>
        {/* Background glow circle */}
        <div className={`absolute -top-24 w-64 h-64 rounded-full blur-3xl opacity-30 ${
          isVictory ? 'bg-amber-400' : 'bg-red-500'
        }`}></div>

        {/* Center Animated Trophy / Skull Icon */}
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 border shadow-xl ${
          isVictory
            ? 'bg-amber-500/20 border-amber-400 text-amber-400 animate-bounce-short'
            : 'bg-red-500/20 border-red-400 text-red-400'
        }`}>
          {isVictory ? <Trophy className="w-10 h-10" /> : <Skull className="w-10 h-10" />}
        </div>

        {/* Title Lockup */}
        <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border mb-2 ${
          isVictory
            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            : 'bg-red-500/10 text-red-300 border-red-500/30'
        }`}>
          {isVictory ? '👑 CAMPEÓN DE LA ARENA' : '💀 COMBATE FINALIZADO'}
        </span>

        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-wider mb-2">
          {isVictory ? '¡VICTORIA ROYALE!' : 'HAS SIDO DERROTADO'}
        </h2>

        <p className="text-xs text-slate-300 max-w-xs leading-relaxed mb-6">
          {isVictory
            ? '¡Has dominado el servidor con puntería legendaria y reflejos superiores!'
            : 'Buen intento en la arena. Ajusta tus ventajas Pay-to-Win y toma tu revancha.'}
        </p>

        {/* Match Statistics Card */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 grid grid-cols-3 gap-2 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">BAJAS (KILLS)</span>
            <span className="text-2xl font-black text-emerald-400">{kills}</span>
          </div>
          <div className="flex flex-col items-center border-x border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase">MUERTES</span>
            <span className="text-2xl font-black text-red-400">{deaths}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">PUNTOS</span>
            <span className="text-2xl font-black text-amber-400">{score}</span>
          </div>
        </div>

        {/* Rewards earned */}
        <div className="w-full flex items-center justify-center gap-4 text-xs font-bold text-slate-300 mb-6 bg-slate-900/90 py-2.5 rounded-xl border border-slate-800">
          <span className="flex items-center gap-1 text-cyan-400">
            <Award className="w-4 h-4" /> {isVictory ? '+75 RP Elo' : '+15 RP Elo'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-amber-400">
            <Coins className="w-4 h-4" /> {isVictory ? '+1,500 Créditos' : '+400 Créditos'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3 mb-4">
          <button
            onClick={onPlayAgain}
            className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>JUGAR REVANCHA</span>
          </button>

          <button
            onClick={onBackToMenu}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
          >
            <Home className="w-4 h-4" />
            <span>Menú</span>
          </button>
        </div>

        {/* Android APK install promo */}
        <button
          onClick={onOpenDownloadApk}
          className="w-full py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition"
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>¿Quieres jugar en tu celular? Descargar APK Android</span>
        </button>
      </div>
    </div>
  );
};
