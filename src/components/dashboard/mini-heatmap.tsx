'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

// ═══════════════════════════════════════════════════════════════════════════
// MINI HEATMAP COMPONENT - For Hero Dashboard Preview
// ═══════════════════════════════════════════════════════════════════════════

interface MiniHeatmapProps {
  className?: string;
}

export function MiniHeatmap({ className }: MiniHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<{ x: number; y: number; r: number }[]>([]);

  // Initialize with some points
  useEffect(() => {
    const initialPoints = Array.from({ length: 30 }, () => ({
      x: 0.2 + Math.random() * 0.6,
      y: 0.2 + Math.random() * 0.6,
      r: 8 + Math.random() * 12,
    }));
    setPoints(initialPoints);
  }, []);

  // Add new points periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPoints((prev) => {
        const newPoint = {
          x: 0.2 + Math.random() * 0.6,
          y: 0.2 + Math.random() * 0.6,
          r: 8 + Math.random() * 12,
        };
        // Keep last 40 points
        return [...prev.slice(-39), newPoint];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Draw heatmap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw background
    ctx.fillStyle = '#01101B';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw screen boundary
    const padding = 8;
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 2]);
    ctx.strokeRect(padding, padding, rect.width - padding * 2, rect.height - padding * 2);
    ctx.setLineDash([]);

    // Draw heat points
    points.forEach((point) => {
      const x = padding + point.x * (rect.width - padding * 2);
      const y = padding + point.y * (rect.height - padding * 2);

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, point.r);
      gradient.addColorStop(0, 'rgba(104, 113, 147, 0.7)');
      gradient.addColorStop(0.5, 'rgba(104, 113, 147, 0.2)');
      gradient.addColorStop(1, 'rgba(104, 113, 147, 0)');

      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, point.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    });
  }, [points]);

  return (
    <div className={cn('relative rounded overflow-hidden', className)}>
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* Subtle scan line */}
      <div className="scan-line opacity-50" style={{ animationDuration: '8s' }} />
    </div>
  );
}
