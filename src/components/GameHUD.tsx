import React, { useState, useEffect } from 'react';
import { Shield, Heart, Zap, Crosshair, Award, Users, Volume2, VolumeX, Eye } from 'lucide-react';
import { RankTier, KillFeedEntry, PlayerScore } from '../types/game';
import { RANKS, WEAPONS } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';

interface GameHUDProps {
  stats: {
    health: number;
    maxHealth: number;
    shield: number;
    maxShield: number;
    ammo: number;
    maxAmmo: number;
    isReloading: boolean;
    kills: number;
    deaths: number;
    score: number;
    elo: number;
    rank: RankTier;
    activePerks: string[];
    invisibilityTimeLeft: number;
  };
  hitmarker: { active: boolean; isHeadshot: boolean } | null;
  killFeed: KillFeedEntry[];
  scores: PlayerScore[];
  isLocked: boolean;
  onOpenStore: () => void;
  onOpenRoulette: () => void;
  onOpenRank: () => void;
  onOpenInventory: () => void;
  onExitMatch: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  hitmarker,
  killFeed,
  scores,
  isLocked,
  onOpenStore,
  onOpenRoulette,
  onOpenRank,
  onOpenInventory,
  onExitMatch,
}) => {
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        setShowScoreboard(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        setShowScoreboard(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    soundEngine.setMuted(next);
    setIsMuted(next);
  };

  const currentRankInfo = RANKS[stats.rank] || RANKS['Hierro'];
  const healthPercent = Math.max(0, Math.min(100, (stats.health / stats.maxHealth) * 100));
  const shieldPercent = Math.max(0, Math.min(100, (stats.shield / stats.maxShield) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-4 overflow-hidden">
      {/* 1. TOP HEADER CLUSTER (Rank, Stats, Killfeed) */}
      <div className="flex justify-between items-start w-full">
        {/* Left: Player Profile & Rank badge */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl shadow-lg pointer-events-auto">
          <div className="text-2xl">{currentRankInfo.badgeIcon}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm tracking-wide">Tú (Comandante)</span>
              <span
                className="text-xs px-2 py-0.5 rounded font-black tracking-wider uppercase"
                style={{ backgroundColor: `${currentRankInfo.color}25`, color: currentRankInfo.color }}
              >
                {stats.rank}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Elo: <strong className="text-white">{stats.elo}</strong> RP</span>
              <span>•</span>
              <span className="text-emerald-400">K/D: {stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(1) : stats.kills}</span>
              <span>•</span>
              <span className="text-cyan-400">Ping: 16ms</span>
            </div>
          </div>

          {/* Active P2W Perks Badges */}
          {stats.activePerks.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-800">
              {stats.activePerks.map((perk, i) => (
                <span
                  key={i}
                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40"
                >
                  {perk}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Center: Match Score & Invisibility Alert */}
        <div className="flex flex-col items-center">
          {stats.invisibilityTimeLeft > 0 && (
            <div className="flex items-center gap-2 bg-purple-900/90 text-purple-200 border border-purple-500 px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg mb-2">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span>CAMUFLAJE ÓPTICO ACTIVO ({stats.invisibilityTimeLeft.toFixed(1)}s)</span>
            </div>
          )}

          <div className="bg-slate-950/80 border border-slate-800 px-5 py-1.5 rounded-full flex items-center gap-4 text-xs font-bold text-slate-300 shadow-md">
            <span>BAJAS: <span className="text-emerald-400 text-sm">{stats.kills}</span></span>
            <span className="text-slate-600">|</span>
            <span>MUERTES: <span className="text-red-400 text-sm">{stats.deaths}</span></span>
            <span className="text-slate-600">|</span>
            <span>PUNTOS: <span className="text-amber-400 text-sm">{stats.score}</span></span>
          </div>
        </div>

        {/* Right: Quick Menu Buttons & Kill Feed */}
        <div className="flex flex-col items-end gap-2">
          {/* Quick HUD controls */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
              title={isMuted ? 'Activar Sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onOpenStore}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 transition"
            >
              👑 Tienda P2W
            </button>
            <button
              onClick={onOpenRoulette}
              className="px-3 py-1.5 rounded-lg bg-purple-600/90 hover:bg-purple-500 border border-purple-400 text-white font-bold text-xs shadow-md transition"
            >
              🎰 Ruleta
            </button>
            <button
              onClick={onExitMatch}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-red-950 border border-slate-800 text-slate-400 hover:text-red-300 text-xs transition"
            >
              Menú
            </button>
          </div>

          {/* Killfeed list */}
          <div className="flex flex-col items-end gap-1.5 mt-2">
            {killFeed.slice(-4).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-2 bg-slate-950/85 border border-slate-800/80 px-3 py-1 rounded-md text-xs shadow-md animate-fade-in"
              >
                <span className={`font-bold ${entry.killer === 'Tú' ? 'text-amber-400' : 'text-slate-200'}`}>
                  {entry.killer}
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {entry.weapon}
                </span>
                {entry.isHeadshot && <span className="text-red-500 font-bold text-xs" title="Headshot">💀</span>}
                <span className={`font-bold ${entry.victim === 'Tú' ? 'text-red-400' : 'text-cyan-300'}`}>
                  {entry.victim}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CENTER RETICLE / HITMARKER */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Subtle dot crosshair */}
        <div className="relative flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"></div>
          {/* Crosshair ticks */}
          <div className="absolute -top-3 w-0.5 h-2 bg-cyan-400/60"></div>
          <div className="absolute -bottom-3 w-0.5 h-2 bg-cyan-400/60"></div>
          <div className="absolute -left-3 h-0.5 w-2 bg-cyan-400/60"></div>
          <div className="absolute -right-3 h-0.5 w-2 bg-cyan-400/60"></div>

          {/* Hitmarker X ticks on hit */}
          {hitmarker && hitmarker.active && (
            <div className={`absolute w-6 h-6 flex items-center justify-center ${hitmarker.isHeadshot ? 'text-red-500 scale-125' : 'text-cyan-300'}`}>
              <div className="absolute w-4 h-0.5 bg-current rotate-45 animate-pulse"></div>
              <div className="absolute w-4 h-0.5 bg-current -rotate-45 animate-pulse"></div>
              {hitmarker.isHeadshot && (
                <div className="absolute -top-5 text-[10px] font-black tracking-widest text-red-500 drop-shadow">
                  HEADSHOT!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lock Hint when pointer is not locked */}
        {!isLocked && (
          <div className="absolute top-[58%] bg-slate-950/90 border border-cyan-500/50 text-cyan-300 px-4 py-2 rounded-xl text-xs font-bold text-center pointer-events-auto cursor-pointer shadow-2xl">
            🖱️ Haz clic en la pantalla para apuntar y disparar con el ratón
            <div className="text-[10px] text-slate-400 font-normal mt-0.5">WASD: Moverse · Shift: Correr · Espacio: Saltar · R: Recargar · E: Habilidad P2W</div>
          </div>
        )}
      </div>

      {/* 3. CENTERED BOTTOM DOCK (Health, Shield, Ammo) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-950/90 border border-slate-800 p-2.5 rounded-2xl shadow-2xl pointer-events-auto max-w-[94vw]">
        {/* Health & Shield compact horizontal bars */}
        <div className="flex flex-col gap-1 w-44 sm:w-52">
          {/* Shield */}
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-300">
                <span>ESCUDO</span>
                <span className="text-cyan-400">{stats.shield}</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150"
                  style={{ width: `${shieldPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Health */}
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-[10px] font-bold text-slate-300">
                <span>SALUD</span>
                <span className={stats.health < 35 ? 'text-red-400 animate-pulse font-black' : 'text-emerald-400'}>
                  {stats.health}
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-150 ${
                    stats.health < 35
                      ? 'bg-gradient-to-r from-red-600 to-red-400'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${healthPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-px h-8 bg-slate-800"></div>

        {/* Ammo Display */}
        <div className="flex items-center gap-2 px-2">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase font-bold text-slate-400">MUNICIÓN</span>
            <div className="flex items-baseline gap-0.5">
              <span className={`text-xl font-black tabular-nums ${stats.ammo <= 5 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
                {stats.activePerks.some((p) => p.includes('DIOS')) ? '∞' : stats.ammo}
              </span>
              <span className="text-xs text-slate-500 font-bold">
                /{stats.activePerks.some((p) => p.includes('DIOS')) ? '∞' : stats.maxAmmo}
              </span>
            </div>
            {stats.isReloading && (
              <span className="text-[9px] font-black text-amber-400 tracking-wider animate-pulse">RECARGANDO</span>
            )}
          </div>
          <Zap className="w-4 h-4 text-cyan-400" />
        </div>
      </div>

      {/* 4. SCOREBOARD MODAL (Hold TAB) */}
      {showScoreboard && (
        <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center p-6 z-30 pointer-events-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-black text-white uppercase tracking-wider">TABLA DE POSICIONES · SERVIDOR APEX</h3>
              </div>
              <span className="text-xs text-slate-400">Mantén [TAB] para ver</span>
            </div>

            <div className="mt-4 divide-y divide-slate-800/60 max-h-72 overflow-y-auto">
              <div className="grid grid-cols-12 text-[11px] font-bold text-slate-400 pb-2">
                <span className="col-span-1">#</span>
                <span className="col-span-5">JUGADOR</span>
                <span className="col-span-2 text-center">RANGO</span>
                <span className="col-span-1 text-center">K</span>
                <span className="col-span-1 text-center">D</span>
                <span className="col-span-1 text-center">PTS</span>
                <span className="col-span-1 text-right">PING</span>
              </div>

              {scores.map((p, idx) => (
                <div
                  key={p.id}
                  className={`grid grid-cols-12 items-center py-2 text-xs ${
                    p.name.includes('Tú') ? 'bg-cyan-500/10 text-cyan-300 font-bold' : 'text-slate-300'
                  }`}
                >
                  <span className="col-span-1 text-slate-500 font-mono">{idx + 1}</span>
                  <div className="col-span-5 flex items-center gap-1.5 truncate">
                    <span>{p.name}</span>
                    {p.isP2W && <span className="text-amber-400 text-xs" title="Pay-to-Win Donador">👑</span>}
                  </div>
                  <span className="col-span-2 text-center text-[10px] font-semibold text-slate-400">{p.rank}</span>
                  <span className="col-span-1 text-center font-bold text-emerald-400">{p.kills}</span>
                  <span className="col-span-1 text-center text-slate-400">{p.deaths}</span>
                  <span className="col-span-1 text-center font-bold text-amber-400">{p.score}</span>
                  <span className="col-span-1 text-right text-[10px] text-slate-400 font-mono">{p.ping}ms</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
