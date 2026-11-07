import * as THREE from 'three';

export interface WeaponViewModel {
  group: THREE.Group;
  muzzlePos: THREE.Vector3;
  muzzleFlash: THREE.PointLight;
  muzzleMesh: THREE.Mesh;
  triggerRecoil: () => void;
  triggerReload: () => void;
  update: (dt: number, isMoving: boolean) => void;
  dispose: () => void;
}

export function createWeaponViewModel(
  weaponId: string,
  outfitGlowColor?: string
): WeaponViewModel {
  const group = new THREE.Group();
  const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

  // Muzzle light & flash
  const muzzleFlash = new THREE.PointLight(0x06b6d4, 0, 10);
  group.add(muzzleFlash);

  const flashGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const flashMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
  disposables.push(flashGeo, flashMat);
  const muzzleMesh = new THREE.Mesh(flashGeo, flashMat);
  group.add(muzzleMesh);

  let muzzlePos = new THREE.Vector3(0.28, -0.25, -0.85);

  if (weaponId === 'celestial_railgun') {
    // ⚡ CELESTIAL RAILGUN (P2W GOD WEAPON: Pure gold + radiant halo + floating emitter rings)
    muzzleFlash.color.setHex(0xfacc15);
    muzzlePos = new THREE.Vector3(0.28, -0.22, -1.05);

    // Main barrel body (extrusive gold frame)
    const bodyGeo = new THREE.BoxGeometry(0.14, 0.18, 0.85);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.15,
      metalness: 0.95,
    });
    disposables.push(bodyGeo, bodyMat);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Twin Rail Prongs
    const railGeo = new THREE.BoxGeometry(0.025, 0.08, 0.6);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0xfef08a,
      emissiveIntensity: 0.5,
    });
    disposables.push(railGeo, railMat);

    const railLeft = new THREE.Mesh(railGeo, railMat);
    railLeft.position.set(-0.08, 0.04, -0.35);
    const railRight = new THREE.Mesh(railGeo, railMat);
    railRight.position.set(0.08, 0.04, -0.35);
    group.add(railLeft, railRight);

    // Floating Golden Rings
    const ringGeo = new THREE.TorusGeometry(0.12, 0.015, 8, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
    disposables.push(ringGeo, ringMat);

    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.position.set(0, 0, -0.2);
    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.position.set(0, 0, -0.45);
    group.add(ring1, ring2);

    // Celestial Core Glow
    const coreGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    disposables.push(coreGeo, coreMat);
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.rotation.x = Math.PI / 2;
    core.position.set(0, 0.02, -0.1);
    group.add(core);

  } else if (weaponId === 'heavy_plasma') {
    // 🟣 HEAVY PLASMA CANNON
    muzzleFlash.color.setHex(0xa855f7);
    muzzlePos = new THREE.Vector3(0.28, -0.24, -0.9);

    const bodyGeo = new THREE.CylinderGeometry(0.1, 0.13, 0.75, 12);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.3,
      metalness: 0.7,
    });
    disposables.push(bodyGeo, bodyMat);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    // Plasma glass chamber
    const chamberGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const chamberMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xc084fc,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.5,
    });
    disposables.push(chamberGeo, chamberMat);
    const chamber = new THREE.Mesh(chamberGeo, chamberMat);
    chamber.position.set(0, 0.04, 0.05);
    group.add(chamber);

  } else {
    // 🔵 VIPER PULSE RIFLE (Default high-tech combat rifle)
    muzzleFlash.color.setHex(0x06b6d4);
    muzzlePos = new THREE.Vector3(0.28, -0.24, -0.85);

    // Upper receiver & barrel
    const barrelGeo = new THREE.BoxGeometry(0.09, 0.12, 0.75);
    const barrelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.8,
    });
    disposables.push(barrelGeo, barrelMat);
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    group.add(barrel);

    // Cyan energy rail
    const railGeo = new THREE.BoxGeometry(0.04, 0.03, 0.6);
    const railMat = new THREE.MeshBasicMaterial({ color: outfitGlowColor || 0x22d3ee });
    disposables.push(railGeo, railMat);
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(0, 0.07, -0.05);
    group.add(rail);

    // Grip & Magazine
    const gripGeo = new THREE.BoxGeometry(0.07, 0.22, 0.09);
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
    disposables.push(gripGeo, gripMat);
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.position.set(0, -0.15, 0.1);
    grip.rotation.x = -0.2;
    group.add(grip);

    // Holo Sight
    const sightGeo = new THREE.BoxGeometry(0.06, 0.06, 0.12);
    const sightMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
    disposables.push(sightGeo, sightMat);
    const sight = new THREE.Mesh(sightGeo, sightMat);
    sight.position.set(0, 0.11, 0.05);
    group.add(sight);
  }

  // Position weapon relative to camera right-handed
  group.position.set(0.28, -0.26, -0.55);
  muzzleMesh.position.copy(muzzlePos);
  muzzleFlash.position.copy(muzzlePos);

  // Animation states
  let recoilOffset = 0;
  let reloadProgress = 0;
  let isReloading = false;
  let swayTime = 0;

  return {
    group,
    muzzlePos,
    muzzleFlash,
    muzzleMesh,
    triggerRecoil: () => {
      recoilOffset = 0.12;
      muzzleFlash.intensity = 3.5;
      (muzzleMesh.material as THREE.MeshBasicMaterial).opacity = 1.0;
    },
    triggerReload: () => {
      isReloading = true;
      reloadProgress = 1.0;
    },
    update: (dt: number, isMoving: boolean) => {
      // Fade muzzle flash
      if (muzzleFlash.intensity > 0) {
        muzzleFlash.intensity = Math.max(0, muzzleFlash.intensity - dt * 25);
        (muzzleMesh.material as THREE.MeshBasicMaterial).opacity = muzzleFlash.intensity / 3.5;
      }

      // Smooth recoil recovery
      recoilOffset = THREE.MathUtils.damp(recoilOffset, 0, 14, dt);

      // Weapon sway/bobbing while moving
      if (isMoving) {
        swayTime += dt * 9;
      } else {
        swayTime += dt * 2;
      }
      const swayX = Math.cos(swayTime) * (isMoving ? 0.015 : 0.003);
      const swayY = Math.sin(swayTime * 2) * (isMoving ? 0.012 : 0.002);

      // Reload animation (tilt down and back)
      let reloadRot = 0;
      let reloadY = 0;
      if (isReloading) {
        reloadProgress -= dt * 0.8;
        if (reloadProgress <= 0) {
          isReloading = false;
          reloadProgress = 0;
        } else {
          reloadRot = Math.sin(reloadProgress * Math.PI) * 0.5;
          reloadY = -Math.sin(reloadProgress * Math.PI) * 0.15;
        }
      }

      group.position.set(0.28 + swayX, -0.26 + swayY + reloadY, -0.55 + recoilOffset);
      group.rotation.set(-recoilOffset * 2.5 + reloadRot, reloadRot * 0.4, -swayX * 2);
    },
    dispose: () => {
      disposables.forEach((d) => d.dispose());
    },
  };
}
