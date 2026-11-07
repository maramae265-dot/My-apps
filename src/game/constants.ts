import { WeaponDef, P2WItem, SkinItem, RouletteItem, RankInfo, RankTier } from '../types/game';

export const PAYPAL_RECEIVER_EMAIL = 'vabe950@gmail.com';

export const RANKS: Record<RankTier, RankInfo> = {
  Hierro: {
    tier: 'Hierro',
    minElo: 0,
    color: '#94a3b8',
    badgeIcon: '🛡️',
    description: 'Recluta de la Arena. Aprende los fundamentos del combate.',
  },
  Bronce: {
    tier: 'Bronce',
    minElo: 500,
    color: '#cd7f32',
    badgeIcon: '🥉',
    description: 'Combatiente iniciado. Desarrollando reflejos cibernéticos.',
  },
  Plata: {
    tier: 'Plata',
    minElo: 1000,
    color: '#cbd5e1',
    badgeIcon: '🥈',
    description: 'Tirador calificado. Precisión en combate medio.',
  },
  Oro: {
    tier: 'Oro',
    minElo: 1500,
    color: '#eab308',
    badgeIcon: '🥇',
    description: 'Veterano de la liga. Estrategia y puntería letal.',
  },
  Platino: {
    tier: 'Platino',
    minElo: 2100,
    color: '#06b6d4',
    badgeIcon: '💎',
    description: 'Élite táctica. Domina el movimiento y las coberturas.',
  },
  Diamante: {
    tier: 'Diamante',
    minElo: 2800,
    color: '#3b82f6',
    badgeIcon: '💠',
    description: 'Maestro de la arena. Reflejos a nivel de torneo.',
  },
  Maestro: {
    tier: 'Maestro',
    minElo: 3500,
    color: '#a855f7',
    badgeIcon: '🔮',
    description: 'Top 1% mundial. Letalidad implacable.',
  },
  'Gran Maestro': {
    tier: 'Gran Maestro',
    minElo: 4300,
    color: '#ec4899',
    badgeIcon: '👑',
    description: 'Leyenda viviente de los servidores Apex.',
  },
  'Apex Predator': {
    tier: 'Apex Predator',
    minElo: 5200,
    color: '#ef4444',
    badgeIcon: '🔥',
    description: 'Rango Máximo Absoluto. Temido por todos en la galaxia.',
  },
};

export const WEAPONS: WeaponDef[] = [
  {
    id: 'rifle_plasma',
    name: 'Viper Rifle Plasma',
    category: 'Rifle',
    damage: 24,
    fireRate: 9, // 9 shots/sec
    magazineSize: 30,
    reloadTime: 1.6,
    recoil: 0.015,
    spread: 0.012,
    projectileSpeed: 110,
    color: '#06b6d4',
  },
  {
    id: 'heavy_plasma',
    name: 'Cañón Iónico Devastador',
    category: 'Plasma',
    damage: 55,
    fireRate: 3.5,
    magazineSize: 15,
    reloadTime: 2.2,
    recoil: 0.035,
    spread: 0.006,
    projectileSpeed: 90,
    color: '#a855f7',
  },
  {
    id: 'celestial_railgun',
    name: '⚡ Railgun Celestial P2W',
    category: 'Celestial',
    damage: 250, // Instant one-shot
    fireRate: 2.2,
    magazineSize: 50,
    reloadTime: 1.0,
    recoil: 0.02,
    spread: 0.001,
    projectileSpeed: 250,
    color: '#facc15',
    isP2W: true,
  },
];

export const P2W_ITEMS: P2WItem[] = [
  {
    id: 'p2w_aim_chip',
    name: 'Microchip Aim-Assist Cuántico',
    tier: 1,
    priceUsd: 0.99,
    description: 'Algoritmo cibernético que asiste sutilmente la retícula magnéticamente hacia las cabezas enemigas.',
    perkSummary: '+Auto-apuntado magnético suave',
    badge: '🎯 AIM ASSIST',
    rarity: 'rare',
    effect: {
      aimAssist: true,
    },
  },
  {
    id: 'p2w_vampiric',
    name: 'Balas Vampíricas Nanotech',
    tier: 2,
    priceUsd: 2.99,
    description: 'Cada disparo que conecta drena la energía vital del enemigo restaurando tu salud inmediatamente.',
    perkSummary: '+35% Robo de Vida (Lifesteal)',
    badge: '🩸 ROBO DE VIDA',
    rarity: 'epic',
    effect: {
      lifestealPercent: 35,
    },
  },
  {
    id: 'p2w_titan_shield',
    name: 'Escudo Titán +300 HP',
    tier: 3,
    priceUsd: 4.99,
    description: 'Barrera de grafeno electromagnética de grado militar que absorbe daño devastador antes de tocar tu salud.',
    perkSummary: '+300 Puntos de Escudo Máximo',
    badge: '🛡️ ESCUDO TITÁN',
    rarity: 'epic',
    effect: {
      extraShield: 300,
    },
  },
  {
    id: 'p2w_camo_stealth',
    name: 'Capa de Infiltración Óptica',
    tier: 4,
    priceUsd: 9.99,
    description: 'Tecnología de camuflaje activo. Presiona la tecla [E] para volverte invisible durante 8 segundos en combate.',
    perkSummary: 'Habilidad [E]: Invisibilidad táctica 8s',
    badge: '👻 INVISIBILIDAD',
    rarity: 'legendary',
    effect: {
      invisibilityAbility: true,
    },
  },
  {
    id: 'p2w_triple_damage',
    name: 'Munición Nuclear 3X Daño',
    tier: 5,
    priceUsd: 19.99,
    description: 'Núcleos de munición enriquecida con uranio que triplican el impacto de cada proyectil y generan ondas doradas.',
    perkSummary: 'x3 Multiplicador de Daño Total',
    badge: '💥 DAÑO X3',
    rarity: 'legendary',
    effect: {
      damageMultiplier: 3.0,
    },
  },
  {
    id: 'p2w_orbital_strike',
    name: 'Llamada Táctica Orbital Airstrike',
    tier: 6,
    priceUsd: 49.99,
    description: 'Enlaza con el satélite bélico orbital de la Federación para desatar lluvia de rayos solares a los enemigos.',
    perkSummary: 'Balas explosivas + Rayo orbital pasivo',
    badge: '🛰️ ATAQUE ORBITAL',
    rarity: 'mythic',
    effect: {
      orbitalStrike: true,
      damageMultiplier: 2.0,
      extraShield: 200,
    },
  },
  {
    id: 'p2w_god_emperor',
    name: 'PAQUETE DIOS EMPERADOR CELESTIAL',
    tier: 7,
    priceUsd: 99.99,
    description: 'El paquete Pay-to-Win supremo definitivo: Desbloquea el Railgun Celestial de 1 solo tiro mortal, Corona Dorada 3D flotante, Escudo Divino de 1000 HP, munición infinita, y título [REY SUPREMO P2W].',
    perkSummary: 'Railgun Un-Tiro + 1000 Escudo + Corona 3D + Balas Infinitas',
    badge: '👑 DIOS CELESTIAL P2W',
    rarity: 'celestial',
    effect: {
      oneHitKill: true,
      infiniteAmmo: true,
      extraShield: 1000,
      damageMultiplier: 5.0,
      aimAssist: true,
      lifestealPercent: 50,
      speedBoost: 1.35,
    },
  },
];

export const CURRENCY_PACKS = [
  { id: 'coins_small', name: 'Bolsa de 1,500 Créditos Apex', priceUsd: 1.99, coins: 1500, gems: 0, bonus: '' },
  { id: 'coins_medium', name: 'Cofre de 5,000 Créditos Apex', priceUsd: 4.99, coins: 5000, gems: 5, bonus: '+5 Gemas' },
  { id: 'coins_large', name: 'Arsenal de 15,000 Créditos + 25 Gemas', priceUsd: 12.99, coins: 15000, gems: 25, bonus: '¡Más Popular! +25 Gemas' },
  { id: 'coins_whale', name: 'Bóveda Diamante 50,000 Créditos + 100 Gemas', priceUsd: 39.99, coins: 50000, gems: 100, bonus: '¡MEJOR VALOR! +100 Gemas' },
];

export const SKINS_CATALOG: SkinItem[] = [
  {
    id: 'skin_cyber_ninja',
    name: 'Cyber Ninja Shadow',
    category: 'outfit',
    rarity: 'epic',
    priceCoins: 2500,
    previewColor: '#1e1b4b',
    secondaryColor: '#8b5cf6',
    description: 'Traje de nanotubos de carbono con filamentos de fibra óptica morada reflectante.',
  },
  {
    id: 'skin_mecha_titan',
    name: 'Mecha Titán Dorado',
    category: 'outfit',
    rarity: 'legendary',
    priceCoins: 6000,
    previewColor: '#eab308',
    secondaryColor: '#fef08a',
    description: 'Armadura pesada de aleación de titanio bañada en oro puro pulido PBR.',
    glow: true,
  },
  {
    id: 'skin_neon_queen',
    name: 'Reina Ciberpunk Neón',
    category: 'outfit',
    rarity: 'epic',
    priceCoins: 3500,
    previewColor: '#ec4899',
    secondaryColor: '#06b6d4',
    description: 'Exoesqueleto estilizado con reactores de pulso en cian y fucsia vibrante.',
  },
  {
    id: 'skin_crimson_spectre',
    name: 'Espectro Infernal Carmesí',
    category: 'outfit',
    rarity: 'mythic',
    priceCoins: 12000,
    previewColor: '#dc2626',
    secondaryColor: '#f97316',
    description: 'Traje ceremonial de plasma ardiente con emisiones de energía térmica continua.',
    glow: true,
  },
  {
    id: 'skin_celestial_god',
    name: 'Emperador Celestial P2W',
    category: 'outfit',
    rarity: 'celestial',
    priceCoins: 30000,
    previewColor: '#fbbf24',
    secondaryColor: '#ffffff',
    description: 'Túnica holográfica divina con alas de luz estelar y aura dorada que intimida en la arena.',
    glow: true,
  },
  {
    id: 'weapon_hyper_beast',
    name: 'Viper Rifle "Dragón Eléctrico"',
    category: 'weapon',
    rarity: 'legendary',
    priceCoins: 4500,
    previewColor: '#10b981',
    secondaryColor: '#06b6d4',
    description: 'Acabado bioluminiscente con escamas reactivas a los disparos.',
    glow: true,
  },
  {
    id: 'weapon_royal_gold',
    name: 'Cañón Iónico "Oro Imperial"',
    category: 'weapon',
    rarity: 'mythic',
    priceCoins: 9000,
    previewColor: '#facc15',
    secondaryColor: '#18181b',
    description: 'Grabados imperiales en oro con cristales de rubí canalizadores.',
    glow: true,
  },
];

export const ROULETTE_REWARDS: RouletteItem[] = [
  { id: 'r1', name: '500 Créditos Apex', type: 'coins', rarity: 'common', value: '+500 Créditos', color: '#94a3b8', rewardCoins: 500 },
  { id: 'r2', name: '1,200 Créditos Apex', type: 'coins', rarity: 'rare', value: '+1,200 Créditos', color: '#3b82f6', rewardCoins: 1200 },
  { id: 'r3', name: 'Microchip Aim-Assist', type: 'p2w', rarity: 'epic', value: 'P2W Perk', color: '#a855f7', rewardP2wId: 'p2w_aim_chip' },
  { id: 'r4', name: '3,000 Créditos Apex', type: 'coins', rarity: 'epic', value: '+3,000 Créditos', color: '#a855f7', rewardCoins: 3000 },
  { id: 'r5', name: 'Skin Mecha Titán Dorado', type: 'skin', rarity: 'legendary', value: 'Skin Legendaria', color: '#eab308', rewardSkinId: 'skin_mecha_titan' },
  { id: 'r6', name: 'Balas Vampíricas Nanotech', type: 'p2w', rarity: 'epic', value: 'P2W Perk', color: '#a855f7', rewardP2wId: 'p2w_vampiric' },
  { id: 'r7', name: '10 Gemas de Uranio', type: 'gems', rarity: 'rare', value: '+10 Gemas', color: '#10b981' },
  { id: 'r8', name: 'Espectro Carmesí Mítico', type: 'skin', rarity: 'mythic', value: 'Skin Mítica', color: '#ec4899', rewardSkinId: 'skin_crimson_spectre' },
  { id: 'r9', name: 'PAQUETE DIOS EMPERADOR', type: 'p2w', rarity: 'celestial', value: 'JACKPOT CELESTIAL', color: '#f59e0b', rewardP2wId: 'p2w_god_emperor' },
  { id: 'r10', name: 'Munición Nuclear 3X', type: 'p2w', rarity: 'legendary', value: 'P2W Perk', color: '#f97316', rewardP2wId: 'p2w_triple_damage' },
  { id: 'r11', name: '800 Créditos Apex', type: 'coins', rarity: 'common', value: '+800 Créditos', color: '#94a3b8', rewardCoins: 800 },
  { id: 'r12', name: 'Viper Dragón Eléctrico', type: 'skin', rarity: 'legendary', value: 'Skin Legendaria', color: '#06b6d4', rewardSkinId: 'weapon_hyper_beast' },
];

export const INITIAL_SIMULATED_MESSAGES = [
  {
    id: 'm1',
    sender: 'S4mura1_EU',
    tag: 'PRO',
    rank: 'Gran Maestro' as RankTier,
    text: '¿Alguien para ranked Diamante+? Vamos por el Predator hoy 🔥',
    channel: 'global' as const,
    timestamp: '18:14',
  },
  {
    id: 'm2',
    sender: 'ViperX_777',
    tag: 'VIP',
    rank: 'Maestro' as RankTier,
    isVIP: true,
    text: 'Acabo de probar el Microchip Aim Assist de $0.99... es una auténtica locura headshots a todos jajaja',
    channel: 'global' as const,
    timestamp: '18:15',
  },
  {
    id: 'm3',
    sender: 'ElReyDelP2W',
    tag: 'P2W GOD',
    rank: 'Apex Predator' as RankTier,
    isVIP: true,
    text: 'Compré el Paquete Dios Emperador Celestial en PayPal y con el Railgun barro a todo el lobby de un tiro 👑',
    channel: 'vip' as const,
    timestamp: '18:16',
  },
  {
    id: 'm4',
    sender: 'Ghost_Recon99',
    tag: '',
    rank: 'Platino' as RankTier,
    text: 'Los servidores van a 120 FPS sin nada de lag, qué fluidez',
    channel: 'global' as const,
    timestamp: '18:17',
  },
  {
    id: 'm5',
    sender: 'CyberValkyrie',
    tag: 'LUCK',
    rank: 'Diamante' as RankTier,
    text: '¡¡ME SALIÓ LA SKIN ESPECTRO CARMESÍ EN LA RULETA MODERNA!! 😱🎰',
    channel: 'global' as const,
    timestamp: '18:18',
  },
];

/**
 * Generate official PayPal URL targeting user email
 */
export function buildPayPalUrl(itemName: string, amountUsd: number): string {
  const email = encodeURIComponent(PAYPAL_RECEIVER_EMAIL);
  const name = encodeURIComponent(`CYBER APEX - ${itemName}`);
  const amount = amountUsd.toFixed(2);
  // Standard PayPal Webscr direct checkout
  return `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${email}&item_name=${name}&amount=${amount}&currency_code=USD&no_shipping=1&no_note=1`;
}
