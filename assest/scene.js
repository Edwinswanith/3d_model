import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createScene() {
  const gameWindow = document.getElementById('render-target');
  const scene = new THREE.Scene();
  // Simple sky gradient for a clear day
  function createSkyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#bfe4ff');
      gradient.addColorStop(0.6, '#8fd0ff');
      gradient.addColorStop(1, '#d7f0ff');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  scene.background = createSkyTexture();
  scene.fog = new THREE.FogExp2(0xbadfff, 0.015); // Soft fog for depth

  // City sizing
  const citySize = 250;

  const camera = new THREE.PerspectiveCamera(70, gameWindow.offsetWidth / gameWindow.offsetHeight, 0.1, 1000);
  camera.position.set(120, 70, 140);
  camera.lookAt(0, 15, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: false }); // Disable antialiasing for performance
  renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
  renderer.shadowMap.enabled = true; // Enable shadows
  renderer.shadowMap.type = THREE.BasicShadowMap; // Use faster shadow type

  // Handle WebGL context loss
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    console.warn('WebGL context lost');
  });

  renderer.domElement.addEventListener('webglcontextrestored', () => {
    console.log('WebGL context restored');
  });

  gameWindow.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1; // Increase damping for smoother performance
  controls.minDistance = 10;
  controls.maxDistance = 280;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  
  // Player control mode (false = orbit camera, true = player control)
  let playerControlMode = false;

  // Player input state (WASD + Shift)
  const playerInput = {
    forward: false,
    back: false,
    left: false,
    right: false,
    run: false
  };

  function handleKey(event, isDown) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        playerInput.forward = isDown;
        if (isDown) {
          playerControlMode = true;
        }
        break;
      case 'KeyS':
      case 'ArrowDown':
        playerInput.back = isDown;
        if (isDown) {
          playerControlMode = true;
        }
        break;
      case 'KeyA':
      case 'ArrowLeft':
        playerInput.left = isDown;
        if (isDown) {
          playerControlMode = true;
        }
        break;
      case 'KeyD':
      case 'ArrowRight':
        playerInput.right = isDown;
        if (isDown) {
          playerControlMode = true;
        }
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        playerInput.run = isDown;
        break;
      case 'KeyC':
        if (isDown) {
          playerControlMode = !playerControlMode;
          controls.enabled = !playerControlMode; // Disable orbit controls when in player mode
          if (playerControlMode) {
            console.log('Player Control Mode: ON - Use WASD to move, Shift to run. Camera follows at fixed angle');
          } else {
            console.log('Orbit Camera Mode: ON - Use mouse to orbit');
          }
        }
        break;
      default:
        break;
    }
  }

  window.addEventListener('keydown', (e) => handleKey(e, true));
  window.addEventListener('keyup', (e) => handleKey(e, false));

  // Helper to create window texture
  function createWindowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 64;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Failed to get 2D context for window texture');
      // Return a simple fallback texture
      const fallbackTexture = new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
      return fallbackTexture;
    }

    // Base color
    context.fillStyle = '#222';
    context.fillRect(0, 0, 32, 64);

    // Windows
    for (let y = 2; y < 64; y += 4) {
      for (let x = 2; x < 32; x += 4) {
        if (Math.random() > 0.4) { // Randomly light up windows
          context.fillStyle = Math.random() > 0.8 ? '#ffffaa' : '#555'; // Some bright, some dark
          context.fillRect(x, y, 2, 2);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter; // Keep pixelated look
    texture.minFilter = THREE.NearestFilter; // Add min filter for consistency
    texture.flipY = false; // Prevent texture flipping issues
    return texture;
  }

  // Helper to create a subtle noise texture for sand
  function createSandTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const baseColor = '#efd8a1';
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 3500; i++) {
        const alpha = 0.05 + Math.random() * 0.05;
        ctx.fillStyle = `rgba(${230 + Math.random() * 25}, ${200 + Math.random() * 25}, ${150 + Math.random() * 20}, ${alpha})`;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
      }
      for (let i = 0; i < 2500; i++) {
        ctx.fillStyle = `rgba(180, 150, 110, 0.08)`;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.anisotropy = 4;
    return texture;
  }

  // Simple striped texture for towels or a ball
  function createStripedTexture(colors) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const stripeHeight = canvas.height / colors.length;
      colors.forEach((color, index) => {
        ctx.fillStyle = color;
        ctx.fillRect(0, index * stripeHeight, canvas.width, stripeHeight);
      });
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
  }

  // Ground
  const groundGeometry = new THREE.PlaneGeometry(citySize, citySize);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true; // Receive shadows
  scene.add(ground);

  // Road Network
  const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const roadWidth = 3;
  const roadMarkingMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  const whiteLineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

  // Create horizontal roads
  const roadRange = 105;
  const roadSpacing = 15;
  const roadPositions = []; // Horizontal roads (z positions)
  const verticalRoadPositions = []; // Vertical roads (x positions)
  // Stadium zone boundaries (x: 90, z: 0, w: 160, h: 110)
  const stadiumZone = { x: 90, z: 0, w: 160, h: 110 };
  const stadiumXMin = stadiumZone.x - stadiumZone.w / 2;
  const stadiumXMax = stadiumZone.x + stadiumZone.w / 2;
  const stadiumZMin = stadiumZone.z - stadiumZone.h / 2;
  const stadiumZMax = stadiumZone.z + stadiumZone.h / 2;
  
  for (let i = -roadRange; i <= roadRange; i += roadSpacing) {
    // Skip central park area
    if (Math.abs(i) < 20) continue;
    // Skip stadium area (horizontal roads at z position i)
    if (i >= stadiumZMin && i <= stadiumZMax) continue;

    roadPositions.push(i);
    const roadGeometry = new THREE.PlaneGeometry(roadRange * 2 + 40, roadWidth);
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.01;
    road.position.z = i;
    road.receiveShadow = true;
    scene.add(road);

    // Yellow center line
    const centerLineGeometry = new THREE.PlaneGeometry(roadRange * 2 + 40, 0.1);
    const centerLine = new THREE.Mesh(centerLineGeometry, roadMarkingMaterial);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.y = 0.02;
    centerLine.position.z = i;
    scene.add(centerLine);

    // White edge lines
    const edgeLine1Geometry = new THREE.PlaneGeometry(roadRange * 2 + 40, 0.08);
    const edgeLine1 = new THREE.Mesh(edgeLine1Geometry, whiteLineMaterial);
    edgeLine1.rotation.x = -Math.PI / 2;
    edgeLine1.position.y = 0.02;
    edgeLine1.position.z = i + roadWidth / 2;
    scene.add(edgeLine1);

    const edgeLine2 = new THREE.Mesh(edgeLine1Geometry.clone(), whiteLineMaterial);
    edgeLine2.rotation.x = -Math.PI / 2;
    edgeLine2.position.y = 0.02;
    edgeLine2.position.z = i - roadWidth / 2;
    scene.add(edgeLine2);
  }

  // Create vertical roads
  for (let i = -roadRange; i <= roadRange; i += roadSpacing) {
    // Skip central park area
    if (Math.abs(i) < 20) continue;
    // Skip stadium area (vertical roads at x position i)
    if (i >= stadiumXMin && i <= stadiumXMax) continue;

    verticalRoadPositions.push(i);

    const roadGeometry = new THREE.PlaneGeometry(roadWidth, roadRange * 2 + 40);
    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.01;
    road.position.x = i;
    road.receiveShadow = true;
    scene.add(road);

    // Yellow center line
    const centerLineGeometry = new THREE.PlaneGeometry(0.1, roadRange * 2 + 40);
    const centerLine = new THREE.Mesh(centerLineGeometry, roadMarkingMaterial);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.y = 0.02;
    centerLine.position.x = i;
    scene.add(centerLine);

    // White edge lines
    const edgeLine1Geometry = new THREE.PlaneGeometry(0.08, roadRange * 2 + 40);
    const edgeLine1 = new THREE.Mesh(edgeLine1Geometry, whiteLineMaterial);
    edgeLine1.rotation.x = -Math.PI / 2;
    edgeLine1.position.y = 0.02;
    edgeLine1.position.x = i + roadWidth / 2;
    scene.add(edgeLine1);

    const edgeLine2 = new THREE.Mesh(edgeLine1Geometry.clone(), whiteLineMaterial);
    edgeLine2.rotation.x = -Math.PI / 2;
    edgeLine2.position.y = 0.02;
    edgeLine2.position.x = i - roadWidth / 2;
    scene.add(edgeLine2);
  }

  // Sidewalks to ground the city in a more realistic scale
  const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: 0xb0b0b0, roughness: 0.95 });
  const sidewalkHeight = 0.06;
  const sidewalkWidth = 1;

  for (let z = -roadRange; z <= roadRange; z += roadSpacing) {
    if (Math.abs(z) < 20) continue; // Skip park
    if (z >= stadiumZMin && z <= stadiumZMax) continue; // Skip stadium area
    const sideA = new THREE.Mesh(new THREE.BoxGeometry(roadRange * 2 + 40, sidewalkHeight, sidewalkWidth), sidewalkMaterial);
    sideA.position.set(0, sidewalkHeight / 2, z + roadWidth / 2 + sidewalkWidth / 2);
    sideA.receiveShadow = true;
    scene.add(sideA);

    const sideB = sideA.clone();
    sideB.position.z = z - roadWidth / 2 - sidewalkWidth / 2;
    sideB.receiveShadow = true;
    scene.add(sideB);
  }

  for (let x = -roadRange; x <= roadRange; x += roadSpacing) {
    if (Math.abs(x) < 20) continue; // Skip park
    if (x >= stadiumXMin && x <= stadiumXMax) continue; // Skip stadium area
    const sideA = new THREE.Mesh(new THREE.BoxGeometry(sidewalkWidth, sidewalkHeight, roadRange * 2 + 40), sidewalkMaterial);
    sideA.position.set(x + roadWidth / 2 + sidewalkWidth / 2, sidewalkHeight / 2, 0);
    sideA.receiveShadow = true;
    scene.add(sideA);

    const sideB = sideA.clone();
    sideB.position.x = x - roadWidth / 2 - sidewalkWidth / 2;
    sideB.receiveShadow = true;
    scene.add(sideB);
  }

  // Helper function to check if position is on a road
  function isOnRoad(x, z) {
    const roadHalfWidth = roadWidth / 2 + 1; // Add buffer

    for (let roadPos of roadPositions) {
      // Check horizontal roads
      if (Math.abs(z - roadPos) < roadHalfWidth) {
        return true;
      }
    }
    for (let roadPos of verticalRoadPositions) {
      // Check vertical roads
      if (Math.abs(x - roadPos) < roadHalfWidth) {
        return true;
      }
    }
    return false;
  }

  // Helper function to check if building footprint overlaps with road
  function buildingOverlapsRoad(x, z, width, depth) {
    const roadHalfWidth = roadWidth / 2 + 0.5; // Smaller buffer for building edges
    
    // Check all four corners and center of building
    const corners = [
      { x: x - width/2, z: z - depth/2 },
      { x: x + width/2, z: z - depth/2 },
      { x: x - width/2, z: z + depth/2 },
      { x: x + width/2, z: z + depth/2 },
      { x: x, z: z } // Center
    ];

    for (const corner of corners) {
      // Check horizontal roads
      for (let roadPos of roadPositions) {
        if (Math.abs(corner.z - roadPos) < roadHalfWidth) {
          return true;
        }
      }
      // Check vertical roads
      for (let roadPos of verticalRoadPositions) {
        if (Math.abs(corner.x - roadPos) < roadHalfWidth) {
          return true;
        }
      }
    }
    return false;
  }

  // Zones to reserve for landmarks (park, stadium) so buildings/trees/bushes don't intrude
  const reservedZones = [
    { x: 0, z: 0, w: 70, h: 70 },     // Expanded park area with generous buffer
    { x: 90, z: 0, w: 160, h: 110 }    // Stadium area with large buffer - NO roads/buildings/trees/people
  ];

  function isInReservedZone(x, z, pad = 0) {
    for (const zone of reservedZones) {
      const halfW = zone.w / 2 + pad;
      const halfH = zone.h / 2 + pad;
      if (Math.abs(x - zone.x) < halfW && Math.abs(z - zone.z) < halfH) {
        return true;
      }
    }
    return false;
  }

  // Buildings Group
  const buildingGroup = new THREE.Group();
  buildingGroup.name = 'buildingGroup';
  const buildingPositions = []; // Store building positions and sizes
  const windowTexture = createWindowTexture();

  // Load Logo Texture with error handling
  const textureLoader = new THREE.TextureLoader();
  const createFallbackTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = '#888888';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('LOGO', 32, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  const logoTexture = createFallbackTexture();
  textureLoader.load(
    'assest/logo.png',
    (loadedTexture) => {
      if (loadedTexture && loadedTexture.image) {
        logoTexture.image = loadedTexture.image;
        logoTexture.needsUpdate = true;
      }
    },
    undefined,
    (error) => console.warn('Failed to load logo texture, using fallback')
  );

  // Building type definitions
  function createBuilding(type, posX, posZ) {
    const building = new THREE.Group();
    let height, scaleX, scaleZ, color;

    // Determine building characteristics based on type
    if (type === 'residential') {
      height = 2 + Math.random() * 3; // Low-rise
      scaleX = 2 + Math.random() * 2;
      scaleZ = 2 + Math.random() * 2;
      color = 0xd4c5b9; // Beige
    } else if (type === 'office') {
      height = 4 + Math.random() * 4; // Mid-rise
      scaleX = 2.5 + Math.random() * 1.5;
      scaleZ = 2.5 + Math.random() * 1.5;
      color = 0xc0c0c0; // Light gray
    } else { // tower
      height = 8 + Math.random() * 6; // High-rise
      scaleX = 2 + Math.random();
      scaleZ = 2 + Math.random();
      color = 0xe8e8e8; // Off-white
    }

    // Main building body
    const bodyGeometry = new THREE.BoxGeometry(1, 1, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: color,
      map: windowTexture,
      roughness: 0.7,
      metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.scale.set(scaleX, height, scaleZ);
    body.position.y = height / 2;
    body.receiveShadow = true;
    building.add(body);

    // Rooftop details
    if (Math.random() > 0.5) {
      // AC units
      const acCount = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < acCount; i++) {
        const acGeo = new THREE.BoxGeometry(0.3, 0.2, 0.3);
        const acMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 });
        const ac = new THREE.Mesh(acGeo, acMat);
        ac.position.set(
          (Math.random() - 0.5) * scaleX * 0.6,
          height + 0.1,
          (Math.random() - 0.5) * scaleZ * 0.6
        );
        building.add(ac);
      }
    }

    // Water tank on some buildings
    if (Math.random() > 0.7) {
      const tankGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.6, 8);
      const tankMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8, metalness: 0.3 });
      const tank = new THREE.Mesh(tankGeo, tankMat);
      tank.position.set(0, height + 0.3, 0);
      building.add(tank);
    }

    // Door
    const doorGeometry = new THREE.PlaneGeometry(0.6, 1.2);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3c31, roughness: 0.9 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 0.6, scaleZ / 2 + 0.01);
    building.add(door);

    // Glass entrance canopy for office/tower
    if (type !== 'residential' && Math.random() > 0.5) {
      const canopyGeo = new THREE.BoxGeometry(1.2, 0.05, 0.8);
      const canopyMat = new THREE.MeshStandardMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
        metalness: 0.8
      });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(0, 1.8, scaleZ / 2 + 0.4);
      building.add(canopy);
    }

    building.position.set(posX, 0, posZ);
    return { building, width: scaleX, depth: scaleZ };
  }

  // Generate buildings
  const buildingTypes = ['residential', 'office', 'tower'];
  for (let i = 0; i < 300; i++) {
    let posX, posZ;
    let attempts = 0;

    do {
      posX = (Math.random() - 0.5) * (citySize - 40);
      posZ = (Math.random() - 0.5) * (citySize - 40);
      attempts++;

      if (Math.abs(posX) < 35 && Math.abs(posZ) < 35) continue; // Park area
    } while ((isOnRoad(posX, posZ) || isInReservedZone(posX, posZ, 2)) && attempts < 50);

    if (attempts >= 50) continue;

    // Determine building type based on location
    let type;
    const distFromCenter = Math.sqrt(posX * posX + posZ * posZ);
    if (distFromCenter < 60) {
      type = Math.random() > 0.3 ? 'office' : 'tower'; // More commercial near center
    } else {
      type = Math.random() > 0.7 ? 'office' : 'residential'; // More residential on outskirts
    }

    const { building, width, depth } = createBuilding(type, posX, posZ);

    // Check if building footprint overlaps with road
    if (buildingOverlapsRoad(posX, posZ, width, depth)) {
      continue;
    }

    // Check for collision with other buildings
    let overlap = false;
    for (const b of buildingPositions) {
      const dx = Math.abs(posX - b.x);
      const dz = Math.abs(posZ - b.z);
      if (dx < (width + b.width) / 2 + 1.5 && dz < (depth + b.depth) / 2 + 1.5) {
        overlap = true;
        break;
      }
    }

    if (!overlap) {
      buildingGroup.add(building);
      buildingPositions.push({ x: posX, z: posZ, width, depth });
    }
  }

  scene.add(buildingGroup);

  // Traffic Lights and Zebra Crossings
  const intersectionPositions = [];
  // const roadCoords = [-30, -15, 0, 15, 30];
  const roadCoords = roadPositions;

  // Find intersections (using both horizontal and vertical road positions)
  for (let x of verticalRoadPositions) {
    for (let z of roadPositions) {
      // Skip intersections in stadium area
      if (x >= stadiumXMin && x <= stadiumXMax && z >= stadiumZMin && z <= stadiumZMax) continue;
      // Skip intersections in park area
      if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;
      intersectionPositions.push({ x, z });
    }
  }

  // Create Traffic Light Function
  function createTrafficLight() {
    const poleHeight = 2.6;
    const poleGeometry = new THREE.CylinderGeometry(0.08, 0.08, poleHeight, 10);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = poleHeight / 2;

    const boxGeometry = new THREE.BoxGeometry(0.35, 0.7, 0.35);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.y = poleHeight - 0.4;
    pole.add(box);

    // Lights
    const lightGeometry = new THREE.CircleGeometry(0.12, 16);

    const redLight = new THREE.Mesh(lightGeometry, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    redLight.position.set(0, 0.18, 0.2);
    box.add(redLight);

    const yellowLight = new THREE.Mesh(lightGeometry, new THREE.MeshBasicMaterial({ color: 0xffff00 }));
    yellowLight.position.set(0, 0, 0.2);
    box.add(yellowLight);

    const greenLight = new THREE.Mesh(lightGeometry, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    greenLight.position.set(0, -0.18, 0.2);
    box.add(greenLight);

    return pole;
  }

  // Add Traffic Lights and Crossings
  const zebraMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const zebraGeometryH = new THREE.PlaneGeometry(2, 0.4); // Horizontal stripes
  const zebraGeometryV = new THREE.PlaneGeometry(0.4, 2); // Vertical stripes
  const intersectionOverlaySize = roadWidth + sidewalkWidth * 2 + 3; // Slightly oversize to hide lane lines
  const intersectionOverlayGeo = new THREE.PlaneGeometry(intersectionOverlaySize, intersectionOverlaySize);
  const intersectionOverlayMat = new THREE.MeshStandardMaterial({ color: 0x2d2d2d });

  intersectionPositions.forEach(pos => {
    // Add Traffic Light (one per intersection for simplicity)
    const tl = createTrafficLight();
    tl.position.set(pos.x - 2, 0, pos.z - 2);
    tl.rotation.y = Math.PI / 4; // Face center
    tl.castShadow = false; // Disable shadows for performance
    scene.add(tl);

    // Add Zebra Crossings (4 per intersection)
    // Top
    for (let i = 0; i < 5; i++) {
      const stripe = new THREE.Mesh(zebraGeometryV, zebraMaterial);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(pos.x - 1 + i * 0.5, 0.03, pos.z - 2.5);
      scene.add(stripe);
    }
    // Bottom
    for (let i = 0; i < 5; i++) {
      const stripe = new THREE.Mesh(zebraGeometryV, zebraMaterial);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(pos.x - 1 + i * 0.5, 0.03, pos.z + 2.5);
      scene.add(stripe);
    }
    // Left
    for (let i = 0; i < 5; i++) {
      const stripe = new THREE.Mesh(zebraGeometryH, zebraMaterial);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(pos.x - 2.5, 0.03, pos.z - 1 + i * 0.5);
      scene.add(stripe);
    }
    // Right
    for (let i = 0; i < 5; i++) {
      const stripe = new THREE.Mesh(zebraGeometryH, zebraMaterial);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(pos.x + 2.5, 0.03, pos.z - 1 + i * 0.5);
      scene.add(stripe);
    }

    // Overlay to hide edge/center lines bleeding into the intersection
    const overlay = new THREE.Mesh(intersectionOverlayGeo, intersectionOverlayMat);
    overlay.rotation.x = -Math.PI / 2;
    overlay.position.set(pos.x, 0.025, pos.z);
    overlay.receiveShadow = true;
    scene.add(overlay);
  });

  // Helper function to check if position is too close to buildings
  function isTooCloseToBuilding(x, z, minDistance = 2) {
    for (let building of buildingPositions) {
      const dx = Math.abs(x - building.x);
      const dz = Math.abs(z - building.z);
      const minDx = (building.width / 2) + minDistance;
      const minDz = (building.depth / 2) + minDistance;

      if (dx < minDx && dz < minDz) {
        return true;
      }
    }
    return false;
  }

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x575757);
  scene.add(ambientLight);

  const hemisphereLight = new THREE.HemisphereLight(0xbfd6ff, 0xffe8c2, 0.55);
  hemisphereLight.position.set(0, 60, -200);
  scene.add(hemisphereLight);

  const directionalLight = new THREE.DirectionalLight(0xfff3d6, 1.08);
  directionalLight.position.set(60, 80, -70);
  directionalLight.castShadow = true; // Cast shadows
  directionalLight.shadow.mapSize.width = 512; // Reduced from 1024 for performance
  directionalLight.shadow.mapSize.height = 512; // Reduced from 1024 for performance
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 100;
  directionalLight.shadow.camera.left = -50;
  directionalLight.shadow.camera.right = 50;
  directionalLight.shadow.camera.top = 50;
  directionalLight.shadow.camera.bottom = -50;
  scene.add(directionalLight);

  // Beach area beside the city
  const beachPeople = [];
  let waterPositions;
  let waterBasePositions;
  let waterGeometryRef;

  const beachGroup = new THREE.Group();
  scene.add(beachGroup);

  const beachArea = {
    center: new THREE.Vector3(0, 0, -160),
    width: 110,
    depth: 70
  };

  // Sand
  const sandGeometry = new THREE.PlaneGeometry(beachArea.width, beachArea.depth, 80, 60);
  sandGeometry.rotateX(-Math.PI / 2);
  const sandMaterial = new THREE.MeshStandardMaterial({
    color: 0xefd8a1,
    map: createSandTexture(),
    roughness: 0.95,
    metalness: 0
  });
  const sand = new THREE.Mesh(sandGeometry, sandMaterial);
  sand.position.set(beachArea.center.x, 0.02, beachArea.center.z);
  sand.receiveShadow = true;
  const sandPositions = sandGeometry.attributes.position;
  for (let i = 0; i < sandPositions.count; i++) {
    sandPositions.setY(i, sandPositions.getY(i) + (Math.random() - 0.5) * 0.2);
  }
  sandPositions.needsUpdate = true;
  sandGeometry.computeVertexNormals();
  beachGroup.add(sand);

  // Water stretching to the horizon
  const waterDepth = 200;
  const waterGeometry = new THREE.PlaneGeometry(beachArea.width + 40, waterDepth, 80, 120);
  waterGeometry.rotateX(-Math.PI / 2);
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x4aa3ff,
    transparent: true,
    opacity: 0.68,
    roughness: 0.18,
    metalness: 0.45,
    side: THREE.DoubleSide
  });
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.position.set(beachArea.center.x, 0.01, beachArea.center.z - (beachArea.depth / 2) - waterDepth / 2);
  water.receiveShadow = false;
  beachGroup.add(water);
  waterGeometryRef = waterGeometry;
  waterPositions = waterGeometry.attributes.position;
  waterBasePositions = waterPositions.array.slice();

  function createBeachTowel(position) {
    const towelColors = [
      ['#ff7f50', '#fbe8a6', '#ffffff'],
      ['#64c0ff', '#ffffff', '#ff8fb1'],
      ['#90ee90', '#f2f2f2', '#ffc857']
    ];
    const palette = towelColors[Math.floor(Math.random() * towelColors.length)];
    const towelTexture = createStripedTexture(palette);
    const towel = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.02, 1.1),
      new THREE.MeshStandardMaterial({ map: towelTexture, roughness: 0.7, metalness: 0 })
    );
    towel.position.set(position.x, 0.03, position.z);
    towel.rotation.y = Math.random() * Math.PI;
    towel.receiveShadow = true;
    return towel;
  }

  function createUmbrella(position) {
    const umbrella = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6),
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.25, roughness: 0.6 })
    );
    pole.position.y = 1.1;
    umbrella.add(pole);

    const canopyColors = [0xff6b6b, 0xfeca57, 0x48dbfb, 0x1dd1a1, 0xff9ff3];
    const canopy = new THREE.Mesh(
      new THREE.ConeGeometry(1.25, 0.9, 10),
      new THREE.MeshStandardMaterial({ color: canopyColors[Math.floor(Math.random() * canopyColors.length)], roughness: 0.4, metalness: 0.1 })
    );
    canopy.position.y = 2.0;
    canopy.castShadow = false;
    umbrella.add(canopy);

    umbrella.position.set(position.x, 0, position.z);
    return umbrella;
  }

  function createBeachBall(position) {
    const ballTexture = createStripedTexture(['#ff6b6b', '#ffffff', '#4b7bec', '#feca57']);
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshStandardMaterial({ map: ballTexture, roughness: 0.4, metalness: 0.2 })
    );
    ball.position.set(position.x, 0.35, position.z);
    ball.castShadow = false;
    ball.receiveShadow = true;
    return ball;
  }

  function createBeachPerson(role = 'idle', position = { x: 0, z: 0 }, scale = 1) {
    const person = new THREE.Group();

    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffdfc4, roughness: 0.85 });
    const shirtPalette = [0x3498db, 0xe67e22, 0x1abc9c, 0xff7675, 0x9b59b6, 0xf4c542];
    const shortsPalette = [0x2c3e50, 0x34495e, 0x16a085, 0xd35400, 0x2980b9];
    const shirtMaterial = new THREE.MeshStandardMaterial({ color: shirtPalette[Math.floor(Math.random() * shirtPalette.length)], roughness: 0.7, metalness: 0.1 });
    const shortsMaterial = new THREE.MeshStandardMaterial({ color: shortsPalette[Math.floor(Math.random() * shortsPalette.length)], roughness: 0.8, metalness: 0.05 });

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6);
    legGeometry.translate(0, -0.25, 0); // pivot at hip

    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.08, 0.55, 0);
    const leftLeg = new THREE.Mesh(legGeometry, shortsMaterial);
    leftLegPivot.add(leftLeg);
    person.add(leftLegPivot);

    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0.08, 0.55, 0);
    const rightLeg = new THREE.Mesh(legGeometry, shortsMaterial);
    rightLegPivot.add(rightLeg);
    person.add(rightLegPivot);

    // Torso
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.85, 8), shirtMaterial);
    torso.position.y = 0.95;
    person.add(torso);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6);
    armGeometry.translate(0, -0.25, 0);

    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.22, 1.05, 0);
    const leftArm = new THREE.Mesh(armGeometry, shirtMaterial);
    leftArmPivot.add(leftArm);
    person.add(leftArmPivot);

    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.22, 1.05, 0);
    const rightArm = new THREE.Mesh(armGeometry, shirtMaterial);
    rightArmPivot.add(rightArm);
    person.add(rightArmPivot);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), skinMaterial);
    head.position.y = 1.45;
    person.add(head);

    person.position.set(position.x, 0, position.z);
    person.scale.set(scale, scale, scale);

    person.userData = {
      role,
      base: { x: position.x, z: position.z },
      speed: 0.6 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      arms: [leftArmPivot, rightArmPivot],
      legs: [leftLegPivot, rightLegPivot]
    };

    beachPeople.push(person);
    beachGroup.add(person);
    return person;
  }

  // Beach props
  const umbrellaPositions = [
    { x: -30, z: beachArea.center.z + 10 },
    { x: 20, z: beachArea.center.z - 5 },
    { x: 40, z: beachArea.center.z + 15 },
    { x: -45, z: beachArea.center.z - 10 }
  ];
  umbrellaPositions.forEach(pos => beachGroup.add(createUmbrella(pos)));

  const towelPositions = [
    { x: -32, z: beachArea.center.z + 12 },
    { x: 22, z: beachArea.center.z - 8 },
    { x: 42, z: beachArea.center.z + 17 },
    { x: -43, z: beachArea.center.z - 14 },
    { x: 5, z: beachArea.center.z + 12 }
  ];
  towelPositions.forEach(pos => beachGroup.add(createBeachTowel(pos)));

  beachGroup.add(createBeachBall({ x: 6, z: beachArea.center.z + 12 }));

  // Beach crowd
  createBeachPerson('walk', { x: -20, z: beachArea.center.z + 10 });
  createBeachPerson('walk', { x: 20, z: beachArea.center.z - 15 });
  createBeachPerson('wave', { x: -35, z: beachArea.center.z + 20 });
  createBeachPerson('wave', { x: 35, z: beachArea.center.z - 10 });
  createBeachPerson('run', { x: -5, z: beachArea.center.z + 25 }, 0.85);
  createBeachPerson('idle', { x: 10, z: beachArea.center.z - 2 });
  createBeachPerson('idle', { x: -15, z: beachArea.center.z - 18 });
  createBeachPerson('walk', { x: 45, z: beachArea.center.z + 5 });
  createBeachPerson('run', { x: -35, z: beachArea.center.z - 20 }, 0.8);

  // Street Lamps for realism
  function createStreetLamp() {
    const lamp = new THREE.Group();

    // Pole
    const poleGeometry = new THREE.CylinderGeometry(0.08, 0.1, 3.5, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.4 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 1.75;
    pole.castShadow = false; // Disable shadows for performance
    lamp.add(pole);

    // Lamp head
    const lampHeadGeometry = new THREE.SphereGeometry(0.25, 12, 12);
    const lampHeadMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff8dc,
      emissive: 0xffee88,
      emissiveIntensity: 0.6,
      metalness: 0.2,
      roughness: 0.3
    });
    const lampHead = new THREE.Mesh(lampHeadGeometry, lampHeadMaterial);
    lampHead.position.y = 3.6;
    lamp.add(lampHead);

    // Point light for illumination (reduced intensity for performance)
    const light = new THREE.PointLight(0xfff8dc, 0.3, 6); // Reduced intensity and range
    light.position.y = 3.6;
    light.castShadow = false; // Disable shadow casting for point lights
    lamp.add(light);

    return lamp;
  }

  // Place street lamps along roads at intersections and intervals (reduced for performance)
  const lampInterval = 30; // Increased interval to reduce lamp count
  for (let i = -roadRange; i <= roadRange; i += lampInterval) {
    if (Math.abs(i) < 20) continue; // Skip park

    for (let j = -roadRange; j <= roadRange; j += lampInterval) {
      if (Math.abs(j) < 20) continue; // Skip park
      if (!isInReservedZone(i, j, 5)) {
        // Place lamp at intersection corners
        const lamp1 = createStreetLamp();
        lamp1.position.set(i + 2, 0, j + 2);
        scene.add(lamp1);
      }
    }
  }

  // Traffic Group
  const trafficGroup = new THREE.Group();
  trafficGroup.name = 'trafficGroup';

  // Create realistic 3D car with improved materials
  function createCar(colorHex) {
    const car = new THREE.Group();

    // Car body (main chassis) with reflective paint
    const bodyGeometry = new THREE.BoxGeometry(1.8, 0.6, 0.8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: colorHex,
      metalness: 0.8,
      roughness: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.4;
    car.add(body);

    // Car roof/cabin
    const roofGeometry = new THREE.BoxGeometry(1.2, 0.5, 0.75);
    const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
    roof.position.y = 0.85;
    roof.position.x = -0.2;
    car.add(roof);

    // Windows (darker glass)
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      transparent: true,
      opacity: 0.5,
      metalness: 0.9,
      roughness: 0.05
    });

    // Front windshield
    const frontWindowGeometry = new THREE.PlaneGeometry(0.75, 0.4);
    const frontWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
    frontWindow.position.set(0.4, 0.85, 0.38);
    frontWindow.rotation.y = Math.PI / 2;
    car.add(frontWindow);

    const frontWindowBack = frontWindow.clone();
    frontWindowBack.position.z = -0.38;
    car.add(frontWindowBack);

    // Rear windshield
    const rearWindow = new THREE.Mesh(frontWindowGeometry, windowMaterial);
    rearWindow.position.set(-0.8, 0.85, 0.38);
    rearWindow.rotation.y = Math.PI / 2;
    car.add(rearWindow);

    const rearWindowBack = rearWindow.clone();
    rearWindowBack.position.z = -0.38;
    car.add(rearWindowBack);

    // Wheels
    const wheelRadius = 0.25;
    const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.2, 16);
    const tireMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.9
    });
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.8,
      roughness: 0.2
    });

    const wheelPositions = [
      { x: 0.6, z: 0.55 },   // Front right
      { x: 0.6, z: -0.55 },  // Front left
      { x: -0.6, z: 0.55 },  // Rear right
      { x: -0.6, z: -0.55 }  // Rear left
    ];

    car.userData.wheels = [];
    car.userData.wheelRadius = wheelRadius;

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Group();
      const tire = new THREE.Mesh(wheelGeometry, tireMaterial);
      tire.rotation.x = Math.PI / 2;
      wheel.add(tire);

      const rimGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.21, 16);
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.rotation.x = Math.PI / 2;
      wheel.add(rim);

      wheel.position.set(pos.x, 0.25, pos.z);
      car.add(wheel);
      car.userData.wheels.push(wheel);
    });

    // Headlights with low intensity
    const headlightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const headlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffaa,
      emissive: 0xffff88,
      emissiveIntensity: 0.3
    });

    const headlight1 = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight1.position.set(0.9, 0.35, 0.3);
    car.add(headlight1);

    const headlight2 = new THREE.Mesh(headlightGeometry, headlightMaterial);
    headlight2.position.set(0.9, 0.35, -0.3);
    car.add(headlight2);

    // Taillights
    const taillightMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.2
    });

    const taillight1 = new THREE.Mesh(headlightGeometry, taillightMaterial);
    taillight1.position.set(-0.9, 0.35, 0.3);
    car.add(taillight1);

    const taillight2 = new THREE.Mesh(headlightGeometry, taillightMaterial);
    taillight2.position.set(-0.9, 0.35, -0.3);
    car.add(taillight2);

    // Front Bumper
    const bumperGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.6);
    const bumperMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const bumper = new THREE.Mesh(bumperGeometry, bumperMaterial);
    bumper.position.set(0.9, 0.2, 0);
    car.add(bumper);

    return car;
  }

  // Generate car paths dynamically from actual road positions
  function generateCarPath() {
    const path = [];
    const minPathLength = 4;
    const maxPathLength = 8;
    const pathLength = minPathLength + Math.floor(Math.random() * (maxPathLength - minPathLength));
    
    // Start at a random intersection
    let currentX = verticalRoadPositions[Math.floor(Math.random() * verticalRoadPositions.length)];
    let currentZ = roadPositions[Math.floor(Math.random() * roadPositions.length)];
    
    // Ensure starting point is not in park or stadium
    while ((Math.abs(currentX) < 20 && Math.abs(currentZ) < 20) || 
           (currentX >= stadiumXMin && currentX <= stadiumXMax && currentZ >= stadiumZMin && currentZ <= stadiumZMax)) {
      currentX = verticalRoadPositions[Math.floor(Math.random() * verticalRoadPositions.length)];
      currentZ = roadPositions[Math.floor(Math.random() * roadPositions.length)];
    }
    
    path.push({ x: currentX, z: currentZ });
    
    // Generate path following roads (at intersections, can move along either road)
    for (let i = 1; i < pathLength; i++) {
      const choices = [];
      
      // At current intersection (currentX, currentZ), we can:
      // 1. Move along the horizontal road (keep z, change x to any vertical road)
      // 2. Move along the vertical road (keep x, change z to any horizontal road)
      
      // Option 1: Move along horizontal road (change x)
      for (const x of verticalRoadPositions) {
        if (x !== currentX) {
          // Check if this intersection is valid (not in park/stadium)
          if (!(x >= stadiumXMin && x <= stadiumXMax && currentZ >= stadiumZMin && currentZ <= stadiumZMax) &&
              !(Math.abs(x) < 20 && Math.abs(currentZ) < 20)) {
            choices.push({ x: x, z: currentZ });
          }
        }
      }
      
      // Option 2: Move along vertical road (change z)
      for (const z of roadPositions) {
        if (z !== currentZ) {
          // Check if this intersection is valid (not in park/stadium)
          if (!(currentX >= stadiumXMin && currentX <= stadiumXMax && z >= stadiumZMin && z <= stadiumZMax) &&
              !(Math.abs(currentX) < 20 && Math.abs(z) < 20)) {
            choices.push({ x: currentX, z: z });
          }
        }
      }
      
      if (choices.length === 0) break;
      
      const next = choices[Math.floor(Math.random() * choices.length)];
      path.push(next);
      currentX = next.x;
      currentZ = next.z;
    }
    
    // Close the loop
    if (path.length > 2) {
      path.push(path[0]);
    }
    
    return path;
  }

  // Generate multiple car paths
  const roadPath = generateCarPath();
  const roadPath2 = generateCarPath();
  const roadPath3 = generateCarPath();

  // Create moving cars
  const cars = [];
  const carColors = [0xff0000, 0x0000ff, 0x2c3e50, 0xffffff, 0x27ae60, 0xe74c3c, 0xf39c12, 0x8e44ad];

  for (let i = 0; i < 12; i++) {
    const car = createCar(carColors[i % carColors.length]);

    let path;
    if (i < 4) path = roadPath;
    else if (i < 8) path = roadPath2;
    else path = roadPath3;

    const startIndex = Math.floor(Math.random() * path.length);
    car.position.set(path[startIndex].x, 0.1, path[startIndex].z);

    car.userData.path = path;
    car.userData.pathIndex = startIndex;
    car.userData.speed = 0.04 + Math.random() * 0.03;
    car.userData.wheelRotation = 0;
    car.userData.isMoving = true;

    trafficGroup.add(car);
    cars.push(car);
  }

  // Add parked cars along roads (only on actual road positions)
  const parkedCarPositions = [];
  for (let i = 0; i < 10; i++) {
    let x, z, r;
    let attempts = 0;
    
    do {
      // Choose a random road position
      if (Math.random() > 0.5) {
        // Park on horizontal road
        z = roadPositions[Math.floor(Math.random() * roadPositions.length)];
        x = (Math.random() - 0.5) * (roadRange * 2);
        r = Math.random() > 0.5 ? 0 : Math.PI;
      } else {
        // Park on vertical road
        x = verticalRoadPositions[Math.floor(Math.random() * verticalRoadPositions.length)];
        z = (Math.random() - 0.5) * (roadRange * 2);
        r = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
      }
      attempts++;
    } while ((isInReservedZone(x, z, 2) || (Math.abs(x) < 20 && Math.abs(z) < 20)) && attempts < 20);
    
    if (attempts < 20) {
      parkedCarPositions.push({ x, z, r });
    }
  }

  parkedCarPositions.forEach(pos => {
    const car = createCar(carColors[Math.floor(Math.random() * carColors.length)]);
    car.position.set(pos.x, 0.1, pos.z);
    car.rotation.y = pos.r;
    car.userData.isMoving = false;
    trafficGroup.add(car);
  });

  scene.add(trafficGroup);


  // Create simple bicycle
  function createBicycle(frameColor) {
    const bicycle = new THREE.Group();
    const frameMaterial = new THREE.MeshStandardMaterial({ color: frameColor, metalness: 0.6, roughness: 0.4 });

    // Frame bars
    const barGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6);
    const bar1 = new THREE.Mesh(barGeometry, frameMaterial);
    bar1.position.set(0, 0.3, 0);
    bar1.rotation.z = Math.PI / 4;
    bicycle.add(bar1);

    // Seat
    const seatGeometry = new THREE.BoxGeometry(0.12, 0.04, 0.08);
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.set(-0.1, 0.5, 0);
    bicycle.add(seat);

    // Handlebars
    const handlebarGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6);
    const handlebar = new THREE.Mesh(handlebarGeometry, frameMaterial);
    handlebar.position.set(0.08, 0.55, 0);
    handlebar.rotation.z = Math.PI / 2;
    bicycle.add(handlebar);

    // Wheels
    const wheelRadius = 0.18;
    const wheelGeometry = new THREE.TorusGeometry(wheelRadius, 0.02, 8, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });

    const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontWheel.position.set(0.3, 0.18, 0);
    frontWheel.rotation.y = Math.PI / 2;
    bicycle.add(frontWheel);

    const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    backWheel.position.set(-0.3, 0.18, 0);
    backWheel.rotation.y = Math.PI / 2;
    bicycle.add(backWheel);

    bicycle.scale.set(0.7, 0.7, 0.7);
    return bicycle;
  }

  // Add parked bicycles only on actual road positions
  const bikeColors = [0xff6600, 0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12];
  const parkedBikePositions = [];
  
  for (let i = 0; i < 10; i++) {
    let x, z, r;
    let attempts = 0;
    
    do {
      // Choose a random road position
      if (Math.random() > 0.5) {
        // Park on horizontal road
        z = roadPositions[Math.floor(Math.random() * roadPositions.length)];
        x = (Math.random() - 0.5) * (roadRange * 2);
        r = Math.random() * Math.PI * 2;
      } else {
        // Park on vertical road
        x = verticalRoadPositions[Math.floor(Math.random() * verticalRoadPositions.length)];
        z = (Math.random() - 0.5) * (roadRange * 2);
        r = Math.random() * Math.PI * 2;
      }
      attempts++;
    } while ((isInReservedZone(x, z, 1) || (Math.abs(x) < 20 && Math.abs(z) < 20)) && attempts < 20);
    
    if (attempts < 20) {
      parkedBikePositions.push({ x, z, r });
    }
  }

  parkedBikePositions.forEach(pos => {
    const bike = createBicycle(bikeColors[Math.floor(Math.random() * bikeColors.length)]);
    bike.position.set(pos.x, 0, pos.z);
    bike.rotation.y = pos.r;
    scene.add(bike);
  });

  // Crowd Group - Simple pedestrian figures
  const crowdGroup = new THREE.Group();
  crowdGroup.name = 'crowdGroup';

  function createPerson() {
    const person = new THREE.Group();

    // Clothing colors
    const shirtColors = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c, 0xe67e22, 0x34495e];
    const pantsColors = [0x34495e, 0x2c3e50, 0x7f8c8d, 0x2980b9];
    const shirtColor = shirtColors[Math.floor(Math.random() * shirtColors.length)];
    const pantsColor = pantsColors[Math.floor(Math.random() * pantsColors.length)];

    // Body (capsule-like)
    const bodyGeometry = new THREE.CapsuleGeometry(0.12, 0.4, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.7;
    person.add(body);

    // Legs
    const legGeometry = new THREE.CapsuleGeometry(0.05, 0.35, 4, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.9 });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.06, 0.225, 0);
    person.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.06, 0.225, 0);
    person.add(rightLeg);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.85 });
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 1.05;
    person.add(head);

    // Vary height slightly
    const heightVariation = 0.9 + Math.random() * 0.2;
    person.scale.set(1, heightVariation, 1);

    person.userData.legs = [leftLeg, rightLeg];
    person.userData.walkCycle = Math.random() * Math.PI * 2;

    return person;
  }

  // Place people in logical locations
  const pedestrians = [];

  // Sidewalk walkers
  const sidewalkPositions = roadPositions;
  for (let i = 0; i < 25; i++) {
    const person = createPerson();
    const roadIndex = Math.floor(Math.random() * sidewalkPositions.length);
    const roadPos = sidewalkPositions[roadIndex];
    const isHorizontalRoad = Math.random() > 0.5;

    if (isHorizontalRoad) {
      person.position.set(
        (Math.random() - 0.5) * 80,
        0,
        roadPos + (Math.random() > 0.5 ? 2.5 : -2.5)
      );
      person.userData.direction = Math.random() > 0.5 ? 1 : -1;
      person.userData.axis = 'x';
      person.rotation.y = person.userData.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      person.position.set(
        roadPos + (Math.random() > 0.5 ? 2.5 : -2.5),
        0,
        (Math.random() - 0.5) * 80
      );
      person.userData.direction = Math.random() > 0.5 ? 1 : -1;
      person.userData.axis = 'z';
      person.rotation.y = person.userData.direction > 0 ? 0 : Math.PI;
    }

    person.userData.speed = 0.015 + Math.random() * 0.015;
    crowdGroup.add(person);
    pedestrians.push(person);
  }

  // People near park entrances
  const parkEntrancePositions = [
    { x: 30, z: 0 }, { x: -30, z: 0 }, { x: 0, z: 30 }, { x: 0, z: -30 }
  ];
  parkEntrancePositions.forEach(pos => {
    for (let i = 0; i < 2; i++) {
      const person = createPerson();
      person.position.set(
        pos.x + (Math.random() - 0.5) * 3,
        0,
        pos.z + (Math.random() - 0.5) * 3
      );
      person.rotation.y = Math.random() * Math.PI * 2;
      person.userData.isStatic = true;
      crowdGroup.add(person);
    }
  });

  // People near stadium
  for (let i = 0; i < 8; i++) {
    const person = createPerson();
    const angle = (i / 8) * Math.PI * 2;
    const radius = 35 + Math.random() * 5;
    person.position.set(
      90 + Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );
    person.rotation.y = Math.atan2(-Math.sin(angle), -Math.cos(angle));
    person.userData.isStatic = true;
    crowdGroup.add(person);
  }

  // People near building entrances
  for (let i = 0; i < 15; i++) {
    if (buildingPositions.length === 0) break;
    const building = buildingPositions[Math.floor(Math.random() * buildingPositions.length)];
    const person = createPerson();
    person.position.set(
      building.x + (Math.random() - 0.5) * (building.width + 2),
      0,
      building.z + building.depth / 2 + 1
    );
    person.rotation.y = Math.random() * Math.PI * 2;
    person.userData.isStatic = true;
    crowdGroup.add(person);
  }

  scene.add(crowdGroup);

  // Playable character (single controllable person) - Enhanced with distinctive colors
  function createPlayableCharacter() {
    const player = new THREE.Group();
    player.name = 'playerCharacter';

    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffd7b0, roughness: 0.85 });
    const shirtMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.7 }); // Green shirt to distinguish player
    const pantsMaterial = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.9 });

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8);
    legGeo.translate(0, -0.225, 0);
    const leftLeg = new THREE.Mesh(legGeo, pantsMaterial);
    const rightLeg = new THREE.Mesh(legGeo, pantsMaterial);
    leftLeg.position.set(-0.08, 0.45, 0);
    rightLeg.position.set(0.08, 0.45, 0);
    player.add(leftLeg);
    player.add(rightLeg);

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.22), shirtMaterial);
    torso.position.y = 0.9;
    player.add(torso);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
    armGeo.translate(0, -0.2, 0);
    const leftArm = new THREE.Mesh(armGeo, shirtMaterial);
    const rightArm = new THREE.Mesh(armGeo, shirtMaterial);
    leftArm.position.set(-0.2, 1.0, 0);
    rightArm.position.set(0.2, 1.0, 0);
    player.add(leftArm);
    player.add(rightArm);

    // Hands
    const handGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const leftHand = new THREE.Mesh(handGeo, skinMaterial);
    const rightHand = new THREE.Mesh(handGeo, skinMaterial);
    leftHand.position.set(-0.2, 0.8, 0);
    rightHand.position.set(0.2, 0.8, 0);
    player.add(leftHand);
    player.add(rightHand);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), skinMaterial);
    head.position.y = 1.25;
    player.add(head);

    // Simple hair cap
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.125, 10, 10), new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.8 }));
    hair.scale.set(1.05, 0.65, 1.05);
    hair.position.y = 1.3;
    player.add(hair);

    player.userData.arms = [leftArm, rightArm];
    player.userData.legs = [leftLeg, rightLeg];
    player.userData.walkCycle = 0;
    player.userData.eyeHeight = 1.2;

    return player;
  }

  const player = createPlayableCharacter();
  player.position.set(6, 0, 6);
  scene.add(player);
  controls.target.set(player.position.x, player.position.y + player.userData.eyeHeight, player.position.z);

  const playerMovement = {
    dir: new THREE.Vector3(),
    focus: new THREE.Vector3(),
    walkSpeed: 5.5,
    runSpeed: 9.5,
    // Fixed camera angle settings
    cameraDistance: 8, // Distance behind player
    cameraHeight: 4, // Height above player
    cameraAngle: Math.PI * 0.25 // Angle (45 degrees from behind)
  };

  function updatePlayer(delta, elapsed) {
    // Movement direction relative to camera's current view
    playerMovement.dir.set(
      (playerInput.right ? 1 : 0) - (playerInput.left ? 1 : 0),
      0,
      (playerInput.back ? 1 : 0) - (playerInput.forward ? 1 : 0)
    );

    const moving = playerMovement.dir.lengthSq() > 0;
    if (moving) {
      playerMovement.dir.normalize();
      
      // Get camera's forward and right vectors (relative to camera view)
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0; // Keep movement on horizontal plane
      cameraDirection.normalize();
      
      const cameraRight = new THREE.Vector3();
      cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
      cameraRight.normalize();
      
      // Apply movement relative to camera view
      const moveVector = new THREE.Vector3();
      moveVector.addScaledVector(cameraDirection, -playerMovement.dir.z); // Forward/back
      moveVector.addScaledVector(cameraRight, playerMovement.dir.x); // Left/right
      moveVector.normalize();
      
      const speed = (playerInput.run ? playerMovement.runSpeed : playerMovement.walkSpeed) * delta;
      player.position.addScaledVector(moveVector, speed);
      player.position.y = 0; // lock to ground plane

      // Face travel direction
      player.rotation.y = Math.atan2(moveVector.x, moveVector.z);

      // Limb swing animation
      const swing = Math.sin(elapsed * (playerInput.run ? 10 : 6)) * (playerInput.run ? 0.7 : 0.4);
      player.userData.arms[0].rotation.x = swing;
      player.userData.arms[1].rotation.x = -swing;
      player.userData.legs[0].rotation.x = -swing * 1.1;
      player.userData.legs[1].rotation.x = swing * 1.1;
    } else {
      // Ease limbs back when idling
      player.userData.arms[0].rotation.x *= 0.85;
      player.userData.arms[1].rotation.x *= 0.85;
      player.userData.legs[0].rotation.x *= 0.85;
      player.userData.legs[1].rotation.x *= 0.85;
    }

    // Camera follows player at fixed angle (third-person view)
    if (playerControlMode) {
      // Calculate camera position behind and above player at fixed angle
      const cameraOffsetX = Math.sin(player.rotation.y + playerMovement.cameraAngle) * playerMovement.cameraDistance;
      const cameraOffsetZ = Math.cos(player.rotation.y + playerMovement.cameraAngle) * playerMovement.cameraDistance;
      
      camera.position.set(
        player.position.x - cameraOffsetX,
        player.position.y + playerMovement.cameraHeight,
        player.position.z - cameraOffsetZ
      );
      
      // Camera looks at player's head
      const lookTarget = new THREE.Vector3(
        player.position.x,
        player.position.y + player.userData.eyeHeight,
        player.position.z
      );
      camera.lookAt(lookTarget);
    } else {
      // Orbit camera mode - smooth follow
      playerMovement.focus.set(player.position.x, player.position.y + player.userData.eyeHeight, player.position.z);
      controls.target.lerp(playerMovement.focus, 0.18);
    }
  }


  // Trees and Plants in green fields (Expanded)
  const treeGeometry = new THREE.CylinderGeometry(0.1, 0.3, 2, 8);
  const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown trunk
  const foliageGeometry = new THREE.SphereGeometry(0.8, 8, 8);
  const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Green foliage

  for (let i = 0; i < 80; i++) { // Reduced tree count for performance
    let posX, posZ;
    let attempts = 0;

    // Find position in green field (not on road and not near buildings)
    do {
      posX = (Math.random() - 0.5) * 200; // Expanded range
      posZ = (Math.random() - 0.5) * 200;
      attempts++;

      // Avoid central park specifically for wild trees (park has its own)
      if (Math.abs(posX) < 20 && Math.abs(posZ) < 20) continue;

    } while ((isOnRoad(posX, posZ) || isTooCloseToBuilding(posX, posZ, 1.5) || isInReservedZone(posX, posZ, 1)) && attempts < 100);

    if (attempts >= 100) continue;

    const tree = new THREE.Group();

    // Trunk
    const trunk = new THREE.Mesh(treeGeometry, treeMaterial);
    trunk.position.y = 1;
    trunk.castShadow = false; // Disable shadows for performance
    tree.add(trunk);

    // Foliage
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 2.2;
    foliage.castShadow = false; // Disable shadows for performance
    tree.add(foliage);

    tree.position.set(posX, 0, posZ);
    scene.add(tree);
  }

  // Small plants/bushes
  const bushGeometry = new THREE.SphereGeometry(0.3, 6, 6);
  const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x32CD32 }); // Lime green

  for (let i = 0; i < 150; i++) { // Reduced bush count for performance
    let posX, posZ;
    let attempts = 0;

    do {
      posX = (Math.random() - 0.5) * 200;
      posZ = (Math.random() - 0.5) * 200;
      attempts++;

      // Avoid central park
      if (Math.abs(posX) < 20 && Math.abs(posZ) < 20) continue;

    } while ((isOnRoad(posX, posZ) || isTooCloseToBuilding(posX, posZ, 1) || isInReservedZone(posX, posZ, 1)) && attempts < 100);

    if (attempts >= 100) continue;

    const bush = new THREE.Mesh(bushGeometry, bushMaterial);
    bush.position.set(posX, 0.15, posZ);
    bush.scale.set(0.8 + Math.random() * 0.4, 0.6 + Math.random() * 0.3, 0.8 + Math.random() * 0.4);
    bush.castShadow = false; // Disable shadows for performance
    scene.add(bush);
  }

  // Detailed Park with Swimming Pool
  function createDetailedPark() {
    const parkGroup = new THREE.Group();
    parkGroup.name = 'parkGroup';

    // Park Dimensions
    const parkWidth = 60;
    const parkDepth = 60;

    // 1. Main Grass Area
    const geometry = new THREE.PlaneGeometry(parkWidth, parkDepth, 8, 8);
    const colors = [];
    const c1 = new THREE.Color(0x4caf50); // Green
    const c2 = new THREE.Color(0x66bb6a); // Lighter Green

    const posAttribute = geometry.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
      const color = Math.random() > 0.5 ? c1 : c2;
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const grassMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 1,
      metalness: 0
    });
    const grass = new THREE.Mesh(geometry, grassMaterial);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = 0.02;
    grass.receiveShadow = true;
    parkGroup.add(grass);

    // 2. Walking Paths
    const pathMaterial = new THREE.MeshStandardMaterial({
      color: 0xd7ccc8, // Light stone/concrete
      roughness: 0.9,
      metalness: 0.1
    });

    // Central Plaza
    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 0.04, 32), pathMaterial);
    plaza.position.set(0, 0.03, 0);
    plaza.receiveShadow = true;
    parkGroup.add(plaza);

    // Paths (Cross)
    const pathW = 2.5;
    const pathH = new THREE.Mesh(new THREE.PlaneGeometry(parkWidth, pathW), pathMaterial);
    pathH.rotation.x = -Math.PI / 2;
    pathH.position.y = 0.025;
    pathH.receiveShadow = true;
    parkGroup.add(pathH);

    const pathV = new THREE.Mesh(new THREE.PlaneGeometry(pathW, parkDepth), pathMaterial);
    pathV.rotation.x = -Math.PI / 2;
    pathV.position.y = 0.025;
    pathV.receiveShadow = true;
    parkGroup.add(pathV);

    // 3. Swimming Pool Area (Top Right)
    const poolGroup = new THREE.Group();
    poolGroup.position.set(15, 0, -15);
    parkGroup.add(poolGroup);

    // Deck Construction (surrounding the pool)
    const deckMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.6 });
    const poolW = 12;
    const poolL = 18;
    const deckMargin = 3;
    const totalDeckW = poolW + deckMargin * 2;
    const totalDeckL = poolL + deckMargin * 2;

    // 4 pieces for deck
    const dTop = new THREE.Mesh(new THREE.BoxGeometry(totalDeckW, 0.15, deckMargin), deckMat);
    dTop.position.set(0, 0.075, -poolL / 2 - deckMargin / 2);
    dTop.receiveShadow = true;
    poolGroup.add(dTop);

    const dBottom = new THREE.Mesh(new THREE.BoxGeometry(totalDeckW, 0.15, deckMargin), deckMat);
    dBottom.position.set(0, 0.075, poolL / 2 + deckMargin / 2);
    dBottom.receiveShadow = true;
    poolGroup.add(dBottom);

    const dLeft = new THREE.Mesh(new THREE.BoxGeometry(deckMargin, 0.15, poolL), deckMat);
    dLeft.position.set(-poolW / 2 - deckMargin / 2, 0.075, 0);
    dLeft.receiveShadow = true;
    poolGroup.add(dLeft);

    const dRight = new THREE.Mesh(new THREE.BoxGeometry(deckMargin, 0.15, poolL), deckMat);
    dRight.position.set(poolW / 2 + deckMargin / 2, 0.075, 0);
    dRight.receiveShadow = true;
    poolGroup.add(dRight);

    // Water
    const waterGeo = new THREE.PlaneGeometry(poolW, poolL);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x4fc3f7,
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.2
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.05;
    poolGroup.add(water);

    // Pool Bottom
    const pBot = new THREE.Mesh(waterGeo, new THREE.MeshStandardMaterial({ color: 0x0288d1 }));
    pBot.rotation.x = -Math.PI / 2;
    pBot.position.y = 0.01;
    poolGroup.add(pBot);

    // Pool Fence
    const fenceH = 1.2;
    const fenceGeoH = new THREE.BoxGeometry(totalDeckW, fenceH, 0.1);
    const fenceGeoV = new THREE.BoxGeometry(0.1, fenceH, totalDeckL);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, roughness: 0, metalness: 0.5 });

    const f1 = new THREE.Mesh(fenceGeoH, glassMat);
    f1.position.set(0, fenceH / 2, -totalDeckL / 2);
    poolGroup.add(f1);

    const f2 = new THREE.Mesh(fenceGeoH, glassMat);
    f2.position.set(0, fenceH / 2, totalDeckL / 2);
    poolGroup.add(f2);

    const f3 = new THREE.Mesh(fenceGeoV, glassMat);
    f3.position.set(-totalDeckW / 2, fenceH / 2, 0);
    poolGroup.add(f3);

    // Gate on right side
    const f4a = new THREE.Mesh(new THREE.BoxGeometry(0.1, fenceH, totalDeckL / 2 - 1), glassMat);
    f4a.position.set(totalDeckW / 2, fenceH / 2, -totalDeckL / 4 - 0.5);
    poolGroup.add(f4a);

    const f4b = new THREE.Mesh(new THREE.BoxGeometry(0.1, fenceH, totalDeckL / 2 - 1), glassMat);
    f4b.position.set(totalDeckW / 2, fenceH / 2, totalDeckL / 4 + 0.5);
    poolGroup.add(f4b);

    // Ladders
    const ladderGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2);
    const ladderMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 });
    const l1 = new THREE.Mesh(ladderGeo, ladderMat);
    l1.position.set(0, 0.4, -poolL / 2 + 0.2);
    poolGroup.add(l1);

    // Lounge Chairs
    const chairGeo = new THREE.BoxGeometry(0.6, 0.2, 1.8);
    const chairMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    for (let i = 0; i < 4; i++) {
      const c = new THREE.Mesh(chairGeo, chairMat);
      c.position.set(-poolW / 2 - 1.5, 0.2, -poolL / 2 + 3 + i * 3);
      c.rotation.y = Math.PI / 2;
      c.castShadow = true;
      poolGroup.add(c);
    }

    // 4. Instanced Trees
    const treeTrunkGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.5, 6);
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });
    const treeLeavesGeo = new THREE.DodecahedronGeometry(1.2);
    const treeLeavesMat = new THREE.MeshStandardMaterial({ color: 0x388e3c });

    const treeCount = 20;
    const trunks = new THREE.InstancedMesh(treeTrunkGeo, treeTrunkMat, treeCount);
    const leaves = new THREE.InstancedMesh(treeLeavesGeo, treeLeavesMat, treeCount);

    const dummy = new THREE.Object3D();
    let tIdx = 0;
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * (parkWidth - 4);
      const z = (Math.random() - 0.5) * (parkDepth - 4);

      // Avoid pool area and paths
      if (x > 5 && z < -5) continue; // Pool area approx
      if (Math.abs(x) < 3 || Math.abs(z) < 3) continue; // Paths

      dummy.position.set(x, 0.75, z);
      dummy.scale.setScalar(0.8 + Math.random() * 0.4);
      dummy.updateMatrix();
      trunks.setMatrixAt(tIdx, dummy.matrix);

      dummy.position.y = 2;
      dummy.scale.setScalar(1 + Math.random() * 0.5);
      dummy.updateMatrix();
      leaves.setMatrixAt(tIdx, dummy.matrix);

      tIdx++;
      if (tIdx >= treeCount) break;
    }
    trunks.count = tIdx;
    leaves.count = tIdx;
    trunks.castShadow = true;
    leaves.castShadow = true;
    parkGroup.add(trunks);
    parkGroup.add(leaves);

    // 5. Park Benches
    const benchGeo = new THREE.BoxGeometry(1.5, 0.4, 0.5);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63 });
    const benches = new THREE.InstancedMesh(benchGeo, benchMat, 10);
    let bIdx = 0;

    const benchPos = [
      { x: 5, z: 5, r: Math.PI / 4 }, { x: -5, z: 5, r: -Math.PI / 4 },
      { x: 5, z: -5, r: -Math.PI / 4 }, { x: -5, z: -5, r: Math.PI / 4 },
      { x: 12, z: 2, r: 0 }, { x: -12, z: 2, r: 0 }
    ];

    benchPos.forEach(p => {
      dummy.position.set(p.x, 0.2, p.z);
      dummy.rotation.y = p.r;
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      benches.setMatrixAt(bIdx++, dummy.matrix);
    });
    benches.count = bIdx;
    benches.castShadow = true;
    parkGroup.add(benches);

    // 6. Lamps
    const lampPostGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.5);
    const lampPostMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const lampHeadGeo = new THREE.SphereGeometry(0.2);
    const lampHeadMat = new THREE.MeshStandardMaterial({ color: 0xffeb3b, emissive: 0xffeb3b, emissiveIntensity: 0.5 });

    const lamps = new THREE.InstancedMesh(lampPostGeo, lampPostMat, 8);
    const heads = new THREE.InstancedMesh(lampHeadGeo, lampHeadMat, 8);
    let lIdx = 0;

    const lampPos = [
      { x: 4, z: 4 }, { x: -4, z: 4 }, { x: 4, z: -4 }, { x: -4, z: -4 },
      { x: 20, z: 2 }, { x: -20, z: 2 }, { x: 2, z: 20 }, { x: 2, z: -20 }
    ];

    lampPos.forEach(p => {
      dummy.position.set(p.x, 1.25, p.z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      lamps.setMatrixAt(lIdx, dummy.matrix);

      dummy.position.y = 2.5;
      dummy.updateMatrix();
      heads.setMatrixAt(lIdx, dummy.matrix);

      // Add actual light
      const light = new THREE.PointLight(0xffeb3b, 0.5, 10);
      light.position.set(p.x, 2.4, p.z);
      parkGroup.add(light);

      lIdx++;
    });
    lamps.count = lIdx;
    heads.count = lIdx;
    parkGroup.add(lamps);
    parkGroup.add(heads);

    // 7. Perimeter Fence
    const pFenceGeo = new THREE.BoxGeometry(parkWidth, 0.6, 0.1);
    const pFenceMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });

    // Top
    const pf1 = new THREE.Mesh(pFenceGeo, pFenceMat);
    pf1.position.set(0, 0.3, -parkDepth / 2);
    parkGroup.add(pf1);

    // Bottom
    const pf2 = new THREE.Mesh(pFenceGeo, pFenceMat);
    pf2.position.set(0, 0.3, parkDepth / 2);
    parkGroup.add(pf2);

    // Left (Split for entrance)
    const pf3a = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, parkDepth / 2 - 2), pFenceMat);
    pf3a.position.set(-parkWidth / 2, 0.3, -parkDepth / 4 - 1);
    parkGroup.add(pf3a);

    const pf3b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, parkDepth / 2 - 2), pFenceMat);
    pf3b.position.set(-parkWidth / 2, 0.3, parkDepth / 4 + 1);
    parkGroup.add(pf3b);

    // Right (Split for entrance)
    const pf4a = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, parkDepth / 2 - 2), pFenceMat);
    pf4a.position.set(parkWidth / 2, 0.3, -parkDepth / 4 - 1);
    parkGroup.add(pf4a);

    const pf4b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, parkDepth / 2 - 2), pFenceMat);
    pf4b.position.set(parkWidth / 2, 0.3, parkDepth / 4 + 1);
    parkGroup.add(pf4b);

    scene.add(parkGroup);
  }

  createDetailedPark();

  // Modern stadium complex near city outskirts
  function createStadium() {
    const stadiumGroup = new THREE.Group();
    stadiumGroup.name = 'stadiumGroup';
    const stadiumCenter = new THREE.Vector3(90, 0, 0);
    stadiumGroup.position.copy(stadiumCenter);

    const outerRadiusX = 25;
    const outerRadiusZ = 17;
    const tierCount = 3;
    const seatSegments = 120;
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x9a9ea3, roughness: 0.85, metalness: 0.05 });
    const darkConcreteMat = new THREE.MeshStandardMaterial({ color: 0x6f757c, roughness: 0.9, metalness: 0.05 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xb6bdc7, roughness: 0.45, metalness: 0.55 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x4d6378, roughness: 0.5, metalness: 0.35 });

    // Plinth/base
    // Plinth/base - Open ended to see the pitch
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1.2, 80, 1, true), concreteMat);
    base.scale.set(outerRadiusX, 1.2, outerRadiusZ);
    base.position.y = 0.6;
    base.receiveShadow = true;
    stadiumGroup.add(base);

    // Bowl structure (stepped rings)
    // Bowl structure (stepped rings) - Flaring OUT
    for (let i = 0; i < tierCount; i++) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1.1, 80, 1, true), darkConcreteMat);
      // Flare out: Increase radius with tier
      ring.scale.set(outerRadiusX + i * 4.5, 1.1, outerRadiusZ + i * 3.2);
      ring.position.y = 1.8 + i * 2.7;
      ring.receiveShadow = true;
      stadiumGroup.add(ring);
    }

    // Facade bands
    // Facade bands - Adjusted to surround the widest part
    const maxRadiusX = outerRadiusX + (tierCount - 1) * 4.5;
    const maxRadiusZ = outerRadiusZ + (tierCount - 1) * 3.2;
    const fascia = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.6, 80, 1, true), metalMat);
    fascia.scale.set(maxRadiusX + 1, 0.6, maxRadiusZ + 1);
    fascia.position.y = 1.8 + tierCount * 2.7 + 0.2;
    fascia.receiveShadow = true;
    stadiumGroup.add(fascia);

    // Seating instancing - aligned INSIDE the bowl tiers
    const seatGeometry = new THREE.BoxGeometry(0.5, 0.25, 0.5);
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.55, metalness: 0.1 });
    const seatMesh = new THREE.InstancedMesh(seatGeometry, seatMaterial, seatSegments * tierCount);
    const seatDummy = new THREE.Object3D();
    let seatIndex = 0;

    for (let tier = 0; tier < tierCount; tier++) {
      // Position seats INSIDE the stadium rings/tiers
      // Seats should be at a smaller radius than the outer wall
      const tierRadiusX = outerRadiusX + tier * 4.5;
      const tierRadiusZ = outerRadiusZ + tier * 3.2;

      // Place seats 3-4 units inside the tier wall
      const seatRadiusX = tierRadiusX - 3.5;
      const seatRadiusZ = tierRadiusZ - 2.5;

      // Height matches the tier elevation
      const height = 1.8 + tier * 2.7 + 0.3;

      for (let s = 0; s < seatSegments; s++) {
        const angle = (s / seatSegments) * Math.PI * 2;
        const x = Math.cos(angle) * seatRadiusX;
        const z = Math.sin(angle) * seatRadiusZ;
        seatDummy.position.set(x, height, z);
        seatDummy.rotation.y = Math.atan2(z, x) + Math.PI / 2;
        seatDummy.updateMatrix();
        seatMesh.setMatrixAt(seatIndex++, seatDummy.matrix);
      }
    }
    seatMesh.instanceMatrix.needsUpdate = true;
    stadiumGroup.add(seatMesh);

    // Facade vertical fins via instancing
    const finGeometry = new THREE.BoxGeometry(0.9, 7.2, 1);
    const finMaterial = new THREE.MeshStandardMaterial({ color: 0xd1d4d9, roughness: 0.55, metalness: 0.5 });
    const finCount = 120;
    const finMesh = new THREE.InstancedMesh(finGeometry, finMaterial, finCount);
    const finDummy = new THREE.Object3D();
    for (let i = 0; i < finCount; i++) {
      const angle = (i / finCount) * Math.PI * 2;
      const x = Math.cos(angle) * (maxRadiusX + 1.5);
      const z = Math.sin(angle) * (maxRadiusZ + 1.5);
      const y = 4 + Math.sin(angle * 3) * 0.5;
      finDummy.position.set(x, y, z);
      finDummy.rotation.y = Math.atan2(z, x) + Math.PI / 2;
      finDummy.updateMatrix();
      finMesh.setMatrixAt(i, finDummy.matrix);
    }
    finMesh.instanceMatrix.needsUpdate = true;
    stadiumGroup.add(finMesh);

    // Pitch
    const pitch = new THREE.Mesh(new THREE.PlaneGeometry(20, 30), new THREE.MeshStandardMaterial({ color: 0x2f9e44, roughness: 0.95, metalness: 0.05 }));
    pitch.rotation.x = -Math.PI / 2;
    pitch.position.y = 1.05;
    pitch.receiveShadow = true;
    stadiumGroup.add(pitch);

    const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, metalness: 0 });
    const midLine = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 30), lineMaterial);
    midLine.rotation.x = -Math.PI / 2;
    midLine.position.y = 1.06;
    stadiumGroup.add(midLine);

    const centerCircle = new THREE.Mesh(new THREE.RingGeometry(3, 3.2, 64), lineMaterial);
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.y = 1.06;
    stadiumGroup.add(centerCircle);

    function addPenaltyBox(zSign) {
      const boxDepth = 5;
      const boxWidth = 12;
      const lineThickness = 0.12;
      const y = 1.06;
      const goalZ = zSign * (30 / 2);
      const frontZ = zSign * (30 / 2 - boxDepth);
      const depth = Math.abs(goalZ - frontZ);
      const midZ = (goalZ + frontZ) / 2;

      const front = new THREE.Mesh(new THREE.BoxGeometry(boxWidth, 0.01, lineThickness), lineMaterial);
      front.position.set(0, y, frontZ);
      stadiumGroup.add(front);

      const sideLeft = new THREE.Mesh(new THREE.BoxGeometry(lineThickness, 0.01, depth), lineMaterial);
      sideLeft.position.set(-boxWidth / 2, y, midZ);
      stadiumGroup.add(sideLeft);

      const sideRight = sideLeft.clone();
      sideRight.position.x = boxWidth / 2;
      stadiumGroup.add(sideRight);
    }

    addPenaltyBox(-1);
    addPenaltyBox(1);

    // Goals
    function createGoal(zOffset) {
      const goal = new THREE.Group();
      const postMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.2 });
      const postThickness = 0.15;
      const goalWidth = 2.4;
      const goalHeight = 0.8;

      const leftPost = new THREE.Mesh(new THREE.BoxGeometry(postThickness, goalHeight, postThickness), postMaterial);
      leftPost.position.set(-goalWidth / 2, goalHeight / 2, 0);
      goal.add(leftPost);

      const rightPost = leftPost.clone();
      rightPost.position.x = goalWidth / 2;
      goal.add(rightPost);

      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(goalWidth + postThickness, postThickness, postThickness), postMaterial);
      crossbar.position.set(0, goalHeight, 0);
      goal.add(crossbar);

      const net = new THREE.Mesh(
        new THREE.PlaneGeometry(goalWidth, goalHeight),
        new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, roughness: 0.8, metalness: 0 })
      );
      const netOffset = zOffset < 0 ? -0.5 : 0.5;
      net.position.set(0, goalHeight / 2, netOffset);
      net.rotation.y = zOffset < 0 ? Math.PI : 0;
      goal.add(net);

      goal.position.set(0, 1.05, zOffset);
      return goal;
    }

    stadiumGroup.add(createGoal(-30 / 2 + 0.5));
    stadiumGroup.add(createGoal(30 / 2 - 0.5));

    // Interior tunnels/stairs
    const tunnelMaterial = new THREE.MeshStandardMaterial({ color: 0x7c7f86, roughness: 0.9, metalness: 0.05 });
    const tunnel1 = new THREE.Mesh(new THREE.BoxGeometry(5, 1.8, 7), tunnelMaterial);
    tunnel1.position.set(-12, 1.8, 0);
    stadiumGroup.add(tunnel1);
    const tunnel2 = tunnel1.clone();
    tunnel2.position.x = 12;
    stadiumGroup.add(tunnel2);
    const tunnel3 = tunnel1.clone();
    tunnel3.position.set(0, 1.8, -12);
    stadiumGroup.add(tunnel3);
    const tunnel4 = tunnel1.clone();
    tunnel4.position.set(0, 1.8, 12);
    stadiumGroup.add(tunnel4);

    // Entrances and counters
    function createEntrance() {
      const entrance = new THREE.Group();
      const frame = new THREE.Mesh(new THREE.BoxGeometry(6, 3, 1.2), concreteMat);
      frame.position.y = 1.5;
      entrance.add(frame);
      const counter = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.7, 1.2), accentMat);
      counter.position.set(0, 0.35, 1.3);
      entrance.add(counter);
      return entrance;
    }

    const northEntrance = createEntrance();
    northEntrance.position.set(0, 0, outerRadiusZ + 1.8);
    stadiumGroup.add(northEntrance);

    const southEntrance = createEntrance();
    southEntrance.position.set(0, 0, -outerRadiusZ - 1.8);
    southEntrance.rotation.y = Math.PI;
    stadiumGroup.add(southEntrance);

    // Access paths
    const asphaltMaterial = new THREE.MeshStandardMaterial({ color: 0x3b3b3b, roughness: 0.92, metalness: 0.05 });
    const pathNorth = new THREE.Mesh(new THREE.PlaneGeometry(12, 14), asphaltMaterial);
    pathNorth.rotation.x = -Math.PI / 2;
    pathNorth.position.set(0, 0.04, outerRadiusZ + 4);
    pathNorth.receiveShadow = true;
    stadiumGroup.add(pathNorth);

    const pathEast = new THREE.Mesh(new THREE.PlaneGeometry(18, 8), asphaltMaterial);
    pathEast.rotation.x = -Math.PI / 2;
    pathEast.position.set(outerRadiusX - 8, 0.04, -4);
    pathEast.receiveShadow = true;
    stadiumGroup.add(pathEast);

    const plaza = new THREE.Mesh(new THREE.PlaneGeometry(18, 12), new THREE.MeshStandardMaterial({ color: 0xc8b7a6, roughness: 0.95, metalness: 0 }));
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, 0.041, outerRadiusZ + 6);
    stadiumGroup.add(plaza);

    // Floodlight towers
    function createFloodlight(x, z) {
      const tower = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 16, 10), metalMat);
      pole.position.y = 8;
      tower.add(pole);

      const head = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 1.2), accentMat);
      head.position.y = 16.8;
      head.position.x = 0;
      tower.add(head);

      const target = new THREE.Object3D();
      target.position.set(0, 0, 0);
      tower.add(target);

      for (let i = 0; i < 4; i++) {
        const light = new THREE.SpotLight(0xffffff, 0.55, 120, Math.PI / 4, 0.35);
        light.position.set(0.5 - i * 0.35, 17, 0.2);
        light.target = target;
        light.castShadow = false;
        tower.add(light);
      }

      tower.position.set(x, 0, z);
      return tower;
    }

    const lightOffsetX = outerRadiusX + 8;
    const lightOffsetZ = outerRadiusZ + 10;
    stadiumGroup.add(createFloodlight(lightOffsetX, lightOffsetZ));
    stadiumGroup.add(createFloodlight(-lightOffsetX, lightOffsetZ));
    stadiumGroup.add(createFloodlight(lightOffsetX, -lightOffsetZ));
    stadiumGroup.add(createFloodlight(-lightOffsetX, -lightOffsetZ));

    // Subtle ring light
    const ringLight = new THREE.PointLight(0xffffff, 0.25, 140);
    ringLight.position.set(0, 9.5, 0);
    stadiumGroup.add(ringLight);

    // Connector from park to stadium
    const parkEdgeX = (0 + 45 / 2); // Park east edge since park centered at origin
    const stadiumWestX = stadiumCenter.x - outerRadiusX - 2;
    const connectorLength = Math.max(6, stadiumWestX - parkEdgeX);
    const connector = new THREE.Mesh(
      new THREE.PlaneGeometry(connectorLength, 6),
      asphaltMaterial
    );
    connector.rotation.x = -Math.PI / 2;
    connector.position.set(parkEdgeX + connectorLength / 2, 0.04, -2);
    connector.receiveShadow = true;
    stadiumGroup.add(connector);

    // Add to scene
    scene.add(stadiumGroup);
  }

  createStadium();

  // Birds
  const birds = [];
  const birdGeometry = new THREE.ConeGeometry(0.1, 0.3, 8); // Smaller birds for scale
  const birdMaterial = new THREE.MeshStandardMaterial({ color: 0xffaa00 });

  for (let i = 0; i < 15; i++) { // Reduced bird count for performance
    const bird = new THREE.Mesh(birdGeometry, birdMaterial);

    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 30;
    const height = 8 + Math.random() * 10;
    const speed = 0.005 + Math.random() * 0.01;

    bird.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );

    bird.rotation.x = Math.PI / 2;
    bird.rotation.z = angle + Math.PI;

    bird.userData = { angle, radius, height, speed };

    scene.add(bird);
    birds.push(bird);
  }

  // Create pedestrian/person - More realistic model
  function createPerson() {
    const person = new THREE.Group();

    // Random clothing colors
    const shirtColors = [0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c, 0xe67e22];
    const pantsColors = [0x34495e, 0x2c3e50, 0x7f8c8d, 0x2980b9, 0x16a085];
    const shirtColor = shirtColors[Math.floor(Math.random() * shirtColors.length)];
    const pantsColor = pantsColors[Math.floor(Math.random() * pantsColors.length)];

    // Legs (lower body)
    const legGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8);
    const legMaterial = new THREE.MeshStandardMaterial({ color: pantsColor });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.07, 0.225, 0);
    leftLeg.castShadow = false; // Disable shadows for performance
    person.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.07, 0.225, 0);
    rightLeg.castShadow = false; // Disable shadows for performance
    person.add(rightLeg);

    // Torso (upper body)
    const torsoGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.5, 8);
    const torsoMaterial = new THREE.MeshStandardMaterial({ color: shirtColor });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.y = 0.7;
    torso.castShadow = false; // Disable shadows for performance
    person.add(torso);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6);
    armGeometry.translate(0, -0.2, 0); // Pivot at the shoulder
    const armMaterial = new THREE.MeshStandardMaterial({ color: shirtColor });
    const handGeometry = new THREE.SphereGeometry(0.04, 6, 6);
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.16, 0.7, 0);
    leftArm.rotation.z = 0; // Keep arms aligned to torso
    person.add(leftArm); // Attach to person group, not torso, to avoid scaling issues if torso is scaled

    const leftArmMesh = new THREE.Mesh(armGeometry, armMaterial);
    leftArmMesh.castShadow = false; // Disable shadows for performance
    leftArm.add(leftArmMesh);

    const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
    leftHand.position.y = -0.4;
    leftHand.castShadow = false; // Disable shadows for performance
    leftArm.add(leftHand);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.16, 0.7, 0);
    rightArm.rotation.z = 0; // Keep arms aligned to torso
    person.add(rightArm);

    const rightArmMesh = new THREE.Mesh(armGeometry, armMaterial);
    rightArmMesh.castShadow = false; // Disable shadows for performance
    rightArm.add(rightArmMesh);

    const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
    rightHand.position.y = -0.4;
    rightHand.castShadow = false; // Disable shadows for performance
    rightArm.add(rightHand);

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.08, 6);
    const neck = new THREE.Mesh(neckGeometry, skinMaterial);
    neck.position.y = 0.99;
    neck.castShadow = false; // Disable shadows for performance
    person.add(neck);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.12, 12, 12);
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 1.12;
    head.castShadow = false; // Disable shadows for performance
    person.add(head);

    // Hair
    const hairColors = [0x1a1a1a, 0x3d2817, 0x8b4513, 0xdaa520, 0xff6347];
    const hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
    const hairGeometry = new THREE.SphereGeometry(0.13, 12, 12);
    const hairMaterial = new THREE.MeshStandardMaterial({ color: hairColor });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 1.17;
    hair.scale.set(1, 0.8, 1);
    hair.castShadow = false; // Disable shadows for performance
    person.add(hair);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.02, 6, 6);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.04, 1.13, 0.11);
    person.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.04, 1.13, 0.11);
    person.add(rightEye);

    // Store references for animation
    person.userData.legs = [leftLeg, rightLeg];
    person.userData.arms = [leftArm, rightArm];
    person.userData.walkCycle = 0;

    return person;
  }


  const clock = new THREE.Clock();

  function draw() {
    // Check if WebGL context is lost
    if (renderer.getContext().isContextLost()) {
      console.warn('WebGL context is lost, stopping animation');
      stop();
      return;
    }

    const delta = clock.getDelta();
    const elapsed = clock.elapsedTime;

    updatePlayer(delta, elapsed);
    
    // Only update orbit controls when not in player control mode
    if (!playerControlMode) {
      controls.update();
    }

    // Animate ocean waves
    if (waterPositions && waterBasePositions && waterGeometryRef) {
      for (let i = 0; i < waterPositions.count; i++) {
        const ix = i * 3;
        const x = waterBasePositions[ix];
        const z = waterBasePositions[ix + 2];
        const wave = Math.sin(x * 0.08 + elapsed * 1.1) * 0.15 + Math.cos(z * 0.05 + elapsed * 0.9) * 0.12;
        waterPositions.setY(i, wave);
      }
      waterPositions.needsUpdate = true;
      waterGeometryRef.computeVertexNormals();
    }

    // Animate people on the beach
    beachPeople.forEach(person => {
      const { role, base, speed, phase, arms, legs } = person.userData;
      const t = elapsed * speed + phase;

      if (role === 'walk') {
        const sway = Math.sin(t) * 2.4;
        person.position.x = base.x + sway;
        person.position.z = base.z + Math.cos(t * 0.5) * 0.8;
        arms[0].rotation.x = -0.35 + Math.sin(t + Math.PI) * 0.4;
        arms[1].rotation.x = -0.35 + Math.sin(t) * 0.4;
        arms[0].rotation.z = 0;
        arms[1].rotation.z = 0;
        legs[0].rotation.x = Math.sin(t + Math.PI) * 0.5;
        legs[1].rotation.x = Math.sin(t) * 0.5;
      } else if (role === 'wave') {
        person.position.x = base.x;
        person.position.z = base.z;
        arms[1].rotation.x = -0.2;
        arms[1].rotation.z = 0.5 + Math.sin(t * 2.4) * 0.65;
        arms[0].rotation.x = -0.35 + Math.sin(t * 0.8 + Math.PI) * 0.15;
        arms[0].rotation.z = 0;
        legs[0].rotation.x = Math.sin(t * 0.8) * 0.12;
        legs[1].rotation.x = Math.sin(t * 0.8 + Math.PI) * 0.12;
      } else if (role === 'run') {
        const radius = 4 + Math.sin(t * 0.3) * 1.6;
        person.position.x = base.x + Math.cos(t * 2) * radius;
        person.position.z = base.z + Math.sin(t * 2) * (radius * 0.65);
        arms[0].rotation.x = -0.15 + Math.sin(t * 2 + Math.PI) * 0.75;
        arms[1].rotation.x = -0.15 + Math.sin(t * 2) * 0.75;
        arms[0].rotation.z = 0;
        arms[1].rotation.z = 0;
        legs[0].rotation.x = Math.sin(t * 2 + Math.PI) * 0.85;
        legs[1].rotation.x = Math.sin(t * 2) * 0.85;
      } else {
        person.position.x = base.x;
        person.position.z = base.z;
        person.position.y = Math.sin(t * 0.6) * 0.03;
        arms[0].rotation.x = -0.25 + Math.sin(t * 0.8 + Math.PI) * 0.15;
        arms[1].rotation.x = -0.25 + Math.sin(t * 0.8) * 0.15;
        arms[0].rotation.z = 0;
        arms[1].rotation.z = 0;
        legs[0].rotation.x = Math.sin(t * 0.8 + Math.PI) * 0.1;
        legs[1].rotation.x = Math.sin(t * 0.8) * 0.1;
      }
    });

    // Animate all cars
    cars.forEach(car => {
      if (!car.userData.isMoving) return; // Skip parked cars

      const path = car.userData.path;
      const targetPoint = path[car.userData.pathIndex];
      const dx = targetPoint.x - car.position.x;
      const dz = targetPoint.z - car.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance > 0.5) {
        // Move towards target
        const normX = dx / distance;
        const normZ = dz / distance;
        const moveX = normX * car.userData.speed;
        const moveZ = normZ * car.userData.speed;

        car.position.x += moveX;
        car.position.z += moveZ;

        // Rotate car to face movement direction
        const angle = Math.atan2(dz, dx);
        car.rotation.y = angle;

        // Rotate wheels using actual travel distance so they never look reversed
        const travel = Math.sqrt(moveX * moveX + moveZ * moveZ);
        car.userData.wheelRotation += travel / car.userData.wheelRadius;
        car.userData.wheels.forEach(wheel => {
          wheel.rotation.z = -car.userData.wheelRotation;
        });
      } else {
        // Move to next point in path
        car.userData.pathIndex = (car.userData.pathIndex + 1) % path.length;
      }
    });


    // Animate birds
    birds.forEach(bird => {
      bird.userData.angle += bird.userData.speed;

      bird.position.x = Math.cos(bird.userData.angle) * bird.userData.radius;
      bird.position.z = Math.sin(bird.userData.angle) * bird.userData.radius;

      bird.rotation.z = -bird.userData.angle;
    });

    // Animate pedestrians
    pedestrians.forEach(person => {
      if (person.userData.isStatic) {
        // Static people just bob slightly
        person.userData.walkCycle += 0.05;
        person.position.y = Math.sin(person.userData.walkCycle) * 0.02;
        return;
      }

      // Walking animation (simple leg swing)
      person.userData.walkCycle += 0.1;
      person.userData.legs[0].rotation.x = Math.sin(person.userData.walkCycle) * 0.2;
      person.userData.legs[1].rotation.x = Math.sin(person.userData.walkCycle + Math.PI) * 0.2;

      // Move along sidewalk
      if (person.userData.axis === 'x') {
        person.position.x += person.userData.speed * person.userData.direction;
        if (person.position.x > 50) person.position.x = -50;
        if (person.position.x < -50) person.position.x = 50;
      } else {
        person.position.z += person.userData.speed * person.userData.direction;
        if (person.position.z > 50) person.position.z = -50;
        if (person.position.z < -50) person.position.z = 50;
      }
    });

    renderer.render(scene, camera);
  }

  function start() {
    renderer.setAnimationLoop(draw);
  }

  function stop() {
    renderer.setAnimationLoop(null);
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = gameWindow.offsetWidth / gameWindow.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
  });

  return {
    start,
    stop,
  }
}
