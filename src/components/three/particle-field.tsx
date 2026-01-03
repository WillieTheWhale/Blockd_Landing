'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

// ═══════════════════════════════════════════════════════════════════════════
// MOUSE-REACTIVE PARTICLE FIELD - Cinematic Three.js Background
// Section-aware with color transitions and enhanced morphing
// ═══════════════════════════════════════════════════════════════════════════

// Section color palette for smooth transitions
const SECTION_COLOR_STOPS = [
  { progress: 0.0, color: new THREE.Color('#3B82F6') },   // hero - blue
  { progress: 0.12, color: new THREE.Color('#6366F1') },  // problem - indigo
  { progress: 0.25, color: new THREE.Color('#8B5CF6') },  // gaze - violet
  { progress: 0.38, color: new THREE.Color('#A855F7') },  // ai-detection - purple
  { progress: 0.50, color: new THREE.Color('#3B82F6') },  // security - blue
  { progress: 0.62, color: new THREE.Color('#0EA5E9') },  // report - sky
  { progress: 0.75, color: new THREE.Color('#06B6D4') },  // architecture - cyan
  { progress: 0.88, color: new THREE.Color('#3B82F6') },  // scale - blue
  { progress: 1.0, color: new THREE.Color('#2563EB') },   // cta - electric blue
];

// PERFORMANCE: Pre-allocated color object to avoid creating new objects every frame
const _sectionColorResult = new THREE.Color();

function getSectionColor(progress: number, target: THREE.Color = _sectionColorResult): THREE.Color {
  // Find the two color stops we're between
  let from = SECTION_COLOR_STOPS[0];
  let to = SECTION_COLOR_STOPS[1];

  for (let i = 0; i < SECTION_COLOR_STOPS.length - 1; i++) {
    if (progress >= SECTION_COLOR_STOPS[i].progress && progress <= SECTION_COLOR_STOPS[i + 1].progress) {
      from = SECTION_COLOR_STOPS[i];
      to = SECTION_COLOR_STOPS[i + 1];
      break;
    }
  }

  // Calculate interpolation factor
  const range = to.progress - from.progress;
  const t = range > 0 ? (progress - from.progress) / range : 0;

  // PERFORMANCE: Reuse target color instead of creating new object
  target.lerpColors(from.color, to.color, t);
  return target;
}

// Shared state for mouse and scroll (passed through Canvas context)
interface InteractionState {
  mouseX: number;
  mouseY: number;
  mouseVelocity: number;
  scrollProgress: number;
  scrollVelocity: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOUSE TRACKER - Updates shared ref from DOM events (no re-renders)
// PERFORMANCE: Using refs instead of state to avoid React re-renders
// ═══════════════════════════════════════════════════════════════════════════

function useInteractionState(): React.MutableRefObject<InteractionState> {
  // PERFORMANCE: Use ref instead of state to avoid re-renders on mouse/scroll
  const stateRef = useRef<InteractionState>({
    mouseX: 0,
    mouseY: 0,
    mouseVelocity: 0,
    scrollProgress: 0,
    scrollVelocity: 0,
  });

  const lastMouseRef = useRef({ x: 0, y: 0, time: 0 });
  const lastScrollRef = useRef({ y: 0, time: 0 });
  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const lastPos = lastMouseRef.current;

      // Normalized -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Calculate velocity
      const dx = x - lastPos.x;
      const dy = y - lastPos.y;
      const dt = Math.max(now - lastPos.time, 1);
      const velocity = Math.sqrt(dx * dx + dy * dy) / dt * 1000;

      lastMouseRef.current = { x, y, time: now };

      // PERFORMANCE: Direct ref mutation, no setState re-render
      stateRef.current.mouseX = x;
      stateRef.current.mouseY = y;
      stateRef.current.mouseVelocity = Math.min(velocity, 10);

      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
      mouseTimeoutRef.current = setTimeout(() => {
        stateRef.current.mouseVelocity = 0;
      }, 100);
    };

    const handleScroll = () => {
      const now = performance.now();
      const lastScroll = lastScrollRef.current;

      const y = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(y / maxScroll, 1) : 0;

      const dy = Math.abs(y - lastScroll.y);
      const dt = Math.max(now - lastScroll.time, 1);
      const velocity = dy / dt * 16;

      lastScrollRef.current = { y, time: now };

      // PERFORMANCE: Direct ref mutation, no setState re-render
      stateRef.current.scrollProgress = progress;
      stateRef.current.scrollVelocity = Math.min(velocity, 10);

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        stateRef.current.scrollVelocity = 0;
      }, 150);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return stateRef;
}

// ═══════════════════════════════════════════════════════════════════════════
// REACTIVE PARTICLES - Mouse & Scroll Responsive
// ═══════════════════════════════════════════════════════════════════════════

interface ParticlesProps {
  count?: number;
  interactionRef: React.MutableRefObject<InteractionState>;
}

function Particles({ count = 3000, interactionRef }: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const prefersReducedMotion = useReducedMotion();

  // Store original positions for morphing
  const { positions, originalPositions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spherical distribution for more interesting shape
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 8 + Math.random() * 12;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi) - 10;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;
    }
    return { positions, originalPositions };
  }, [count]);

  // Smooth interpolation values
  const smoothMouse = useRef({ x: 0, y: 0 });
  const smoothScroll = useRef(0);
  const currentColor = useRef(new THREE.Color('#3B82F6'));

  useFrame((state) => {
    if (prefersReducedMotion || !pointsRef.current) return;

    const time = state.clock.getElapsedTime();
    // PERFORMANCE: Read from ref instead of prop (no re-renders)
    const interaction = interactionRef.current;

    // Smooth mouse following (lerp)
    smoothMouse.current.x += (interaction.mouseX - smoothMouse.current.x) * 0.05;
    smoothMouse.current.y += (interaction.mouseY - smoothMouse.current.y) * 0.05;
    smoothScroll.current += (interaction.scrollProgress - smoothScroll.current) * 0.1;

    const geometry = pointsRef.current.geometry;
    const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    const posArray = positionAttribute.array as Float32Array;

    // Scroll-based morph factor (0 = sphere, 1 = helix)
    const morphFactor = smoothScroll.current;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const origX = originalPositions[i3];
      const origY = originalPositions[i3 + 1];
      const origZ = originalPositions[i3 + 2];

      // Calculate helix target position
      const t = (i / count) * Math.PI * 8 + time * 0.2;
      const helixRadius = 4 + Math.sin(t * 0.5) * 2;
      const helixX = Math.cos(t) * helixRadius;
      const helixY = ((i / count) - 0.5) * 30;
      const helixZ = Math.sin(t) * helixRadius - 10;

      // Lerp between sphere and helix based on scroll
      const targetX = origX * (1 - morphFactor) + helixX * morphFactor;
      const targetY = origY * (1 - morphFactor) + helixY * morphFactor;
      const targetZ = origZ * (1 - morphFactor) + helixZ * morphFactor;

      // Mouse repulsion effect
      const dx = targetX - smoothMouse.current.x * 15;
      const dy = targetY - smoothMouse.current.y * 10;
      const distSq = dx * dx + dy * dy;
      const repulsionRadius = 100;
      const repulsion = Math.max(0, 1 - distSq / repulsionRadius);
      const repulsionStrength = repulsion * 3 * (1 + interaction.mouseVelocity * 0.3);

      // Apply repulsion
      posArray[i3] = targetX + dx * repulsionStrength * 0.1;
      posArray[i3 + 1] = targetY + dy * repulsionStrength * 0.1;
      posArray[i3 + 2] = targetZ + repulsion * 2;

      // Add subtle wave motion
      posArray[i3] += Math.sin(time * 0.5 + i * 0.01) * 0.1;
      posArray[i3 + 1] += Math.cos(time * 0.3 + i * 0.02) * 0.1;
    }

    positionAttribute.needsUpdate = true;

    // Subtle overall rotation based on mouse
    pointsRef.current.rotation.y = smoothMouse.current.x * 0.2 + time * 0.02;
    pointsRef.current.rotation.x = smoothMouse.current.y * 0.1 + time * 0.01;

    // Section-aware color transition
    if (materialRef.current) {
      // PERFORMANCE: Pass currentColor.current as target to avoid allocations
      getSectionColor(smoothScroll.current, currentColor.current);
      materialRef.current.color.copy(currentColor.current);
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        ref={materialRef}
        transparent
        color="#3B82F6"
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GLOWING ORB - Focal Point Effect with Mouse Tracking
// ═══════════════════════════════════════════════════════════════════════════

interface GlowingOrbProps {
  interactionRef: React.MutableRefObject<InteractionState>;
}

function GlowingOrb({ interactionRef }: GlowingOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const outerMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const innerMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const prefersReducedMotion = useReducedMotion();

  const smoothMouse = useRef({ x: 0, y: 0 });
  const smoothScroll = useRef(0);
  const currentColor = useRef(new THREE.Color('#3B82F6'));
  // PERFORMANCE: Pre-allocated color for inner orb to avoid clone() every frame
  const lightColor = useRef(new THREE.Color('#60A5FA'));

  useFrame((state) => {
    if (prefersReducedMotion || !meshRef.current) return;

    const time = state.clock.getElapsedTime();
    // PERFORMANCE: Read from ref instead of prop
    const interaction = interactionRef.current;

    // Smooth scroll for color transition
    smoothScroll.current += (interaction.scrollProgress - smoothScroll.current) * 0.1;

    // Smooth mouse following
    smoothMouse.current.x += (interaction.mouseX - smoothMouse.current.x) * 0.03;
    smoothMouse.current.y += (interaction.mouseY - smoothMouse.current.y) * 0.03;

    // Follow mouse subtly
    meshRef.current.position.x = smoothMouse.current.x * 2;
    meshRef.current.position.y = smoothMouse.current.y * 1.5 + Math.sin(time * 0.3) * 0.5;

    // Pulsing scale based on scroll and mouse velocity
    const velocityPulse = 1 + interaction.mouseVelocity * 0.05;
    const scrollScale = 1 + interaction.scrollProgress * 0.3;
    const basePulse = 1 + Math.sin(time * 0.5) * 0.1;
    const scale = basePulse * velocityPulse * scrollScale;
    meshRef.current.scale.set(scale, scale, scale);

    // Inner orb counter-rotation
    if (innerRef.current) {
      innerRef.current.rotation.x = time * 0.5;
      innerRef.current.rotation.y = time * 0.3;
    }

    // Section-aware color transition for orb
    // PERFORMANCE: Pass currentColor as target to avoid allocations
    getSectionColor(smoothScroll.current, currentColor.current);
    if (outerMaterialRef.current) {
      outerMaterialRef.current.color.copy(currentColor.current);
    }
    if (innerMaterialRef.current) {
      // PERFORMANCE: Reuse lightColor ref instead of clone()
      lightColor.current.copy(currentColor.current);
      lightColor.current.offsetHSL(0, -0.1, 0.15);
      innerMaterialRef.current.color.copy(lightColor.current);
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, -5]}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial
          ref={outerMaterialRef}
          color="#3B82F6"
          transparent
          opacity={0.08}
        />
        {/* Inner glowing core */}
        <mesh ref={innerRef}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshBasicMaterial
            ref={innerMaterialRef}
            color="#60A5FA"
            transparent
            opacity={0.15}
          />
        </mesh>
      </mesh>
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONNECTION LINES - Dynamic Data Flow Visualization
// ═══════════════════════════════════════════════════════════════════════════

interface ConnectionLinesProps {
  interactionRef: React.MutableRefObject<InteractionState>;
}

function ConnectionLines({ interactionRef }: ConnectionLinesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const prefersReducedMotion = useReducedMotion();

  const { lines, lineData } = useMemo(() => {
    const lineObjects: THREE.Line[] = [];
    const lineData: { start: THREE.Vector3; end: THREE.Vector3; phase: number }[] = [];

    for (let i = 0; i < 20; i++) {
      const geometry = new THREE.BufferGeometry();
      const material = new THREE.LineBasicMaterial({
        color: '#3B82F6',
        transparent: true,
        opacity: 0.2,
      });

      const start = new THREE.Vector3(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 10 - 8
      );
      const end = new THREE.Vector3(
        start.x + (Math.random() - 0.5) * 8,
        start.y + (Math.random() - 0.5) * 8,
        start.z + (Math.random() - 0.5) * 4
      );

      const positions = new Float32Array([
        start.x, start.y, start.z,
        end.x, end.y, end.z,
      ]);

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const line = new THREE.Line(geometry, material);
      lineObjects.push(line);
      lineData.push({ start, end, phase: Math.random() * Math.PI * 2 });
    }

    return { lines: lineObjects, lineData };
  }, []);

  useFrame((state) => {
    if (prefersReducedMotion || !groupRef.current) return;

    const time = state.clock.getElapsedTime();
    // PERFORMANCE: Read from ref instead of prop
    const interaction = interactionRef.current;

    // Animate each line
    lines.forEach((line, i) => {
      const data = lineData[i];
      const positionAttr = line.geometry.getAttribute('position') as THREE.BufferAttribute;
      const positions = positionAttr.array as Float32Array;

      // Pulse the line endpoints
      const pulse = Math.sin(time * 2 + data.phase) * 0.5;
      positions[0] = data.start.x + pulse;
      positions[1] = data.start.y + Math.cos(time + data.phase) * 0.3;
      positions[3] = data.end.x - pulse;
      positions[4] = data.end.y + Math.sin(time * 1.5 + data.phase) * 0.3;

      positionAttr.needsUpdate = true;

      // Fade based on scroll
      const mat = line.material as THREE.LineBasicMaterial;
      mat.opacity = 0.1 + interaction.scrollProgress * 0.2;
    });

    groupRef.current.rotation.z = time * 0.015 + interaction.mouseX * 0.1;
    groupRef.current.rotation.y = interaction.mouseY * 0.1;
  });

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DATA STREAM RINGS - Scroll-Activated Effect
// ═══════════════════════════════════════════════════════════════════════════

interface DataStreamRingsProps {
  interactionRef: React.MutableRefObject<InteractionState>;
}

function DataStreamRings({ interactionRef }: DataStreamRingsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const prefersReducedMotion = useReducedMotion();

  const rings = useMemo(() => {
    const ringObjects: THREE.Line[] = [];

    for (let i = 0; i < 5; i++) {
      const radius = 3 + i * 2;
      const segments = 64;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(segments * 3);

      for (let j = 0; j < segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        positions[j * 3] = Math.cos(theta) * radius;
        positions[j * 3 + 1] = Math.sin(theta) * radius;
        positions[j * 3 + 2] = 0;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.LineBasicMaterial({
        color: '#3B82F6',
        transparent: true,
        opacity: 0,
      });
      const ring = new THREE.LineLoop(geometry, material);
      ring.position.z = -15 + i * 2;
      ringObjects.push(ring);
    }

    return ringObjects;
  }, []);

  useFrame((state) => {
    if (prefersReducedMotion || !groupRef.current) return;

    const time = state.clock.getElapsedTime();
    // PERFORMANCE: Read from ref instead of prop
    const scrollFactor = interactionRef.current.scrollProgress;

    rings.forEach((ring, i) => {
      // Fade in based on scroll progress
      const fadeStart = i * 0.15;
      const fadeEnd = fadeStart + 0.3;
      const opacity = Math.min(
        Math.max((scrollFactor - fadeStart) / (fadeEnd - fadeStart), 0),
        0.3
      );
      (ring.material as THREE.LineBasicMaterial).opacity = opacity;

      // Rotate at different speeds
      ring.rotation.z = time * (0.1 + i * 0.05) * (i % 2 === 0 ? 1 : -1);
      ring.rotation.x = Math.sin(time * 0.2 + i) * 0.2;

      // Scale pulse
      const scale = 1 + Math.sin(time * 0.5 + i * 0.5) * 0.05;
      ring.scale.set(scale, scale, 1);
    });
  });

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <primitive key={i} object={ring} />
      ))}
    </group>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE WRAPPER - Passes interaction state to children
// ═══════════════════════════════════════════════════════════════════════════

interface SceneProps {
  interactionRef: React.MutableRefObject<InteractionState>;
}

function Scene({ interactionRef }: SceneProps) {
  return (
    <>
      <color attach="background" args={['#0F172A']} />
      <fog attach="fog" args={['#0F172A', 8, 35]} />

      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.4} color="#3B82F6" />
      <pointLight position={[-10, -10, 5]} intensity={0.2} color="#60A5FA" />

      <Particles count={2500} interactionRef={interactionRef} />
      <GlowingOrb interactionRef={interactionRef} />
      <ConnectionLines interactionRef={interactionRef} />
      <DataStreamRings interactionRef={interactionRef} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PARTICLE FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function ParticleField() {
  const interactionRef = useInteractionState();

  return (
    <div className="three-canvas">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 55 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene interactionRef={interactionRef} />
      </Canvas>
    </div>
  );
}
