import React from 'react';
import { X, Check, Shirt, Crosshair, Sparkles, Coins, Crown } from 'lucide-react';
import { SkinItem } from '../types/game';
import { SKINS_CATALOG } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedSkinIds: Set<string>;
  equippedSkinId: string;
  onEquipSkin: (skin: SkinItem) => void;
  onBuySkin: (skin: SkinItem) => boolean;
  currentCoins: number;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  unlockedSkinIds,
  equippedSkinId,
  onEquipSkin,
  onBuySkin,
  currentCoins,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 pointer-events-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Shirt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
                ARMERÍA Y TRAJES LEGENDARIOS
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                  PERSONALIZACIÓN 3D
                </span>
              </h2>
              <p className="text-xs text-slate-400">Canjea tus Créditos Apex por armaduras de combate y apariencias</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400">
              <Coins className="w-3.5 h-3.5" />
              <span>{currentCoins.toLocaleString()} Créditos</span>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Skins Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SKINS_CATALOG.map((skin) => {
            const isUnlocked = unlockedSkinIds.has(skin.id);
            const isEquipped = equippedSkinId === skin.id;

            return (
              <div
                key={skin.id}
                className={`rounded-xl p-4 border flex flex-col justify-between transition-all ${
                  isEquipped
                    ? 'bg-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Preview Color Swatch */}
                  <div
                    className="h-24 w-full rounded-lg mb-3 flex items-center justify-center relative overflow-hidden shadow-inner border border-white/10"
                    style={{
                      background: `linear-gradient(135deg, ${skin.previewColor}, ${skin.secondaryColor})`,
                    }}
                  >
                    {skin.glow && (
                      <div className="absolute inset-0 bg-white/15 animate-pulse"></div>
                    )}
                    <span className="text-white text-2xl font-black drop-shadow-md">
                      {skin.category === 'outfit' ? '🥋' : '🔫'}
                    </span>
                    <span className="absolute bottom-2 right-2 text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-slate-950/80 text-white border border-white/20">
                      {skin.rarity}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm mb-1">{skin.name}</h3>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">{skin.description}</p>
                </div>

                <div>
                  {isEquipped ? (
                    <div className="w-full py-2 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" /> EQUIPADO ACTUALMENTE
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => {
                        soundEngine.playReload();
                        onEquipSkin(skin);
                      }}
                      className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                    >
                      Equipar Traje
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const ok = onBuySkin(skin);
                        if (ok) {
                          soundEngine.playPurchaseSuccess();
                        } else {
                          alert('¡No tienes suficientes Créditos Apex! Consigue más en la tienda PayPal o ruleta.');
                        }
                      }}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Coins className="w-3.5 h-3.5" /> Canjear ({skin.priceCoins.toLocaleString()} Créditos)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
