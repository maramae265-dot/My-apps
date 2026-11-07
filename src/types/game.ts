export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'celestial';

export type RankTier = 
  | 'Hierro'
  | 'Bronce'
  | 'Plata'
  | 'Oro'
  | 'Platino'
  | 'Diamante'
  | 'Maestro'
  | 'Gran Maestro'
  | 'Apex Predator';

export interface RankInfo {
  tier: RankTier;
  minElo: number;
  color: string;
  badgeIcon: string;
  description: string;
}

export interface WeaponDef {
  id: string;
  name: string;
  category: 'Rifle' | 'Plasma' | 'Sniper' | 'Celestial';
  damage: number;
  fireRate: number; // shots per sec
  magazineSize: number;
  reloadTime: number; // seconds
  recoil: number;
  spread: number;
  projectileSpeed: number;
  color: string;
  isP2W?: boolean;
}

export interface P2WItem {
  id: string;
  name: string;
  tier: number;
  priceUsd: number;
  description: string;
  perkSummary: string;
  badge: string;
  rarity: Rarity;
  effect: {
    damageMultiplier?: number;
    aimAssist?: boolean;
    lifestealPercent?: number;
    extraShield?: number;
    invisibilityAbility?: boolean;
    infiniteAmmo?: boolean;
    orbitalStrike?: boolean;
    oneHitKill?: boolean;
    speedBoost?: number;
  };
}

export interface SkinItem {
  id: string;
  name: string;
  category: 'outfit' | 'weapon';
  rarity: Rarity;
  priceCoins: number;
  previewColor: string;
  secondaryColor: string;
  description: string;
  glow?: boolean;
  unlocked?: boolean;
}

export interface RouletteItem {
  id: string;
  name: string;
  type: 'skin' | 'coins' | 'p2w' | 'gems';
  rarity: Rarity;
  value: string;
  color: string;
  rewardSkinId?: string;
  rewardCoins?: number;
  rewardP2wId?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  tag?: string;
  rank: RankTier;
  isVIP?: boolean;
  isDev?: boolean;
  text: string;
  channel: 'global' | 'match' | 'vip';
  timestamp: string;
}

export interface KillFeedEntry {
  id: string;
  killer: string;
  victim: string;
  weapon: string;
  isHeadshot: boolean;
  isP2W: boolean;
  time: number;
}

export interface PlayerScore {
  id: string;
  name: string;
  rank: RankTier;
  kills: number;
  deaths: number;
  score: number;
  ping: number;
  isP2W: boolean;
  isBot: boolean;
  activePerks: string[];
}
