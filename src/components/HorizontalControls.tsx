import React, { useState, useRef } from 'react';
import { Crosshair, Zap, RotateCcw, ArrowUp, Flame, Shield, Eye, ShieldAlert } from 'lucide-react';
import { GameEngine } from '../game/gameEngine';
import { WEAPONS } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';

interface HorizontalControlsProps {
  engine: GameEngine | null;
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
  invisibilityTimeLeft: number;
  hasP2WPerks: boolean;
  onSwitchWeapon: (index: number) => void;
  activeWeaponIndex: number;
}

export const HorizontalControls: React.FC<HorizontalControlsProps> = ({
  engine,
  ammo,
  maxAmmo,
  isReloading,
  invisibilityTimeLeft,
  hasP2WPerks,
  onSwitchWeapon,
  activeWeaponIndex,
}) => {
  const [isSprinting, setIsSprinting] = useState(false);
  const [isAiming, setIsAiming] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });

  const joystickRef = useRef<HTMLDivElement>(null);
  const touchLookStart = useRef<{ x: number; y: number } | null>(null);

  // Joystick touch handlers
  const handleJoystickStart = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxDist = 45;
    const dist = Math.min(maxDist, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);

    const nx = (Math.cos(angle) * dist) / maxDist;
    const ny = (Math.sin(angle) * dist) / maxDist;

    setJoystickPos({ x: nx * 35, y: ny * 35 });
    if (engine) engine.setVirtualMove(nx, ny);
  };

  const handleJoystickMove = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxDist = 45;
    const dist = Math.min(maxDist, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);

    const nx = (Math.cos(angle) * dist) / maxDist;
    const ny = (Math.sin(angle) * dist) / maxDist;

    setJoystickPos({ x: nx * 35, y: ny * 35 });
    if (engine) engine.setVirtualMove(nx, ny);
  };

  const handleJoystickEnd = () => {
    setJoystickPos({ x: 0, y: 0 });
    if (engine) engine.setVirtualMove(0, 0);
  };

  // Touch look on the right side of the screen
  const handleTouchLookStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchLookStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchLookMove = (e: React.TouchEvent) => {
    if (!touchLookStart.current || !engine) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchLookStart.current.x;
    const dy = touch.clientY - touchLookStart.current.y;
    touchLookStart.current = { x: touch.clientX, y: touch.clientY };

    engine.rotateCamera(dx * 1.5, dy * 1.5);
  };

  const handleTouchLookEnd = () => {
    touchLookStart.current = null;
  };

  const toggleSprint = () => {
    const next = !isSprinting;
    setIsSprinting(next);
    if (engine) engine.setVirtualSprinting(next);
    soundEngine.playRouletteTick(1.4);
  };

  const toggleAim = () => {
    const next = !isAiming;
    setIsAiming(next);
    if (engine) engine.setVirtualAiming(next);
    soundEngine.playRouletteTick(1.2);
  };

  const handleFireDown = () => {
    setIsFiring(true);
    if (engine) engine.setVirtualShooting(true);
  };

  const handleFireUp = () => {
    setIsFiring(false);
    if (engine) engine.setVirtualShooting(false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-15 flex justify-between select-none overflow-hidden">
      {/* Invisible Touch Look Pan Area (Right side for mobile/tablet drag aiming) */}
      <div
        className="absolute right-0 top-16 bottom-36 w-1/2 pointer-events-auto"
        onTouchStart={handleTouchLookStart}
        onTouchMove={handleTouchLookMove}
        onTouchEnd={handleTouchLookEnd}
      />

      {/* 1. LEFT FLANK CONTROLS: Joystick & Sprint Button */}
      <div className="flex flex-col justify-end items-start p-6 pb-8 gap-4 pointer-events-auto">
        {/* Sprint Toggle */}
        <button
          onClick={toggleSprint}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-lg transition active:scale-95 ${
            isSprinting
              ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/40'
              : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{isSprinting ? 'CORRIENDO ⚡' : 'CORRER [SHIFT]'}</span>
        </button>

        {/* Virtual Analog Joystick */}
        <div
          ref={joystickRef}
          onMouseDown={(e) => {
            const onMouseMove = (ev: MouseEvent) => handleJoystickMove(ev.clientX, ev.clientY);
            const onMouseUp = () => {
              handleJoystickEnd();
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
            handleJoystickStart(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => handleJoystickStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => handleJoystickMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={handleJoystickEnd}
          className="relative w-28 h-28 rounded-full bg-slate-950/70 border-2 border-cyan-500/40 flex items-center justify-center shadow-2xl backdrop-blur-none cursor-pointer"
        >
          {/* Directional arrow notches */}
          <div className="absolute top-1 text-[9px] font-bold text-cyan-400">W</div>
          <div className="absolute bottom-1 text-[9px] font-bold text-cyan-400">S</div>
          <div className="absolute left-1.5 text-[9px] font-bold text-cyan-400">A</div>
          <div className="absolute right-1.5 text-[9px] font-bold text-cyan-400">D</div>

          {/* Center inner ring */}
          <div className="w-12 h-12 rounded-full border border-cyan-500/20 pointer-events-none"></div>

          {/* Interactive Thumb Knob */}
          <div
            className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/50 flex items-center justify-center pointer-events-none transition-transform duration-75"
            style={{
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-white/80"></div>
          </div>
        </div>
      </div>

      {/* 2. RIGHT FLANK CONTROLS: Action Buttons (Fire, Aim, Jump, Reload, Skill, Weapon Switches) */}
      <div className="flex flex-col justify-end items-end p-6 pb-8 gap-3 pointer-events-auto">
        {/* Weapon Quick-Pills Row */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1.5 rounded-xl shadow-lg">
          {WEAPONS.map((w, idx) => {
            const isActive = activeWeaponIndex === idx;
            return (
              <button
                key={w.id}
                onClick={() => {
                  soundEngine.playReload();
                  onSwitchWeapon(idx);
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition active:scale-95 flex items-center gap-1 border ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <span>[{idx + 1}]</span>
                <span>{w.category}</span>
              </button>
            );
          })}
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-3 gap-2.5 items-end">
          {/* P2W Skill Button [E] */}
          <button
            onClick={() => {
              if (engine) engine.triggerP2WAbility();
            }}
            className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center text-[10px] font-black uppercase transition active:scale-95 shadow-lg ${
              invisibilityTimeLeft > 0
                ? 'bg-purple-600 border-purple-300 text-white animate-pulse'
                : hasP2WPerks
                ? 'bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/30 text-amber-300 shadow-amber-500/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <Eye className="w-4 h-4 mb-0.5" />
            <span>{invisibilityTimeLeft > 0 ? `${invisibilityTimeLeft.toFixed(0)}s` : 'SKILL [E]'}</span>
          </button>

          {/* Reload Button [R] */}
          <button
            onClick={() => {
              if (engine) engine.triggerReload();
            }}
            disabled={isReloading}
            className={`w-14 h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 flex flex-col items-center justify-center text-[10px] font-bold transition active:scale-95 shadow-lg ${
              isReloading ? 'animate-spin border-amber-400 text-amber-400' : ''
            }`}
          >
            <RotateCcw className="w-4 h-4 mb-0.5" />
            <span>{isReloading ? '...' : 'RECARGAR [R]'}</span>
          </button>

          {/* Jump Button [SPACE] */}
          <button
            onClick={() => {
              if (engine) engine.triggerJump();
              soundEngine.playJumpPad();
            }}
            className="w-14 h-14 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-cyan-300 flex flex-col items-center justify-center text-[10px] font-black transition active:scale-95 shadow-lg"
          >
            <ArrowUp className="w-5 h-5 mb-0.5" />
            <span>SALTAR</span>
          </button>

          {/* Aim / Scope Zoom Button */}
          <button
            onClick={toggleAim}
            className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center text-[10px] font-bold transition active:scale-95 shadow-lg ${
              isAiming
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-cyan-500/30'
                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Crosshair className="w-5 h-5 mb-0.5" />
            <span>{isAiming ? 'ZOOM ON' : 'MIRA'}</span>
          </button>

          {/* GIANT FIRE BUTTON (DISPARAR 🔥) Spans 2 cols */}
          <button
            onMouseDown={handleFireDown}
            onMouseUp={handleFireUp}
            onTouchStart={handleFireDown}
            onTouchEnd={handleFireUp}
            className={`col-span-2 h-14 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border shadow-xl transition transform active:scale-95 ${
              isFiring
                ? 'bg-gradient-to-r from-red-500 to-amber-500 border-red-300 text-white scale-102 shadow-red-500/50'
                : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 border-red-500 text-white shadow-red-600/30'
            }`}
          >
            <Flame className="w-5 h-5 fill-current animate-pulse" />
            <span>DISPARAR (FUEGO)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
