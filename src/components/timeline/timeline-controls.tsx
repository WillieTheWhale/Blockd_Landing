'use client';

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE CONTROLS
// Playback, zoom, and filter controls
// ═══════════════════════════════════════════════════════════════════════════

import React, { useCallback, useEffect, useRef } from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Filter,
} from 'lucide-react';
import { EventSeverity } from '@/types';
import { useTimelineStore } from '@/store/timeline';
import { getPlaybackService } from '@/services/timeline';
import {
  controlsEntranceVariants,
  playButtonVariants,
  zoomButtonVariants,
  filterChipVariants,
  currentTimeVariants,
} from '@/lib/timeline/animation-variants';
import { formatTime } from '@/domain/timeline/calculations';
import { SEVERITY_COLORS } from '@/lib/severity-colors';
import { cn } from '@/lib/cn';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface TimelineControlsProps {
  /** Whether to enable playback controls */
  enablePlayback?: boolean;
  /** Whether to enable zoom controls */
  enableZoom?: boolean;
  /** Whether to enable filter controls */
  enableFilters?: boolean;
  /** Motion value for current time */
  timeMotionValue: MotionValue<number>;
  /** Custom class name */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function TimelineControls({
  enablePlayback = true,
  enableZoom = true,
  enableFilters = true,
  timeMotionValue,
  className,
}: TimelineControlsProps) {
  // Refs
  const playbackServiceRef = useRef(getPlaybackService());

  // Store state
  const playback = useTimelineStore((state) => state.playback);
  const zoom = useTimelineStore((state) => state.zoom);
  const filters = useTimelineStore((state) => state.filters);
  const config = useTimelineStore((state) => state.config);

  // Store actions
  const play = useTimelineStore((state) => state.play);
  const pause = useTimelineStore((state) => state.pause);
  const setSpeed = useTimelineStore((state) => state.setSpeed);
  const seek = useTimelineStore((state) => state.seek);
  const seekToStart = useTimelineStore((state) => state.seekToStart);
  const zoomIn = useTimelineStore((state) => state.zoomIn);
  const zoomOut = useTimelineStore((state) => state.zoomOut);
  const resetZoom = useTimelineStore((state) => state.resetZoom);
  const toggleSeverity = useTimelineStore((state) => state.toggleSeverity);
  const advanceTime = useTimelineStore((state) => state.advanceTime);

  // Formatted time
  const formattedTime = useTransform(timeMotionValue, (t) => formatTime(t));
  const formattedDuration = formatTime(config.duration);

  // ─────────────────────────────────────────────────────────────────────────
  // PLAYBACK SERVICE SYNC
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const service = playbackServiceRef.current;
    service.setTimeMotionValue(timeMotionValue);
    service.updateConfig(config);
    service.setCallbacks(
      (time) => seek(time),
      () => pause(),
      (time) => seek(time)
    );

    return () => {
      service.destroy();
    };
  }, [timeMotionValue, config, seek, pause]);

  // Sync playback state with service
  useEffect(() => {
    const service = playbackServiceRef.current;
    if (playback.isPlaying) {
      service.play();
    } else {
      service.pause();
    }
    service.setSpeed(playback.speed);
  }, [playback.isPlaying, playback.speed]);

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const handlePlayPause = useCallback(() => {
    if (playback.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [playback.isPlaying, play, pause]);

  const handleSpeedChange = useCallback(() => {
    const speeds = config.playbackSpeeds;
    const currentIndex = speeds.indexOf(playback.speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setSpeed(speeds[nextIndex]);
  }, [config.playbackSpeeds, playback.speed, setSpeed]);

  const handleSkipBack = useCallback(() => {
    seekToStart();
  }, [seekToStart]);

  const handleSkipForward = useCallback(() => {
    seek(config.duration);
  }, [seek, config.duration]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <motion.div
      data-timeline-controls
      className={cn(
        'flex items-center justify-between gap-4 mt-4 p-3',
        'bg-blockd-surface/30 backdrop-blur-sm rounded-lg',
        'border border-blockd-surface/50',
        className
      )}
      variants={controlsEntranceVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Left: Playback Controls */}
      {enablePlayback && (
        <div className="flex items-center gap-2">
          {/* Skip to start */}
          <motion.button
            className="p-2 rounded-lg hover:bg-blockd-surface/50 text-blockd-muted hover:text-blockd-light transition-colors"
            variants={playButtonVariants}
            initial="idle"
            whileHover="hovered"
            whileTap="pressed"
            onClick={handleSkipBack}
          >
            <SkipBack className="w-4 h-4" />
          </motion.button>

          {/* Play/Pause */}
          <motion.button
            className={cn(
              'p-3 rounded-full',
              'bg-blockd-accent hover:bg-blockd-accent/80',
              'text-white shadow-lg shadow-blockd-accent/30',
              'transition-colors'
            )}
            variants={playButtonVariants}
            initial="idle"
            whileHover="hovered"
            whileTap="pressed"
            onClick={handlePlayPause}
          >
            {playback.isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </motion.button>

          {/* Skip to end */}
          <motion.button
            className="p-2 rounded-lg hover:bg-blockd-surface/50 text-blockd-muted hover:text-blockd-light transition-colors"
            variants={playButtonVariants}
            initial="idle"
            whileHover="hovered"
            whileTap="pressed"
            onClick={handleSkipForward}
          >
            <SkipForward className="w-4 h-4" />
          </motion.button>

          {/* Speed indicator */}
          <motion.button
            className="px-2 py-1 text-xs font-mono text-blockd-muted hover:text-blockd-accent transition-colors"
            onClick={handleSpeedChange}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {playback.speed}x
          </motion.button>
        </div>
      )}

      {/* Center: Time Display */}
      <motion.div
        className="flex items-center gap-2 font-mono text-sm"
        variants={currentTimeVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.span className="text-blockd-light tabular-nums">
          {formattedTime}
        </motion.span>
        <span className="text-blockd-muted/50">/</span>
        <span className="text-blockd-muted tabular-nums">{formattedDuration}</span>
      </motion.div>

      {/* Right: Zoom & Filters */}
      <div className="flex items-center gap-3">
        {/* Filters */}
        {enableFilters && (
          <div className="flex items-center gap-1">
            {(['info', 'warning', 'critical'] as EventSeverity[]).map((severity) => {
              const isActive = filters.severities.has(severity);
              const color = SEVERITY_COLORS[severity];

              return (
                <motion.button
                  key={severity}
                  className={cn(
                    'w-2.5 h-2.5 rounded-full border-2',
                    'transition-all duration-200',
                    isActive ? 'border-transparent' : 'border-blockd-muted/30'
                  )}
                  style={{
                    backgroundColor: isActive ? color : 'transparent',
                    boxShadow: isActive ? `0 0 8px ${color}60` : 'none',
                  }}
                  variants={filterChipVariants}
                  initial={isActive ? 'active' : 'inactive'}
                  animate={isActive ? 'active' : 'inactive'}
                  whileHover="hovered"
                  onClick={() => toggleSeverity(severity)}
                  title={`Toggle ${severity} events`}
                />
              );
            })}
          </div>
        )}

        {/* Zoom Controls */}
        {enableZoom && (
          <div className="flex items-center gap-1 border-l border-blockd-surface/50 pl-3">
            <motion.button
              className={cn(
                'p-1.5 rounded text-blockd-muted hover:text-blockd-light transition-colors',
                zoom.level <= config.minZoom && 'opacity-50 cursor-not-allowed'
              )}
              variants={zoomButtonVariants}
              initial="idle"
              animate={zoom.level <= config.minZoom ? 'disabled' : 'idle'}
              whileHover={zoom.level > config.minZoom ? 'hovered' : undefined}
              whileTap={zoom.level > config.minZoom ? 'pressed' : undefined}
              onClick={zoomOut}
              disabled={zoom.level <= config.minZoom}
            >
              <ZoomOut className="w-4 h-4" />
            </motion.button>

            <span className="text-xs font-mono text-blockd-muted min-w-[3ch] text-center">
              {Math.round(zoom.level * 100)}%
            </span>

            <motion.button
              className={cn(
                'p-1.5 rounded text-blockd-muted hover:text-blockd-light transition-colors',
                zoom.level >= config.maxZoom && 'opacity-50 cursor-not-allowed'
              )}
              variants={zoomButtonVariants}
              initial="idle"
              animate={zoom.level >= config.maxZoom ? 'disabled' : 'idle'}
              whileHover={zoom.level < config.maxZoom ? 'hovered' : undefined}
              whileTap={zoom.level < config.maxZoom ? 'pressed' : undefined}
              onClick={zoomIn}
              disabled={zoom.level >= config.maxZoom}
            >
              <ZoomIn className="w-4 h-4" />
            </motion.button>

            {zoom.level > 1 && (
              <motion.button
                className="p-1.5 rounded text-blockd-muted hover:text-blockd-light transition-colors"
                variants={zoomButtonVariants}
                initial="idle"
                whileHover="hovered"
                whileTap="pressed"
                onClick={resetZoom}
                title="Reset zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
