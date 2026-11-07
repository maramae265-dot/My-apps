import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { WeaponDef, P2WItem, RankTier } from '../types/game';
import { WEAPONS, P2W_ITEMS, RANKS } from './constants';
import { buildCyberArena, ArenaResult } from './arena';
import { createWeaponViewModel, WeaponViewModel } from './weaponModels';
import { BotManager, BotPlayer } from './botManager';
import { soundEngine } from '../audio/soundEngine';

// Pre-allocated vectors for Zero-GC render loops
const _vec3 = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _camForward = new THREE.Vector3();
const _camRight = new THREE.Vector3();
const _rayOrigin = new THREE.Vector3();
const _rayDir = new THREE.Vector3();

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: {
    health: number;
    maxHealth: number;
    shield: number;
    maxShield: number;
    ammo: number;
    maxAmmo: number;
    isReloading: boolean;
    kills: number;
    deaths: number;
    score: number;
    elo: number;
    rank: RankTier;
    activePerks: string[];
    invisibilityTimeLeft: number;
    targetKills: number;
  }) => void;
  onHitmarker: (isHeadshot: boolean) => void;
  onKill: (victim: string, weapon: string, isHeadshot: boolean, isP2W: boolean) => void;
  onPlayerDeath: (killer: string) => void;
  onLockChange: (isLocked: boolean) => void;
  onMatchEnd: (result: 'victory' | 'defeat', finalKills: number, finalScore: number) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private isSoftwareGl: boolean = false;
  private callbacks: GameEngineCallbacks;

  // Arena & Bots
  private arena: ArenaResult | null = null;
  private botManager: BotManager | null = null;
  private weaponViewModel: WeaponViewModel | null = null;

  // Active loadout & P2W
  private currentWeapon: WeaponDef = WEAPONS[0];
  private unlockedP2wIds: Set<string> = new Set();
  private equippedOutfitColor: string = '#06b6d4';

  // Player Stats & State
  private health: number = 100;
  private maxHealth: number = 100;
  private shield: number = 100;
  private maxShield: number = 100;
  private ammo: number = 30;
  private kills: number = 0;
  private deaths: number = 0;
  private score: number = 0;
  private elo: number = 1250;
  private isAlive: boolean = true;
  private isReloading: boolean = false;
  private reloadTimer: number = 0;
  private shootCooldown: number = 0;
  private invisibilityTimer: number = 0;
  private matchEnded: boolean = false;
  private targetKills: number = 15;
  private deathCamTilt: number = 0;

  // Movement & Camera
  private playerPos = new THREE.Vector3(0, 1.7, 25);
  private playerVel = new THREE.Vector3();
  private isGrounded = false;
  private pitch = 0;
  private yaw = 0;
  private isPointerLocked = false;
  private isAiming = false;

  // Inputs
  private keys: Record<string, boolean> = {};
  private isShooting = false;
  private virtualMove = new THREE.Vector2(0, 0);
  private isSprinting = false;

  // Particles & Tracers
  private tracers: { line: THREE.Line; age: number; maxAge: number }[] = [];
  private particles: { mesh: THREE.Mesh; vel: THREE.Vector3; age: number }[] = [];

  // Loop control
  private animationFrameId: number = 0;
  private lastTime: number = performance.now();
  private isDestroyed: boolean = false;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Initialize WebGLRenderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    // Camera & Scene
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 400);
    this.camera.position.copy(this.playerPos);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070913);
    this.scene.fog = new THREE.FogExp2(0x070913, 0.012);

    // Studio Environment (Zero-dependency RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting
    this.setupLighting();

    // Build Arena & Entities
    this.arena = buildCyberArena(this.scene);
    this.botManager = new BotManager(this.scene, this.arena.spawnPoints, this.arena.colliders);

    // Setup Weapon Viewmodel
    this.switchWeapon(this.currentWeapon);

    // Register Input Listeners
    this.setupInputListeners();

    // Start game loop
    this.lastTime = performance.now();
    this.tick();
  }

  private setupLighting() {
    // Warm Key Light with soft shadows
    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.6);
    keyLight.position.set(40, 60, 30);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    const d = 45;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    this.scene.add(keyLight);

    // Cool Hemisphere Fill
    const hemiLight = new THREE.HemisphereLight(0x06b6d4, 0x0f172a, 0.7);
    this.scene.add(hemiLight);

    // Central Arena Beacon Light
    const beaconLight = new THREE.PointLight(0x06b6d4, 2.0, 50);
    beaconLight.position.set(0, 10, 0);
    this.scene.add(beaconLight);
  }

  public switchWeapon(weapon: WeaponDef) {
    this.currentWeapon = weapon;
    this.ammo = weapon.magazineSize;
    this.isReloading = false;

    if (this.weaponViewModel) {
      this.camera.remove(this.weaponViewModel.group);
      this.weaponViewModel.dispose();
    }

    this.weaponViewModel = createWeaponViewModel(weapon.id, this.equippedOutfitColor);
    this.camera.add(this.weaponViewModel.group);
    this.scene.add(this.camera);

    this.emitStats();
  }

  public applyP2WPerks(perkIds: string[]) {
    this.unlockedP2wIds = new Set(perkIds);

    // Compute extra stats
    let extraHpShield = 0;
    let hasGodEmperor = false;

    perkIds.forEach((id) => {
      const item = P2W_ITEMS.find((p) => p.id === id);
      if (!item) return;
      if (item.effect.extraShield) extraHpShield += item.effect.extraShield;
      if (item.id === 'p2w_god_emperor') {
        hasGodEmperor = true;
      }
    });

    this.maxShield = 100 + extraHpShield;
    this.shield = this.maxShield;

    // If unlocked God Emperor, auto equip Celestial Railgun!
    if (hasGodEmperor) {
      const railgun = WEAPONS.find((w) => w.id === 'celestial_railgun');
      if (railgun && this.currentWeapon.id !== 'celestial_railgun') {
        this.switchWeapon(railgun);
      }
    }

    this.emitStats();
  }

  public setOutfit(color: string) {
    this.equippedOutfitColor = color;
  }

  private setupInputListeners() {
    const canvas = this.renderer.domElement;

    // Pointer Lock click
    canvas.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        canvas.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === canvas;
      this.callbacks.onLockChange(this.isPointerLocked);
    });

    // Mouse Look
    document.addEventListener('mousemove', (e) => {
      if (!this.isPointerLocked) return;
      const sens = this.isAiming ? 0.0012 : 0.0022;
      this.yaw -= e.movementX * sens;
      this.pitch -= e.movementY * sens;
      this.pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.pitch));
    });

    // Mouse buttons
    document.addEventListener('mousedown', (e) => {
      if (!this.isPointerLocked) return;
      if (e.button === 0) {
        this.isShooting = true;
      } else if (e.button === 2) {
        this.isAiming = true;
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.isShooting = false;
      } else if (e.button === 2) {
        this.isAiming = false;
      }
    });

    // Prevent context menu on right click
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Keyboard
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      this.keys[code] = true;

      // Reload
      if (code === 'KeyR' && !this.isReloading && this.ammo < this.currentWeapon.magazineSize) {
        this.startReload();
      }

      // Pay-to-Win Invisibility Ability [E]
      if (code === 'KeyE') {
        const hasCamo = this.unlockedP2wIds.has('p2w_camo_stealth') || this.unlockedP2wIds.has('p2w_god_emperor');
        if (hasCamo && this.invisibilityTimer <= 0) {
          this.invisibilityTimer = 8.0;
          soundEngine.playJumpPad();
        }
      }

      // Weapon hotkeys 1, 2, 3
      if (code === 'Digit1') this.switchWeapon(WEAPONS[0]);
      if (code === 'Digit2') this.switchWeapon(WEAPONS[1]);
      if (code === 'Digit3') {
        const rail = WEAPONS[2];
        if (this.unlockedP2wIds.has('p2w_god_emperor')) {
          this.switchWeapon(rail);
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Resize
    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public setVirtualMove(x: number, y: number) {
    this.virtualMove.set(x, y);
  }

  public setVirtualSprinting(sprinting: boolean) {
    this.isSprinting = sprinting;
  }

  public setVirtualShooting(shooting: boolean) {
    this.isShooting = shooting;
  }

  public setVirtualAiming(aiming: boolean) {
    this.isAiming = aiming;
  }

  public triggerJump() {
    if (this.isAlive && this.isGrounded) {
      this.playerVel.y = 12.0;
      this.isGrounded = false;
    }
  }

  public triggerReload() {
    if (!this.isReloading && this.ammo < this.currentWeapon.magazineSize) {
      this.startReload();
    }
  }

  public triggerP2WAbility() {
    const hasCamo = this.unlockedP2wIds.has('p2w_camo_stealth') || this.unlockedP2wIds.has('p2w_god_emperor');
    if (hasCamo && this.invisibilityTimer <= 0) {
      this.invisibilityTimer = 8.0;
      soundEngine.playJumpPad();
      this.emitStats();
    }
  }

  public rotateCamera(deltaYaw: number, deltaPitch: number) {
    const sens = this.isAiming ? 0.002 : 0.0035;
    this.yaw -= deltaYaw * sens;
    this.pitch -= deltaPitch * sens;
    this.pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.pitch));
  }

  private startReload() {
    this.isReloading = true;
    this.reloadTimer = this.currentWeapon.reloadTime;
    soundEngine.playReload();
    if (this.weaponViewModel) {
      this.weaponViewModel.triggerReload();
    }
  }

  private shoot() {
    if (!this.isAlive || this.isReloading) return;

    if (this.ammo <= 0) {
      this.startReload();
      return;
    }

    // Deduct ammo unless Infinite Ammo perk is active
    const hasInfiniteAmmo = this.unlockedP2wIds.has('p2w_god_emperor');
    if (!hasInfiniteAmmo) {
      this.ammo--;
    }

    this.shootCooldown = 1 / this.currentWeapon.fireRate;

    // Viewmodel recoil & audio
    if (this.weaponViewModel) {
      this.weaponViewModel.triggerRecoil();
    }

    if (this.currentWeapon.id === 'celestial_railgun') {
      soundEngine.playRailgunShot();
    } else if (this.currentWeapon.id === 'heavy_plasma') {
      soundEngine.playPlasmaShot();
    } else {
      soundEngine.playRifleShot();
    }

    // Calculate bullet trajectory
    _rayOrigin.copy(this.playerPos);
    this.camera.getWorldDirection(_rayDir);

    // Aim Assist P2W perk: If equipped, magnetize slightly towards closest enemy in crosshair!
    const hasAimAssist = this.unlockedP2wIds.has('p2w_aim_chip') || this.unlockedP2wIds.has('p2w_god_emperor');
    if (hasAimAssist && this.botManager) {
      const bots = this.botManager.getBots();
      let bestAngle = 0.18; // approx 10 degrees cone
      let targetHeadPos: THREE.Vector3 | null = null;

      bots.forEach((bot) => {
        if (bot.state === 'dead') return;
        const headPos = new THREE.Vector3();
        bot.headMesh.getWorldPosition(headPos);
        const toHead = headPos.clone().sub(_rayOrigin).normalize();
        const angle = _rayDir.angleTo(toHead);
        if (angle < bestAngle) {
          bestAngle = angle;
          targetHeadPos = headPos;
        }
      });

      if (targetHeadPos) {
        _rayDir.lerp((targetHeadPos as THREE.Vector3).clone().sub(_rayOrigin).normalize(), 0.65);
      }
    }

    // Raycast hit detection
    const raycaster = new THREE.Raycaster(_rayOrigin, _rayDir, 0.1, 300);

    // Check bots
    if (this.botManager) {
      const bots = this.botManager.getBots();
      let hitBot: BotPlayer | null = null;
      let isHeadshot = false;
      let closestDist = Infinity;

      bots.forEach((bot) => {
        if (bot.state === 'dead') return;

        // Check head first
        const headIntersect = raycaster.intersectObject(bot.headMesh);
        if (headIntersect.length > 0 && headIntersect[0].distance < closestDist) {
          closestDist = headIntersect[0].distance;
          hitBot = bot;
          isHeadshot = true;
          return;
        }

        // Check body
        const bodyIntersect = raycaster.intersectObject(bot.bodyMesh);
        if (bodyIntersect.length > 0 && bodyIntersect[0].distance < closestDist) {
          closestDist = bodyIntersect[0].distance;
          hitBot = bot;
          isHeadshot = false;
        }
      });

      if (hitBot) {
        // Calculate damage with P2W multipliers
        let baseDamage = this.currentWeapon.damage;
        if (this.unlockedP2wIds.has('p2w_triple_damage')) baseDamage *= 3.0;
        if (this.unlockedP2wIds.has('p2w_god_emperor')) baseDamage *= 5.0;

        // One-hit kill celestial rule
        if (this.currentWeapon.id === 'celestial_railgun' || this.unlockedP2wIds.has('p2w_god_emperor')) {
          baseDamage = 9999;
        }

        const { killed } = this.botManager.damageBot(
          (hitBot as BotPlayer).id,
          baseDamage,
          isHeadshot,
          (victim, headshot) => {
            this.handlePlayerScoreKill(victim.name, headshot);
          }
        );

        // Sound feedback
        if (isHeadshot) {
          soundEngine.playHeadshot();
        } else {
          soundEngine.playHitmarker();
        }
        this.callbacks.onHitmarker(isHeadshot);

        // Lifesteal P2W perk
        const hasLifesteal = this.unlockedP2wIds.has('p2w_vampiric') || this.unlockedP2wIds.has('p2w_god_emperor');
        if (hasLifesteal) {
          const heal = Math.round(baseDamage * 0.35);
          this.health = Math.min(this.maxHealth, this.health + heal);
        }

        // Spawn hit spark particles at bot position
        const hitPoint = _rayOrigin.clone().add(_rayDir.clone().multiplyScalar(closestDist));
        this.spawnHitParticles(hitPoint, isHeadshot ? 0xfacc15 : 0x06b6d4);

        // Tracer line to hit point
        this.spawnTracer(_rayOrigin, hitPoint, this.currentWeapon.color);
      } else {
        // Hit arena wall or sky
        const endPoint = _rayOrigin.clone().add(_rayDir.clone().multiplyScalar(120));
        this.spawnTracer(_rayOrigin, endPoint, this.currentWeapon.color);
      }
    }

    this.emitStats();
  }

  private handlePlayerScoreKill(victimName: string, isHeadshot: boolean) {
    this.kills++;
    this.score += isHeadshot ? 150 : 100;
    this.elo += isHeadshot ? 35 : 25;

    soundEngine.playKillSound();

    const isP2W = this.unlockedP2wIds.size > 0;
    this.callbacks.onKill(victimName, this.currentWeapon.name, isHeadshot, isP2W);
    this.emitStats();

    // Check Victory Condition (Target 15 kills)
    if (this.kills >= this.targetKills && !this.matchEnded) {
      this.matchEnded = true;
      this.callbacks.onMatchEnd('victory', this.kills, this.score);
    }
  }

  private spawnTracer(from: THREE.Vector3, to: THREE.Vector3, colorHex: string) {
    const points = [from.clone().add(new THREE.Vector3(0, -0.15, 0)), to];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(colorHex),
      linewidth: 3,
    });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.tracers.push({ line, age: 0, maxAge: 0.1 });
  }

  private spawnHitParticles(pos: THREE.Vector3, colorHex: number) {
    const geo = new THREE.SphereGeometry(0.06, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: colorHex });

    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      this.scene.add(mesh);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        Math.random() * 5 + 1,
        (Math.random() - 0.5) * 6
      );
      this.particles.push({ mesh, vel, age: 0 });
    }
  }

  private handleBotShoots = (origin: THREE.Vector3, dir: THREE.Vector3, isP2W: boolean) => {
    // Check if bullet strikes player
    if (!this.isAlive || this.invisibilityTimer > 0) return;

    const toPlayer = this.playerPos.clone().sub(origin);
    const dist = toPlayer.length();
    const proj = toPlayer.dot(dir);

    // Bullet line tracer
    const end = origin.clone().add(dir.clone().multiplyScalar(dist));
    this.spawnTracer(origin, end, isP2W ? '#facc15' : '#ef4444');

    if (proj > 0 && Math.abs(proj - dist) < 0.9) {
      // Balanced bot damage: fair and enjoyable (not overly aggressive)
      const botDamage = isP2W ? 16 : 10;

      // Absorb shield first
      if (this.shield > 0) {
        if (this.shield >= botDamage) {
          this.shield -= botDamage;
        } else {
          const rem = botDamage - this.shield;
          this.shield = 0;
          this.health -= rem;
        }
      } else {
        this.health -= botDamage;
      }

      soundEngine.playHitmarker();

      if (this.health <= 0) {
        this.handlePlayerDeath('Enemigo IA');
      }

      this.emitStats();
    }
  };

  private handlePlayerDeath(killer: string) {
    this.isAlive = false;
    this.deaths++;
    this.elo = Math.max(0, this.elo - 20);
    this.callbacks.onPlayerDeath(killer);
    this.emitStats();

    // Check Defeat if deaths become excessive
    if (this.deaths >= 10 && !this.matchEnded) {
      this.matchEnded = true;
      this.callbacks.onMatchEnd('defeat', this.kills, this.score);
    }

    // Respawn after 3 seconds
    setTimeout(() => {
      this.respawnPlayer();
    }, 3000);
  }

  private respawnPlayer() {
    this.health = this.maxHealth;
    this.shield = this.maxShield;
    this.ammo = this.currentWeapon.magazineSize;
    this.isAlive = true;
    this.camera.rotation.z = 0;
    if (this.arena) {
      const spawn = this.arena.spawnPoints[0];
      this.playerPos.set(spawn.x, 1.7, spawn.z);
      this.playerVel.set(0, 0, 0);
    }
    this.emitStats();
  }

  public resetMatch() {
    this.kills = 0;
    this.deaths = 0;
    this.score = 0;
    this.matchEnded = false;
    this.respawnPlayer();
  }

  private updatePlayerPhysics(dt: number) {
    if (!this.isAlive) return;

    // Camera rotation
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.x = this.pitch;
    euler.y = this.yaw;
    this.camera.quaternion.setFromEuler(euler);

    // Direction vectors
    _camForward.set(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw).normalize();
    _camRight.set(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw).normalize();

    _moveDir.set(0, 0, 0);
    if (this.keys['KeyW']) _moveDir.add(_camForward);
    if (this.keys['KeyS']) _moveDir.sub(_camForward);
    if (this.keys['KeyD']) _moveDir.add(_camRight);
    if (this.keys['KeyA']) _moveDir.sub(_camRight);

    // Apply on-screen virtual joystick movement
    if (this.virtualMove.lengthSq() > 0.001) {
      _moveDir.addScaledVector(_camRight, this.virtualMove.x);
      _moveDir.addScaledVector(_camForward, -this.virtualMove.y);
    }

    if (_moveDir.lengthSq() > 0.001) {
      _moveDir.normalize();
    }

    // Movement speed with sprint and P2W boost
    let baseSpeed = 11.5;
    if (this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.isSprinting) baseSpeed = 16.5;
    if (this.unlockedP2wIds.has('p2w_god_emperor')) baseSpeed *= 1.35;

    this.playerVel.x = _moveDir.x * baseSpeed;
    this.playerVel.z = _moveDir.z * baseSpeed;

    // Gravity
    this.playerVel.y -= 32 * dt;

    // Jump
    if (this.keys['Space'] && this.isGrounded) {
      this.playerVel.y = 12.0;
      this.isGrounded = false;
    }

    // Apply velocity
    this.playerPos.x += this.playerVel.x * dt;
    this.playerPos.y += this.playerVel.y * dt;
    this.playerPos.z += this.playerVel.z * dt;

    // Ground floor collision
    if (this.playerPos.y <= 1.7) {
      this.playerPos.y = 1.7;
      this.playerVel.y = 0;
      this.isGrounded = true;
    }

    // Jump pads trigger
    if (this.arena) {
      this.arena.jumpPads.forEach((pad) => {
        const d = new THREE.Vector2(this.playerPos.x - pad.position.x, this.playerPos.z - pad.position.z).length();
        if (d < pad.triggerRadius && this.playerPos.y < 3.0) {
          this.playerVel.y = pad.boostY;
          this.isGrounded = false;
          soundEngine.playJumpPad();
        }
      });
    }

    // Arena boundary clamp
    this.playerPos.x = THREE.MathUtils.clamp(this.playerPos.x, -68, 68);
    this.playerPos.z = THREE.MathUtils.clamp(this.playerPos.z, -68, 68);

    // Sync camera position
    this.camera.position.copy(this.playerPos);

    // FOV smoothly lerps on aim (Iron Sights)
    const targetFov = this.isAiming ? 48 : 75;
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 12, dt);
    this.camera.updateProjectionMatrix();
  }

  private emitStats() {
    // Determine rank tier
    let rank: RankTier = 'Hierro';
    Object.values(RANKS).forEach((r) => {
      if (this.elo >= r.minElo) rank = r.tier;
    });

    const activePerks: string[] = [];
    this.unlockedP2wIds.forEach((id) => {
      const item = P2W_ITEMS.find((p) => p.id === id);
      if (item) activePerks.push(item.badge);
    });

    this.callbacks.onStatsUpdate({
      health: Math.max(0, Math.round(this.health)),
      maxHealth: this.maxHealth,
      shield: Math.max(0, Math.round(this.shield)),
      maxShield: this.maxShield,
      ammo: this.ammo,
      maxAmmo: this.currentWeapon.magazineSize,
      isReloading: this.isReloading,
      kills: this.kills,
      deaths: this.deaths,
      score: this.score,
      elo: this.elo,
      rank,
      activePerks,
      invisibilityTimeLeft: Math.max(0, this.invisibilityTimer),
      targetKills: this.targetKills,
    });
  }

  private tick = () => {
    if (this.isDestroyed) return;

    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = Math.min(rawDt, 0.05); // Clamp dt

    // Death camera fall and roll animation
    if (!this.isAlive) {
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, 0.42, 6, dt);
      this.camera.rotation.z = THREE.MathUtils.damp(this.camera.rotation.z, -0.38, 5, dt);
    }

    // Update Player
    this.updatePlayerPhysics(dt);

    // Reload timer
    if (this.isReloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        this.isReloading = false;
        this.ammo = this.currentWeapon.magazineSize;
        this.emitStats();
      }
    }

    // Shoot cooldown & auto-fire
    if (this.shootCooldown > 0) {
      this.shootCooldown -= dt;
    }
    if (this.isShooting && this.shootCooldown <= 0 && this.isPointerLocked) {
      this.shoot();
    }

    // Invisibility timer
    if (this.invisibilityTimer > 0) {
      this.invisibilityTimer -= dt;
      if (this.invisibilityTimer <= 0) {
        this.invisibilityTimer = 0;
      }
    }

    // Update Bots
    if (this.botManager) {
      this.botManager.update(
        dt,
        this.playerPos,
        (bot, isHeadshot) => {
          this.handlePlayerScoreKill(bot.name, isHeadshot);
        },
        this.handleBotShoots
      );
    }

    // Update Weapon Viewmodel
    if (this.weaponViewModel) {
      const isMoving = this.playerVel.x !== 0 || this.playerVel.z !== 0;
      this.weaponViewModel.update(dt, isMoving);
    }

    // Update Tracers
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.age += dt;
      if (t.age >= t.maxAge) {
        this.scene.remove(t.line);
        t.line.geometry.dispose();
        (t.line.material as THREE.Material).dispose();
        this.tracers.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.vel.y -= 14 * dt; // Particle gravity
      if (p.age > 0.45) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
        this.particles.splice(i, 1);
      }
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.handleResize);

    if (this.botManager) this.botManager.dispose();
    if (this.arena) this.arena.dispose();
    if (this.weaponViewModel) this.weaponViewModel.dispose();

    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
