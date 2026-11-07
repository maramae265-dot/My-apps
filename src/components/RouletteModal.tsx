import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Coins, Disc, Crown, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RouletteItem } from '../types/game';
import { ROULETTE_REWARDS } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';

interface RouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoins: number;
  currentGems: number;
  onRewardWon: (reward: RouletteItem) => void;
  onDeductCurrency: (coins: number, gems: number) => boolean;
}

export const RouletteModal: React.FC<RouletteModalProps> = ({
  isOpen,
  onClose,
  currentCoins,
  currentGems,
  onRewardWon,
  onDeductCurrency,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [itemsList, setItemsList] = useState<RouletteItem[]>([]);
  const [wonItem, setWonItem] = useState<RouletteItem | null>(null);
  const [carouselOffset, setCarouselOffset] = useState(0);

  const carouselRef = useRef<HTMLDivElement>(null);
  const CARD_WIDTH = 140; // width + gap

  // Generate long strip of 60 items with random distributions
  const generateStrip = (forceWinningItem?: RouletteItem) => {
    const list: RouletteItem[] = [];
    for (let i = 0; i < 55; i++) {
      const rand = Math.random();
      let picked: RouletteItem;
      if (rand < 0.45) {
        picked = ROULETTE_REWARDS.filter((r) => r.rarity === 'common')[0] || ROULETTE_REWARDS[0];
      } else if (rand < 0.75) {
        picked = ROULETTE_REWARDS.filter((r) => r.rarity === 'rare')[0] || ROULETTE_REWARDS[1];
      } else if (rand < 0.90) {
        picked = ROULETTE_REWARDS.filter((r) => r.rarity === 'epic')[0] || ROULETTE_REWARDS[2];
      } else if (rand < 0.98) {
        picked = ROULETTE_REWARDS.filter((r) => r.rarity === 'legendary')[0] || ROULETTE_REWARDS[4];
      } else {
        picked = ROULETTE_REWARDS.filter((r) => r.rarity === 'mythic' || r.rarity === 'celestial')[0] || ROULETTE_REWARDS[8];
      }
      list.push({ ...picked, id: `strip_${i}_${Math.random()}` });
    }

    // Target winning item at position 45
    if (forceWinningItem) {
      list[45] = { ...forceWinningItem, id: `strip_45_winner` };
    }
    return list;
  };

  useEffect(() => {
    if (isOpen && itemsList.length === 0) {
      setItemsList(generateStrip());
    }
  }, [isOpen, itemsList.length]);

  if (!isOpen) return null;

  const handleSpin = (useGems: boolean) => {
    if (isSpinning) return;

    const costCoins = useGems ? 0 : 800;
    const costGems = useGems ? 2 : 0;

    const success = onDeductCurrency(costCoins, costGems);
    if (!success) {
      alert(useGems ? '¡No tienes suficientes Gemas de Uranio!' : '¡No tienes suficientes Créditos Apex!');
      return;
    }

    setWonItem(null);
    setIsSpinning(true);

    // Pick winning item (higher luck with gems)
    let winner: RouletteItem;
    const rand = Math.random();
    if (useGems) {
      // VIP Lucky Spin
      if (rand < 0.3) winner = ROULETTE_REWARDS.find((r) => r.rarity === 'celestial') || ROULETTE_REWARDS[8];
      else if (rand < 0.6) winner = ROULETTE_REWARDS.find((r) => r.rarity === 'mythic') || ROULETTE_REWARDS[7];
      else winner = ROULETTE_REWARDS.find((r) => r.rarity === 'legendary') || ROULETTE_REWARDS[4];
    } else {
      // Normal Spin
      if (rand < 0.05) winner = ROULETTE_REWARDS.find((r) => r.rarity === 'celestial') || ROULETTE_REWARDS[8];
      else if (rand < 0.15) winner = ROULETTE_REWARDS.find((r) => r.rarity === 'mythic') || ROULETTE_REWARDS[7];
      else if (rand < 0.35) winner = ROULETTE_REWARDS.find((r) => r.rarity === 'legendary') || ROULETTE_REWARDS[4];
      else if (rand < 0.65) winner = ROULETTE_REWARDS.find((r) => r.rarity === 'epic') || ROULETTE_REWARDS[2];
      else winner = ROULETTE_REWARDS.find((r) => r.rarity === 'rare' || r.rarity === 'common') || ROULETTE_REWARDS[0];
    }

    const newStrip = generateStrip(winner);
    setItemsList(newStrip);

    // Calculate target offset so card at index 45 is centered in viewport
    const containerWidth = carouselRef.current ? carouselRef.current.clientWidth : 700;
    const centerOffset = containerWidth / 2 - CARD_WIDTH / 2;
    // Slight random jitter inside the card (-35 to +35 px)
    const jitter = (Math.random() - 0.5) * 60;
    const finalOffset = -(45 * CARD_WIDTH - centerOffset + jitter);

    // Reset offset first
    setCarouselOffset(0);

    // Animate smoothly with CSS transition
    setTimeout(() => {
      setCarouselOffset(finalOffset);

      // Play tick sounds as it passes cards
      let ticks = 0;
      const tickInterval = setInterval(() => {
        ticks++;
        soundEngine.playRouletteTick(1.0 + (ticks / 35) * 0.4);
        if (ticks >= 28) clearInterval(tickInterval);
      }, 140);
    }, 50);

    // Finish spin after 5.5s
    setTimeout(() => {
      setIsSpinning(false);
      setWonItem(winner);
      onRewardWon(winner);

      // Confetti for good drops!
      if (['legendary', 'mythic', 'celestial'].includes(winner.rarity)) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#facc15', '#ec4899', '#06b6d4', '#10b981'],
        });
        soundEngine.playPurchaseSuccess();
      } else {
        soundEngine.playKillSound();
      }
    }, 5600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 pointer-events-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Disc className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
                RULETA MODERNA DE SKINS Y VENTAJAS
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                  SISTEMA CS/APEX
                </span>
              </h2>
              <p className="text-xs text-slate-400">Desbloquea aspectos legendarios y potenciadores Pay-to-Win</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <Coins className="w-3.5 h-3.5" /> {currentCoins.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" /> {currentGems} Gemas
              </span>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Visual Arena */}
        <div className="p-6 bg-slate-950/70 relative flex flex-col items-center">
          {/* Center Indicator needle */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-amber-400 shadow-[0_0_12px_#facc15] z-20 pointer-events-none flex flex-col justify-between items-center py-2">
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-400"></div>
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-amber-400"></div>
          </div>

          {/* Carousel viewport window */}
          <div ref={carouselRef} className="w-full overflow-hidden py-4 relative">
            <div
              className="flex gap-2.5 transition-transform ease-out"
              style={{
                transform: `translateX(${carouselOffset}px)`,
                transitionDuration: isSpinning ? '5400ms' : '0ms',
                transitionTimingFunction: 'cubic-bezier(0.12, 0.8, 0.22, 1)',
              }}
            >
              {itemsList.map((item, idx) => {
                const isWinner = wonItem && idx === 45;
                return (
                  <div
                    key={item.id}
                    className={`w-[130px] h-[160px] shrink-0 rounded-xl p-3 flex flex-col justify-between items-center text-center border relative transition ${
                      isWinner
                        ? 'border-amber-400 bg-amber-500/20 scale-105 shadow-xl shadow-amber-500/40'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {/* Top glow accent */}
                    <div
                      className="w-full h-1 rounded-full mb-1"
                      style={{ backgroundColor: item.color }}
                    ></div>

                    <div className="my-auto flex flex-col items-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-1 shadow-md"
                        style={{ backgroundColor: `${item.color}25`, border: `1px solid ${item.color}60` }}
                      >
                        {item.rarity === 'celestial' ? (
                          <Crown className="w-5 h-5 text-amber-400" />
                        ) : item.type === 'coins' ? (
                          <Coins className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Trophy className="w-5 h-5" style={{ color: item.color }} />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-white leading-tight line-clamp-2">
                        {item.name}
                      </span>
                    </div>

                    <span
                      className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${item.color}20`, color: item.color }}
                    >
                      {item.rarity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Winning Announcement Banner */}
          {wonItem && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-amber-500/60 shadow-xl flex items-center justify-between w-full animate-fade-in">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl"
                  style={{ backgroundColor: `${wonItem.color}20`, border: `1px solid ${wonItem.color}` }}
                >
                  🎉
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">¡HAS GANADO!</div>
                  <div className="text-lg font-black text-white">{wonItem.name}</div>
                  <div className="text-xs font-semibold" style={{ color: wonItem.color }}>
                    Rareza: {wonItem.rarity.toUpperCase()} · {wonItem.value}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Añadido a tu Inventario
              </span>
            </div>
          )}
        </div>

        {/* Action Controls & Spin Buttons */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span className="font-bold text-white">Probabilidades transparentes:</span>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Común: 45% · Raro: 30% · Épico: 15% · Legendario: 7% · Mítico/Celestial: 3%
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Standard Spin */}
            <button
              onClick={() => handleSpin(false)}
              disabled={isSpinning}
              className={`flex-1 sm:flex-none px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg ${
                isSpinning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 shadow-amber-500/10'
              }`}
            >
              <Coins className="w-4 h-4 text-amber-400" />
              Girar (800 Créditos)
            </button>

            {/* VIP Lucky Spin */}
            <button
              onClick={() => handleSpin(true)}
              disabled={isSpinning}
              className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xl ${
                isSpinning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Giro VIP (2 Gemas · +Suerte)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
