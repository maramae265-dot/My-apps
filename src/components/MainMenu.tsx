import React, { useState } from 'react';
import { Play, Zap, Disc, Trophy, Shirt, ExternalLink, ShieldCheck, Copy, Check, Radio, Volume2, VolumeX, Sparkles, Crown, Download, Smartphone } from 'lucide-react';
import { RankTier } from '../types/game';
import { RANKS, PAYPAL_RECEIVER_EMAIL, buildPayPalUrl } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';

interface MainMenuProps {
  onStartGame: (gameMode: string) => void;
  onOpenStore: () => void;
  onOpenRoulette: () => void;
  onOpenRank: () => void;
  onOpenInventory: () => void;
  onOpenDownloadApk: () => void;
  playerRank: RankTier;
  playerElo: number;
  coins: number;
  gems: number;
  unlockedP2wCount: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenStore,
  onOpenRoulette,
  onOpenRank,
  onOpenInventory,
  onOpenDownloadApk,
  playerRank,
  playerElo,
  coins,
  gems,
  unlockedP2wCount,
}) => {
  const [selectedMode, setSelectedMode] = useState('ffa');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());

  const currentRankInfo = RANKS[playerRank] || RANKS['Hierro'];

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PAYPAL_RECEIVER_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleQuickPayPal = (tierName: string, price: number) => {
    const url = buildPayPalUrl(tierName, price);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleMute = () => {
    const next = !isMuted;
    soundEngine.setMuted(next);
    setIsMuted(next);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 sm:p-10 select-none z-20 overflow-y-auto">
      {/* 1. TOP BAR: Currency, Rank, Server ping, Sound toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 w-full">
        {/* Server & Network Status */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-xs backdrop-blur-none">
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> SERVIDOR SA-EAST / US
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">120 Hz Tickrate</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-mono">14ms Ping</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400 font-bold">1,420 Jugadores Online</span>
        </div>

        {/* Currency & Player Rank Cluster */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold">
            <span className="text-amber-400 flex items-center gap-1">
              💰 {coins.toLocaleString()} Créditos
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              💎 {gems} Gemas
            </span>
          </div>

          <div
            onClick={onOpenRank}
            className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-white cursor-pointer transition shadow-md"
          >
            <span>{currentRankInfo.badgeIcon}</span>
            <span style={{ color: currentRankInfo.color }}>{playerRank}</span>
            <span className="text-slate-400 font-mono">({playerElo} RP)</span>
          </div>

          <button
            onClick={onOpenDownloadApk}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition transform hover:scale-105 active:scale-95"
          >
            <Smartphone className="w-4 h-4 text-emerald-300" />
            <span>DESCARGAR APK</span>
          </button>

          <button
            onClick={toggleMute}
            className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white transition"
            title={isMuted ? 'Activar Sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 2. HERO CENTER: Bespoke SVG Title Lockup & Game Mode Selector */}
      <div className="my-auto py-8 max-w-2xl">
        {/* Bespoke inline SVG Title Lockup */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-black tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" /> COMPETITIVE 3D MULTIPLAYER SHOOTER
          </div>

          {/* SVG Logo Title */}
          <div className="w-full max-w-lg">
            <svg viewBox="0 0 520 85" className="w-full h-auto filter drop-shadow-[0_0_25px_rgba(6,182,212,0.4)]">
              <defs>
                <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#facc15" />
                </linearGradient>
                <linearGradient id="p2wGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
              <text
                x="0"
                y="55"
                fontFamily="system-ui, sans-serif"
                fontWeight="900"
                fontSize="52"
                letterSpacing="4"
                fill="url(#cyberGrad)"
              >
                CYBER APEX
              </text>
              <rect x="365" y="16" width="145" height="45" rx="8" fill="#18181b" stroke="#facc15" strokeWidth="2" />
              <text
                x="437"
                y="45"
                fontFamily="system-ui, sans-serif"
                fontWeight="900"
                fontSize="22"
                textAnchor="middle"
                letterSpacing="2"
                fill="url(#p2wGrad)"
              >
                P2W ARENA
              </text>
            </svg>
          </div>

          <p className="text-sm text-slate-300 font-medium leading-relaxed mt-2 max-w-xl">
            Entra a la arena 3D con simulación de servidor de alto rendimiento, sistema de rangos competitivo, ruleta moderna de skins y tienda Pay-to-Win integrada directamente con pagos PayPal.
          </p>
        </div>

        {/* Game Mode Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { id: 'ffa', name: 'Partida Rápida (FFA)', desc: 'Caos total libre contra todos', badge: 'Casual' },
            { id: 'ranked', name: 'Competitivo Ranked', desc: 'Sube de Bronce a Apex Predator', badge: 'Clasificatorio' },
            { id: 'p2w_chaos', name: 'Arena P2W Total', desc: 'Sin restricciones de ventajas', badge: 'Modo Dios' },
          ].map((mode) => (
            <div
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedMode === mode.id
                  ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-white">{mode.name}</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-900 text-cyan-400 border border-cyan-500/30">
                  {mode.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{mode.desc}</p>
            </div>
          ))}
        </div>

        {/* Primary Start CTA Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => onStartGame(selectedMode)}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-cyan-500/25 transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>DESPLEGAR EN LA ARENA</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-mono">SPACE / ENTER</span>
          </button>

          <button
            onClick={onOpenStore}
            className="px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
          >
            <Crown className="w-5 h-5" />
            <span>TIENDA PAYPAL P2W</span>
          </button>
        </div>

        {/* Flat control-hint line */}
        <div className="text-xs text-slate-400 font-medium mt-4 tracking-wide">
          WASD Moverse · Shift Correr · Espacio Saltar · R Recargar · E Habilidad P2W · Tab Posiciones
        </div>
      </div>

      {/* 3. BOTTOM PANEL: Navigation & PayPal Direct Transactions in Main Menu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Navigation Buttons (6 cols) */}
        <div className="lg:col-span-6 flex flex-wrap gap-2">
          <button
            onClick={onOpenStore}
            className="px-4 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 shadow-md transition"
          >
            <Zap className="w-4 h-4 text-amber-400" /> Tienda P2W ($0.99 - $99.99)
          </button>

          <button
            onClick={onOpenRoulette}
            className="px-4 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-2 shadow-md transition"
          >
            <Disc className="w-4 h-4 text-purple-400" /> Ruleta de Skins
          </button>

          <button
            onClick={onOpenRank}
            className="px-4 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-2 shadow-md transition"
          >
            <Trophy className="w-4 h-4 text-cyan-400" /> Clasificación Ranked
          </button>

          <button
            onClick={onOpenInventory}
            className="px-4 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 shadow-md transition"
          >
            <Shirt className="w-4 h-4 text-slate-400" /> Trajes Legendarios
          </button>

          <button
            onClick={onOpenDownloadApk}
            className="px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-md transition"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Descargar APK Android
          </button>
        </div>

        {/* Integrated PayPal Direct Box (6 cols) */}
        <div className="lg:col-span-6 bg-slate-950/90 border border-amber-500/40 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Transacciones Directas PayPal:</span>
              <button
                onClick={handleCopyEmail}
                className="font-mono text-amber-300 hover:underline inline-flex items-center gap-1 text-[11px]"
              >
                {PAYPAL_RECEIVER_EMAIL} {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Tus compras se envían a esta cuenta e impulsan tus ventajas P2W en tiempo real.
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleQuickPayPal('Aim Assist Microchip', 0.99)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1"
            >
              Aim Assist $0.99
            </button>
            <button
              onClick={() => handleQuickPayPal('Paquete Dios Emperador Celestial', 99.99)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black tracking-wide transition flex items-center gap-1 shadow-md"
            >
              👑 Pack Dios $99.99
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
