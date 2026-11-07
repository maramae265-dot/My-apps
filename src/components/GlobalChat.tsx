import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ChevronDown, ChevronUp, Radio } from 'lucide-react';
import { ChatMessage, RankTier } from '../types/game';
import { INITIAL_SIMULATED_MESSAGES, RANKS } from '../game/constants';

interface GlobalChatProps {
  playerRank: RankTier;
  isVIP: boolean;
  defaultCollapsed?: boolean;
}

const BOT_CHAT_POOL = [
  '¡Buena racha de bajas!',
  'El Railgun Celestial está rotísimo pero vale cada centavo jajaja',
  '¿Quién para ranked competitivo? Agreguen',
  '¡Ojo con los que usan la habilidad de invisibilidad en el centro!',
  'La ruleta me dio la skin legendaria Mecha Titán en el primer intento 🔥',
  'Servidores estables a 120 FPS, cero lag',
  'Vayan por el punto elevado de la torre, da ventaja de tiro',
  'Compré el Aim Assist en la tienda y mi K/D subió a 4.5',
];

export const GlobalChat: React.FC<GlobalChatProps> = ({ playerRank, isVIP, defaultCollapsed = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_SIMULATED_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [channel, setChannel] = useState<'global' | 'match' | 'vip'>('global');
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isCollapsed]);

  // Simulate active multiplayer lobby chat activity
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const senders = ['S4mura1_EU', 'ViperX_777', 'K1llMachine', 'CyberValkyrie', 'AlphaWolf', 'Ghost_Recon99'];
        const sender = senders[Math.floor(Math.random() * senders.length)];
        const text = BOT_CHAT_POOL[Math.floor(Math.random() * BOT_CHAT_POOL.length)];
        const ranks: RankTier[] = ['Oro', 'Platino', 'Diamante', 'Maestro', 'Gran Maestro'];

        const newMsg: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random()}`,
          sender,
          rank: ranks[Math.floor(Math.random() * ranks.length)],
          isVIP: Math.random() > 0.5,
          text,
          channel: Math.random() > 0.8 ? 'vip' : 'global',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev.slice(-30), newMsg]);
      }
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'Tú',
      tag: isVIP ? 'VIP P2W' : 'PLAYER',
      rank: playerRank,
      isVIP,
      text: inputText.trim(),
      channel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  const filteredMessages = messages.filter((m) => {
    if (channel === 'vip') return m.isVIP || m.channel === 'vip';
    return true;
  });

  return (
    <div className="pointer-events-auto w-80 sm:w-96 bg-slate-950/85 border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-white tracking-wide">CHAT GLOBAL EN VIVO</span>
          <span className="inline-flex items-center px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
            <Radio className="w-2.5 h-2.5 mr-1 animate-pulse" /> 1,420 ONLINE
          </span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white p-1 rounded transition"
          title={isCollapsed ? 'Expandir' : 'Minimizar'}
        >
          {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Channel Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-950/60 px-2 pt-1 gap-1">
            <button
              onClick={() => setChannel('global')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-t transition ${
                channel === 'global' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-900/80' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setChannel('match')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-t transition ${
                channel === 'match' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-900/80' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Partida
            </button>
            <button
              onClick={() => setChannel('vip')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-t transition ${
                channel === 'vip' ? 'text-amber-400 border-b-2 border-amber-400 bg-slate-900/80' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👑 Club VIP P2W
            </button>
          </div>

          {/* Messages list */}
          <div ref={scrollRef} className="h-44 overflow-y-auto p-2.5 space-y-1.5 font-sans divide-y divide-slate-900/50">
            {filteredMessages.map((msg) => {
              const rInfo = RANKS[msg.rank] || RANKS['Hierro'];
              return (
                <div key={msg.id} className="pt-1 first:pt-0 leading-relaxed">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                    <span
                      className="text-[9px] font-bold px-1 rounded uppercase tracking-wider"
                      style={{ backgroundColor: `${rInfo.color}25`, color: rInfo.color }}
                    >
                      {msg.rank}
                    </span>
                    {msg.isVIP && (
                      <span className="text-[9px] font-black px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        👑 VIP
                      </span>
                    )}
                    <span className={`font-bold ${msg.sender === 'Tú' ? 'text-cyan-300' : 'text-slate-200'}`}>
                      {msg.sender}:
                    </span>
                    <span className="text-slate-300 break-words">{msg.text}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input form */}
          <form onSubmit={handleSendMessage} className="p-2 bg-slate-900/70 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe un mensaje en el chat global..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              maxLength={120}
            />
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg flex items-center justify-center transition shadow-md"
              title="Enviar mensaje"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
