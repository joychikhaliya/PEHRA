import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  MUMBAI_TOPOGRAPHIC_LANDMARKS,
  getMumbaiElevation,
  MumbaiLandmark,
} from '../utils/mumbaiElevation.ts';
import {
  Maximize2,
  Minimize2,
  Compass,
  RotateCw,
  Eye,
  Sliders,
  AlertTriangle,
  Info,
  Droplets,
  Layers,
  MapPin,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { Village, Incident, Shelter } from '../types/index.ts';

interface Mumbai3DViewProps {
  villages?: Village[];
  incidents?: Incident[];
  shelters?: Shelter[];
  userLocation?: { lat: number; lng: number } | null;
  onSelectLocation?: (lat: number, lng: number, elevation: number) => void;
}

export const Mumbai3DView: React.FC<Mumbai3DViewProps> = ({
  villages = [],
  incidents = [],
  shelters = [],
  userLocation,
  onSelectLocation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 3D UI States
  const [waterLevelM, setWaterLevelM] = useState<number>(2.5);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [colorMode, setColorMode] = useState<'hypsometric' | 'storm' | 'topographic'>('hypsometric');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<'oblique' | 'mithi' | 'topdown' | 'south_north'>('oblique');
  const [selectedPin, setSelectedPin] = useState<{
    name: string;
    elevation: number;
    lat: number;
    lng: number;
    status: string;
    submerged: boolean;
    waterDepth: number;
  } | null>(null);

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 3,
    radius: 180,
  });

  // Map geographic bounds to 3D terrain coordinates
  // Mumbai Lat: 18.90 (South) to 19.28 (North) -> dLat = 0.38
  // Mumbai Lng: 72.78 (West) to 72.98 (East) -> dLng = 0.20
  const latMin = 18.90;
  const latMax = 19.28;
  const lngMin = 72.78;
  const lngMax = 72.98;

  const geoToWorld = (lat: number, lng: number, elevationM: number) => {
    const x = ((lng - lngMin) / (lngMax - lngMin) - 0.5) * 120;
    // In Three.js, +Z is towards camera (South), -Z is North
    const z = -((lat - latMin) / (latMax - latMin) - 0.5) * 160;
    // Scale elevation: 468m max -> Y ~ 30 units
    const y = (elevationM / 468) * 32;
    return new THREE.Vector3(x, y, z);
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b14);
    scene.fog = new THREE.FogExp2(0x050b14, 0.0035);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xe0f2fe, 1.4);
    sunLight.position.set(60, 120, 80);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const mithiFloodLight = new THREE.PointLight(0x06b6d4, 1.5, 120);
    mithiFloodLight.position.set(0, 15, 0);
    scene.add(mithiFloodLight);

    // 5. Build Digital Elevation Model Terrain Mesh
    const gridX = 70;
    const gridZ = 90;
    const terrainGeo = new THREE.PlaneGeometry(120, 160, gridX - 1, gridZ - 1);
    terrainGeo.rotateX(-Math.PI / 2);

    const pos = terrainGeo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Convert local X/Z to Lat/Lng
      const lng = lngMin + (x / 120 + 0.5) * (lngMax - lngMin);
      const lat = latMin + (-z / 160 + 0.5) * (latMax - latMin);

      const elevData = getMumbaiElevation(lat, lng);
      const elev = elevData.elevationM;
      const y = (elev / 468) * 32;

      pos.setY(i, y);

      // Color computation based on elevation
      let r = 0.05, g = 0.4, b = 0.65; // base sea/estuary
      if (elev <= 2.5) {
        // Critical flood bowl
        r = 0.05; g = 0.65; b = 0.75;
      } else if (elev <= 5.0) {
        // Lowland plain
        r = 0.15; g = 0.55; b = 0.45;
      } else if (elev <= 25.0) {
        // Urban terraces
        r = 0.35; g = 0.48; b = 0.45;
      } else if (elev <= 80.0) {
        // Hills (Malabar, Pali, Antop)
        r = 0.75; g = 0.55; b = 0.2;
      } else if (elev <= 200.0) {
        // High ridges (Powai, Trombay)
        r = 0.65; g = 0.35; b = 0.15;
      } else {
        // Kanheri peaks (SGNP)
        r = 0.45; g = 0.2; b = 0.1;
      }

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    terrainGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.8,
      metalness: 0.1,
      flatShading: false,
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);
    terrainMeshRef.current = terrainMesh;

    // 6. Dynamic Inundation Water Plane
    const waterGeo = new THREE.PlaneGeometry(130, 170, 32, 32);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.72,
      roughness: 0.1,
      metalness: 0.8,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    const initialWaterY = (waterLevelM / 468) * 32;
    waterMesh.position.y = initialWaterY;
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // 7. Base Plate / Sub-base Map Frame
    const baseGeo = new THREE.BoxGeometry(124, 6, 164);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -3;
    scene.add(baseMesh);

    // 8. Add 3D Landmarks and Hotspot Beacons
    MUMBAI_TOPOGRAPHIC_LANDMARKS.forEach((lm) => {
      const worldPos = geoToWorld(lm.lat, lm.lng, lm.elevationM);
      const isCritical = lm.floodVulnerability === 'CRITICAL';

      // Landmark vertical pin stick
      const stickHeight = 5;
      const stickGeo = new THREE.CylinderGeometry(0.25, 0.25, stickHeight, 8);
      const stickMat = new THREE.MeshBasicMaterial({
        color: isCritical ? 0xef4444 : 0x38bdf8,
      });
      const stick = new THREE.Mesh(stickGeo, stickMat);
      stick.position.set(worldPos.x, worldPos.y + stickHeight / 2, worldPos.z);
      scene.add(stick);

      // Glowing pin head
      const headGeo = new THREE.SphereGeometry(isCritical ? 1.4 : 1.1, 12, 12);
      const headMat = new THREE.MeshStandardMaterial({
        color: isCritical ? 0xff0044 : 0x00d8ff,
        emissive: isCritical ? 0x990022 : 0x0066aa,
        emissiveIntensity: 0.7,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(worldPos.x, worldPos.y + stickHeight, worldPos.z);
      scene.add(head);
    });

    // 9. If user location exists, place a pulse pin
    if (userLocation) {
      const userElev = getMumbaiElevation(userLocation.lat, userLocation.lng).elevationM;
      const userPos = geoToWorld(userLocation.lat, userLocation.lng, userElev);

      const userPinGeo = new THREE.ConeGeometry(1.6, 5, 12);
      userPinGeo.rotateX(Math.PI);
      const userPinMat = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x15803d,
        emissiveIntensity: 0.8,
      });
      const userPin = new THREE.Mesh(userPinGeo, userPinMat);
      userPin.position.set(userPos.x, userPos.y + 4, userPos.z);
      scene.add(userPin);
    }

    // 10. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Subtle water wave ripple
      if (waterMeshRef.current) {
        const baseWaterY = (waterLevelM / 468) * 32;
        waterMeshRef.current.position.y = baseWaterY + Math.sin(elapsedTime * 2.5) * 0.15;
      }

      // Auto rotation
      if (autoRotate && !isDraggingRef.current) {
        cameraAngleRef.current.theta += 0.003;
        updateCameraPosition();
      }

      renderer.render(scene, camera);
    };
    animate();

    // 11. Responsive Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      terrainGeo.dispose();
      waterGeo.dispose();
    };
  }, []);

  // Update water plane position when waterLevelM changes
  useEffect(() => {
    if (waterMeshRef.current) {
      const targetY = (waterLevelM / 468) * 32;
      waterMeshRef.current.position.y = targetY;
    }
  }, [waterLevelM]);

  // Wireframe toggle
  useEffect(() => {
    if (terrainMeshRef.current) {
      (terrainMeshRef.current.material as THREE.MeshStandardMaterial).wireframe = wireframeMode;
      (terrainMeshRef.current.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }
  }, [wireframeMode]);

  // Helper to update camera from spherical coordinates
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, Math.max(y, 10), z);
    cameraRef.current.lookAt(0, 5, 0);
  };

  // Camera preset handler
  const setPreset = (preset: 'oblique' | 'mithi' | 'topdown' | 'south_north') => {
    setCameraPreset(preset);
    setAutoRotate(false);

    if (preset === 'oblique') {
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3.2, radius: 170 };
    } else if (preset === 'mithi') {
      // Close up on Mithi River (Central Mumbai)
      cameraAngleRef.current = { theta: 0.1, phi: Math.PI / 3.8, radius: 85 };
    } else if (preset === 'topdown') {
      // Top down contour look
      cameraAngleRef.current = { theta: 0, phi: 0.1, radius: 190 };
    } else if (preset === 'south_north') {
      // Looking North from Colaba toward Sanjay Gandhi National Park
      cameraAngleRef.current = { theta: 0, phi: Math.PI / 2.6, radius: 155 };
    }
    updateCameraPosition();
  };

  // Mouse & Touch Orbit Handling
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    cameraAngleRef.current.theta -= deltaX * 0.008;
    cameraAngleRef.current.phi = Math.max(
      0.1,
      Math.min(Math.PI / 2.05, cameraAngleRef.current.phi - deltaY * 0.008)
    );

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraAngleRef.current.radius = Math.max(
      40,
      Math.min(300, cameraAngleRef.current.radius + e.deltaY * 0.15)
    );
    updateCameraPosition();
  };

  // Click on 3D canvas raycaster to inspect terrain coordinate & elevation
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !terrainMeshRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    const intersects = raycaster.intersectObject(terrainMeshRef.current);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const worldX = hit.point.x;
      const worldZ = hit.point.z;

      // Inverse transform to Lat/Lng
      const lng = lngMin + (worldX / 120 + 0.5) * (lngMax - lngMin);
      const lat = latMin + (-worldZ / 160 + 0.5) * (latMax - latMin);

      const elevData = getMumbaiElevation(lat, lng);
      const isSubmerged = elevData.elevationM <= waterLevelM;
      const waterDepth = isSubmerged ? Math.round((waterLevelM - elevData.elevationM) * 10) / 10 : 0;

      setSelectedPin({
        name: `Coordinate probe (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`,
        elevation: elevData.elevationM,
        lat,
        lng,
        status: elevData.zoneName,
        submerged: isSubmerged,
        waterDepth,
      });

      if (onSelectLocation) {
        onSelectLocation(lat, lng, elevData.elevationM);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 select-none flex flex-col"
    >
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="flex-1 w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
      />

      {/* Top Floating 3D Title Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-cyan-800/80 bg-slate-900/90 px-3 py-1.5 backdrop-blur-md shadow-xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="font-bold text-xs tracking-wider text-cyan-300 uppercase">
            Mumbai 3D Digital Elevation Model (DEM)
          </span>
          <span className="rounded bg-cyan-950 px-1.5 py-0.5 font-mono text-[10px] text-cyan-400 border border-cyan-800">
            WebGL 3D
          </span>
        </div>

        {/* Camera Preset Selector */}
        <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/90 p-1 backdrop-blur-md shadow-xl text-xs">
          <button
            onClick={() => setPreset('oblique')}
            className={`rounded px-2 py-1 font-medium transition-colors ${
              cameraPreset === 'oblique' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Oblique 3D
          </button>
          <button
            onClick={() => setPreset('mithi')}
            className={`rounded px-2 py-1 font-medium transition-colors ${
              cameraPreset === 'mithi' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Mithi Valley
          </button>
          <button
            onClick={() => setPreset('south_north')}
            className={`rounded px-2 py-1 font-medium transition-colors ${
              cameraPreset === 'south_north' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            South→North
          </button>
          <button
            onClick={() => setPreset('topdown')}
            className={`rounded px-2 py-1 font-medium transition-colors ${
              cameraPreset === 'topdown' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            Top-Down Relief
          </button>
        </div>
      </div>

      {/* Top Right Quick Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center gap-1.5 rounded-lg border border-slate-800 px-2.5 py-1.5 text-xs font-semibold backdrop-blur-md shadow-lg transition-colors ${
            autoRotate ? 'bg-cyan-500/20 text-cyan-300 border-cyan-600' : 'bg-slate-900/90 text-slate-300 hover:text-white'
          }`}
          title="Toggle 360° Cinematic Orbit"
        >
          <RotateCw className={`h-3.5 w-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">{autoRotate ? 'Orbiting' : 'Orbit'}</span>
        </button>

        <button
          onClick={() => setWireframeMode(!wireframeMode)}
          className={`flex items-center gap-1.5 rounded-lg border border-slate-800 px-2.5 py-1.5 text-xs font-semibold backdrop-blur-md shadow-lg transition-colors ${
            wireframeMode ? 'bg-amber-500/20 text-amber-300 border-amber-600' : 'bg-slate-900/90 text-slate-300 hover:text-white'
          }`}
          title="Toggle Topographic Wireframe Mesh"
        >
          <Layers className="h-3.5 w-3.5" />
          <span className="hidden md:inline">{wireframeMode ? 'Wireframe' : 'Solid'}</span>
        </button>
      </div>

      {/* Interactive 3D Water Inundation Simulation Slider */}
      <div className="absolute bottom-4 left-4 z-10 w-80 max-w-[calc(100%-2rem)] rounded-xl border border-cyan-800/80 bg-slate-900/95 p-3.5 backdrop-blur-md shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-cyan-400" />
            <span className="font-bold text-xs text-white">3D Flood Inundation Simulator</span>
          </div>
          <span className="font-mono text-sm font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700">
            {waterLevelM.toFixed(1)} m MSL
          </span>
        </div>

        <input
          type="range"
          min="0.5"
          max="6.0"
          step="0.1"
          value={waterLevelM}
          onChange={(e) => setWaterLevelM(parseFloat(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
          <span>0.5m (Low Tide)</span>
          <span>2.5m (Mean Inundation)</span>
          <span>4.5m (Spring Surge)</span>
          <span>6.0m (Deluge)</span>
        </div>

        <div className="mt-2.5 flex items-center gap-2 rounded bg-slate-950/70 p-2 border border-slate-800/80 text-[11px] text-slate-300">
          <Info className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
          <span>
            {waterLevelM <= 2.2
              ? 'Mithi estuary within normal tidal banks. Central transit corridors clear.'
              : waterLevelM <= 3.4
              ? 'Kurla West, Sion Circle, and Hindmata depressions submerged.'
              : 'Severe flooding across Dharavi, BKC link, and Chembur lowlands.'}
          </span>
        </div>
      </div>

      {/* 3D Legend & Hypsometric Color Ramp */}
      <div className="absolute bottom-4 right-4 z-10 hidden sm:block rounded-xl border border-slate-800 bg-slate-900/90 p-3 backdrop-blur-md shadow-xl text-xs text-slate-300 w-56">
        <div className="font-bold text-white mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400">
          <span>Topographic Hypsometry</span>
          <span className="font-mono text-[10px] text-cyan-400">Height</span>
        </div>

        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: '#78350f' }} />
              <span>SGNP Peak (Kanheri)</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">468m</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: '#b45309' }} />
              <span>Trombay Hill Ridge</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">302m</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: '#d97706' }} />
              <span>Powai & Malabar Ridges</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">55–85m</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: '#64748b' }} />
              <span>Urban Plain</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">10–25m</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: '#0d9488' }} />
              <span>Kurla / Sion Flood Bowls</span>
            </span>
            <span className="font-mono text-[10px] text-rose-400 font-bold">1.8–3.5m</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-cyan-500" />
              <span>Arabian Sea / Tidal Creek</span>
            </span>
            <span className="font-mono text-[10px] text-cyan-400">0.0m</span>
          </div>
        </div>
      </div>

      {/* Selected 3D Coordinate Probe Inspector Floating Card */}
      {selectedPin && (
        <div className="absolute top-16 left-4 z-20 w-72 rounded-xl border border-cyan-800 bg-slate-900/95 p-3.5 backdrop-blur-md shadow-2xl text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span>3D Surface Inspection</span>
            </span>
            <button
              onClick={() => setSelectedPin(null)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="text-[11px] text-slate-400 font-mono">
              {selectedPin.lat.toFixed(4)}° N, {selectedPin.lng.toFixed(4)}° E
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
              <span className="text-slate-400">Ground Elevation:</span>
              <span className="font-mono font-bold text-white">{selectedPin.elevation} m MSL</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Terrain Category:</span>
              <span className="font-semibold text-cyan-300">{selectedPin.status}</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
              <span className="text-slate-400">Flood Inundation:</span>
              {selectedPin.submerged ? (
                <span className="font-bold text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Submerged ({selectedPin.waterDepth}m depth)
                </span>
              ) : (
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Above Waterline (+{(selectedPin.elevation - waterLevelM).toFixed(1)}m)
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
