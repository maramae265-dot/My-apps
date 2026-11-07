import * as THREE from 'three';
import { RankTier } from '../types/game';
import { ArenaCollider } from './arena';
import { soundEngine } from '../audio/soundEngine';

export interface BotSkinDef {
  name: string;
  primaryColor: number;
  secondaryColor: number;
  glowColor: number;
  metalness: number;
  roughness: number;
  hasCrown?: boolean;
  hasWings?: boolean;
  hasKatana?: boolean;
  skinName: string;
}

export const BOT_SKINS: BotSkinDef[] = [
  {
    name: 'Mecha Titán Dorado',
    primaryColor: 0xfacc15, // Pure gold
    secondaryColor: 0xca8a04,
    glowColor: 0xfef08a,
    metalness: 0.95,
    roughness: 0.15,
    hasCrown: true,
    skinName: 'Oro Legendario',
  },
  {
    name: 'Cyber Ninja Shadow',
    primaryColor: 0x09090b, // Obsidian black
    secondaryColor: 0x18181b,
    glowColor: 0xa855f7, // Neon purple
    metalness: 0.7,
    roughness: 0.3,
    hasKatana: true,
    skinName: 'Sombra Ninja',
  },
  {
    name: 'Reina Ciberpunk Neón',
    primaryColor: 0x06b6d4, // Cyan
    secondaryColor: 0xec4899, // Fuchsia pink
    glowColor: 0x22d3ee,
    metalness: 0.8,
    roughness: 0.25,
    skinName: 'Neón Cyberpunk',
  },
  {
    name: 'Espectro Infernal Carmesí',
    primaryColor: 0xdc2626, // Crimson red
    secondaryColor: 0x991b1b,
    glowColor: 0xf97316, // Orange fire
    metalness: 0.85,
    roughness: 0.2,
    skinName: 'Espectro Carmesí',
  },
  {
    name: 'Emperador Celestial P2W',
    primaryColor: 0xf8fafc, // Pure white
    secondaryColor: 0xfacc15, // Radiant gold
    glowColor: 0xffffff,
    metalness: 0.9,
    roughness: 0.1,
    hasCrown: true,
    hasWings: true,
    skinName: 'Celestial P2W',
  },
  {
    name: 'Soldado Ártico Camo',
    primaryColor: 0xe0f2fe, // Ice blue
    secondaryColor: 0x334155, // Slate
    glowColor: 0x38bdf8,
    metalness: 0.5,
    roughness: 0.4,
    skinName: 'Ártico Táctico',
  },
  {
    name: 'Viper Biohazard',
    primaryColor: 0x10b981, // Toxic green
    secondaryColor: 0x0f172a, // Dark carbon
    glowColor: 0x34d399,
    metalness: 0.75,
    roughness: 0.25,
    skinName: 'Biohazard Neón',
  },
];

export interface BotPlayer {
  id: string;
  name: string;
  skin: BotSkinDef;
  rank: RankTier;
  isP2W: boolean;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  group: THREE.Group;
  headMesh: THREE.Mesh;
  bodyMesh: THREE.Mesh;
  weaponMesh: THREE.Mesh;
  hpBarFill: THREE.Mesh;
  aimLaserMesh?: THREE.Line;
  nameCanvasTexture: THREE.CanvasTexture;
  velocity: THREE.Vector3;
  targetPos: THREE.Vector3;
  targetBotId: string | null;
  state: 'patrol' | 'chase' | 'attack' | 'dying' | 'dead';
  shootCooldown: number;
  reactionTimer: number; // Human-like reaction time
  deathTimer: number; // For smooth death falling animation
  respawnTimer: number;
  walkCycle: number;
  legsGroup: THREE.Group;
  armsGroup: THREE.Group;
  headHitbox: THREE.Box3;
  bodyHitbox: THREE.Box3;
  isHeadshot?: boolean;
}

const BOT_NAMES = [
  'ViperX_777',
  'S4mura1_EU',
  'Ghost_Recon99',
  'CyberValkyrie',
  'ApexPredator_NA',
  'K1llMachine',
  'NeonNinja',
];

const BOT_RANKS: RankTier[] = [
  'Oro',
  'Platino',
  'Diamante',
  'Maestro',
  'Gran Maestro',
  'Apex Predator',
  'Diamante',
];

export class BotManager {
  private bots: BotPlayer[] = [];
  private scene: THREE.Scene;
  private spawnPoints: THREE.Vector3[];
  private colliders: ArenaCollider[];

  constructor(scene: THREE.Scene, spawnPoints: THREE.Vector3[], colliders: ArenaCollider[]) {
    this.scene = scene;
    this.spawnPoints = spawnPoints;
    this.colliders = colliders;
    this.initBots();
  }

  private initBots() {
    for (let i = 0; i < 7; i++) {
      const name = BOT_NAMES[i % BOT_NAMES.length];
      const rank = BOT_RANKS[i % BOT_RANKS.length];
      const skin = BOT_SKINS[i % BOT_SKINS.length];
      const isP2W = i === 0 || i === 4; // Titan and Celestial have P2W crowns
      const bot = this.createBot(i, name, rank, skin, isP2W);
      this.bots.push(bot);
    }
  }

  private createNameSprite(name: string, rank: string, skinName: string, isP2W: boolean): { sprite: THREE.Sprite; texture: THREE.CanvasTexture } {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 72;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(10, 15, 30, 0.9)';
    ctx.roundRect(4, 4, 248, 64, 12);
    ctx.fill();

    ctx.strokeStyle = isP2W ? '#facc15' : '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${name} ${isP2W ? '👑' : ''}`, 128, 26);

    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillStyle = isP2W ? '#fde047' : '#38bdf8';
    ctx.fillText(`[${rank}] · ${skinName}`, 128, 46);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.4, 0.65, 1);
    sprite.position.y = 2.5;

    return { sprite, texture };
  }

  private createBot(index: number, name: string, rank: RankTier, skin: BotSkinDef, isP2W: boolean): BotPlayer {
    const group = new THREE.Group();
    const spawn = this.spawnPoints[(index + 1) % this.spawnPoints.length];
    group.position.copy(spawn);

    // 1. TORSO (Multi-layered custom skin armor)
    const torsoGeo = new THREE.BoxGeometry(0.72, 0.92, 0.46);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: skin.primaryColor,
      roughness: skin.roughness,
      metalness: skin.metalness,
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    group.add(torso);

    // Shoulder Pauldrons (Adds recognizable silhouette to skins)
    const pauldronGeo = new THREE.BoxGeometry(0.24, 0.22, 0.32);
    const pauldronMat = new THREE.MeshStandardMaterial({
      color: skin.secondaryColor,
      metalness: skin.metalness,
      roughness: skin.roughness,
    });
    const pauldronL = new THREE.Mesh(pauldronGeo, pauldronMat);
    pauldronL.position.set(-0.48, 1.7, 0);
    const pauldronR = new THREE.Mesh(pauldronGeo, pauldronMat);
    pauldronR.position.set(0.48, 1.7, 0);
    group.add(pauldronL, pauldronR);

    // 2. HEAD & GLOWING VISOR (Headshot zone)
    const headGeo = new THREE.BoxGeometry(0.38, 0.42, 0.38);
    const headMat = new THREE.MeshStandardMaterial({
      color: skin.secondaryColor,
      roughness: skin.roughness,
      metalness: skin.metalness,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.95;
    head.castShadow = true;
    group.add(head);

    // Glowing Visor
    const visorGeo = new THREE.BoxGeometry(0.32, 0.1, 0.1);
    const visorMat = new THREE.MeshBasicMaterial({
      color: skin.glowColor,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.02, 0.18);
    head.add(visor);

    // 3. BACK ACCENT (Katana, Wings, or Jetpack based on Skin)
    if (skin.hasKatana) {
      // Cyber Ninja Katana sheathed diagonally
      const katanaGeo = new THREE.BoxGeometry(0.06, 1.1, 0.06);
      const katanaMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        emissive: 0xa855f7,
        emissiveIntensity: 0.6,
      });
      const katana = new THREE.Mesh(katanaGeo, katanaMat);
      katana.position.set(0, 1.45, -0.28);
      katana.rotation.z = Math.PI / 4;
      group.add(katana);
    } else if (skin.hasWings) {
      // Celestial Holographic Wings
      const wingGeo = new THREE.BoxGeometry(1.6, 0.35, 0.04);
      const wingMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.7,
      });
      const wings = new THREE.Mesh(wingGeo, wingMat);
      wings.position.set(0, 1.55, -0.28);
      group.add(wings);
    } else {
      // Standard Sci-Fi Jetpack
      const jetpackGeo = new THREE.BoxGeometry(0.45, 0.5, 0.18);
      const jetpackMat = new THREE.MeshStandardMaterial({ color: skin.secondaryColor, roughness: 0.5 });
      const jetpack = new THREE.Mesh(jetpackGeo, jetpackMat);
      jetpack.position.set(0, 1.4, -0.3);
      group.add(jetpack);
    }

    // 4. LEGS & ARMS
    const legsGroup = new THREE.Group();
    const legGeo = new THREE.BoxGeometry(0.24, 0.8, 0.26);
    const legMat = new THREE.MeshStandardMaterial({ color: skin.secondaryColor, roughness: 0.5 });
    const legL = new THREE.Mesh(legGeo, legMat);
    legL.position.set(-0.2, 0.4, 0);
    const legR = new THREE.Mesh(legGeo, legMat);
    legR.position.set(0.2, 0.4, 0);
    legsGroup.add(legL, legR);
    group.add(legsGroup);

    const armsGroup = new THREE.Group();
    const armGeo = new THREE.BoxGeometry(0.18, 0.75, 0.2);
    const armL = new THREE.Mesh(armGeo, torsoMat);
    armL.position.set(-0.46, 1.35, 0);
    const armR = new THREE.Mesh(armGeo, torsoMat);
    armR.position.set(0.46, 1.35, 0.2);
    armR.rotation.x = -Math.PI / 4;
    armsGroup.add(armL, armR);
    group.add(armsGroup);

    // 5. BOT WEAPON
    const gunGeo = new THREE.BoxGeometry(0.1, 0.14, 0.55);
    const gunMat = new THREE.MeshStandardMaterial({
      color: isP2W ? 0xfacc15 : 0x334155,
      metalness: 0.8,
    });
    const gunMesh = new THREE.Mesh(gunGeo, gunMat);
    gunMesh.position.set(0.46, 1.3, 0.4);
    group.add(gunMesh);

    // 6. HEALTH BAR
    const hpBgGeo = new THREE.PlaneGeometry(1.2, 0.12);
    const hpBgMat = new THREE.MeshBasicMaterial({ color: 0x09090b, side: THREE.DoubleSide });
    const hpBg = new THREE.Mesh(hpBgGeo, hpBgMat);
    hpBg.position.y = 2.2;
    group.add(hpBg);

    const hpFillGeo = new THREE.PlaneGeometry(1.16, 0.08);
    const hpFillMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
    const hpFill = new THREE.Mesh(hpFillGeo, hpFillMat);
    hpFill.position.set(0, 2.2, 0.01);
    group.add(hpFill);

    // 7. NAME & RANK SPRITE
    const { sprite, texture } = this.createNameSprite(name, rank, skin.skinName, isP2W);
    group.add(sprite);

    // Crown if P2W / Mecha Titán / Celestial
    if (skin.hasCrown || isP2W) {
      const crownGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.14, 5);
      const crownMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        emissive: 0xeab308,
        emissiveIntensity: 0.6,
        metalness: 0.9,
      });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.set(0, 2.3, 0);
      group.add(crown);
    }

    this.scene.add(group);

    return {
      id: `bot_${index}_${Math.random()}`,
      name,
      skin,
      rank,
      isP2W,
      health: 100,
      maxHealth: 100,
      shield: isP2W ? 150 : 80,
      maxShield: isP2W ? 150 : 80,
      group,
      headMesh: head,
      bodyMesh: torso,
      weaponMesh: gunMesh,
      hpBarFill: hpFill,
      nameCanvasTexture: texture,
      velocity: new THREE.Vector3(),
      targetPos: new THREE.Vector3(),
      targetBotId: null,
      state: 'patrol',
      shootCooldown: 2.0 + Math.random() * 2, // Less aggressive: 2-4s cooldown!
      reactionTimer: 0,
      deathTimer: 0,
      respawnTimer: 0,
      walkCycle: Math.random() * 10,
      legsGroup,
      armsGroup,
      headHitbox: new THREE.Box3(),
      bodyHitbox: new THREE.Box3(),
    };
  }

  public update(
    dt: number,
    playerPos: THREE.Vector3,
    onBotKilled: (bot: BotPlayer, isHeadshot: boolean) => void,
    onBotShoots: (origin: THREE.Vector3, dir: THREE.Vector3, isP2W: boolean) => void
  ) {
    const _botPos = new THREE.Vector3();

    this.bots.forEach((bot) => {
      // 1. DEATH FALLING ANIMATION (Animación de Morirse)
      if (bot.state === 'dying') {
        bot.deathTimer += dt;
        // Dramatic backward fall and limp limbs
        bot.group.rotation.x = THREE.MathUtils.damp(bot.group.rotation.x, -Math.PI / 2.1, 7, dt);
        bot.group.position.y = THREE.MathUtils.damp(bot.group.position.y, 0.25, 7, dt);
        bot.armsGroup.children[0].rotation.z = THREE.MathUtils.damp(bot.armsGroup.children[0].rotation.z, -0.8, 5, dt);
        bot.armsGroup.children[1].rotation.z = THREE.MathUtils.damp(bot.armsGroup.children[1].rotation.z, 0.8, 5, dt);

        if (bot.deathTimer >= 1.6) {
          bot.state = 'dead';
          bot.group.visible = false;
          bot.respawnTimer = 3.5;
        }
        return;
      }

      if (bot.state === 'dead') {
        bot.respawnTimer -= dt;
        if (bot.respawnTimer <= 0) {
          this.respawnBot(bot);
        }
        return;
      }

      bot.group.getWorldPosition(_botPos);

      // Hitboxes for player shots
      bot.headHitbox.setFromObject(bot.headMesh);
      bot.bodyHitbox.setFromObject(bot.bodyMesh);

      // 2. TARGET SELECTION (Player OR another nearby Bot!)
      const distToPlayer = _botPos.distanceTo(playerPos);
      let targetPos = playerPos;
      let targetIsPlayer = true;

      // Find closest alive other bot
      let closestBot: BotPlayer | null = null;
      let closestBotDist = Infinity;
      this.bots.forEach((other) => {
        if (other.id !== bot.id && other.state !== 'dying' && other.state !== 'dead') {
          const d = _botPos.distanceTo(other.group.position);
          if (d < closestBotDist) {
            closestBotDist = d;
            closestBot = other;
          }
        }
      });

      // If another bot is closer than the player, fight that bot! (Realistic multiplayer FFA feel)
      if (closestBot && closestBotDist < distToPlayer && closestBotDist < 25) {
        targetPos = (closestBot as BotPlayer).group.position;
        targetIsPlayer = false;
      }

      const activeDist = targetPos.distanceTo(_botPos);

      // 3. COMBAT & REACTION LOGIC (Less aggressive, fair reaction time)
      if (activeDist < 35) {
        // Face target smoothly
        const lookTarget = targetPos.clone();
        lookTarget.y = _botPos.y;
        bot.group.lookAt(lookTarget);

        bot.reactionTimer += dt;

        // Shoot only after human reaction delay (0.75s) and cooldown
        bot.shootCooldown -= dt;
        if (bot.reactionTimer > 0.75 && bot.shootCooldown <= 0) {
          bot.shootCooldown = 2.4 + Math.random() * 1.5; // Balanced: Shoots every 2.4 to 3.9 seconds
          bot.reactionTimer = 0;

          const shootOrigin = _botPos.clone().add(new THREE.Vector3(0, 1.4, 0));
          const shootDir = targetPos.clone().sub(shootOrigin).normalize();

          // Balanced bot spread (fair accuracy so player can dodge)
          const spreadFactor = bot.isP2W ? 0.08 : 0.16;
          shootDir.x += (Math.random() - 0.5) * spreadFactor;
          shootDir.y += (Math.random() - 0.5) * spreadFactor;
          shootDir.z += (Math.random() - 0.5) * spreadFactor;
          shootDir.normalize();

          if (targetIsPlayer) {
            onBotShoots(shootOrigin, shootDir, bot.isP2W);
          } else if (closestBot) {
            // Bot shoots other bot
            this.damageBot((closestBot as BotPlayer).id, bot.isP2W ? 28 : 18, false, () => {});
          }
        }

        // Tactical Movement: keep moderate distance, don't rush aggressively
        if (activeDist > 20) {
          const moveDir = targetPos.clone().sub(_botPos).normalize();
          bot.group.position.x += moveDir.x * dt * 2.8;
          bot.group.position.z += moveDir.z * dt * 2.8;
        } else if (activeDist < 9) {
          // Back up gently
          const retreatDir = _botPos.clone().sub(targetPos).normalize();
          bot.group.position.x += retreatDir.x * dt * 2.2;
          bot.group.position.z += retreatDir.z * dt * 2.2;
        }
      } else {
        // Patrol Arena Points
        bot.reactionTimer = 0;
        bot.walkCycle += dt * 2;
        if (!bot.targetPos.lengthSq() || _botPos.distanceTo(bot.targetPos) < 3) {
          const randomSpawn = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
          bot.targetPos.copy(randomSpawn);
        }
        const dir = bot.targetPos.clone().sub(_botPos).normalize();
        bot.group.position.x += dir.x * dt * 2.6;
        bot.group.position.z += dir.z * dt * 2.6;
        const lookTarget = bot.targetPos.clone();
        lookTarget.y = _botPos.y;
        bot.group.lookAt(lookTarget);
      }

      // Animate walking limbs
      bot.walkCycle += dt * 6;
      bot.legsGroup.children[0].rotation.x = Math.sin(bot.walkCycle) * 0.4;
      bot.legsGroup.children[1].rotation.x = -Math.sin(bot.walkCycle) * 0.4;

      // Arena boundary clamp
      bot.group.position.x = THREE.MathUtils.clamp(bot.group.position.x, -68, 68);
      bot.group.position.z = THREE.MathUtils.clamp(bot.group.position.z, -68, 68);
      if (bot.group.position.y < 0) bot.group.position.y = 0;

      // Update HP bar visual scale
      const totalMax = bot.maxHealth + bot.maxShield;
      const totalCurrent = Math.max(0, bot.health + bot.shield);
      const ratio = Math.max(0.01, totalCurrent / totalMax);
      bot.hpBarFill.scale.set(ratio, 1, 1);
      (bot.hpBarFill.material as THREE.MeshBasicMaterial).color.setHex(
        ratio > 0.5 ? 0x10b981 : ratio > 0.25 ? 0xf59e0b : 0xef4444
      );
    });
  }

  public damageBot(
    botId: string,
    damage: number,
    isHeadshot: boolean,
    onKilled: (bot: BotPlayer, isHeadshot: boolean) => void
  ): { killed: boolean; damageDealt: number } {
    const bot = this.bots.find((b) => b.id === botId);
    if (!bot || bot.state === 'dying' || bot.state === 'dead') {
      return { killed: false, damageDealt: 0 };
    }

    const actualDamage = isHeadshot ? damage * 2.2 : damage;

    // Absorb with shield first
    if (bot.shield > 0) {
      if (bot.shield >= actualDamage) {
        bot.shield -= actualDamage;
      } else {
        const overflow = actualDamage - bot.shield;
        bot.shield = 0;
        bot.health -= overflow;
      }
    } else {
      bot.health -= actualDamage;
    }

    // Hit flash
    const prevColor = (bot.bodyMesh.material as THREE.MeshStandardMaterial).color.getHex();
    (bot.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(0xffffff);
    setTimeout(() => {
      if (bot.bodyMesh.material) {
        (bot.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(prevColor);
      }
    }, 60);

    // Trigger Dramatic Death Animation!
    if (bot.health <= 0) {
      bot.health = 0;
      bot.state = 'dying';
      bot.deathTimer = 0;
      onKilled(bot, isHeadshot);
      return { killed: true, damageDealt: actualDamage };
    }

    return { killed: false, damageDealt: actualDamage };
  }

  private respawnBot(bot: BotPlayer) {
    bot.health = bot.maxHealth;
    bot.shield = bot.maxShield;
    bot.state = 'patrol';
    bot.group.rotation.set(0, 0, 0);
    bot.armsGroup.children[0].rotation.set(0, 0, 0);
    bot.armsGroup.children[1].rotation.set(-Math.PI / 4, 0, 0);

    const spawn = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
    bot.group.position.copy(spawn);
    bot.group.position.y = 0;
    bot.group.visible = true;
  }

  public getBots(): BotPlayer[] {
    return this.bots;
  }

  public dispose() {
    this.bots.forEach((bot) => {
      bot.nameCanvasTexture.dispose();
      this.scene.remove(bot.group);
    });
    this.bots = [];
  }
}
