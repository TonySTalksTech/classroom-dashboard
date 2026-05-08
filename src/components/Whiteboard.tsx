/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { 
  Pencil, 
  Eraser, 
  Type, 
  Square, 
  Circle, 
  ArrowRight, 
  Minus, 
  Highlighter, 
  Undo, 
  Redo, 
  Trash2, 
  Download, 
  Maximize2, 
  Grid3X3, 
  Ruler, 
  Compass, 
  Calculator, 
  FunctionSquare,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface WhiteboardProps {
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export type WhiteboardHandle = {
  resize: () => void;
  getData: () => string;
};

const WB_COLORS = [
  { id: 'white', value: '#ffffff' },
  { id: 'black', value: '#1a1a2e' },
  { id: 'red', value: '#ff5f5f' },
  { id: 'orange', value: '#ff9a3c' },
  { id: 'yellow', value: '#ffd600' },
  { id: 'green', value: '#4ade80' },
  { id: 'teal', value: '#00d4aa' },
  { id: 'blue', value: '#4ea8ff' },
  { id: 'purple', value: '#a78bfa' },
  { id: 'pink', value: '#f472b6' },
];

const WB_SIZES = {
  sm: 2,
  md: 6,
  lg: 14,
  xl: 28
};

const Whiteboard = forwardRef<WhiteboardHandle, WhiteboardProps>(({ isMaximized, onToggleMaximize }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<string>('pen');
  const [color, setColor] = useState<string>('#ffffff');
  const [size, setSize] = useState<keyof typeof WB_SIZES>('sm');
  const [bgDark, setBgDark] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [snapshotBeforeStroke, setSnapshotBeforeStroke] = useState<string | null>(null);
  
  // Math tool states
  const [showGrid, setShowGrid] = useState(false);
  const [gridScale, setGridScale] = useState(30);
  const [showGridLabels, setShowGridLabels] = useState(true);
  const [showEqPanel, setShowEqPanel] = useState(false);
  const [activeGeoTools, setActiveGeoTools] = useState<Set<string>>(new Set());
  const [showGrapher, setShowGrapher] = useState(false);
  const [functions, setFunctions] = useState<{ expr: string, color: string }[]>([]);
  
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const toggleGeoTool = (toolId: string) => {
    setActiveGeoTools(prev => {
      const next = new Set(prev);
      if (next.has(toolId)) next.delete(toolId);
      else next.add(toolId);
      return next;
    });
  };

  const getCanvasDims = (cv: HTMLCanvasElement) => {
    const dpr = window.devicePixelRatio || 1;
    return { w: cv.width / dpr, h: cv.height / dpr };
  };

  const fillBg = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = bgDark ? '#1a1f2e' : '#f5f5f0';
    ctx.fillRect(0, 0, w, h);
  };

  const resize = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const wrap = cv.parentElement;
    if (!wrap) return;

    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;

    if (w === 0 || h === 0) return;

    let img: string | null = null;
    if (cv.width > 0 && cv.height > 0) {
      img = cv.toDataURL();
    }

    cv.width = w * dpr;
    cv.height = h * dpr;
    cv.style.width = `${w}px`;
    cv.style.height = `${h}px`;

    const ctx = cv.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      fillBg(ctx, w, h);
      if (img) {
        const im = new Image();
        im.onload = () => ctx.drawImage(im, 0, 0, w, h);
        im.src = img;
      }
      ctxRef.current = ctx;
    }

    if (showGrid) drawGrid();
  };

  useImperativeHandle(ref, () => ({
    resize,
    getData: () => canvasRef.current?.toDataURL() || ''
  }));

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const wrap = cv.parentElement;
    if (!wrap) return;

    resize();
    
    const observer = new ResizeObserver(() => {
      // Debounced resize to avoid flickering
      window.requestAnimationFrame(resize);
    });
    
    observer.observe(wrap);
    window.addEventListener('resize', resize);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    if (showGrid) drawGrid();
  }, [showGrid, gridScale, showGridLabels, bgDark]);

  const drawGrid = () => {
    const cv = gridCanvasRef.current;
    const wrap = canvasRef.current?.parentElement;
    if (!cv || !wrap) return;

    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    cv.width = w * dpr;
    cv.height = h * dpr;
    cv.style.width = `${w}px`;
    cv.style.height = `${h}px`;

    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const step = gridScale;
    const cx = Math.round(w / 2);
    const cy = Math.round(h / 2);

    // Grid lines
    ctx.strokeStyle = bgDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
    ctx.lineWidth = 1;
    for (let x = cx % step; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = cy % step; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = bgDark ? 'rgba(0,212,170,0.6)' : 'rgba(0,140,120,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();

    if (showGridLabels) {
      ctx.fillStyle = bgDark ? 'rgba(0,212,170,0.75)' : 'rgba(0,140,120,0.85)';
      ctx.font = "500 10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let x = cx + step; x < w - 10; x += step) {
        ctx.fillText(Math.round((x - cx) / step).toString(), x, cy + 6);
      }
      for (let x = cx - step; x > 10; x -= step) {
        ctx.fillText(Math.round((x - cx) / step).toString(), x, cy + 6);
      }
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let y = cy - step; y > 10; y -= step) {
        ctx.fillText(Math.round((cy - y) / step).toString(), cx - 7, y);
      }
      for (let y = cy + step; y < h - 10; y += step) {
        ctx.fillText(Math.round((cy - y) / step).toString(), cx - 7, y);
      }
    }
  };

  const snapshot = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const data = cv.toDataURL();
    setUndoStack(prev => [...prev.slice(-39), data]);
    setRedoStack([]);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const current = cv.toDataURL();
    setRedoStack(prev => [...prev, current]);
    
    const prev = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    
    const img = new Image();
    img.onload = () => {
      const ctx = cv.getContext('2d');
      if (ctx) {
        const { w, h } = getCanvasDims(cv);
        fillBg(ctx, w, h);
        ctx.drawImage(img, 0, 0, w, h);
      }
    };
    img.src = prev;
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const current = cv.toDataURL();
    setUndoStack(prev => [...prev, current]);
    
    const next = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    
    const img = new Image();
    img.onload = () => {
      const ctx = cv.getContext('2d');
      if (ctx) {
        const { w, h } = getCanvasDims(cv);
        fillBg(ctx, w, h);
        ctx.drawImage(img, 0, 0, w, h);
      }
    };
    img.src = next;
  };

  const applyStyle = (ctx: CanvasRenderingContext2D, t: string, c: string, s: keyof typeof WB_SIZES) => {
    const sz = WB_SIZES[s];
    if (t === 'highlighter') {
      ctx.globalAlpha = 0.35;
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = c;
      ctx.lineWidth = sz * 4;
    } else if (t === 'eraser') {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = bgDark ? '#1a1f2e' : '#f5f5f0';
      ctx.lineWidth = sz * 3;
    } else if (t === 'marker') {
      ctx.globalAlpha = 0.85;
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = c;
      ctx.lineWidth = sz * 2.5;
    } else {
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = c;
      ctx.lineWidth = sz;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent, cv: HTMLCanvasElement) => {
    const rect = cv.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return { x: 0, y: 0 };
    }
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const drawShape = (ctx: CanvasRenderingContext2D, t: string, x0: number, y0: number, x1: number, y1: number, c: string, s: keyof typeof WB_SIZES) => {
    ctx.save();
    applyStyle(ctx, t, c, s);
    ctx.beginPath();
    if (t === 'line' || t === 'arrow') {
      ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      if (t === 'arrow') {
        const angle = Math.atan2(y1 - y0, x1 - x0);
        const hw = Math.min(20, Math.hypot(x1 - x0, y1 - y0) * 0.3);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - hw * Math.cos(angle - 0.4), y1 - hw * Math.sin(angle - 0.4));
        ctx.lineTo(x1 - hw * Math.cos(angle + 0.4), y1 - hw * Math.sin(angle + 0.4));
        ctx.closePath(); ctx.fillStyle = c; ctx.globalAlpha = 1; ctx.fill();
      }
    } else if (t === 'rect') {
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    } else if (t === 'ellipse') {
      const rx = Math.abs(x1 - x0) / 2, ry = Math.abs(y1 - y0) / 2;
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  };

  const handleDown = (e: React.MouseEvent | React.TouchEvent) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const { x, y } = getPos(e, cv);
    
    setIsDrawing(true);
    setStartPos({ x, y });
    setSnapshotBeforeStroke(cv.toDataURL());

    if (['pen', 'marker', 'highlighter', 'eraser'].includes(tool)) {
      const ctx = cv.getContext('2d');
      if (ctx) {
        ctx.save();
        applyStyle(ctx, tool, color, size);
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const { x, y } = getPos(e, cv);
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    if (['pen', 'marker', 'highlighter', 'eraser'].includes(tool)) {
      applyStyle(ctx, tool, color, size);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      if (snapshotBeforeStroke) {
        const img = new Image();
        img.onload = () => {
          const { w, h } = getCanvasDims(cv);
          ctx.clearRect(0, 0, w, h);
          fillBg(ctx, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          drawShape(ctx, tool, startPos.x, startPos.y, x, y, color, size);
        };
        img.src = snapshotBeforeStroke;
      }
    }
  };

  const handleUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (snapshotBeforeStroke) {
      setUndoStack(prev => [...prev.slice(-39), snapshotBeforeStroke]);
      setRedoStack([]);
      setSnapshotBeforeStroke(null);
    }
  };

  const clear = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    snapshot();
    const ctx = cv.getContext('2d');
    if (ctx) {
      const { w, h } = getCanvasDims(cv);
      fillBg(ctx, w, h);
    }
  };

  const download = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const a = document.createElement('a');
    a.download = `whiteboard_${Date.now()}.png`;
    a.href = cv.toDataURL('image/png');
    a.click();
  };

  // Math stamping helpers (simplified for now)
  const stampText = (text: string) => {
    const cv = canvasRef.current;
    if (!cv) return;
    snapshot();
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const { w, h } = getCanvasDims(cv);
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = "500 48px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);
    ctx.restore();
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--surface)]">
      {/* Drawing Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[var(--surface2)] border-b border-[var(--border)] shrink-0 relative z-20 pointer-events-auto">
        <ToolbarButton active={tool === 'pen'} onClick={() => setTool('pen')} title="Pen"><Pencil size={18} /></ToolbarButton>
        <ToolbarButton active={tool === 'marker'} onClick={() => setTool('marker')} title="Marker"><Pencil size={18} strokeWidth={3} /></ToolbarButton>
        <ToolbarButton active={tool === 'highlighter'} onClick={() => setTool('highlighter')} title="Highlighter"><Highlighter size={18} /></ToolbarButton>
        <ToolbarButton active={tool === 'line'} onClick={() => setTool('line')} title="Line"><Minus size={18} className="-rotate-45" /></ToolbarButton>
        <ToolbarButton active={tool === 'arrow'} onClick={() => setTool('arrow')} title="Arrow"><ArrowRight size={18} className="-rotate-45" /></ToolbarButton>
        <ToolbarButton active={tool === 'rect'} onClick={() => setTool('rect')} title="Rectangle"><Square size={18} /></ToolbarButton>
        <ToolbarButton active={tool === 'ellipse'} onClick={() => setTool('ellipse')} title="Ellipse"><Circle size={18} /></ToolbarButton>
        <ToolbarButton active={tool === 'text'} onClick={() => setTool('text')} title="Text"><Type size={18} /></ToolbarButton>
        <ToolbarButton active={tool === 'eraser'} onClick={() => setTool('eraser')} title="Eraser"><Eraser size={18} /></ToolbarButton>
        
        <div className="w-px h-6 bg-[var(--border)] mx-1" />
        
        {(['sm', 'md', 'lg', 'xl'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSize(s)}
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-white/10",
              size === s && "bg-[var(--accent)]/30 border border-[var(--accent)]"
            )}
          >
            <div className="rounded-full bg-white" style={{ width: Math.max(3, WB_SIZES[s]/2), height: Math.max(3, WB_SIZES[s]/2) }} />
          </button>
        ))}

        <div className="w-px h-6 bg-[var(--border)] mx-1" />

        <div className="flex flex-wrap gap-1">
          {WB_COLORS.map(c => (
            <button
              key={c.id}
              onClick={() => setColor(c.value)}
              className={cn(
                "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                color === c.value ? "border-white" : "border-transparent"
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-[var(--border)] mx-1" />

        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => setBgDark(!bgDark)} title="Toggle Dark/Light Mode">
            <div className={cn("w-4 h-4 rounded-sm border", bgDark ? "bg-[#1a1f2e]" : "bg-[#f5f5f0]")} />
          </ToolbarButton>
          <ToolbarButton onClick={undo} title="Undo"><Undo size={18} /></ToolbarButton>
          <ToolbarButton onClick={redo} title="Redo"><Redo size={18} /></ToolbarButton>
          <ToolbarButton onClick={clear} title="Clear Board" className="text-red-400 hover:text-red-300"><Trash2 size={18} /></ToolbarButton>
          <ToolbarButton onClick={download} title="Download Image"><Download size={18} /></ToolbarButton>
          {onToggleMaximize && (
            <ToolbarButton onClick={onToggleMaximize} title="Maximize" className="ml-auto">
              <Maximize2 size={18} />
            </ToolbarButton>
          )}
        </div>
      </div>

      {/* Math Toolbar - This was missing in the legacy maximized view, now always visible */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 bg-[var(--accent)]/5 border-b border-[var(--accent)]/20 shrink-0 relative z-20 pointer-events-auto">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Math Tools</span>
        <ToolbarMathButton active={showGrid} onClick={() => setShowGrid(!showGrid)} icon={<Grid3X3 size={14} />} label="Grid" />
        
        {showGrid && (
          <div className="flex items-center gap-2 ml-1 px-2 border-l border-[var(--accent)]/20">
            <select 
              value={gridScale} 
              onChange={e => setGridScale(Number(e.target.value))}
              className="bg-[var(--surface2)] text-xs border border-[var(--accent)]/30 rounded px-1 py-0.5 outline-none focus:border-[var(--accent)]"
            >
              <option value="20">20px</option>
              <option value="30">30px</option>
              <option value="40">40px</option>
              <option value="60">60px</option>
            </select>
            <label className="flex items-center gap-1.5 text-[10px] text-[var(--muted)] cursor-pointer">
              <input type="checkbox" checked={showGridLabels} onChange={e => setShowGridLabels(e.target.checked)} className="accent-[var(--accent)]" />
              Labels
            </label>
          </div>
        )}

        <ToolbarMathButton 
          active={activeGeoTools.has('ruler')} 
          onClick={() => toggleGeoTool('ruler')} 
          icon={<Ruler size={14} />} 
          label="Ruler" 
        />
        <ToolbarMathButton 
          active={activeGeoTools.has('protractor')} 
          onClick={() => toggleGeoTool('protractor')} 
          icon={<Compass size={14} />} 
          label="Protractor" 
        />
        <ToolbarMathButton 
          active={activeGeoTools.has('compass')} 
          onClick={() => toggleGeoTool('compass')} 
          icon={<Calculator size={14} />} 
          label="Compass" 
        />
        
        <div className="w-px h-4 bg-[var(--accent)]/20 mx-1" />
        
        <ToolbarMathButton active={showEqPanel} onClick={() => setShowEqPanel(!showEqPanel)} icon={<FunctionSquare size={14} />} label="Equations" />
        <ToolbarMathButton active={showGrapher} onClick={() => setShowGrapher(!showGrapher)} icon={<Plus size={14} />} label="Grapher" />
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 min-h-0">
        <canvas
          ref={canvasRef}
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleUp}
          onMouseLeave={handleUp}
          onTouchStart={handleDown}
          onTouchMove={handleMove}
          onTouchEnd={handleUp}
          className={cn(
            "block touch-none cursor-crosshair",
            tool === 'eraser' && "cursor-cell",
            tool === 'text' && "cursor-text"
          )}
        />
        <canvas
          ref={gridCanvasRef}
          className={cn(
            "absolute inset-0 pointer-events-none transition-opacity duration-200",
            showGrid ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Equation Panel Overlay */}
        <AnimatePresence>
          {showEqPanel && (
            <motion.div 
              key="equation-panel"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="absolute bottom-0 inset-x-0 bg-[var(--surface)] border-t border-[var(--accent)]/30 p-3 z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Equation Templates</span>
                <button onClick={() => setShowEqPanel(false)} className="text-[var(--muted)] hover:text-white p-1 hover:bg-white/5 rounded-md"><X size={16} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                <EqButton onClick={() => stampText('√x')} label="√x" />
                <EqButton onClick={() => stampText('x²')} label="x²" />
                <EqButton onClick={() => stampText('π')} label="π" />
                <EqButton onClick={() => stampText('θ')} label="θ" />
                <EqButton onClick={() => stampText('Δ')} label="Δ" />
                <EqButton onClick={() => stampText('∑')} label="∑" />
                <EqButton onClick={() => stampText('∫')} label="∫" />
                <EqButton onClick={() => stampText('∞')} label="∞" />
                <EqButton onClick={() => stampText('≠')} label="≠" />
                <EqButton onClick={() => stampText('≤')} label="≤" />
                <EqButton onClick={() => stampText('±')} label="±" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

function ToolbarButton({ children, active, onClick, title, className }: { children: React.ReactNode, active?: boolean, onClick?: () => void, title?: string, className?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "w-9 h-9 rounded-md flex items-center justify-center transition-colors text-[var(--muted)] hover:bg-white/10 hover:text-white",
        active && "bg-[var(--accent)]/30 text-white border border-[var(--accent)]",
        className
      )}
    >
      {children}
    </button>
  );
}

function ToolbarMathButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all",
        active 
          ? "bg-[var(--accent)]/30 border-[var(--accent)] text-white" 
          : "bg-transparent border-[var(--accent)]/30 text-[var(--muted)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function EqButton({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 bg-[var(--surface2)] border border-[var(--accent)]/30 rounded-md font-mono text-sm hover:bg-[var(--accent)]/20 hover:border-[var(--accent)] transition-all"
    >
      {label}
    </button>
  );
}

export default Whiteboard;
