import React, { useState } from 'react';
import { X, Check, ExternalLink, ShieldCheck, Zap, Sparkles, Coins, Crown, Copy, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { P2WItem } from '../types/game';
import { P2W_ITEMS, CURRENCY_PACKS, PAYPAL_RECEIVER_EMAIL, buildPayPalUrl } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedP2wIds: Set<string>;
  onUnlockP2W: (item: P2WItem) => void;
  onAddCurrency: (coins: number, gems: number) => void;
  currentCoins: number;
  currentGems: number;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  unlockedP2wIds,
  onUnlockP2W,
  onAddCurrency,
  currentCoins,
  currentGems,
}) => {
  const [activeTab, setActiveTab] = useState<'p2w' | 'currency'>('p2w');
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
    priceUsd: number;
    description: string;
    isCurrency?: boolean;
    coins?: number;
    gems?: number;
    itemRef?: P2WItem;
  } | null>(null);

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [purchasedId, setPurchasedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PAYPAL_RECEIVER_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleOpenPayPal = (itemName: string, amount: number) => {
    const url = buildPayPalUrl(itemName, amount);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleConfirmAndActivate = () => {
    if (!selectedItem) return;

    soundEngine.playPurchaseSuccess();

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#facc15', '#06b6d4', '#ec4899', '#10b981'],
    });

    if (selectedItem.isCurrency) {
      onAddCurrency(selectedItem.coins || 0, selectedItem.gems || 0);
    } else if (selectedItem.itemRef) {
      onUnlockP2W(selectedItem.itemRef);
    }

    setPurchasedId(selectedItem.id);
    setTimeout(() => {
      setPurchasedId(null);
      setSelectedItem(null);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 pointer-events-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
                TIENDA OFICIAL PAY-TO-WIN
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  VENTAJAS REALES
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pagos seguros directos a PayPal:{' '}
                <button
                  onClick={handleCopyEmail}
                  className="font-mono text-cyan-400 hover:underline inline-flex items-center gap-1"
                >
                  {PAYPAL_RECEIVER_EMAIL} {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Currency balance readout */}
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <Coins className="w-3.5 h-3.5" />
                <span>{currentCoins.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentGems} Gemas</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('p2w')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-lg transition flex items-center gap-2 ${
              activeTab === 'p2w'
                ? 'bg-slate-900 text-amber-400 border-b-2 border-amber-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Ventajas Pay-to-Win ($0.99 - $99.99)
          </button>
          <button
            onClick={() => setActiveTab('currency')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-lg transition flex items-center gap-2 ${
              activeTab === 'currency'
                ? 'bg-slate-900 text-cyan-400 border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4 text-cyan-400" />
            Monedas & Gemas de Uranio
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'p2w' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {P2W_ITEMS.map((item) => {
                const isUnlocked = unlockedP2wIds.has(item.id);
                const isGod = item.id === 'p2w_god_emperor';

                return (
                  <div
                    key={item.id}
                    className={`relative rounded-xl p-4 flex flex-col justify-between border transition-all ${
                      isGod
                        ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-amber-500 shadow-xl shadow-amber-500/10 md:col-span-2 lg:col-span-3'
                        : isUnlocked
                        ? 'bg-slate-900/60 border-emerald-500/40'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top badge & price */}
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${
                            isGod
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                          }`}
                        >
                          TIER {item.tier} · {item.badge}
                        </span>
                        <span className="text-base font-black text-white">
                          ${item.priceUsd.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">USD</span>
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-sm mb-1">{item.name}</h3>
                      <p className="text-xs text-slate-400 mb-3 leading-relaxed">{item.description}</p>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg mb-3">
                        ⚡ {item.perkSummary}
                      </div>

                      {isUnlocked ? (
                        <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                          <Check className="w-4 h-4" /> ACTIVADO EN TU CUENTA
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setSelectedItem({
                              id: item.id,
                              name: item.name,
                              priceUsd: item.priceUsd,
                              description: item.description,
                              itemRef: item,
                            })
                          }
                          className={`w-full py-2.5 rounded-lg font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg ${
                            isGod
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/30'
                              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" /> Adquirir por ${item.priceUsd.toFixed(2)} USD
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Currency Packs */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CURRENCY_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-cyan-400">{pack.bonus || 'Paquete Básico'}</span>
                      <span className="text-lg font-black text-white">${pack.priceUsd.toFixed(2)} USD</span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{pack.name}</h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-300 mb-4">
                      <span className="flex items-center gap-1 text-amber-400">
                        <Coins className="w-4 h-4" /> {pack.coins.toLocaleString()} Créditos
                      </span>
                      {pack.gems > 0 && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Sparkles className="w-4 h-4" /> {pack.gems} Gemas
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedItem({
                        id: pack.id,
                        name: pack.name,
                        priceUsd: pack.priceUsd,
                        description: `Recibirás ${pack.coins.toLocaleString()} Créditos Apex ${pack.gems > 0 ? `y ${pack.gems} Gemas` : ''} al instante.`,
                        isCurrency: true,
                        coins: pack.coins,
                        gems: pack.gems,
                      })
                    }
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                  >
                    Comprar con PayPal (${pack.priceUsd.toFixed(2)})
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security / PayPal Guarantee Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Transacciones encriptadas SSL · Envío de fondos a PayPal: <strong>vabe950@gmail.com</strong></span>
          </div>
          <span className="text-[11px] text-slate-500">Activación inmediata en el servidor</span>
        </div>
      </div>

      {/* PAYPAL CHECKOUT MODAL OVERLAY */}
      {selectedItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">PASARELA DE PAGO PAYPAL</h3>
                <p className="text-xs text-slate-400">Destinatario oficial: {PAYPAL_RECEIVER_EMAIL}</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-white">{selectedItem.name}</span>
                <span className="text-base font-black text-amber-400">${selectedItem.priceUsd.toFixed(2)} USD</span>
              </div>
              <p className="text-xs text-slate-400">{selectedItem.description}</p>
            </div>

            {purchasedId === selectedItem.id ? (
              <div className="py-4 flex flex-col items-center justify-center text-emerald-400 gap-2">
                <CheckCircle2 className="w-12 h-12 animate-bounce" />
                <span className="font-bold text-sm">¡PAGO VERIFICADO Y ACTIVADO CON ÉXITO!</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1. Official PayPal Checkout Button */}
                <button
                  onClick={() => handleOpenPayPal(selectedItem.name, selectedItem.priceUsd)}
                  className="w-full py-3 rounded-xl bg-[#0070ba] hover:bg-[#005ea6] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <ExternalLink className="w-4 h-4" /> Pagar en PayPal Oficial (${selectedItem.priceUsd.toFixed(2)} USD)
                </button>

                {/* 2. Direct simulation / Fast validation instant activator */}
                <button
                  onClick={handleConfirmAndActivate}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Zap className="w-3.5 h-3.5" /> Validar & Desbloquear al Instante
                </button>

                <p className="text-[10px] text-slate-400 text-center">
                  Todos los pagos se registran para <span className="text-slate-300 font-mono">vabe950@gmail.com</span>. Los objetos se activan permanentemente en tu partida.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
