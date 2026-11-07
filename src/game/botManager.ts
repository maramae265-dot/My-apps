import * as THREE from 'three';
import { RankTier } from '../types/game';
import { ArenaCollider } from './arena';
import { soundEngine } from '../audio/soundEngine';

export interface BotPlayer {
  id: string;
  name: string;
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
  nameCanvasTexture: THREE.CanvasTexture;
  velocity: THREE.Vector3;
  targetPos: THREE.Vector3;
  state: 'patrol' | 'chase' | 'attack' | 'dead';
  shootCooldown: number;
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
  'Shadow_Sniper',
];

const BOT_RANKS: RankTier[] = [
  'Oro',
  'Platino',
  'Diamante',
  'Maestro',
  'Gran Maestro',
  'Apex Predator',
  'Oro',
  'Platino',
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
      const isP2W = i === 0 || i === 3; // Give a couple bots P2W glow for dynamic multiplayer atmosphere
      const bot = this.createBot(i, name, rank, isP2W);
      this.bots.push(bot);
    }
  }

  private createNameSprite(name: string, rank: string, isP2W: boolean): { sprite: THREE.Sprite; texture: THREE.CanvasTexture } {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect(4, 4, 248, 56, 10);
    ctx.fill();

    ctx.strokeStyle = isP2W ? '#facc15' : '#06b6d4';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${name} ${isP2W ? '👑' : ''}`, 128, 28);

    ctx.font = '14px system-ui, sans-serif';
    ctx.fillStyle = isP2W ? '#fde047' : '#94a3b8';
    ctx.fillText(`[${rank}]`, 128, 48);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.4, 0.6, 1);
    sprite.position.y = 2.4;

    return { sprite, texture };
  }

  private createBot(index: number, name: string, rank: RankTier, isP2W: boolean): BotPlayer {
    const group = new THREE.Group();
    const spawn = this.spawnPoints[(index + 1) % this.spawnPoints.length];
    group.position.copy(spawn);

    // 1. TORSO (Multi-layered chest armor)
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.45);
    const armorColor = isP2W ? 0xfacc15 : 0x1e293b;
    const torsoMat = new THREE.MeshStandardMaterial({
      color: armorColor,
      roughness: 0.3,
      metalness: isP2W ? 0.9 : 0.6,
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    group.add(torso);

    // 2. HEAD & GLOWING VISOR (Headshot zone)
    const headGeo = new THREE.BoxGeometry(0.38, 0.42, 0.38);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.7,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.95;
    head.castShadow = true;
    group.add(head);

    // Visor eye bar
    const visorGeo = new THREE.BoxGeometry(0.32, 0.1, 0.1);
    const visorMat = new THREE.MeshBasicMaterial({
      color: isP2W ? 0xfef08a : 0x06b6d4,
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.02, 0.18);
    head.add(visor);

    // 3. BACKPACK THRUSTER
    const jetpackGeo = new THREE.BoxGeometry(0.45, 0.5, 0.18);
    const jetpackMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.5 });
    const jetpack = new THREE.Mesh(jetpackGeo, jetpackMat);
    jetpack.position.set(0, 1.4, -0.3);
    group.add(jetpack);

    // 4. LEGS & ARMS
    const legsGroup = new THREE.Group();
    const legGeo = new THREE.BoxGeometry(0.24, 0.8, 0.26);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
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
    armR.rotation.x = -Math.PI / 4; // Holding weapon
    armsGroup.add(armL, armR);
    group.add(armsGroup);

    // 5. BOT WEAPON IN HAND
    const gunGeo = new THREE.BoxGeometry(0.1, 0.14, 0.55);
    const gunMat = new THREE.MeshStandardMaterial({
      color: isP2W ? 0xfacc15 : 0x334155,
      metalness: 0.8,
    });
    const gunMesh = new THREE.Mesh(gunGeo, gunMat);
    gunMesh.position.set(0.46, 1.3, 0.4);
    group.add(gunMesh);

    // 6. HEALTH BAR (3D overhead billboard)
    const hpBgGeo = new THREE.PlaneGeometry(1.2, 0.12);
    const hpBgMat = new THREE.MeshBasicMaterial({ color: 0x09090b, side: THREE.DoubleSide });
    const hpBg = new THREE.Mesh(hpBgGeo, hpBgMat);
    hpBg.position.y = 2.15;
    group.add(hpBg);

    const hpFillGeo = new THREE.PlaneGeometry(1.16, 0.08);
    const hpFillMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
    const hpFill = new THREE.Mesh(hpFillGeo, hpFillMat);
    hpFill.position.set(0, 2.15, 0.01);
    group.add(hpFill);

    // 7. NAME & RANK SPRITE
    const { sprite, texture } = this.createNameSprite(name, rank, isP2W);
    group.add(sprite);

    // If P2W: Add floating crown
    if (isP2W) {
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
      rank,
      isP2W,
      health: 100,
      maxHealth: 100,
      shield: isP2W ? 250 : 100,
      maxShield: isP2W ? 250 : 100,
      group,
      headMesh: head,
      bodyMesh: torso,
      weaponMesh: gunMesh,
      hpBarFill: hpFill,
      nameCanvasTexture: texture,
      velocity: new THREE.Vector3(),
      targetPos: new THREE.Vector3(),
      state: 'patrol',
      shootCooldown: Math.random() * 2,
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
      if (bot.state === 'dead') {
        bot.respawnTimer -= dt;
        if (bot.respawnTimer <= 0) {
          this.respawnBot(bot);
        }
        return;
      }

      bot.group.getWorldPosition(_botPos);

      // Update hitboxes for player bullet raycasts
      bot.headHitbox.setFromObject(bot.headMesh);
      bot.bodyHitbox.setFromObject(bot.bodyMesh);

      // AI Decision Logic
      const distToPlayer = _botPos.distanceTo(playerPos);

      if (distToPlayer < 40) {
        // Face player
        const lookTarget = playerPos.clone();
        lookTarget.y = _botPos.y;
        bot.group.lookAt(lookTarget);

        // Combat shooting
        bot.shootCooldown -= dt;
        if (bot.shootCooldown <= 0) {
          bot.shootCooldown = bot.isP2W ? 0.75 : 1.35; // P2W bots shoot faster

          const shootOrigin = _botPos.clone().add(new THREE.Vector3(0, 1.4, 0));
          const shootDir = playerPos.clone().sub(shootOrigin).normalize();
          // Add slight bot spread
          shootDir.x += (Math.random() - 0.5) * (bot.isP2W ? 0.04 : 0.12);
          shootDir.y += (Math.random() - 0.5) * (bot.isP2W ? 0.04 : 0.12);
          shootDir.z += (Math.random() - 0.5) * (bot.isP2W ? 0.04 : 0.12);
          shootDir.normalize();

          onBotShoots(shootOrigin, shootDir, bot.isP2W);
        }

        // Movement: Strafe or approach
        if (distToPlayer > 18) {
          const moveDir = playerPos.clone().sub(_botPos).normalize();
          bot.group.position.x += moveDir.x * dt * 4.5;
          bot.group.position.z += moveDir.z * dt * 4.5;
        } else if (distToPlayer < 8) {
          // Back up slightly
          const retreatDir = _botPos.clone().sub(playerPos).normalize();
          bot.group.position.x += retreatDir.x * dt * 3.5;
          bot.group.position.z += retreatDir.z * dt * 3.5;
        }
      } else {
        // Patrol movement
        bot.walkCycle += dt * 2;
        if (!bot.targetPos.lengthSq() || _botPos.distanceTo(bot.targetPos) < 2) {
          const randomSpawn = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
          bot.targetPos.copy(randomSpawn);
        }
        const dir = bot.targetPos.clone().sub(_botPos).normalize();
        bot.group.position.x += dir.x * dt * 3;
        bot.group.position.z += dir.z * dt * 3;
        const lookTarget = bot.targetPos.clone();
        lookTarget.y = _botPos.y;
        bot.group.lookAt(lookTarget);
      }

      // Animate walking limbs
      bot.walkCycle += dt * 7;
      bot.legsGroup.children[0].rotation.x = Math.sin(bot.walkCycle) * 0.45;
      bot.legsGroup.children[1].rotation.x = -Math.sin(bot.walkCycle) * 0.45;

      // Keep bot on ground / arena bounds
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
    if (!bot || bot.state === 'dead') return { killed: false, damageDealt: 0 };

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

    // Hit flash on meshes
    const prevColor = (bot.bodyMesh.material as THREE.MeshStandardMaterial).color.getHex();
    (bot.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(0xffffff);
    setTimeout(() => {
      if (bot.bodyMesh.material) {
        (bot.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(prevColor);
      }
    }, 60);

    if (bot.health <= 0) {
      bot.health = 0;
      bot.state = 'dead';
      bot.respawnTimer = 3.5;
      bot.group.visible = false;
      onKilled(bot, isHeadshot);
      return { killed: true, damageDealt: actualDamage };
    }

    return { killed: false, damageDealt: actualDamage };
  }

  private respawnBot(bot: BotPlayer) {
    bot.health = bot.maxHealth;
    bot.shield = bot.maxShield;
    bot.state = 'patrol';
    const spawn = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
    bot.group.position.copy(spawn);
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
