import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createScene() {
  const gameWindow = document.getElementById('render-target');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB); // Sky blue background
  scene.fog = new THREE.FogExp2(0x87CEEB, 0.02); // Add fog

  // City sizing
  const citySize = 250;

  const camera = new THREE.PerspectiveCamera(75, gameWindow.offsetWidth / gameWindow.offsetHeight, 0.1, 1000);
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(gameWindow.offsetWidth, gameWindow.offsetHeight);
  renderer.shadowMap.enabled = true; // Enable shadows
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  gameWindow.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Helper to create window texture
  function createWindowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 64;
    const context = canvas.getContext('2d');

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
  const roadPositions = [];
  for (let i = -roadRange; i <= roadRange; i += roadSpacing) {
    // Skip central park area
    if (Math.abs(i) < 20) continue;

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
    // const roadPositions = [-30, -15, 0, 15, 30]; // Now dynamic
    const roadHalfWidth = roadWidth / 2 + 1; // Add buffer

    for (let roadPos of roadPositions) {
      // Check horizontal roads
      if (Math.abs(z - roadPos) < roadHalfWidth) {
        return true;
      }
      // Check vertical roads
      if (Math.abs(x - roadPos) < roadHalfWidth) {
        return true;
      }
    }
    return false;
  }

  // Zones to reserve for landmarks (park, stadium) so buildings/trees/bushes don't intrude
  const reservedZones = [
    { x: 0, z: 0, w: 70, h: 70 },     // Expanded park area with generous buffer
    { x: -70, z: 60, w: 36, h: 32 }   // Stadium area with buffer
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

  // Buildings - store positions for collision detection
  const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
  const windowTexture = createWindowTexture();
  const buildingPositions = []; // Store building positions and sizes

  // Load Logo Texture
  const logoTexture = new THREE.TextureLoader().load('assest/logo.png');

  for (let i = 0; i < 300; i++) { // Increased building count
    let posX, posZ;
    let attempts = 0;

    // Find a position that's not on a road AND not in reserved zones
    do {
      posX = (Math.random() - 0.5) * (citySize - 40);
      posZ = (Math.random() - 0.5) * (citySize - 40);
      attempts++;

      // Central Park Exclusion Zone (-20 to 20)
      if (Math.abs(posX) < 20 && Math.abs(posZ) < 20) {
        // Force retry if in park
        continue;
      }

    } while ((isOnRoad(posX, posZ) || isInReservedZone(posX, posZ, 2)) && attempts < 50);

    const height = Math.random() * 5 + 2;
    const scaleX = 1 + Math.random();
    const scaleZ = 1 + Math.random();

    // Check for collision with existing buildings
    let overlap = false;
    for (const b of buildingPositions) {
      const dx = Math.abs(posX - b.x);
      const dz = Math.abs(posZ - b.z);
      // Minimum distance required (half width of both + buffer)
      if (dx < (scaleX + b.width) / 2 + 1 && dz < (scaleZ + b.depth) / 2 + 1) {
        overlap = true;
        break;
      }
    }

    if (overlap) continue;

    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: Math.random() * 0x444444 + 0x888888, // Greyish colors
      map: windowTexture
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);

    building.position.x = posX;
    building.position.z = posZ;
    building.position.y = height / 2;
    building.scale.set(scaleX, height, scaleZ);

    building.castShadow = true; // Cast shadows
    building.receiveShadow = true; // Receive shadows

    scene.add(building);

    // Add Logo to some buildings (e.g., 10% chance)
    if (Math.random() < 0.1) {
      const logoGeometry = new THREE.PlaneGeometry(0.8, 0.8);
      const logoMaterial = new THREE.MeshStandardMaterial({
        map: logoTexture,
        transparent: true,
        side: THREE.DoubleSide
      });
      const logo = new THREE.Mesh(logoGeometry, logoMaterial);

      // Place flat on roof to avoid floating
      logo.rotation.x = -Math.PI / 2;
      logo.position.set(0, 0.51, 0); // Just above the roof surface

      // Counter-scale to keep logo size consistent regardless of building scale
      logo.scale.set(1 / scaleX, 1 / scaleZ, 1);

      building.add(logo);
    }

    // Add Door
    const doorGeometry = new THREE.PlaneGeometry(0.6, 1.2);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3c31 }); // Dark wood color
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    // Neutralize parent scale so doors stay human-sized
    door.scale.set(1 / scaleX, 1 / height, 1 / scaleZ);

    // Position door at bottom center of one side (accounting for parent scale)
    if (scaleX > scaleZ) {
      door.position.set(0, (-height / 2 + 0.6) / height, (scaleZ / 2 + 0.01) / scaleZ);
    } else {
      door.position.set((scaleX / 2 + 0.01) / scaleX, (-height / 2 + 0.6) / height, 0);
      door.rotation.y = Math.PI / 2;
    }
    building.add(door);

    // Store building position and size for collision detection
    buildingPositions.push({
      x: posX,
      z: posZ,
      width: scaleX,
      depth: scaleZ
    });
  }

  // Traffic Lights and Zebra Crossings
  const intersectionPositions = [];
  // const roadCoords = [-30, -15, 0, 15, 30];
  const roadCoords = roadPositions;

  // Find intersections
  for (let x of roadCoords) {
    for (let z of roadCoords) {
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
    tl.castShadow = true;
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
  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(20, 30, 10);
  directionalLight.castShadow = true; // Cast shadows
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 100;
  directionalLight.shadow.camera.left = -50;
  directionalLight.shadow.camera.right = 50;
  directionalLight.shadow.camera.top = 50;
  directionalLight.shadow.camera.bottom = -50;
  scene.add(directionalLight);

  // Street Lamps for realism
  function createStreetLamp() {
    const lamp = new THREE.Group();

    // Pole
    const poleGeometry = new THREE.CylinderGeometry(0.08, 0.1, 3.5, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.4 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 1.75;
    pole.castShadow = true;
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

    // Point light for illumination
    const light = new THREE.PointLight(0xfff8dc, 0.5, 8);
    light.position.y = 3.6;
    lamp.add(light);

    return lamp;
  }

  // Place street lamps along roads at intersections and intervals
  const lampInterval = 15;
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

  // Create realistic 3D car
  function createCar() {
    const car = new THREE.Group();

    // Car body (main chassis)
    const bodyGeometry = new THREE.BoxGeometry(1.8, 0.6, 0.8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      metalness: 0.7,
      roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.4;
    body.castShadow = true;
    car.add(body);

    // Car roof/cabin
    const roofGeometry = new THREE.BoxGeometry(1.2, 0.5, 0.75);
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0xcc0000,
      metalness: 0.6,
      roughness: 0.4
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 0.85;
    roof.position.x = -0.2;
    roof.castShadow = true;
    car.add(roof);

    // Windows (transparent)
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.3,
      metalness: 0.9,
      roughness: 0.1
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

    // Wheels - Fixed positioning to be visible outside body
    // Wheels - Fixed positioning and orientation (Axle along Z)
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

      // Tire - Rotate X 90 to align cylinder with Z axis
      const tire = new THREE.Mesh(wheelGeometry, tireMaterial);
      tire.rotation.x = Math.PI / 2;
      tire.castShadow = true;
      wheel.add(tire);

      // Rim
      const rimGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.21, 16);
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.rotation.x = Math.PI / 2;
      wheel.add(rim);

      wheel.position.set(pos.x, 0.25, pos.z);
      car.add(wheel);
      car.userData.wheels.push(wheel);
    });

    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const headlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffaa,
      emissive: 0xffff88,
      emissiveIntensity: 0.5
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
      emissiveIntensity: 0.3
    });

    const taillight1 = new THREE.Mesh(headlightGeometry, taillightMaterial);
    taillight1.position.set(-0.9, 0.35, 0.3);
    car.add(taillight1);

    const taillight2 = new THREE.Mesh(headlightGeometry, taillightMaterial);
    taillight2.position.set(-0.9, 0.35, -0.3);
    car.add(taillight2);

    // Front Bumper (Grille)
    const bumperGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.6);
    const bumperMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const bumper = new THREE.Mesh(bumperGeometry, bumperMaterial);
    bumper.position.set(0.9, 0.2, 0);
    car.add(bumper);

    return car;
  }

  // Create bicycle
  function createBicycle() {
    const bicycle = new THREE.Group();

    // Frame
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xff6600, metalness: 0.6 });

    // Main frame bars
    const barGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8);
    const bar1 = new THREE.Mesh(barGeometry, frameMaterial);
    bar1.position.set(0, 0.4, 0);
    bar1.rotation.z = Math.PI / 4;
    bicycle.add(bar1);

    const bar2 = new THREE.Mesh(barGeometry, frameMaterial);
    bar2.position.set(-0.2, 0.3, 0);
    bar2.rotation.z = -Math.PI / 3;
    bicycle.add(bar2);

    // Seat
    const seatGeometry = new THREE.BoxGeometry(0.15, 0.05, 0.1);
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.set(-0.15, 0.64, 0);
    bicycle.add(seat);

    // Handlebars
    const handlebarGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
    const handlebar = new THREE.Mesh(handlebarGeometry, frameMaterial);
    handlebar.position.set(0.1, 0.72, 0);
    handlebar.rotation.z = Math.PI / 2;
    bicycle.add(handlebar);

    // Wheels - Fixed to use proper cylinder geometry and orientation
    const wheelRadius = 0.2;
    const wheelWidth = 0.05;
    const wheelGeometry = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
    const spokeMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });

    // Front wheel
    const frontWheel = new THREE.Group();
    // Rotate tire X 90 to align with Z
    const frontTire = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontTire.rotation.x = Math.PI / 2;
    frontTire.castShadow = true;
    frontWheel.add(frontTire);

    // Front wheel spokes
    for (let i = 0; i < 8; i++) {
      const spokeGeometry = new THREE.BoxGeometry(0.01, wheelRadius * 1.8, 0.01);
      const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial);
      // Spokes rotate around Z (axle)
      spoke.rotation.x = (i * Math.PI) / 4;
      frontWheel.add(spoke);
    }

    frontWheel.position.set(0.4, 0.2, 0);
    bicycle.add(frontWheel);

    // Back wheel
    const backWheel = new THREE.Group();
    const backTire = new THREE.Mesh(wheelGeometry, wheelMaterial);
    backTire.rotation.x = Math.PI / 2;
    backTire.castShadow = true;
    backWheel.add(backTire);

    // Back wheel spokes
    for (let i = 0; i < 8; i++) {
      const spokeGeometry = new THREE.BoxGeometry(0.01, wheelRadius * 1.8, 0.01);
      const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial);
      spoke.rotation.x = (i * Math.PI) / 4;
      backWheel.add(spoke);
    }

    backWheel.position.set(-0.4, 0.2, 0);
    bicycle.add(backWheel);

    bicycle.scale.set(0.8, 0.8, 0.8);
    bicycle.userData.wheels = [frontWheel, backWheel];
    bicycle.userData.wheelRadius = wheelRadius * bicycle.scale.x;

    // Add Cyclist
    const cyclist = new THREE.Group();

    // Cyclist Body
    const bodyGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.45, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red shirt
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(-0.15, 0.75, 0); // Adjusted position to sit properly
    body.rotation.z = -0.3; // Less lean
    body.castShadow = true;
    cyclist.add(body);

    // Cyclist Head
    const headGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.set(0, 0.3, 0);
    head.castShadow = true;
    body.add(head);

    // Helmet
    const helmetGeometry = new THREE.SphereGeometry(0.11, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.copy(head.position);
    helmet.castShadow = true;
    body.add(helmet);

    // Arms - Adjusted position to reach handlebars
    const armGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6);
    armGeometry.translate(0, -0.2, 0); // Pivot at shoulder
    const handGeometry = new THREE.SphereGeometry(0.035, 6, 6);

    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(0.02, 0.2, 0.12);
    leftArmPivot.rotation.set(-0.6, -0.05, -0.2);
    body.add(leftArmPivot);

    const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
    leftArm.castShadow = true;
    leftArmPivot.add(leftArm);

    const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
    leftHand.position.y = -0.38;
    leftHand.castShadow = true;
    leftArmPivot.add(leftHand);

    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.02, 0.2, -0.12);
    rightArmPivot.rotation.set(-0.6, 0.05, -0.2);
    body.add(rightArmPivot);

    const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
    rightArm.castShadow = true;
    rightArmPivot.add(rightArm);

    const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
    rightHand.position.y = -0.38;
    rightHand.castShadow = true;
    rightArmPivot.add(rightHand);

    // Legs (Upper)
    const legGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.32, 6);
    legGeometry.translate(0, -0.16, 0); // Pivot at hip
    const pantsMaterial = new THREE.MeshStandardMaterial({ color: 0x0000aa }); // Blue pants

    const leftThigh = new THREE.Group();
    leftThigh.position.set(-0.14, -0.1, 0.07);
    body.add(leftThigh);

    const leftThighMesh = new THREE.Mesh(legGeometry, pantsMaterial);
    leftThighMesh.castShadow = true;
    leftThigh.add(leftThighMesh);

    const rightThigh = new THREE.Group();
    rightThigh.position.set(-0.14, -0.1, -0.07);
    body.add(rightThigh);

    const rightThighMesh = new THREE.Mesh(legGeometry, pantsMaterial);
    rightThighMesh.castShadow = true;
    rightThigh.add(rightThighMesh);

    // Legs (Lower)
    const shinGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6);
    shinGeometry.translate(0, -0.15, 0); // Pivot at knee

    const leftShin = new THREE.Mesh(shinGeometry, pantsMaterial);
    leftShin.position.y = -0.32; // Relative to thigh
    leftThigh.add(leftShin);

    const rightShin = new THREE.Mesh(shinGeometry, pantsMaterial);
    rightShin.position.y = -0.32; // Relative to thigh
    rightThigh.add(rightShin);

    bicycle.add(cyclist);
    bicycle.userData.cyclist = {
      leftThigh, rightThigh,
      leftShin, rightShin
    };

    return bicycle;
  }

  // Car animation path (following roads, avoiding park)
  const roadPath = [
    { x: -45, z: -45 },
    { x: 45, z: -45 },
    { x: 45, z: 45 },
    { x: -45, z: 45 },
    { x: -45, z: -45 }
  ];

  // Alternative paths for variety
  const roadPath2 = [
    { x: 30, z: -60 },
    { x: 30, z: 60 },
    { x: 45, z: 60 },
    { x: 45, z: -60 },
    { x: 30, z: -60 }
  ];

  const roadPath3 = [
    { x: -60, z: 30 },
    { x: 60, z: 30 },
    { x: 60, z: 45 },
    { x: -60, z: 45 },
    { x: -60, z: 30 }
  ];

  // Create multiple cars
  const cars = [];
  const carColors = [0xff0000, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];

  for (let i = 0; i < 5; i++) {
    const car = createCar();
    // Change car color
    car.children[0].material = new THREE.MeshStandardMaterial({
      color: carColors[i % carColors.length],
      metalness: 0.7,
      roughness: 0.3
    });

    let path;
    if (i < 2) path = roadPath;
    else if (i < 4) path = roadPath2;
    else path = roadPath3;

    const startIndex = Math.floor(Math.random() * path.length);
    car.position.set(path[startIndex].x, 0.1, path[startIndex].z);

    car.userData.path = path;
    car.userData.pathIndex = startIndex;
    car.userData.speed = 0.04 + Math.random() * 0.03;
    car.userData.wheelRotation = 0;

    scene.add(car);
    cars.push(car);
  }

  // Create multiple bicycles
  const bicycles = [];

  for (let i = 0; i < 6; i++) {
    const bicycle = createBicycle();

    let path;
    if (i < 3) path = roadPath;
    else path = roadPath2;

    const startIndex = Math.floor(Math.random() * path.length);
    bicycle.position.set(path[startIndex].x, 0.05, path[startIndex].z);

    bicycle.userData.path = path;
    bicycle.userData.pathIndex = startIndex;
    bicycle.userData.speed = 0.025 + Math.random() * 0.015;
    bicycle.userData.wheelRotation = 0;

    scene.add(bicycle);
    bicycles.push(bicycle);
  }

  // Trees and Plants in green fields (Expanded)
  const treeGeometry = new THREE.CylinderGeometry(0.1, 0.3, 2, 8);
  const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown trunk
  const foliageGeometry = new THREE.SphereGeometry(0.8, 8, 8);
  const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Green foliage

  for (let i = 0; i < 300; i++) { // Increased tree count
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
    trunk.castShadow = true;
    tree.add(trunk);

    // Foliage
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 2.2;
    foliage.castShadow = true;
    tree.add(foliage);

    tree.position.set(posX, 0, posZ);
    scene.add(tree);
  }

  // Small plants/bushes
  const bushGeometry = new THREE.SphereGeometry(0.3, 6, 6);
  const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x32CD32 }); // Lime green

  for (let i = 0; i < 500; i++) { // Increased bush count
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
    bush.castShadow = true;
    scene.add(bush);
  }

  // Park with pool and stadium
  function addRecreationalAreas() {
    // City park (Central)
    const park = new THREE.Group();
    const parkSize = { w: 45, h: 45 }; // Further expanded park
    const parkBase = new THREE.Mesh(new THREE.BoxGeometry(parkSize.w, 0.05, parkSize.h), new THREE.MeshStandardMaterial({ color: 0x3b9c4a }));
    parkBase.position.y = 0.025;
    parkBase.receiveShadow = true;
    park.add(parkBase);

    // Path
    const pathWidth = 3;
    const path = new THREE.Mesh(new THREE.BoxGeometry(parkSize.w * 0.85, 0.06, pathWidth), new THREE.MeshStandardMaterial({ color: 0xd3c6a6 }));
    path.position.set(0, 0.06, 0);
    path.receiveShadow = true;
    park.add(path);

    const pathV = new THREE.Mesh(new THREE.BoxGeometry(pathWidth, 0.06, parkSize.h * 0.85), new THREE.MeshStandardMaterial({ color: 0xd3c6a6 }));
    pathV.position.set(0, 0.06, 0);
    pathV.receiveShadow = true;
    park.add(pathV);

    // Pool
    const poolBorder = new THREE.Mesh(new THREE.BoxGeometry(10, 0.1, 6), new THREE.MeshStandardMaterial({ color: 0xc9c9c9 }));
    poolBorder.position.set(-8, 0.1, -8);
    poolBorder.receiveShadow = true;
    park.add(poolBorder);

    const water = new THREE.Mesh(
      new THREE.BoxGeometry(9.2, 0.02, 5.2),
      new THREE.MeshStandardMaterial({ color: 0x36b5ff, transparent: true, opacity: 0.93, metalness: 0.25, roughness: 0.15, emissive: 0x1f9dff, emissiveIntensity: 0.45 })
    );
    water.position.set(-8, 0.12, -8);
    park.add(water);

    // Benches
    function addBench(x, z, rot = 0) {
      const bench = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.35), new THREE.MeshStandardMaterial({ color: 0x8b5a2b }));
      seat.position.y = 0.35;
      seat.castShadow = true;
      bench.add(seat);

      const legs = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.08), new THREE.MeshStandardMaterial({ color: 0x4a2f1b }));
      legs.position.y = 0.18;
      bench.add(legs);

      bench.position.set(x, 0, z);
      bench.rotation.y = rot;
      park.add(bench);
    }

    addBench(3, -3);
    addBench(3, 3);
    addBench(-3, 3);
    addBench(5, 0, Math.PI / 2);
    addBench(-8, -6);
    addBench(8, -6);
    addBench(-10, 10);
    addBench(10, 10);

    // Park trees
    for (let i = 0; i < 32; i++) {
      const px = (Math.random() - 0.5) * (parkSize.w - 2);
      const pz = (Math.random() - 0.5) * (parkSize.h - 2);

      // Avoid pool and paths roughly
      if (Math.abs(px) < 3 || Math.abs(pz) < 3 || (px < -1 && px > -9 && pz < -1 && pz > -9)) continue;

      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.2, 8), treeMaterial);
      trunk.position.y = 0.6;
      trunk.castShadow = true;
      tree.add(trunk);
      const crown = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 10), foliageMaterial);
      crown.position.y = 1.4;
      crown.castShadow = true;
      tree.add(crown);
      tree.position.set(px, 0, pz);
      park.add(tree);
    }

    // Small mountain
    const mountain = new THREE.Mesh(new THREE.ConeGeometry(3, 2.2, 10), new THREE.MeshStandardMaterial({ color: 0x6a5a48, roughness: 0.95 }));
    mountain.position.set(-6, 1.1, 6);
    mountain.castShadow = true;
    park.add(mountain);

    // Rocks
    for (let i = 0; i < 10; i++) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.25), new THREE.MeshStandardMaterial({ color: 0x5e5e5e, roughness: 0.95 }));
      let placed = false;
      for (let tries = 0; tries < 8 && !placed; tries++) {
        const rx = (Math.random() - 0.5) * (parkSize.w - 4);
        const rz = (Math.random() - 0.5) * (parkSize.h - 4);
        // Avoid main paths and pool
        if (Math.abs(rx) < pathWidth + 1 || Math.abs(rz) < pathWidth + 1 || (rx < -1 && rx > -11 && rz < -1 && rz > -11)) continue;
        rock.position.set(rx, 0.15 + Math.random() * 0.2, rz);
        placed = true;
      }
      if (placed) {
        rock.castShadow = true;
        park.add(rock);
      }
    }

    // Small bushes inside park
    const parkBushGeometry = new THREE.SphereGeometry(0.32, 8, 8);
    const parkBushMaterial = new THREE.MeshStandardMaterial({ color: 0x2fae4d });
    for (let i = 0; i < 18; i++) {
      const bx = (Math.random() - 0.5) * (parkSize.w - 2);
      const bz = (Math.random() - 0.5) * (parkSize.h - 2);
      if (Math.abs(bx) < pathWidth + 1 || Math.abs(bz) < pathWidth + 1 || (bx < -1 && bx > -11 && bz < -1 && bz > -11)) continue;
      const bush = new THREE.Mesh(parkBushGeometry, parkBushMaterial);
      bush.position.set(bx, 0.2, bz);
      bush.scale.setScalar(0.8 + Math.random() * 0.5);
      bush.castShadow = true;
      park.add(bush);
    }

    // Fence around the park
    const fenceHeight = 0.8;
    const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
    const fenceThickness = 0.1;

    // Top/Bottom fence
    const fenceH1 = new THREE.Mesh(new THREE.BoxGeometry(parkSize.w, fenceHeight, fenceThickness), fenceMaterial);
    fenceH1.position.set(0, fenceHeight / 2, -parkSize.h / 2);
    park.add(fenceH1);

    const fenceH2 = new THREE.Mesh(new THREE.BoxGeometry(parkSize.w, fenceHeight, fenceThickness), fenceMaterial);
    fenceH2.position.set(0, fenceHeight / 2, parkSize.h / 2);
    park.add(fenceH2);

    // Left/Right fence (with gate gap)
    const fenceV1 = new THREE.Mesh(new THREE.BoxGeometry(fenceThickness, fenceHeight, parkSize.h), fenceMaterial);
    fenceV1.position.set(-parkSize.w / 2, fenceHeight / 2, 0);
    park.add(fenceV1);

    // Right fence with gate
    const fenceV2a = new THREE.Mesh(new THREE.BoxGeometry(fenceThickness, fenceHeight, parkSize.h / 2 - 2), fenceMaterial);
    fenceV2a.position.set(parkSize.w / 2, fenceHeight / 2, -parkSize.h / 4 - 1);
    park.add(fenceV2a);

    const fenceV2b = new THREE.Mesh(new THREE.BoxGeometry(fenceThickness, fenceHeight, parkSize.h / 2 - 2), fenceMaterial);
    fenceV2b.position.set(parkSize.w / 2, fenceHeight / 2, parkSize.h / 4 + 1);
    park.add(fenceV2b);

    // Gate pillars
    const pillarGeo = new THREE.BoxGeometry(0.4, 1.5, 0.4);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const p1 = new THREE.Mesh(pillarGeo, pillarMat);
    p1.position.set(parkSize.w / 2, 0.75, -2);
    park.add(p1);
    const p2 = new THREE.Mesh(pillarGeo, pillarMat);
    p2.position.set(parkSize.w / 2, 0.75, 2);
    park.add(p2);

    park.position.set(0, 0, 0); // Center of city
    scene.add(park);

    // Stadium (Moved to side, ensure visible)
    const stadium = new THREE.Group();
    const field = new THREE.Mesh(new THREE.BoxGeometry(10, 0.05, 6), new THREE.MeshStandardMaterial({ color: 0x2f8f46 }));
    field.position.y = 0.025;
    stadium.add(field);

    const track = new THREE.Mesh(new THREE.TorusGeometry(4.5, 0.35, 8, 32), new THREE.MeshStandardMaterial({ color: 0xcc5a1a }));
    track.rotation.x = Math.PI / 2;
    track.scale.set(1.3, 1, 1);
    track.position.y = 0.05;
    stadium.add(track);

    const stands = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.7, 8, 32), new THREE.MeshStandardMaterial({ color: 0x9ea3a8, metalness: 0.1, roughness: 0.8 }));
    stands.rotation.x = Math.PI / 2;
    stands.scale.set(1.4, 1, 1);
    stands.position.y = 0.2;
    stands.receiveShadow = true;
    stadium.add(stands);

    // Tiered seating (realistic benches layer by layer)
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x4a90e2, roughness: 0.7 });
    const seatBackMaterial = new THREE.MeshStandardMaterial({ color: 0x2a5a8a, roughness: 0.7 });
    const tierCount = 8; // Number of tiers
    const seatsPerTier = 24; // Seats around the stadium

    for (let tier = 0; tier < tierCount; tier++) {
      const tierRadius = 6 + tier * 0.8;
      const tierHeight = 0.3 + tier * 0.35;

      for (let seat = 0; seat < seatsPerTier; seat++) {
        const angle = (seat / seatsPerTier) * Math.PI * 2;
        const seatX = Math.cos(angle) * tierRadius;
        const seatZ = Math.sin(angle) * tierRadius;

        // Seat (bench)
        const seatGeometry = new THREE.BoxGeometry(0.5, 0.08, 0.35);
        const seatMesh = new THREE.Mesh(seatGeometry, seatMaterial);
        seatMesh.position.set(seatX, tierHeight, seatZ);
        seatMesh.rotation.y = angle + Math.PI / 2;
        seatMesh.castShadow = true;
        seatMesh.receiveShadow = true;
        stadium.add(seatMesh);

        // Seat back
        const backGeometry = new THREE.BoxGeometry(0.5, 0.25, 0.05);
        const backMesh = new THREE.Mesh(backGeometry, seatBackMaterial);
        backMesh.position.set(seatX, tierHeight + 0.15, seatZ);
        backMesh.rotation.y = angle + Math.PI / 2;
        backMesh.rotation.x = -0.2;
        backMesh.castShadow = true;
        stadium.add(backMesh);
      }
    }

    // Flood lights
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const lx = Math.cos(angle) * 7;
      const lz = Math.sin(angle) * 5;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3, 8), new THREE.MeshStandardMaterial({ color: 0x222 }));
      pole.position.set(lx, 1.5, lz);
      pole.castShadow = true;
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.4), new THREE.MeshStandardMaterial({ color: 0xf5f1c3, emissive: 0xf5f1c3, emissiveIntensity: 0.2 }));
      lamp.position.y = 1.6;
      pole.add(lamp);
      stadium.add(pole);
    }

    // Place stadium away from park to avoid overlap
    stadium.position.set(-70, 0, 60);
    scene.add(stadium);
  }

  addRecreationalAreas();

  // Birds
  const birds = [];
  const birdGeometry = new THREE.ConeGeometry(0.1, 0.3, 8); // Smaller birds for scale
  const birdMaterial = new THREE.MeshStandardMaterial({ color: 0xffaa00 });

  for (let i = 0; i < 40; i++) {
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
    leftLeg.castShadow = true;
    person.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.07, 0.225, 0);
    rightLeg.castShadow = true;
    person.add(rightLeg);

    // Torso (upper body)
    const torsoGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.5, 8);
    const torsoMaterial = new THREE.MeshStandardMaterial({ color: shirtColor });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.y = 0.7;
    torso.castShadow = true;
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
    leftArmMesh.castShadow = true;
    leftArm.add(leftArmMesh);

    const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
    leftHand.position.y = -0.4;
    leftHand.castShadow = true;
    leftArm.add(leftHand);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.16, 0.7, 0);
    rightArm.rotation.z = 0; // Keep arms aligned to torso
    person.add(rightArm);

    const rightArmMesh = new THREE.Mesh(armGeometry, armMaterial);
    rightArmMesh.castShadow = true;
    rightArm.add(rightArmMesh);

    const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
    rightHand.position.y = -0.4;
    rightHand.castShadow = true;
    rightArm.add(rightHand);

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.08, 6);
    const neck = new THREE.Mesh(neckGeometry, skinMaterial);
    neck.position.y = 0.99;
    neck.castShadow = true;
    person.add(neck);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.12, 12, 12);
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 1.12;
    head.castShadow = true;
    person.add(head);

    // Hair
    const hairColors = [0x1a1a1a, 0x3d2817, 0x8b4513, 0xdaa520, 0xff6347];
    const hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
    const hairGeometry = new THREE.SphereGeometry(0.13, 12, 12);
    const hairMaterial = new THREE.MeshStandardMaterial({ color: hairColor });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 1.17;
    hair.scale.set(1, 0.8, 1);
    hair.castShadow = true;
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

  // Add pedestrians walking on sidewalks
  const pedestrians = [];
  // const sidewalkPositions = [-30, -15, 0, 15, 30]; // Old
  const sidewalkPositions = [];
  for (let i = -90; i <= 90; i += 15) {
    sidewalkPositions.push(i);
  }

  for (let i = 0; i < 60; i++) { // Increased pedestrian count
    const person = createPerson();

    // Random sidewalk position
    const roadIndex = Math.floor(Math.random() * sidewalkPositions.length);
    const roadPos = sidewalkPositions[roadIndex];
    const isHorizontalRoad = Math.random() > 0.5;

    if (isHorizontalRoad) {
      person.position.set(
        (Math.random() - 0.5) * 80,
        0,
        roadPos + (Math.random() > 0.5 ? 2 : -2) // Sidewalk offset
      );
      person.userData.direction = Math.random() > 0.5 ? 1 : -1;
      person.userData.axis = 'x';
      person.rotation.y = person.userData.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      person.position.set(
        roadPos + (Math.random() > 0.5 ? 2 : -2),
        0,
        (Math.random() - 0.5) * 80
      );
      person.userData.direction = Math.random() > 0.5 ? 1 : -1;
      person.userData.axis = 'z';
      person.rotation.y = person.userData.direction > 0 ? 0 : Math.PI;
    }

    person.userData.speed = 0.02 + Math.random() * 0.02;

    scene.add(person);
    pedestrians.push(person);
  }

  function draw() {
    controls.update();

    // Animate all cars
    cars.forEach(car => {
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

    // Animate all bicycles
    bicycles.forEach(bicycle => {
      const path = bicycle.userData.path;
      const targetPoint = path[bicycle.userData.pathIndex];
      const dx = targetPoint.x - bicycle.position.x;
      const dz = targetPoint.z - bicycle.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance > 0.3) {
        // Move towards target
        const normX = dx / distance;
        const normZ = dz / distance;
        const moveX = normX * bicycle.userData.speed;
        const moveZ = normZ * bicycle.userData.speed;

        bicycle.position.x += moveX;
        bicycle.position.z += moveZ;

        // Rotate bicycle to face movement direction
        const angle = Math.atan2(dz, dx);
        bicycle.rotation.y = angle;

        // Rotate wheels - Rotate around Z axis
        const travel = Math.sqrt(moveX * moveX + moveZ * moveZ);
        bicycle.userData.wheelRotation += travel / bicycle.userData.wheelRadius;
        bicycle.userData.wheels.forEach(wheel => {
          wheel.rotation.z = -bicycle.userData.wheelRotation;
        });

        // Animate Cyclist
        const cycle = bicycle.userData.wheelRotation * 1.5; // Pedaling speed
        const { leftThigh, rightThigh, leftShin, rightShin } = bicycle.userData.cyclist;

        // Simple pedaling animation
        leftThigh.rotation.x = Math.sin(cycle) * 0.6;
        leftShin.rotation.x = Math.cos(cycle) * 0.7 - 0.4;

        rightThigh.rotation.x = Math.sin(cycle + Math.PI) * 0.6;
        rightShin.rotation.x = Math.cos(cycle + Math.PI) * 0.7 - 0.4;
      } else {
        // Move to next point in path
        bicycle.userData.pathIndex = (bicycle.userData.pathIndex + 1) % path.length;
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
      // Walking animation (leg and arm swing)
      person.userData.walkCycle += 0.1;
      person.userData.legs[0].rotation.x = Math.sin(person.userData.walkCycle) * 0.25;
      person.userData.legs[1].rotation.x = Math.sin(person.userData.walkCycle + Math.PI) * 0.25;

      // Arm swing (opposite to legs for natural walking, keep hands down and near torso)
      const leftArm = person.userData.arms[0];
      const rightArm = person.userData.arms[1];
      leftArm.rotation.x = -0.55 + Math.sin(person.userData.walkCycle + Math.PI) * 0.25;
      rightArm.rotation.x = -0.55 + Math.sin(person.userData.walkCycle) * 0.25;
      leftArm.rotation.z = 0;
      rightArm.rotation.z = 0;

      // Move along sidewalk
      if (person.userData.axis === 'x') {
        person.position.x += person.userData.speed * person.userData.direction;

        // Wrap around
        if (person.position.x > 50) person.position.x = -50;
        if (person.position.x < -50) person.position.x = 50;
      } else {
        person.position.z += person.userData.speed * person.userData.direction;

        // Wrap around
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
