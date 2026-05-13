/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/src/lib/utils';
import { ClockMode } from '@/src/types';
import { useWidgetSize } from './Widget';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [mode, setMode] = useState<ClockMode>('12');
  const { width, height } = useWidgetSize();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    let h = time.getHours();
    const m = String(time.getMinutes()).padStart(2, '0');
    const s = String(time.getSeconds()).padStart(2, '0');
    let ampm = '';

    if (mode === '12') {
      ampm = h >= 12 ? ' PM' : ' AM';
      h = h % 12 || 12;
    }
    
    const hStr = mode === '24' ? String(h).padStart(2, '0') : String(h);
    return { h: hStr, m, s, ampm };
  };

  const { h, m, s, ampm } = formatTime();

  // Calculate dynamic font size based on width/height
  const baseSize = Math.min(width / 6, height / 2.5);
  const fontSize = Math.max(24, baseSize);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      {mode !== 'analog' ? (
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-2">
            <span 
              className="font-mono font-medium tracking-tight"
              style={{ fontSize: `${fontSize}px` }}
            >
              {h}:{m}:{s}
            </span>
            <span 
              className="font-bold text-[var(--accent2)] uppercase"
              style={{ fontSize: `${fontSize * 0.2}px` }}
            >
              {ampm}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <AnalogClock time={time} size={Math.min(width - 60, height - 80)} />
        </div>
      )}

      <div className="flex gap-1 shrink-0">
        {(['12', '24', 'analog'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "text-[10px] px-3 py-1 rounded-full border border-[var(--border)] font-medium transition-all",
              mode === m ? "bg-[var(--accent)] border-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-white hover:border-white/30"
            )}
          >
            {m === 'analog' ? 'Analog' : m + 'h'}
          </button>
        ))}
      </div>
    </div>
  );
};

const AnalogClock: React.FC<{ time: Date; size: number }> = ({ time, size: requestedSize }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const size = Math.max(80, requestedSize);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = cx - 5;

    ctx.clearRect(0, 0, size, size);
    
    // Face
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1d27';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = size * 0.015;
    ctx.stroke();

    // Ticks & Numbers
    for (let i = 1; i <= 12; i++) {
      const angle = (i * Math.PI) / 6;
      const isBig = i % 3 === 0;
      const r1 = r - (isBig ? size * 0.08 : size * 0.05);
      const r2 = r - 2;
      
      // Draw tick
      ctx.beginPath();
      ctx.moveTo(cx + Math.sin(angle) * r1, cy - Math.cos(angle) * r1);
      ctx.lineTo(cx + Math.sin(angle) * r2, cy - Math.cos(angle) * r2);
      ctx.strokeStyle = isBig ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = isBig ? size * 0.015 : size * 0.008;
      ctx.stroke();

      // Draw number
      const numRadius = r - (size * 0.2);
      const nx = cx + Math.sin(angle) * numRadius;
      const ny = cy - Math.cos(angle) * numRadius;
      
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = `bold ${Math.max(10, size * 0.08)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i.toString(), nx, ny);
    }

    const h = time.getHours() % 12;
    const mi = time.getMinutes();
    const s = time.getSeconds();

    const hA = (h + mi / 60) * Math.PI / 6;
    const mA = (mi + s / 60) * Math.PI / 30;
    const sA = s * Math.PI / 30;

    // Hour hand
    ctx.beginPath();
    ctx.moveTo(cx - Math.sin(hA) * size * 0.05, cy + Math.cos(hA) * size * 0.05);
    ctx.lineTo(cx + Math.sin(hA) * (r * 0.5), cy - Math.cos(hA) * (r * 0.5));
    ctx.strokeStyle = '#f0f0f5';
    ctx.lineWidth = size * 0.035;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Minute hand
    ctx.beginPath();
    ctx.moveTo(cx - Math.sin(mA) * size * 0.06, cy + Math.cos(mA) * size * 0.06);
    ctx.lineTo(cx + Math.sin(mA) * (r * 0.75), cy - Math.cos(mA) * (r * 0.75));
    ctx.strokeStyle = '#f0f0f5';
    ctx.lineWidth = size * 0.02;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Second hand
    ctx.beginPath();
    ctx.moveTo(cx - Math.sin(sA) * size * 0.08, cy + Math.cos(sA) * size * 0.08);
    ctx.lineTo(cx + Math.sin(sA) * (r * 0.85), cy - Math.cos(sA) * (r * 0.85));
    ctx.strokeStyle = '#00d4aa';
    ctx.lineWidth = size * 0.012;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.025, 0, Math.PI * 2);
    ctx.fillStyle = '#00d4aa';
    ctx.fill();

  }, [time, size]);

  return <canvas ref={canvasRef} />;
};

export default Clock;
