import React from 'react';
import { X, Trophy, Award, Flame, Shield, ArrowUpRight } from 'lucide-react';
import { RankTier } from '../types/game';
import { RANKS } from '../game/constants';

interface RankModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentElo: number;
  currentRank: RankTier;
}

const LEADERBOARD_PLAYERS = [
  { rankPos: 1, name: 'S4mura1_EU', rank: 'Apex Predator' as RankTier, elo: 5840, kd: 5.2, wins: 342, isP2W: true },
  { rankPos: 2, name: 'ViperX_777', rank: 'Apex Predator' as RankTier, elo: 5610, kd: 4.8, wins: 310, isP2W: true },
  { rankPos: 3, name: 'ElReyDelP2W', rank: 'Apex Predator' as RankTier, elo: 5490, kd: 4.6, wins: 295, isP2W: true },
  { rankPos: 4, name: 'Ghost_Recon99', rank: 'Gran Maestro' as RankTier, elo: 4890, kd: 3.9, wins: 260, isP2W: false },
  { rankPos: 5, name: 'CyberValkyrie', rank: 'Gran Maestro' as RankTier, elo: 4620, kd: 3.7, wins: 245, isP2W: true },
  { rankPos: 6, name: 'NeonNinja_ES', rank: 'Maestro' as RankTier, elo: 3950, kd: 3.2, wins: 198, isP2W: false },
  { rankPos: 7, name: 'K1llMachine', rank: 'Maestro' as RankTier, elo: 3810, kd: 3.1, wins: 184, isP2W: true },
  { rankPos: 8, name: 'AlphaPredator', rank: 'Diamante' as RankTier, elo: 3150, kd: 2.8, wins: 152, isP2W: false },
];

export const RankModal: React.FC<RankModalProps> = ({
  isOpen,
  onClose,
  currentElo,
  currentRank,
}) => {
  if (!isOpen) return null;

  const currentRankInfo = RANKS[currentRank] || RANKS['Hierro'];
  const rankList = Object.values(RANKS);
  const currentIdx = rankList.findIndex((r) => r.tier === currentRank);
  const nextRank = currentIdx < rankList.length - 1 ? rankList[currentIdx + 1] : null;

  // Calculate progress toward next rank
  let progressPercent = 100;
  if (nextRank) {
    const range = nextRank.minElo - currentRankInfo.minElo;
    const progress = currentElo - currentRankInfo.minElo;
    progressPercent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 pointer-events-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
                SISTEMA DE RANGOS COMPETITIVO
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                  TEMPORADA 1
                </span>
              </h2>
              <p className="text-xs text-slate-400">Clasificación mundial en tiempo real por puntos de rango (RP)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Current Rank Card */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl border"
              style={{
                backgroundColor: `${currentRankInfo.color}15`,
                borderColor: currentRankInfo.color,
              }}
            >
              {currentRankInfo.badgeIcon}
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">TU RANGO ACTUAL</div>
              <div className="text-2xl font-black text-white flex items-center gap-2">
                <span>{currentRank}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-md font-bold"
                  style={{ backgroundColor: `${currentRankInfo.color}30`, color: currentRankInfo.color }}
                >
                  {currentElo} RP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentRankInfo.description}</p>
            </div>
          </div>

          {/* Progress Bar toward Next Rank */}
          {nextRank && (
            <div className="w-full md:w-80 flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Próximo: {nextRank.tier}</span>
                <span className="text-cyan-400">{progressPercent}% ({nextRank.minElo - currentElo} RP restantes)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Content Columns: Leaderboard & Rank Tier Tiers */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Top 10 World Leaderboard (8 cols) */}
          <div className="lg:col-span-8 bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              TABLA DE CLASIFICACIÓN MUNDIAL (TOP APEX)
            </h3>

            <div className="divide-y divide-slate-800/60">
              <div className="grid grid-cols-12 text-[10px] font-bold text-slate-500 pb-2">
                <span className="col-span-1">#</span>
                <span className="col-span-5">JUGADOR</span>
                <span className="col-span-3 text-center">RANGO</span>
                <span className="col-span-1 text-center">K/D</span>
                <span className="col-span-2 text-right">ELO RP</span>
              </div>

              {LEADERBOARD_PLAYERS.map((player) => (
                <div key={player.rankPos} className="grid grid-cols-12 items-center py-2.5 text-xs">
                  <span className={`col-span-1 font-mono font-bold ${player.rankPos <= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {player.rankPos}
                  </span>
                  <div className="col-span-5 flex items-center gap-1.5">
                    <span className="font-bold text-white">{player.name}</span>
                    {player.isP2W && <span className="text-amber-400 text-xs" title="Jugador VIP P2W">👑</span>}
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${RANKS[player.rank].color}20`,
                        color: RANKS[player.rank].color,
                      }}
                    >
                      {player.rank}
                    </span>
                  </div>
                  <span className="col-span-1 text-center font-bold text-emerald-400">{player.kd}</span>
                  <span className="col-span-2 text-right font-black text-cyan-400 tabular-nums">{player.elo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ranks Escalation Ladder (4 cols) */}
          <div className="lg:col-span-4 bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                ESCALERA DE RANGOS
              </h3>

              <div className="space-y-2">
                {rankList.map((r) => {
                  const isCurrent = r.tier === currentRank;
                  return (
                    <div
                      key={r.tier}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                        isCurrent
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{r.badgeIcon}</span>
                        <span>{r.tier}</span>
                      </div>
                      <span className="font-mono text-[11px]" style={{ color: r.color }}>
                        {r.minElo} RP
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[11px] text-amber-200">
              💡 <strong>Consejo Pro:</strong> Los objetos de la tienda Pay-to-Win aumentan drásticamente tu ratio de victorias y aceleran tu ascenso hacia Apex Predator.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
