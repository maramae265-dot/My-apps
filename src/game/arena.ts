import * as THREE from 'three';

export interface ArenaCollider {
  box: THREE.Box3;
  mesh: THREE.Object3D;
  isJumpPad?: boolean;
}

export interface ArenaResult {
  group: THREE.Group;
  colliders: ArenaCollider[];
  jumpPads: { position: THREE.Vector3; triggerRadius: number; boostY: number }[];
  spawnPoints: THREE.Vector3[];
  dispose: () => void;
}

/**
 * Procedural texture helpers to adhere strictly to Zero-404 rule
 */
function createGridTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Dark slate cyber background
  ctx.fillStyle = '#0a0d1a';
  ctx.fillRect(0, 0, size, size);

  // Subtle hexagonal or grid lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  const step = 64;
  for (let x = 0; x <= size; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Glowing cyan corner nodes
  ctx.fillStyle = '#06b6d4';
  for (let x = 0; x <= size; x += step) {
    for (let y = 0; y <= size; y += step) {
      ctx.fillRect(x - 3, y - 3, 6, 6);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createWarningStripeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#09090b';
  const w = 32;
  for (let i = -256; i < 512; i += w * 2) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + w, 0);
    ctx.lineTo(i + w + 128, 256);
    ctx.lineTo(i + 128, 256);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function buildCyberArena(scene: THREE.Scene): ArenaResult {
  const group = new THREE.Group();
  scene.add(group);

  const colliders: ArenaCollider[] = [];
  const jumpPads: { position: THREE.Vector3; triggerRadius: number; boostY: number }[] = [];
  const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];

  const gridTex = createGridTexture();
  const warningTex = createWarningStripeTexture();
  disposables.push(gridTex, warningTex);

  // 1. ARENA FLOOR (Large grounded base)
  const floorGeo = new THREE.PlaneGeometry(160, 160);
  const floorMat = new THREE.MeshStandardMaterial({
    map: gridTex,
    roughness: 0.25,
    metalness: 0.65,
  });
  disposables.push(floorGeo, floorMat);

  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // 2. CENTRAL ELEVATED PLATFORM (3-part structure)
  const centerPlatGroup = new THREE.Group();
  centerPlatGroup.position.set(0, 0, 0);

  // Base plinth
  const baseGeo = new THREE.CylinderGeometry(16, 18, 2.5, 8);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.7,
  });
  disposables.push(baseGeo, baseMat);
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = 1.25;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  centerPlatGroup.add(baseMesh);

  // Top platform
  const topGeo = new THREE.CylinderGeometry(14, 14, 0.4, 8);
  const topMat = new THREE.MeshStandardMaterial({
    map: gridTex,
    roughness: 0.3,
    metalness: 0.8,
  });
  disposables.push(topGeo, topMat);
  const topMesh = new THREE.Mesh(topGeo, topMat);
  topMesh.position.y = 2.7;
  centerPlatGroup.add(topMesh);

  // Central energy obelisk spire
  const spireGeo = new THREE.ConeGeometry(2.5, 12, 6);
  const spireMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.8,
    roughness: 0.1,
    metalness: 0.9,
  });
  disposables.push(spireGeo, spireMat);
  const spire = new THREE.Mesh(spireGeo, spireMat);
  spire.position.y = 8.5;
  centerPlatGroup.add(spire);

  group.add(centerPlatGroup);

  // Add platform collider box
  const centerBox = new THREE.Box3(
    new THREE.Vector3(-14, 0, -14),
    new THREE.Vector3(14, 2.7, 14)
  );
  colliders.push({ box: centerBox, mesh: centerPlatGroup });

  // 3. JUMP PADS (4 cardinal jump pads launching high into air)
  const jumpPadCoords = [
    new THREE.Vector3(26, 0, 0),
    new THREE.Vector3(-26, 0, 0),
    new THREE.Vector3(0, 0, 26),
    new THREE.Vector3(0, 0, -26),
  ];

  const padBaseGeo = new THREE.CylinderGeometry(2.4, 2.8, 0.4, 16);
  const padGlowGeo = new THREE.RingGeometry(0.8, 2.2, 16);
  const padBaseMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.5,
    metalness: 0.5,
  });
  const padGlowMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    side: THREE.DoubleSide,
  });
  disposables.push(padBaseGeo, padGlowGeo, padBaseMat, padGlowMat);

  jumpPadCoords.forEach((pos) => {
    const padGroup = new THREE.Group();
    padGroup.position.copy(pos);

    const padBase = new THREE.Mesh(padBaseGeo, padBaseMat);
    padBase.position.y = 0.2;
    padGroup.add(padBase);

    const padGlow = new THREE.Mesh(padGlowGeo, padGlowMat);
    padGlow.rotation.x = -Math.PI / 2;
    padGlow.position.y = 0.42;
    padGroup.add(padGlow);

    group.add(padGroup);

    jumpPads.push({
      position: pos.clone().setY(0.5),
      triggerRadius: 2.5,
      boostY: 18.0,
    });
  });

  // 4. COVER PILLARS & SHIPPING CONTAINERS (Procedural multi-part props)
  const pillarColors = [0x0f172a, 0x1e1b4b, 0x18181b, 0x1e293b];
  const neonEmissives = [0x06b6d4, 0x8b5cf6, 0xec4899, 0xfacc15];

  const propPositions = [
    // Quadrant 1
    { pos: [18, 0, 18], size: [6, 4.5, 6] },
    { pos: [35, 0, 12], size: [8, 3.5, 4] },
    { pos: [12, 0, 35], size: [4, 3.5, 8] },
    // Quadrant 2
    { pos: [-18, 0, 18], size: [6, 4.5, 6] },
    { pos: [-35, 0, 12], size: [8, 3.5, 4] },
    { pos: [-12, 0, 35], size: [4, 3.5, 8] },
    // Quadrant 3
    { pos: [18, 0, -18], size: [6, 4.5, 6] },
    { pos: [35, 0, -12], size: [8, 3.5, 4] },
    { pos: [12, 0, -35], size: [4, 3.5, 8] },
    // Quadrant 4
    { pos: [-18, 0, -18], size: [6, 4.5, 6] },
    { pos: [-35, 0, -12], size: [8, 3.5, 4] },
    { pos: [-12, 0, -35], size: [4, 3.5, 8] },
    // Flanks
    { pos: [45, 0, 0], size: [4, 7.0, 4] },
    { pos: [-45, 0, 0], size: [4, 7.0, 4] },
    { pos: [0, 0, 45], size: [4, 7.0, 4] },
    { pos: [0, 0, -45], size: [4, 7.0, 4] },
  ];

  propPositions.forEach((prop, idx) => {
    const [w, h, d] = prop.size;
    const [px, , pz] = prop.pos;
    const pGroup = new THREE.Group();
    pGroup.position.set(px, 0, pz);

    // Main box body
    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: pillarColors[idx % pillarColors.length],
      roughness: 0.35,
      metalness: 0.6,
    });
    disposables.push(bodyGeo, bodyMat);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = h / 2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    pGroup.add(bodyMesh);

    // Neon accent stripes
    const stripeGeo = new THREE.BoxGeometry(w + 0.05, 0.25, d + 0.05);
    const stripeMat = new THREE.MeshBasicMaterial({
      color: neonEmissives[idx % neonEmissives.length],
    });
    disposables.push(stripeGeo, stripeMat);
    const stripe1 = new THREE.Mesh(stripeGeo, stripeMat);
    stripe1.position.y = h * 0.3;
    const stripe2 = new THREE.Mesh(stripeGeo, stripeMat);
    stripe2.position.y = h * 0.75;
    pGroup.add(stripe1, stripe2);

    group.add(pGroup);

    // Add collider
    const halfW = w / 2;
    const halfD = d / 2;
    const box = new THREE.Box3(
      new THREE.Vector3(px - halfW, 0, pz - halfD),
      new THREE.Vector3(px + halfW, h, pz + halfD)
    );
    colliders.push({ box, mesh: pGroup });
  });

  // 5. OUTER BOUNDARY WALLS & CITYSCAPE SILHOUETTES
  // Perimeter energy barrier walls
  const wallLength = 140;
  const wallHeight = 8;
  const wallThickness = 2;
  const wallPositions = [
    { pos: [0, wallHeight / 2, -wallLength / 2], size: [wallLength, wallHeight, wallThickness] },
    { pos: [0, wallHeight / 2, wallLength / 2], size: [wallLength, wallHeight, wallThickness] },
    { pos: [-wallLength / 2, wallHeight / 2, 0], size: [wallThickness, wallHeight, wallLength] },
    { pos: [wallLength / 2, wallHeight / 2, 0], size: [wallThickness, wallHeight, wallLength] },
  ];

  wallPositions.forEach((wp) => {
    const [w, h, d] = wp.size;
    const [x, y, z] = wp.pos;
    const wGeo = new THREE.BoxGeometry(w, h, d);
    const wMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.4,
    });
    disposables.push(wGeo, wMat);
    const wMesh = new THREE.Mesh(wGeo, wMat);
    wMesh.position.set(x, y, z);
    wMesh.receiveShadow = true;
    group.add(wMesh);

    // Collider
    const box = new THREE.Box3(
      new THREE.Vector3(x - w / 2, 0, z - d / 2),
      new THREE.Vector3(x + w / 2, h, z + d / 2)
    );
    colliders.push({ box, mesh: wMesh });
  });

  // Background Cyber Skyscrapers (outside arena boundaries for epic depth)
  const towerGeo = new THREE.BoxGeometry(16, 80, 16);
  const towerMat = new THREE.MeshStandardMaterial({
    color: 0x030712,
    roughness: 0.8,
    metalness: 0.2,
  });
  disposables.push(towerGeo, towerMat);

  const towerOffsets = [
    [-90, -90], [0, -110], [90, -90],
    [-110, 0], [110, 0],
    [-90, 90], [0, 110], [90, 90],
    [-130, -50], [130, 50],
  ];

  towerOffsets.forEach(([tx, tz]) => {
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(tx, 40, tz);
    group.add(tower);
  });

  // Spawn points for player & bots
  const spawnPoints: THREE.Vector3[] = [
    new THREE.Vector3(0, 1, 35),
    new THREE.Vector3(30, 1, 30),
    new THREE.Vector3(-30, 1, 30),
    new THREE.Vector3(30, 1, -30),
    new THREE.Vector3(-30, 1, -30),
    new THREE.Vector3(0, 1, -35),
    new THREE.Vector3(40, 1, 0),
    new THREE.Vector3(-40, 1, 0),
    new THREE.Vector3(0, 4, 0), // On top of center platform!
  ];

  return {
    group,
    colliders,
    jumpPads,
    spawnPoints,
    dispose: () => {
      disposables.forEach((item) => item.dispose());
      scene.remove(group);
    },
  };
}
