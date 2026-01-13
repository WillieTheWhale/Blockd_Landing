'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { GazeSession } from '@/types';
import { SegmentedControl } from '@/components/ui/toggle';
import { ScanLine } from '@/components/effects/scan-line';

// ═══════════════════════════════════════════════════════════════════════════
// ORGANIC GAZE HEATMAP - Flowing Heat Blobs with Smooth Animation
// ═══════════════════════════════════════════════════════════════════════════

interface GazeHeatmapProps {
  normalData: GazeSession;
  suspiciousData: GazeSession;
  className?: string;
}

// PERFORMANCE: Pre-allocated arrays for blur operations to avoid GC pressure
let _blurArrayR: number[] | null = null;
let _blurArrayG: number[] | null = null;
let _blurArrayB: number[] | null = null;
let _blurArrayA: number[] | null = null;
let _lastBlurSize = 0;

// Apply Gaussian-like blur using multiple passes of box blur (fast approximation)
// PERFORMANCE: Reuses pre-allocated arrays to avoid memory allocation every frame
function applyStackBlur(imageData: ImageData, radius: number): void {
  const pixels = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  if (radius < 1) return;

  const wm = width - 1;
  const hm = height - 1;
  const div = radius + radius + 1;
  const size = width * height;

  // PERFORMANCE: Reuse arrays if size matches, otherwise reallocate
  if (_lastBlurSize !== size) {
    _blurArrayR = new Array(size);
    _blurArrayG = new Array(size);
    _blurArrayB = new Array(size);
    _blurArrayA = new Array(size);
    _lastBlurSize = size;
  }

  const r = _blurArrayR!;
  const g = _blurArrayG!;
  const b = _blurArrayB!;
  const a = _blurArrayA!;

  let rsum: number, gsum: number, bsum: number, asum: number;
  let p: number, p1: number, p2: number;
  let yp: number, yi: number, yw: number;

  // PERFORMANCE: Zero-fill using simple loop (faster than creating new arrays)
  for (let i = 0; i < size; i++) {
    r[i] = 0;
    g[i] = 0;
    b[i] = 0;
    a[i] = 0;
  }

  // Horizontal pass
  yw = yi = 0;
  for (let y = 0; y < height; y++) {
    rsum = gsum = bsum = asum = 0;

    for (let i = -radius; i <= radius; i++) {
      p = (yi + Math.min(wm, Math.max(i, 0))) * 4;
      rsum += pixels[p];
      gsum += pixels[p + 1];
      bsum += pixels[p + 2];
      asum += pixels[p + 3];
    }

    for (let x = 0; x < width; x++) {
      r[yi] = rsum;
      g[yi] = gsum;
      b[yi] = bsum;
      a[yi] = asum;

      if (y === 0) {
        p1 = Math.min(x + radius + 1, wm) * 4;
        p2 = Math.max(x - radius, 0) * 4;
      } else {
        p1 = (yw + Math.min(x + radius + 1, wm)) * 4;
        p2 = (yw + Math.max(x - radius, 0)) * 4;
      }

      rsum += pixels[p1] - pixels[p2];
      gsum += pixels[p1 + 1] - pixels[p2 + 1];
      bsum += pixels[p1 + 2] - pixels[p2 + 2];
      asum += pixels[p1 + 3] - pixels[p2 + 3];

      yi++;
    }
    yw += width;
  }

  // Vertical pass
  for (let x = 0; x < width; x++) {
    rsum = gsum = bsum = asum = 0;
    yp = -radius * width;

    for (let i = -radius; i <= radius; i++) {
      yi = Math.max(0, yp) + x;
      rsum += r[yi];
      gsum += g[yi];
      bsum += b[yi];
      asum += a[yi];
      yp += width;
    }

    yi = x;
    for (let y = 0; y < height; y++) {
      pixels[yi * 4] = Math.round(rsum / (div * div));
      pixels[yi * 4 + 1] = Math.round(gsum / (div * div));
      pixels[yi * 4 + 2] = Math.round(bsum / (div * div));
      pixels[yi * 4 + 3] = Math.round(asum / (div * div));

      p1 = x + Math.min(y + radius + 1, hm) * width;
      p2 = x + Math.max(y - radius, 0) * width;

      rsum += r[p1] - r[p2];
      gsum += g[p1] - g[p2];
      bsum += b[p1] - b[p2];
      asum += a[p1] - a[p2];

      yi += width;
    }
  }
}

export function GazeHeatmap({ normalData, suspiciousData, className }: GazeHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heatBufferRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [dataType, setDataType] = useState<'normal' | 'suspicious'>('normal');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  const currentData = dataType === 'normal' ? normalData : suspiciousData;

  // Calculate scan line duration to match the heatmap animation
  // Points are drawn at 12 per frame at ~60fps, plus initial delay
  const pointsPerFrame = 12;
  const estimatedFps = 60;
  const initialDelay = 0.3; // 300ms delay before animation starts
  const framesNeeded = Math.ceil(currentData.points.length / pointsPerFrame);
  const animationDuration = (framesNeeded / estimatedFps) + initialDelay + 0.5; // Add 0.5s buffer

  // Track mouse position for interactive glow
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      mousePosition.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }, []);

  // Draw organic heatmap with flowing heat blobs
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // Create heat buffer canvas (for accumulation)
    if (!heatBufferRef.current) {
      heatBufferRef.current = document.createElement('canvas');
    }
    const heatBuffer = heatBufferRef.current;
    heatBuffer.width = rect.width;
    heatBuffer.height = rect.height;
    const heatCtx = heatBuffer.getContext('2d', { willReadFrequently: true });
    if (!heatCtx) return;

    // Clear heat buffer
    heatCtx.clearRect(0, 0, rect.width, rect.height);

    const padding = 40;
    const screenX = padding;
    const screenY = padding;
    const screenWidth = rect.width - padding * 2;
    const screenHeight = rect.height - padding * 2;

    const points = currentData.points;

    // Pre-calculate all point positions
    const pointPositions = points.map(point => {
      let x: number, y: number;

      if (point.isOffScreen) {
        if (point.direction === 'left') {
          x = padding / 2;
          y = screenY + point.y * screenHeight;
        } else if (point.direction === 'right') {
          x = rect.width - padding / 2;
          y = screenY + point.y * screenHeight;
        } else {
          x = screenX + point.x * screenWidth;
          y = point.direction === 'top' ? padding / 2 : rect.height - padding / 2;
        }
      } else {
        x = screenX + point.x * screenWidth;
        y = screenY + point.y * screenHeight;
      }

      return { x, y, duration: point.duration, isOffScreen: point.isOffScreen };
    });

    setIsAnimating(true);
    let pointIndex = 0;
    const pointsPerFrame = 12;
    let lastTime = 0;
    const pulseSpeed = 0.003;
    // PERFORMANCE: Track frame count to throttle expensive blur operation
    let frameCount = 0;
    const blurEveryNFrames = 3; // Only blur every 3 frames

    // Draw background elements (static)
    const drawBackground = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Background gradient - Dark mode
      const bgGradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      bgGradient.addColorStop(0, '#01101B');
      bgGradient.addColorStop(0.5, '#0a1929');
      bgGradient.addColorStop(1, '#01101B');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Animated grid
      const time = Date.now() * 0.001;
      const gridSize = 30;

      for (let x = 0; x < rect.width; x += gridSize) {
        const opacity = 0.08 + Math.sin(x * 0.01 + time) * 0.03;
        ctx.strokeStyle = `rgba(104, 113, 147, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, rect.height);
        ctx.stroke();
      }
      for (let y = 0; y < rect.height; y += gridSize) {
        const opacity = 0.08 + Math.cos(y * 0.01 + time) * 0.03;
        ctx.strokeStyle = `rgba(104, 113, 147, ${opacity})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rect.width, y);
        ctx.stroke();
      }

      // Screen boundary glow
      ctx.shadowColor = 'rgba(104, 113, 147, 0.3)';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = 'rgba(104, 113, 147, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(screenX, screenY, screenWidth, screenHeight);
      ctx.shadowBlur = 0;

      // Dashed inner boundary
      ctx.strokeStyle = 'rgba(54, 69, 79, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(screenX + 2, screenY + 2, screenWidth - 4, screenHeight - 4);
      ctx.setLineDash([]);

      // Off-screen zone labels (rotated vertically to fit)
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.shadowColor = 'rgba(239, 68, 68, 0.5)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Left side label (rotated -90 degrees)
      ctx.save();
      ctx.translate(padding / 2, rect.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('OFF-SCREEN LEFT', 0, 0);
      ctx.restore();

      // Right side label (rotated 90 degrees)
      ctx.save();
      ctx.translate(rect.width - padding / 2, rect.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.fillText('OFF-SCREEN RIGHT', 0, 0);
      ctx.restore();

      ctx.shadowBlur = 0;
    };

    // Draw a single heat point to the buffer (accumulates)
    const drawHeatPoint = (x: number, y: number, duration: number, isOffScreen: boolean) => {
      // Intensity based on dwell time (normalized 0-1)
      const intensity = Math.min(1, duration / 350);
      const baseRadius = 20 + intensity * 30;

      // Create soft radial gradient for organic blob
      const gradient = heatCtx.createRadialGradient(x, y, 0, x, y, baseRadius);

      if (isOffScreen) {
        gradient.addColorStop(0, `rgba(220, 38, 38, ${0.6 * intensity})`);
        gradient.addColorStop(0.4, `rgba(239, 68, 68, ${0.35 * intensity})`);
        gradient.addColorStop(0.7, `rgba(239, 68, 68, ${0.15 * intensity})`);
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else {
        gradient.addColorStop(0, `rgba(144, 153, 187, ${0.6 * intensity})`);
        gradient.addColorStop(0.4, `rgba(122, 138, 163, ${0.4 * intensity})`);
        gradient.addColorStop(0.7, `rgba(104, 113, 147, ${0.2 * intensity})`);
        gradient.addColorStop(1, 'rgba(104, 113, 147, 0)');
      }

      // Use additive blending for heat accumulation
      heatCtx.globalCompositeOperation = 'lighter';
      heatCtx.fillStyle = gradient;
      heatCtx.beginPath();
      heatCtx.arc(x, y, baseRadius, 0, Math.PI * 2);
      heatCtx.fill();
      heatCtx.globalCompositeOperation = 'source-over';
    };

    // Animation loop for smooth rendering with pulsing effect
    const animate = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      // Add new points gradually with smooth fade-in
      if (pointIndex < points.length) {
        const newPointsCount = Math.min(pointsPerFrame, points.length - pointIndex);

        for (let i = 0; i < newPointsCount; i++) {
          const pos = pointPositions[pointIndex];
          drawHeatPoint(pos.x, pos.y, pos.duration, pos.isOffScreen);
          pointIndex++;
        }
      }

      // Draw background
      drawBackground();

      // Calculate pulse effect (subtle breathing)
      const time = timestamp * pulseSpeed;
      const pulseIntensity = 0.85 + Math.sin(time) * 0.15;

      // PERFORMANCE: Apply blur less frequently and only during build-up phase
      frameCount++;
      if (pointIndex <= points.length * 0.3 && frameCount % blurEveryNFrames === 0) {
        const heatImageData = heatCtx.getImageData(0, 0, rect.width, rect.height);
        applyStackBlur(heatImageData, 3);
        heatCtx.putImageData(heatImageData, 0, 0);
      }

      // Draw heat buffer to main canvas with pulse modulation
      ctx.globalAlpha = pulseIntensity;
      ctx.drawImage(heatBuffer, 0, 0);
      ctx.globalAlpha = 1;

      // Add bright hotspots at high-intensity areas (drawn on top)
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < Math.min(pointIndex, pointPositions.length); i++) {
        const pos = pointPositions[i];
        const intensity = Math.min(1, pos.duration / 350);

        // Only draw hotspot for longer dwell times
        if (intensity > 0.5) {
          const hotspotGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 4);
          if (pos.isOffScreen) {
            hotspotGradient.addColorStop(0, `rgba(248, 113, 113, ${(intensity - 0.5) * 0.9 * pulseIntensity})`);
            hotspotGradient.addColorStop(1, 'rgba(248, 113, 113, 0)');
          } else {
            hotspotGradient.addColorStop(0, `rgba(243, 246, 251, ${(intensity - 0.5) * 0.8 * pulseIntensity})`);
            hotspotGradient.addColorStop(1, 'rgba(243, 246, 251, 0)');
          }
          ctx.fillStyle = hotspotGradient;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = 'source-over';

      // Continue animation
      if (pointIndex < points.length) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Continue subtle pulsing after all points drawn
        setIsAnimating(false);
        const continuePulse = (ts: number) => {
          drawBackground();
          const pulseTime = ts * pulseSpeed;
          const pulse = 0.9 + Math.sin(pulseTime) * 0.1;
          ctx.globalAlpha = pulse;
          ctx.drawImage(heatBuffer, 0, 0);
          ctx.globalAlpha = 1;
          animationRef.current = requestAnimationFrame(continuePulse);
        };
        animationRef.current = requestAnimationFrame(continuePulse);
      }
    };

    // Start animation with delay
    const timeoutId = setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentData]);

  return (
    <div className={cn('w-full', className)}>
      {/* Toggle Control with animation */}
      <div className="flex justify-center mb-6">
        <SegmentedControl
          options={[
            { value: 'normal', label: 'Normal Interview' },
            { value: 'suspicious', label: 'Suspicious Interview' },
          ]}
          value={dataType}
          onChange={(value) => setDataType(value as 'normal' | 'suspicious')}
        />
      </div>

      {/* Heatmap Container */}
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative aspect-video w-full rounded-lg overflow-hidden border border-blockd-accent/20 cursor-glow"
        whileHover={{ scale: 1.005 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* Scan line effect */}
        {isAnimating && <ScanLine duration={animationDuration} />}

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blockd-accent/40 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blockd-accent/40 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blockd-accent/40 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blockd-accent/40 rounded-br-lg" />

        {/* "LIVE ANALYSIS" badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-blockd-void/80 border border-blockd-accent/30 backdrop-blur-sm"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-blockd-risk-low"
          />
          <span className="text-xs font-mono text-blockd-muted">LIVE ANALYSIS</span>
        </motion.div>
      </motion.div>

      {/* Enhanced Metrics with hover effects */}
      <AnimatePresence mode="wait">
        <motion.div
          key={dataType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="mt-6 grid grid-cols-3 gap-4"
        >
          <motion.div
            className={cn(
              'glass-tinted p-4 text-center transition-all duration-300 cursor-pointer',
              hoveredMetric === 'offscreen' && 'ring-1 ring-blockd-accent/50'
            )}
            onMouseEnter={() => setHoveredMetric('offscreen')}
            onMouseLeave={() => setHoveredMetric(null)}
            whileHover={{ y: -2 }}
          >
            <p className="text-xs font-mono uppercase tracking-wider text-blockd-muted mb-1">
              Off-screen Events
            </p>
            <motion.p
              className={cn(
                'text-2xl font-mono font-medium tabular-nums',
                currentData.metadata.offScreenEvents > 5 ? 'text-blockd-risk-critical' : 'text-blockd-light'
              )}
              animate={currentData.metadata.offScreenEvents > 5 ? {
                textShadow: ['0 0 10px rgba(239, 68, 68, 0.5)', '0 0 20px rgba(239, 68, 68, 0.8)', '0 0 10px rgba(239, 68, 68, 0.5)']
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {currentData.metadata.offScreenEvents}
            </motion.p>
          </motion.div>

          <motion.div
            className={cn(
              'glass-tinted p-4 text-center transition-all duration-300 cursor-pointer',
              hoveredMetric === 'attention' && 'ring-1 ring-blockd-accent/50'
            )}
            onMouseEnter={() => setHoveredMetric('attention')}
            onMouseLeave={() => setHoveredMetric(null)}
            whileHover={{ y: -2 }}
          >
            <p className="text-xs font-mono uppercase tracking-wider text-blockd-muted mb-1">
              Attention Score
            </p>
            <p className={cn(
              'text-2xl font-mono font-medium tabular-nums',
              currentData.metadata.attentionScore < 0.7 ? 'text-blockd-risk-medium' : 'text-blockd-light'
            )}>
              {currentData.metadata.attentionScore.toFixed(2)}
            </p>
          </motion.div>

          <motion.div
            className={cn(
              'glass-tinted p-4 text-center transition-all duration-300 cursor-pointer',
              hoveredMetric === 'pattern' && 'ring-1 ring-blockd-accent/50'
            )}
            onMouseEnter={() => setHoveredMetric('pattern')}
            onMouseLeave={() => setHoveredMetric(null)}
            whileHover={{ y: -2 }}
          >
            <p className="text-xs font-mono uppercase tracking-wider text-blockd-muted mb-1">
              Reading Pattern
            </p>
            <p className={cn(
              'text-2xl font-mono font-medium',
              currentData.metadata.readingPatternDetected ? 'text-blockd-risk-critical' : 'text-blockd-risk-low'
            )}>
              {currentData.metadata.readingPatternDetected ? 'Detected' : 'Normal'}
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
