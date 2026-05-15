/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, RotateCcw, Volume2, VolumeX, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { TimerMode } from '@/src/types';
import { useWidgetSize } from './Widget';

interface TimerProps {
  isMinimized?: boolean;
  onSizeChange?: (isMinimized: boolean) => void;
}

const Timer: React.FC<TimerProps> = ({ isMinimized: propMinimized, onSizeChange }) => {
  const [mode, setMode] = useState<TimerMode>('down');
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundType, setSoundType] = useState<'classic' | 'bell' | 'digital' | 'marimba' | 'success'>('classic');
  const [inputVal, setInputVal] = useState(5);
  const [internalMinimized, setInternalMinimized] = useState(false);
  
  const isMinimized = propMinimized !== undefined ? propMinimized : internalMinimized;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { width, height } = useWidgetSize();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (mode === 'down') {
            if (prev <= 1) {
              handleEnd();
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  const handleEnd = () => {
    setIsRunning(false);
    if (soundEnabled) playSound();
  };

  const playSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      
      const beep = (freq: number, start: number, dur: number, type: OscillatorType = 'sine', volume = 0.4) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(volume, ctx.currentTime + start);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        o.start(ctx.currentTime + start);
        o.stop(ctx.currentTime + start + dur + 0.05);
      };

      switch (soundType) {
        case 'classic':
          beep(880, 0, 0.15);
          beep(1046, 0.2, 0.15);
          beep(1318, 0.4, 0.5);
          break;
        case 'bell':
          beep(1760, 0, 1.2, 'sine', 0.5);
          beep(880, 0, 0.8, 'sine', 0.2);
          break;
        case 'digital':
          beep(2000, 0, 0.05, 'square', 0.2);
          beep(2000, 0.1, 0.05, 'square', 0.2);
          beep(2000, 0.2, 0.05, 'square', 0.2);
          break;
        case 'marimba':
          beep(523.25, 0, 0.3, 'sine', 0.5);
          beep(659.25, 0.1, 0.3, 'sine', 0.5);
          beep(783.99, 0.2, 0.3, 'sine', 0.5);
          break;
        case 'success':
          [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
            beep(f, i * 0.1, 0.4, 'triangle', 0.3);
          });
          break;
      }
    } catch (e) {
      console.warn('Audio not supported', e);
    }
  };

  const cycleSound = () => {
    const types: ('classic' | 'bell' | 'digital' | 'marimba' | 'success')[] = ['classic', 'bell', 'digital', 'marimba', 'success'];
    const idx = types.indexOf(soundType);
    const next = types[(idx + 1) % types.length];
    setSoundType(next);
    // Preview sound
    setTimeout(() => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = 440;
        g.gain.setValueAtTime(0.1, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        o.start();
        o.stop(ctx.currentTime + 0.11);
      } catch(e) {}
    }, 0);
  };

  const toggle = () => setIsRunning(!isRunning);

  const reset = () => {
    setIsRunning(false);
    if (mode === 'down') {
      setTimeLeft(inputVal * 60);
    } else {
      setTimeLeft(0);
    }
  };

  const format = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const setPreset = (m: number) => {
    setIsRunning(false);
    setMode('down');
    setInputVal(m);
    setTimeLeft(m * 60);
  };

  const toggleMinimized = () => {
    const nextValue = !isMinimized;
    setInternalMinimized(nextValue);
    onSizeChange?.(nextValue);
  };

  // Calculate dynamic font size based on width/height
  // Account for header (~36px) and body padding (~16px if p-2)
  const availableHeight = height - 60;
  const baseSize = isMinimized 
    ? Math.min(width / 3.5, availableHeight * 0.9) 
    : Math.min(width / 5, availableHeight / 3);
  const fontSize = Math.max(24, baseSize);

  return (
    <div className={cn(
      "flex flex-col items-center gap-4 h-full relative",
      isMinimized ? "justify-center pt-0" : "justify-start pt-4"
    )}>
      {/* Minimize/Expand Toggle */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggleMinimized();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-0 right-0 p-1.5 rounded-full bg-[var(--surface2)] border border-[var(--border)] text-[var(--muted)] hover:text-white transition-all z-20 shadow-lg"
        title={isMinimized ? "Expand" : "Minimize"}
      >
        <div className={cn("transition-transform duration-300", isMinimized ? "rotate-0" : "rotate-180")}>
          <ChevronRight size={14} className="rotate-90" />
        </div>
      </button>

      <div 
        className={cn(
          "font-mono font-medium tracking-tighter transition-all duration-300 text-white",
          mode === 'down' && timeLeft <= 30 && "text-orange-400",
          mode === 'down' && timeLeft <= 10 && "text-red-500 animate-pulse",
          isMinimized ? "mt-0" : "mt-2"
        )}
        style={{ fontSize: `${fontSize}px`, lineHeight: 1 }}
      >
        {format(timeLeft)}
      </div>

      {!isMinimized && (
        <>
          <div className="flex items-center gap-2 w-full max-w-[240px] shrink-0">
            {mode === 'down' && (
              <div className="flex items-center gap-1 bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-2 py-1">
                <input 
                  type="number" 
                  value={inputVal} 
                  onChange={e => {
                    const v = parseInt(e.target.value) || 0;
                    setInputVal(v);
                    if (!isRunning) setTimeLeft(v * 60);
                  }}
                  className="w-10 bg-transparent outline-none text-sm font-mono text-center"
                />
                <span className="text-[10px] uppercase font-bold text-[var(--muted)]">min</span>
              </div>
            )}
            <button 
              onClick={toggle}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm transition-all",
                isRunning ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : "bg-[var(--accent)] text-white"
              )}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? 'Pause' : timeLeft === 0 && mode === 'down' ? 'Restart' : 'Start'}
            </button>
            <button onClick={reset} className="p-1.5 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-[var(--muted)] hover:text-white transition-all">
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="flex flex-wrap gap-1 justify-center shrink-0">
            {[1, 2, 5, 10, 15, 20].map(m => (
              <button 
                key={m} 
                onClick={() => setPreset(m)}
                className="text-[10px] px-4 py-2 bg-[var(--surface2)] border border-[var(--border)] rounded-full text-[var(--muted)] hover:text-white hover:border-white/30 transition-all font-bold"
              >
                {m}m
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-center shrink-0">
            <button
              onClick={() => { setMode('down'); reset(); }}
              className={cn(
                "text-[10px] px-4 py-2 rounded-full border border-[var(--border)] font-bold transition-all text-[var(--muted)]",
                mode === 'down' && "bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg"
              )}
            >
              Countdown
            </button>
            <button
              onClick={() => { setMode('up'); reset(); }}
              className={cn(
                "text-[10px] px-4 py-2 rounded-full border border-[var(--border)] font-bold transition-all text-[var(--muted)]",
                mode === 'up' && "bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg"
              )}
            >
              Count-up
            </button>
            <button
              onClick={cycleSound}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full border border-[var(--border)] transition-all text-[var(--muted)] hover:text-white",
                soundEnabled && "border-[var(--accent2)]/20"
              )}
              title="Cycle notification sound"
            >
              <Music size={12} />
              <span className="text-[9px] uppercase font-bold tracking-wider">{soundType}</span>
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "p-1.5 rounded-full border border-[var(--border)] transition-all",
                soundEnabled ? "text-[var(--accent2)] border-[var(--accent2)]/30" : "text-[var(--muted)]"
              )}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Timer;
