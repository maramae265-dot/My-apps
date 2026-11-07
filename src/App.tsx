import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from './game/gameEngine';
import { GameHUD } from './components/GameHUD';
import { GlobalChat } from './components/GlobalChat';
import { StoreModal } from './components/StoreModal';
import { RouletteModal } from './components/RouletteModal';
import { RankModal } from './components/RankModal';
import { InventoryModal } from './components/InventoryModal';
import { MainMenu } from './components/MainMenu';
import { DownloadApkModal } from './components/DownloadApkModal';
import { HorizontalControls } from './components/HorizontalControls';
import { OrientationWarning } from './components/OrientationWarning';
import { RankTier, KillFeedEntry, PlayerScore, P2WItem, SkinItem, RouletteItem } from './types/game';
import { WEAPONS } from './game/constants';
import { soundEngine } from './audio/soundEngine';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Game Shell State ('menu' | 'playing')
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [isLocked, setIsLocked] = useState(false);

  // Player Stats
  const [stats, setStats] = useState({
    health: 100,
    maxHealth: 100,
    shield: 100,
    maxShield: 100,
    ammo: 30,
    maxAmmo: 30,
    isReloading: false,
    kills: 0,
    deaths: 0,
    score: 0,
    elo: 1250,
    rank: 'Plata' as RankTier,
    activePerks: [] as string[],
    invisibilityTimeLeft: 0,
  });

  // Hitmarker indicator state
  const [hitmarker, setHitmarker] = useState<{ active: boolean; isHeadshot: boolean } | null>(null);

  // Killfeed state
  const [killFeed, setKillFeed] = useState<KillFeedEntry[]>([]);

  // Scoreboard list
  const [scores, setScores] = useState<PlayerScore[]>([
    { id: 'p0', name: 'Tú (Comandante)', rank: 'Plata', kills: 0, deaths: 0, score: 0, ping: 14, isP2W: false, isBot: false, activePerks: [] },
    { id: 'b1', name: 'S4mura1_EU', rank: 'Gran Maestro', kills: 14, deaths: 3, score: 1450, ping: 22, isP2W: true, isBot: true, activePerks: ['👑'] },
    { id: 'b2', name: 'ViperX_777', rank: 'Maestro', kills: 11, deaths: 5, score: 1180, ping: 35, isP2W: true, isBot: true, activePerks: ['🎯'] },
    { id: 'b3', name: 'Ghost_Recon99', rank: 'Platino', kills: 7, deaths: 6, score: 720, ping: 18, isP2W: false, isBot: true, activePerks: [] },
    { id: 'b4', name: 'CyberValkyrie', rank: 'Diamante', kills: 9, deaths: 4, score: 940, ping: 28, isP2W: true, isBot: true, activePerks: ['🩸'] },
    { id: 'b5', name: 'NeonNinja', rank: 'Oro', kills: 5, deaths: 7, score: 510, ping: 42, isP2W: false, isBot: true, activePerks: [] },
    { id: 'b6', name: 'K1llMachine', rank: 'Maestro', kills: 8, deaths: 6, score: 830, ping: 19, isP2W: false, isBot: true, activePerks: [] },
  ]);

  // Virtual Currencies
  const [coins, setCoins] = useState(2500); // Initial welcome test balance
  const [gems, setGems] = useState(5);

  // Inventory & Customization
  const [unlockedP2wIds, setUnlockedP2wIds] = useState<Set<string>>(new Set());
  const [unlockedSkinIds, setUnlockedSkinIds] = useState<Set<string>>(new Set(['skin_cyber_ninja']));
  const [equippedSkinId, setEquippedSkinId] = useState('skin_cyber_ninja');
  const [activeWeaponIndex, setActiveWeaponIndex] = useState(0);

  // Modals
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isRankOpen, setIsRankOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // Initialize Three.js Game Engine once on mount
  useEffect(() => {
    if (!canvasMountRef.current) return;

    soundEngine.init();

    const engine = new GameEngine(canvasMountRef.current, {
      onStatsUpdate: (newStats) => {
        setStats(newStats);
        // Sync scoreboard for player
        setScores((prev) =>
          prev.map((p) =>
            p.id === 'p0'
              ? {
                  ...p,
                  kills: newStats.kills,
                  deaths: newStats.deaths,
                  score: newStats.score,
                  rank: newStats.rank,
                  isP2W: newStats.activePerks.length > 0,
                  activePerks: newStats.activePerks,
                }
              : p
          )
        );
      },
      onHitmarker: (isHeadshot) => {
        setHitmarker({ active: true, isHeadshot });
        setTimeout(() => setHitmarker(null), 120);
      },
      onKill: (victim, weapon, isHeadshot, isP2W) => {
        const entry: KillFeedEntry = {
          id: `kf_${Date.now()}_${Math.random()}`,
          killer: 'Tú',
          victim,
          weapon,
          isHeadshot,
          isP2W,
          time: Date.now(),
        };
        setKillFeed((prev) => [...prev.slice(-7), entry]);
      },
      onPlayerDeath: (killer) => {
        const entry: KillFeedEntry = {
          id: `kf_${Date.now()}_${Math.random()}`,
          killer,
          victim: 'Tú',
          weapon: 'Plasma Blast',
          isHeadshot: false,
          isP2W: false,
          time: Date.now(),
        };
        setKillFeed((prev) => [...prev.slice(-7), entry]);
      },
      onLockChange: (locked) => {
        setIsLocked(locked);
      },
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Keyboard shortcut listener for Start Game (Space/Enter) in Menu
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (gameState === 'menu' && !isStoreOpen && !isRouletteOpen && !isRankOpen && !isInventoryOpen && !isApkModalOpen) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleStartGame('ffa');
        }
      }
      if (e.code === 'Escape') {
        if (isStoreOpen) setIsStoreOpen(false);
        else if (isRouletteOpen) setIsRouletteOpen(false);
        else if (isRankOpen) setIsRankOpen(false);
        else if (isInventoryOpen) setIsInventoryOpen(false);
        else if (isApkModalOpen) setIsApkModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [gameState, isStoreOpen, isRouletteOpen, isRankOpen, isInventoryOpen, isApkModalOpen]);

  // Handle Game Start
  const handleStartGame = (gameMode: string) => {
    soundEngine.init();
    soundEngine.playJumpPad();
    soundEngine.startAmbientMusic();
    setGameState('playing');

    // Auto lock pointer after brief delay
    setTimeout(() => {
      const canvas = canvasMountRef.current?.querySelector('canvas');
      if (canvas && !document.pointerLockElement) {
        canvas.requestPointerLock();
      }
    }, 150);
  };

  // Exit match to menu
  const handleExitMatch = () => {
    if (document.exitPointerLock) {
      document.exitPointerLock();
    }
    setGameState('menu');
  };

  // P2W Perk Unlock handler
  const handleUnlockP2W = (item: P2WItem) => {
    const nextSet = new Set(unlockedP2wIds);
    nextSet.add(item.id);
    setUnlockedP2wIds(nextSet);

    if (engineRef.current) {
      engineRef.current.applyP2WPerks(Array.from(nextSet));
    }
  };

  // Add Currency
  const handleAddCurrency = (newCoins: number, newGems: number) => {
    setCoins((prev) => prev + newCoins);
    setGems((prev) => prev + newGems);
  };

  // Deduct Currency for Roulette
  const handleDeductCurrency = (costCoins: number, costGems: number) => {
    if (coins < costCoins || gems < costGems) return false;
    setCoins((prev) => prev - costCoins);
    setGems((prev) => prev - costGems);
    return true;
  };

  // Roulette Reward Won
  const handleRewardWon = (reward: RouletteItem) => {
    if (reward.rewardCoins) {
      setCoins((prev) => prev + reward.rewardCoins!);
    }
    if (reward.rewardSkinId) {
      setUnlockedSkinIds((prev) => new Set([...prev, reward.rewardSkinId!]));
    }
    if (reward.rewardP2wId) {
      const nextSet = new Set(unlockedP2wIds);
      nextSet.add(reward.rewardP2wId);
      setUnlockedP2wIds(nextSet);
      if (engineRef.current) {
        engineRef.current.applyP2WPerks(Array.from(nextSet));
      }
    }
  };

  // Equip Skin
  const handleEquipSkin = (skin: SkinItem) => {
    setEquippedSkinId(skin.id);
    if (engineRef.current) {
      engineRef.current.setOutfit(skin.secondaryColor);
    }
  };

  // Buy Skin with Coins
  const handleBuySkin = (skin: SkinItem) => {
    if (coins < skin.priceCoins) return false;
    setCoins((prev) => prev - skin.priceCoins);
    const nextSkins = new Set(unlockedSkinIds);
    nextSkins.add(skin.id);
    setUnlockedSkinIds(nextSkins);
    handleEquipSkin(skin);
    return true;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. 3D WebGL Canvas Mount (Isolated container, never re-mounted) */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full cursor-crosshair z-0"
      />

      {/* 2. MAIN MENU / TITLE SCREEN (When not in match) */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 bg-slate-950/75 z-20">
          <MainMenu
            onStartGame={handleStartGame}
            onOpenStore={() => setIsStoreOpen(true)}
            onOpenRoulette={() => setIsRouletteOpen(true)}
            onOpenRank={() => setIsRankOpen(true)}
            onOpenInventory={() => setIsInventoryOpen(true)}
            onOpenDownloadApk={() => setIsApkModalOpen(true)}
            playerRank={stats.rank}
            playerElo={stats.elo}
            coins={coins}
            gems={gems}
            unlockedP2wCount={unlockedP2wIds.size}
          />
        </div>
      )}

      {/* Orientation Warning Banner (if viewed in portrait) */}
      <OrientationWarning />

      {/* 3. IN-GAME LOW-OCCLUSION HUD & HORIZONTAL TOUCH/MOUSE CONTROLS */}
      {gameState === 'playing' && (
        <>
          <GameHUD
            stats={stats}
            hitmarker={hitmarker}
            killFeed={killFeed}
            scores={scores}
            isLocked={isLocked}
            onOpenStore={() => {
              if (document.exitPointerLock) document.exitPointerLock();
              setIsStoreOpen(true);
            }}
            onOpenRoulette={() => {
              if (document.exitPointerLock) document.exitPointerLock();
              setIsRouletteOpen(true);
            }}
            onOpenRank={() => {
              if (document.exitPointerLock) document.exitPointerLock();
              setIsRankOpen(true);
            }}
            onOpenInventory={() => {
              if (document.exitPointerLock) document.exitPointerLock();
              setIsInventoryOpen(true);
            }}
            onOpenDownloadApk={() => {
              if (document.exitPointerLock) document.exitPointerLock();
              setIsApkModalOpen(true);
            }}
            onExitMatch={handleExitMatch}
          />
          <HorizontalControls
            engine={engineRef.current}
            ammo={stats.ammo}
            maxAmmo={stats.maxAmmo}
            isReloading={stats.isReloading}
            invisibilityTimeLeft={stats.invisibilityTimeLeft}
            hasP2WPerks={unlockedP2wIds.size > 0}
            activeWeaponIndex={activeWeaponIndex}
            onSwitchWeapon={(idx) => {
              setActiveWeaponIndex(idx);
              if (engineRef.current && WEAPONS[idx]) {
                engineRef.current.switchWeapon(WEAPONS[idx]);
              }
            }}
          />
        </>
      )}

      {/* 4. REAL-TIME GLOBAL MULTIPLAYER CHAT */}
      <div className={`absolute z-20 ${gameState === 'playing' ? 'top-20 left-4' : 'bottom-4 left-4'}`}>
        <GlobalChat
          key={gameState}
          playerRank={stats.rank}
          isVIP={unlockedP2wIds.size > 0}
          defaultCollapsed={gameState === 'playing'}
        />
      </div>

      {/* 5. MODALS */}
      <StoreModal
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        unlockedP2wIds={unlockedP2wIds}
        onUnlockP2W={handleUnlockP2W}
        onAddCurrency={handleAddCurrency}
        currentCoins={coins}
        currentGems={gems}
      />

      <RouletteModal
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
        currentCoins={coins}
        currentGems={gems}
        onRewardWon={handleRewardWon}
        onDeductCurrency={handleDeductCurrency}
      />

      <RankModal
        isOpen={isRankOpen}
        onClose={() => setIsRankOpen(false)}
        currentElo={stats.elo}
        currentRank={stats.rank}
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        unlockedSkinIds={unlockedSkinIds}
        equippedSkinId={equippedSkinId}
        onEquipSkin={handleEquipSkin}
        onBuySkin={handleBuySkin}
        currentCoins={coins}
      />

      <DownloadApkModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />
    </div>
  );
}
