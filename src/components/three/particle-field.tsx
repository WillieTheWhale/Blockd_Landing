'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

// ═══════════════════════════════════════════════════════════════════════════
// BRUTALIST PARTICLE FIELD
// High contrast white particles on dark background
// ═══════════════════════════════════════════════════════════════════════════

// Shared state for mouse and scroll (passed through Canvas context)
interface InteractionState {
  mouseX: number;
  mouseY: number;
  mouseVelocity: number;
  scrollProgress: number;
  scrollVelocity: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MOUSE TRACKER
// ═══════════════════════════════════════════════════════════════════════════

function useInteractionState(): React.MutableRefObject<InteractionState> {
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

      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;

      const dx = x - lastPos.x;
      const dy = y - lastPos.y;
      const dt = Math.max(now - lastPos.time, 1);
      const velocity = Math.sqrt(dx * dx + dy * dy) / dt * 1000;

      lastMouseRef.current = { x, y, time: now };

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
// PARTICLES - White, sharp, high contrast
// ═══════════════════════════════════════════════════════════════════════════

interface ParticlesProps {
  count?: number;
  interactionRef: React.MutableRefObject<InteractionState>;
}

function Particles({ count = 2000, interactionRef }: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const prefersReducedMotion = useReducedMotion();

  const { positions, originalPositions } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Grid-like distribution for brutalist feel
      const gridX = (i % 50) / 50 - 0.5;
      const gridY = Math.floor(i / 50) / (count / 50) - 0.5;

      // Add some randomness to break up the grid
      const x = gridX * 30 + (Math.random() - 0.5) * 2;
      const y = gridY * 30 + (Math.random() - 0.5) * 2;
      const z = (Math.random() - 0.5) * 15 - 10;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;
    }
    return { positions, originalPositions };
  }, [count]);

  const smoothMouse = useRef({ x: 0, y: 0 });
  const smoothScroll = useRef(0);

  useFrame((state) => {
    if (prefersReducedMotion || !pointsRef.current) return;

    const time = state.clock.getElapsedTime();
    const interaction = interactionRef.current;

    // Linear interpolation - no spring physics
    smoothMouse.current.x += (interaction.mouseX - smoothMouse.current.x) * 0.1;
    smoothMouse.current.y += (interaction.mouseY - smoothMouse.current.y) * 0.1;
    smoothScroll.current += (interaction.scrollProgress - smoothScroll.current) * 0.15;

    const geometry = pointsRef.current.geometry;
    const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    const posArray = positionAttribute.array as Float32Array;

    const morphFactor = smoothScroll.current;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const origX = originalPositions[i3];
      const origY = originalPositions[i3 + 1];
      const origZ = originalPositions[i3 + 2];

      // Simple vertical line formation
      const lineX = 0;
      const lineY = ((i / count) - 0.5) * 40;
      const lineZ = -10;

      // Lerp between grid and line based on scroll
      const targetX = origX * (1 - morphFactor) + lineX * morphFactor;
      const targetY = origY * (1 - morphFactor) + lineY * morphFactor;
      const targetZ = origZ * (1 - morphFactor) + lineZ * morphFactor;

      // Mouse repulsion
      const dx = targetX - smoothMouse.current.x * 15;
      const dy = targetY - smoothMouse.current.y * 10;
      const distSq = dx * dx + dy * dy;
      const repulsion = Math.max(0, 1 - distSq / 100);
      const repulsionStrength = repulsion * 2;

      posArray[i3] = targetX + dx * repulsionStrength * 0.1;
      posArray[i3 + 1] = targetY + dy * repulsionStrength * 0.1;
      posArray[i3 + 2] = targetZ + repulsion * 2;

      // Minimal motion
      posArray[i3] += Math.sin(time * 0.2 + i * 0.01) * 0.05;
    }

    positionAttribute.needsUpdate = true;

    // Minimal rotation
    pointsRef.current.rotation.y = smoothMouse.current.x * 0.1 + time * 0.01;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#FFFFFF"
        size={0.08}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONNECTION LINES - Stark white lines
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

    for (let i = 0; i < 15; i++) {
      const geometry = new THREE.BufferGeometry();
      const material = new THREE.LineBasicMaterial({
        color: '#FFFFFF',
        transparent: true,
        opacity: 0.3,
      });

      // Horizontal and vertical lines only (brutalist grid)
      const isHorizontal = i % 2 === 0;
      const start = new THREE.Vector3(
        isHorizontal ? -20 : (Math.random() - 0.5) * 30,
        isHorizontal ? (Math.random() - 0.5) * 20 : -15,
        -15 + Math.random() * 5
      );
      const end = new THREE.Vector3(
        isHorizontal ? 20 : start.x,
        isHorizontal ? start.y : 15,
        start.z
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
    const interaction = interactionRef.current;

    lines.forEach((line, i) => {
      const mat = line.material as THREE.LineBasicMaterial;
      // Fade based on scroll
      mat.opacity = 0.15 + interaction.scrollProgress * 0.25;
    });

    // Minimal rotation
    groupRef.current.rotation.z = time * 0.005;
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
// SCENE
// ═══════════════════════════════════════════════════════════════════════════

interface SceneProps {
  interactionRef: React.MutableRefObject<InteractionState>;
}

function Scene({ interactionRef }: SceneProps) {
  return (
    <>
      <fog attach="fog" args={['#01101B', 10, 40]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#FFFFFF" />
      <Particles count={2000} interactionRef={interactionRef} />
      <ConnectionLines interactionRef={interactionRef} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
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
