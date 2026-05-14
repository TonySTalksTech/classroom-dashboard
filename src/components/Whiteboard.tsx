/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { 
  Pencil, 
  MousePointer2,
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
  Calculator,
  Compass, 
  Variable,
  Sigma,
  LineChart,
  FunctionSquare,
  X,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { cn } from '@/src/lib/utils';

import { WhiteboardState, WhiteboardSize, WhiteboardElement } from '@/src/types';

interface WhiteboardProps {
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  sharedState?: WhiteboardState;
  onSharedStateChange?: (updates: Partial<WhiteboardState>) => void;
}

export type WhiteboardHandle = {
  resize: () => void;
  getData: () => string;
};

const WB_COLORS = [
  { id: 'white', value: '#ffffff' },
  { id: 'black', value: '#0f0f1a' },
  { id: 'red', value: '#ff3131' },
  { id: 'orange', value: '#ff9100' },
  { id: 'yellow', value: '#ffde00' },
  { id: 'green', value: '#00ff66' },
  { id: 'teal', value: '#00f2ff' },
  { id: 'blue', value: '#38b2ac' },
  { id: 'blue-alt', value: '#0070ff' },
  { id: 'purple', value: '#b621ff' },
  { id: 'pink', value: '#ff007a' },
];

const WB_SIZES = {
  sm: 2,
  md: 6,
  lg: 14,
  xl: 28
};

const Whiteboard = forwardRef<WhiteboardHandle, WhiteboardProps>(({ 
  isMaximized, 
  onToggleMaximize,
  sharedState,
  onSharedStateChange
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Internal fallback states if sharedState isn't provided
  const [internalTool, setInternalTool] = useState<string>('pen');
  const [internalColor, setInternalColor] = useState<string>('#ffffff');
  const [internalSize, setInternalSize] = useState<WhiteboardSize>('sm');
  const [internalBgDark, setInternalBgDark] = useState(true);
  const [internalUndoStack, setInternalUndoStack] = useState<string[]>([]);
  const [internalRedoStack, setInternalRedoStack] = useState<string[]>([]);
  
  const [internalShowGrid, setInternalShowGrid] = useState(false);
  const [internalGridScale, setInternalGridScale] = useState(30);
  const [internalShowGridLabels, setInternalShowGridLabels] = useState(true);
  const [internalShowEqPanel, setInternalShowEqPanel] = useState(false);
  const [internalShowMathTools, setInternalShowMathTools] = useState(false);
  const [internalActiveGeoTools, setInternalActiveGeoTools] = useState<string[]>([]);
  const [internalShowGrapher, setInternalShowGrapher] = useState(false);
  const [internalFunctions, setInternalFunctions] = useState<{ expr: string, color: string }[]>([]);
  const [internalElements, setInternalElements] = useState<WhiteboardElement[]>([]);

  // Helpers to use either shared or internal state
  const tool = sharedState?.tool ?? internalTool;
  const color = sharedState?.color ?? internalColor;
  const size = sharedState?.size ?? internalSize;
  const bgDark = sharedState?.bgDark ?? internalBgDark;
  const undoStack = sharedState?.undoStack ?? internalUndoStack;
  const redoStack = sharedState?.redoStack ?? internalRedoStack;
  const elements = sharedState?.elements ?? internalElements;
  
  const showGrid = sharedState?.showGrid ?? internalShowGrid;
  const gridScale = sharedState?.gridScale ?? internalGridScale;
  const showGridLabels = sharedState?.showGridLabels ?? internalShowGridLabels;
  const showEqPanel = sharedState?.showEqPanel ?? internalShowEqPanel;
  const showMathTools = sharedState?.showMathTools ?? internalShowMathTools;
  const activeGeoTools = sharedState?.activeGeoTools ?? internalActiveGeoTools;
  const showGrapher = sharedState?.showGrapher ?? internalShowGrapher;
  const functions = sharedState?.functions ?? internalFunctions;

  const setTool = (v: string) => {
    setInternalTool(v);
    if (onSharedStateChange) onSharedStateChange({ tool: v });
    if (v !== 'select') {
      setSelectedElementId(null);
    }
  };

  const setColor = (v: string) => {
    setInternalColor(v);
    if (onSharedStateChange) onSharedStateChange({ color: v });
    if (selectedElementId) {
      setElements(prev => prev.map(el => 
        el.id === selectedElementId ? { ...el, color: v } : el
      ));
    }
  };

  const setSize = (v: WhiteboardSize) => {
    setInternalSize(v);
    if (onSharedStateChange) onSharedStateChange({ size: v });
    if (selectedElementId) {
      const sw = WB_SIZES[v] * (tool === 'highlighter' ? 4 : (tool === 'eraser' ? 3 : (tool === 'marker' ? 2.5 : 1)));
      setElements(prev => prev.map(el => 
        el.id === selectedElementId ? { ...el, strokeWidth: sw, tool: tool } : el
      ));
    }
  };

  const setBgDark = (v: boolean) => {
    setInternalBgDark(v);
    if (onSharedStateChange) onSharedStateChange({ bgDark: v });
  };

  const setUndoStack = (valOrUpdater: string[] | ((prev: string[]) => string[])) => {
    const next = typeof valOrUpdater === 'function' ? (valOrUpdater as any)(undoStack) : valOrUpdater;
    setInternalUndoStack(next);
    if (onSharedStateChange) onSharedStateChange({ undoStack: next });
  };

  const setRedoStack = (valOrUpdater: string[] | ((prev: string[]) => string[])) => {
    const next = typeof valOrUpdater === 'function' ? (valOrUpdater as any)(redoStack) : valOrUpdater;
    setInternalRedoStack(next);
    if (onSharedStateChange) onSharedStateChange({ redoStack: next });
  };

  const setShowGrid = (v: boolean) => {
    setInternalShowGrid(v);
    if (onSharedStateChange) onSharedStateChange({ showGrid: v });
  };

  const setGridScale = (v: number) => {
    setInternalGridScale(v);
    if (onSharedStateChange) onSharedStateChange({ gridScale: v });
  };

  const setShowGridLabels = (v: boolean) => {
    setInternalShowGridLabels(v);
    if (onSharedStateChange) onSharedStateChange({ showGridLabels: v });
  };

  const setShowEqPanel = (v: boolean) => {
    setInternalShowEqPanel(v);
    if (onSharedStateChange) onSharedStateChange({ showEqPanel: v });
  };

  const setShowMathTools = (v: boolean) => {
    setInternalShowMathTools(v);
    if (onSharedStateChange) onSharedStateChange({ showMathTools: v });
  };

  const setActiveGeoTools = (valOrUpdater: string[] | ((prev: string[]) => string[])) => {
    const next = typeof valOrUpdater === 'function' ? (valOrUpdater as any)(activeGeoTools) : valOrUpdater;
    setInternalActiveGeoTools(next);
    if (onSharedStateChange) onSharedStateChange({ activeGeoTools: next });
  };

  const setShowGrapher = (v: boolean) => {
    setInternalShowGrapher(v);
    if (onSharedStateChange) onSharedStateChange({ showGrapher: v });
  };

  const setFunctions = (v: { expr: string, color: string }[]) => {
    setInternalFunctions(v);
    if (onSharedStateChange) onSharedStateChange({ functions: v });
  };

  const setElements = (valOrUpdater: WhiteboardElement[] | ((prev: WhiteboardElement[]) => WhiteboardElement[])) => {
    const next = typeof valOrUpdater === 'function' ? (valOrUpdater as any)(elements) : valOrUpdater;
    setInternalElements(next);
    if (onSharedStateChange) onSharedStateChange({ elements: next });
  };

  const [isDrawing, setIsDrawing] = useState(false);
  const [activePoints, setActivePoints] = useState<{ x: number, y: number }[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [editingText, setEditingText] = useState<{ id?: string, x: number, y: number, value: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resizeStartRef = useRef<{ width: number, height: number, ratio: number } | null>(null);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Calculate suitable size (max 400px wide/high)
        let w = img.width;
        let h = img.height;
        const max = 400;
        if (w > max || h > max) {
          if (w > h) {
            h = (max / w) * h;
            w = max;
          } else {
            w = (max / h) * w;
            h = max;
          }
        }

        const newElement: WhiteboardElement = {
          id: Math.random().toString(36).substring(7),
          type: 'image',
          tool: 'image',
          x: 100, // Default position
          y: 100,
          width: w,
          height: h,
          src: src,
          color: 'transparent',
          strokeWidth: 0,
          opacity: 1
        };
        setElements(prev => [...prev, newElement]);
        setTool('select');
        setSelectedElementId(newElement.id);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent | ClipboardEvent) => {
    const items = (e as any).clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) handleImageFile(file);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  useEffect(() => {
    const pasteHandler = (e: ClipboardEvent) => {
      // Only handle paste if not in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      handlePaste(e);
    };
    window.addEventListener('paste', pasteHandler);
    return () => window.removeEventListener('paste', pasteHandler);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedElementId && (e.key === 'Delete' || e.key === 'Backspace')) {
        setElements(prev => prev.filter(el => el.id !== selectedElementId));
        setSelectedElementId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId]);
  const [snapshotBeforeStroke, setSnapshotBeforeStroke] = useState<string | null>(null);
  
  const [graphScale, setGraphScale] = useState(30);

  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastSentDataRef = useRef<string | null>(null);

  useEffect(() => {
    if (sharedState?.data && sharedState.data !== lastSentDataRef.current) {
      const img = new Image();
      img.onload = () => {
        const cv = canvasRef.current;
        if (cv) {
          const ctx = cv.getContext('2d');
          if (ctx) {
            const { w, h } = getCanvasDims(cv);
            fillBg(ctx, w, h);
            ctx.drawImage(img, 0, 0, w, h);
          }
        }
      };
      img.src = sharedState.data;
      lastSentDataRef.current = sharedState.data;
    }
  }, [sharedState?.data]);

  const toggleGeoTool = (toolId: string) => {
    setActiveGeoTools(prev => {
      const next = [...prev];
      const idx = next.indexOf(toolId);
      if (idx !== -1) next.splice(idx, 1);
      else next.push(toolId);
      return next;
    });
  };

  const getCanvasDims = (cv: HTMLCanvasElement) => {
    const dpr = window.devicePixelRatio || 1;
    return { w: cv.width / dpr, h: cv.height / dpr };
  };

  const fillBg = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
  };

  const resize = () => {
    const cv = canvasRef.current;
    const gcv = gridCanvasRef.current;
    if (!cv || !gcv) return;
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

    [cv, gcv].forEach(c => {
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
    });

    const ctx = cv.getContext('2d');
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      fillBg(ctx, w, h);
      if (img) {
        const im = new Image();
        im.onload = () => {
          const context = cv.getContext('2d');
          if (context) context.drawImage(im, 0, 0, w, h);
        };
        im.src = img;
      }
      ctxRef.current = ctx;
    }

    const gctx = gcv.getContext('2d');
    if (gctx) {
      gctx.setTransform(1, 0, 0, 1, 0, 0);
      gctx.scale(dpr, dpr);
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
    
    // If we have shared state data, load it immediately after resize
    if (sharedState?.data) {
      const img = new Image();
      img.onload = () => {
        const ctx = cv.getContext('2d');
        if (ctx) {
          const { w, h } = getCanvasDims(cv);
          ctx.drawImage(img, 0, 0, w, h);
        }
      };
      img.src = sharedState.data;
    }
    
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

  const drawFunctions = () => {
    const cv = gridCanvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const w = cv.width / (window.devicePixelRatio || 1);
    const h = cv.height / (window.devicePixelRatio || 1);
    const cx = w / 2;
    const cy = h / 2;

    functions.forEach(fn => {
      ctx.beginPath();
      ctx.strokeStyle = fn.color;
      ctx.lineWidth = 2;
      
      let first = true;
      for (let xPixel = 0; xPixel < w; xPixel += 2) {
        const x = (xPixel - cx) / gridScale;
        try {
          // Simple math expression evaluator
          // Replace 'x' with actual value and use eval (restricted/safe enough for this use case)
          const expr = fn.expr.toLowerCase().replace(/x/g, `(${x})`).replace(/\^/g, '**');
          const y = eval(expr);
          
          const yPixel = cy - (y * gridScale);
          
          if (yPixel >= 0 && yPixel <= h) {
            if (first) {
              ctx.moveTo(xPixel, yPixel);
              first = false;
            } else {
              ctx.lineTo(xPixel, yPixel);
            }
          }
        } catch (e) {
          // Skip invalid points
        }
      }
      ctx.stroke();
    });
  };

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

    if (!showGrid) return;

    const step = gridScale;
    const cx = Math.round(w / 2);
    const cy = Math.round(h / 2);

    // Grid lines
    ctx.strokeStyle = bgDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
    ctx.lineWidth = 1;
    for (let x = cx % step; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let x = cx % step - step; x > 0; x -= step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = cy % step; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    for (let y = cy % step - step; y > 0; y -= step) {
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

    drawFunctions();
  };

  useEffect(() => {
    drawGrid();
  }, [showGrid, gridScale, showGridLabels, bgDark, functions]);

  const snapshot = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const data = cv.toDataURL();
    setUndoStack(prev => [...prev.slice(-39), data]);
    setRedoStack([]);
  };

  const undo = () => {
    if (elements.length === 0) return;
    const last = elements[elements.length - 1];
    setRedoStack(prev => [...prev, JSON.stringify(last)]); // Using stringify to store in string[] stack
    setElements(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const last = JSON.parse(redoStack[redoStack.length - 1]);
    setRedoStack(prev => prev.slice(0, -1));
    setElements(prev => [...prev, last]);
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

  const handleTextSubmit = () => {
    if (!editingText) return;
    if (editingText.value.trim()) {
      if (editingText.id) {
        setElements(prev => prev.map(el => 
          el.id === editingText.id ? { ...el, text: editingText.value } : el
        ));
      } else {
        const newElement: WhiteboardElement = {
          id: Math.random().toString(36).substring(7),
          type: 'text',
          tool: 'text',
          x: editingText.x,
          y: editingText.y,
          color: color,
          strokeWidth: WB_SIZES[size],
          opacity: 1,
          text: editingText.value
        };
        setElements(prev => [...prev, newElement]);
      }
    } else if (editingText.id) {
      setElements(prev => prev.filter(el => el.id !== editingText.id));
    }
    setEditingText(null);
  };

  const handleDown = (e: React.PointerEvent) => {
    // If clicking on UI elements, don't start drawing
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('select') || target.closest('input')) return;

    const cv = canvasRef.current;
    if (!cv) return;
    
    // Stop propagation to avoid triggering widget dragging or other parent handlers
    e.stopPropagation();
    
    // Capture on the element that has the handlers (the container)
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const { x, y } = getPos(e, cv);
    
    if (tool === 'select') {
      setSelectedElementId(null);
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });
    setActivePoints([{ x, y }]);
  };

  const handleMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    e.stopPropagation();
    const cv = canvasRef.current;
    if (!cv) return;
    const { x, y } = getPos(e, cv);

    if (['pen', 'marker', 'highlighter', 'eraser', 'rect', 'ellipse', 'line', 'arrow'].includes(tool)) {
      setActivePoints(prev => [...prev, { x, y }]);
    }
  };

  const handleUp = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);

    const cv = canvasRef.current;
    if (!cv) return;
    const { x: endX, y: endY } = getPos(e, cv);

    if (tool === 'text') {
      setEditingText({ x: endX, y: endY, value: '' });
      setIsDrawing(false);
      setActivePoints([]);
      return;
    }

    // If it was just a click, maybe don't add?
    if (activePoints.length < 2 && !['rect', 'ellipse'].includes(tool)) {
      setActivePoints([]);
      return;
    }

    const toolType = ['pen', 'marker', 'highlighter', 'eraser'].includes(tool) ? 'path' : 
                     (tool === 'rect' ? 'rect' : 
                     (tool === 'ellipse' ? 'ellipse' : 
                     (tool === 'line' || tool === 'arrow' ? 'line' : 
                     (tool === 'text' ? 'text' : 'path'))));

    const isPath = ['pen', 'marker', 'highlighter', 'eraser'].includes(tool);
    const isLine = tool === 'line' || tool === 'arrow';

    const newElement: WhiteboardElement = {
      id: Math.random().toString(36).substring(7),
      type: toolType as any,
      tool: tool,
      points: isPath ? activePoints : undefined,
      x: isPath ? 0 : (isLine ? startPos.x : Math.min(startPos.x, endX)),
      y: isPath ? 0 : (isLine ? startPos.y : Math.min(startPos.y, endY)),
      width: isLine ? (endX - startPos.x) : Math.abs(endX - startPos.x),
      height: isLine ? (endY - startPos.y) : Math.abs(endY - startPos.y),
      color: tool === 'eraser' ? (bgDark ? '#1a1f2e' : '#f5f5f0') : color,
      strokeWidth: WB_SIZES[size] * (tool === 'highlighter' ? 4 : (tool === 'eraser' ? 3 : (tool === 'marker' ? 2.5 : 1))),
      opacity: tool === 'highlighter' ? 0.35 : (tool === 'marker' ? 0.85 : 1),
    };

    setElements(prev => [...prev, newElement]);
    setActivePoints([]);
  };

  const clear = () => {
    setElements([]);
    setUndoStack([]);
    setRedoStack([]);
    setSelectedElementId(null);
  };

  const download = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    
    // Merge everything into a temporary canvas for export
    const tempCv = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    const { w, h } = getCanvasDims(cv);
    tempCv.width = w * dpr;
    tempCv.height = h * dpr;
    tempCv.style.width = `${w}px`;
    tempCv.style.height = `${h}px`;
    
    const ctx = tempCv.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    
    // 1. Background
    ctx.fillStyle = bgDark ? '#1a1f2e' : '#f5f5f0';
    ctx.fillRect(0, 0, w, h);
    
    // 2. Grid if visible
    if (showGrid) {
      // Small logic to redraw grid on temp canvas
      const step = gridScale;
      const cx = Math.round(w / 2);
      const cy = Math.round(h / 2);
      ctx.strokeStyle = bgDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
      ctx.lineWidth = 1;
      for (let x = cx % step; x < w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let x = cx % step - step; x > 0; x -= step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = cy % step; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      for (let y = cy % step - step; y > 0; y -= step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.strokeStyle = bgDark ? 'rgba(0,212,170,0.4)' : 'rgba(0,140,120,0.5)';
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    }
    
    // 3. Vector Elements & Images
    const drawElements = async () => {
      for (const el of elements) {
        ctx.save();
        ctx.globalAlpha = el.opacity;
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (el.type === 'path' && el.points) {
          ctx.beginPath();
          el.points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x + el.x, p.y + el.y);
            else ctx.lineTo(p.x + el.x, p.y + el.y);
          });
          ctx.stroke();
        } else if (el.type === 'line') {
          const x1 = el.x + (el.width || 0);
          const y1 = el.y + (el.height || 0);
          ctx.beginPath();
          ctx.moveTo(el.x, el.y);
          ctx.lineTo(x1, y1);
          ctx.stroke();
          if (el.tool === 'arrow') {
            const angle = Math.atan2(y1 - el.y, x1 - el.x);
            const headLen = 15;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1 - headLen * Math.cos(angle - 0.4), y1 - headLen * Math.sin(angle - 0.4));
            ctx.lineTo(x1 - headLen * Math.cos(angle + 0.4), y1 - headLen * Math.sin(angle + 0.4));
            ctx.closePath();
            ctx.fillStyle = el.color;
            ctx.fill();
          }
        } else if (el.type === 'rect') {
          ctx.strokeRect(el.x, el.y, el.width || 0, el.height || 0);
        } else if (el.type === 'ellipse') {
          ctx.beginPath();
          const rx = (el.width || 0) / 2, ry = (el.height || 0) / 2;
          ctx.ellipse(el.x + rx, el.y + ry, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (el.type === 'image' && el.src) {
          const img = new Image();
          await new Promise((resolve) => {
            img.onload = () => {
              ctx.drawImage(img, el.x, el.y, el.width || 0, el.height || 0);
              resolve(null);
            };
            img.src = el.src!;
          });
        }
        ctx.restore();
      }

      const a = document.createElement('a');
      a.download = `whiteboard_${Date.now()}.png`;
      a.href = tempCv.toDataURL('image/png');
      a.click();
    };

    drawElements();
  };

  // Math stamping helpers (simplified for now)
  const stampText = (text: string) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const { w, h } = getCanvasDims(cv);
    
    const newElement: WhiteboardElement = {
      id: Math.random().toString(36).substring(7),
      type: 'text',
      tool: 'text',
      x: w / 2,
      y: h / 2,
      color: color,
      strokeWidth: WB_SIZES[size],
      opacity: 1,
      text: text
    };
    setElements(prev => [...prev, newElement]);
    setTool('select');
    setSelectedElementId(newElement.id);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--surface)]">
      {/* Drawing Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[var(--surface2)] border-b border-[var(--border)] shrink-0 relative z-[100] pointer-events-auto">
        <ToolbarButton active={tool === 'select'} onClick={() => setTool('select')} title="Select"><MousePointer2 size={18} /></ToolbarButton>
        <ToolbarButton active={tool === 'pen'} onClick={() => setTool('pen')} title="Pen"><Pencil size={18} /></ToolbarButton>
        <ToolbarButton active={tool === 'marker'} onClick={() => setTool('marker')} title="Marker"><Pencil size={18} strokeWidth={3} /></ToolbarButton>
        <ToolbarButton active={tool === 'highlighter'} onClick={() => setTool('highlighter')} title="Highlighter"><Highlighter size={18} /></ToolbarButton>
        <ToolbarButton active={tool === 'line'} onClick={() => setTool('line')} title="Line"><Minus size={18} className="-rotate-45" /></ToolbarButton>
        <ToolbarButton active={tool === 'arrow'} onClick={() => setTool('arrow')} title="Arrow"><ArrowRight size={18} className="-rotate-45" /></ToolbarButton>
        <ToolbarButton active={tool === 'rect'} onClick={() => setTool('rect')} title="Rectangle"><Square size={18} /></ToolbarButton>
        <ToolbarButton active={tool === 'ellipse'} onClick={() => setTool('ellipse')} title="Ellipse"><Circle size={18} /></ToolbarButton>
        <ToolbarButton active={tool === 'text'} onClick={() => setTool('text')} title="Text"><Type size={18} /></ToolbarButton>
        
        <ToolbarButton 
          onClick={() => fileInputRef.current?.click()} 
          title="Upload Image"
        >
          <ImageIcon size={18} />
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageFile(file);
            }} 
          />
        </ToolbarButton>

        <ToolbarButton active={tool === 'eraser'} onClick={() => setTool('eraser')} title="Eraser"><Eraser size={18} /></ToolbarButton>
        
        <div className="w-px h-6 bg-[var(--border)] mx-1" />
        
        {(['sm', 'md', 'lg', 'xl'] as const).map(s => (
          <button
            key={s}
            onPointerDown={e => e.stopPropagation()}
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
              onPointerDown={e => e.stopPropagation()}
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
          <div className="w-px h-6 bg-[var(--border)] mx-1" />
          <ToolbarButton 
            active={showMathTools} 
            onClick={() => setShowMathTools(!showMathTools)} 
            title="Math Tools"
            className={cn(showMathTools && "text-[var(--accent)] border-[var(--accent)]/50 bg-[var(--accent)]/10")}
          >
            <Calculator size={18} />
          </ToolbarButton>
          <div className="w-px h-6 bg-[var(--border)] mx-1" />
          {selectedElementId && (
            <ToolbarButton 
              onClick={() => {
                setElements(prev => prev.filter(el => el.id !== selectedElementId));
                setSelectedElementId(null);
              }} 
              title="Delete Selected" 
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 size={18} />
            </ToolbarButton>
          )}
          <ToolbarButton onClick={clear} title="Clear Board" className="text-red-400 hover:text-red-300"><Trash2 size={18} /></ToolbarButton>
          <ToolbarButton onClick={download} title="Download Image"><Download size={18} /></ToolbarButton>
          {onToggleMaximize && (
            <ToolbarButton 
              onClick={() => {
                if (onSharedStateChange && canvasRef.current) {
                  onSharedStateChange({ data: canvasRef.current.toDataURL() });
                }
                onToggleMaximize();
              }} 
              title="Maximize" 
              className="ml-auto"
            >
              <Maximize2 size={18} />
            </ToolbarButton>
          )}
        </div>
      </div>

      {/* Math Toolbar - This was missing in the legacy maximized view, now always visible */}
      <AnimatePresence>
        {showMathTools && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-wrap items-center gap-2 px-3 py-1.5 bg-[var(--accent)]/5 border-b border-[var(--accent)]/20 shrink-0 relative z-[200] pointer-events-auto overflow-hidden"
          >
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
              active={activeGeoTools.includes('ruler')} 
              onClick={() => toggleGeoTool('ruler')} 
              icon={<Ruler size={14} />} 
              label="Ruler" 
            />
            <ToolbarMathButton 
              active={activeGeoTools.includes('protractor')} 
              onClick={() => toggleGeoTool('protractor')} 
              icon={<Compass size={14} />} 
              label="Protractor" 
            />
            <ToolbarMathButton 
              active={activeGeoTools.includes('compass')} 
              onClick={() => toggleGeoTool('compass')} 
              icon={<Variable size={14} />} 
              label="Compass" 
            />
            
            <div className="w-px h-4 bg-[var(--accent)]/20 mx-1" />
            
            <ToolbarMathButton active={showEqPanel} onClick={() => { setShowEqPanel(!showEqPanel); setShowGrapher(false); }} icon={<Sigma size={14} />} label="Equations" />
            <ToolbarMathButton active={showGrapher} onClick={() => { setShowGrapher(!showGrapher); setShowEqPanel(false); }} icon={<LineChart size={14} />} label="Grapher" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas Area */}
      <div 
        className={cn(
          "relative flex-1 min-h-0 transition-colors duration-300",
          bgDark ? "bg-[#1a1f2e]" : "bg-[#f5f5f0]"
        )}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <canvas
          ref={canvasRef}
          className={cn(
            "block absolute inset-0 w-full h-full touch-none cursor-crosshair z-10",
            tool === 'eraser' && "cursor-cell",
            tool === 'text' && "cursor-text",
            tool === 'select' && "cursor-default"
          )}
        />
        <canvas
          ref={gridCanvasRef}
          className={cn(
            "absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200 z-20",
            showGrid ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Math Tool Overlays */}
        {activeGeoTools.includes('ruler') && <RulerTool bgDark={bgDark} />}
        {activeGeoTools.includes('protractor') && <ProtractorTool bgDark={bgDark} />}
        {activeGeoTools.includes('compass') && <CompassTool bgDark={bgDark} color={color} />}

        {/* Text Input Overlay */}
        {editingText && (
          <div 
            className="absolute z-[1000]"
            style={{ 
              left: editingText.x, 
              top: editingText.y,
              transform: 'translateY(-2px)'
            }}
          >
            <input
              autoFocus
              className="bg-transparent border-none outline-none p-0 m-0 leading-none"
              style={{
                color: color,
                fontSize: WB_SIZES[size] * 3 + 12,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontWeight: "500",
                width: `${Math.max(1, editingText.value.length + 1)}ch`,
                minWidth: '20px'
              }}
              value={editingText.value}
              onChange={e => setEditingText({ ...editingText, value: e.target.value })}
              onBlur={handleTextSubmit}
              onKeyDown={e => {
                if (e.key === 'Enter') handleTextSubmit();
                if (e.key === 'Escape') setEditingText(null);
              }}
              onPointerDown={e => e.stopPropagation()}
            />
          </div>
        )}

        {/* Drawing Elements SVG Overlay */}
        <svg 
          id="svg-drawing-overlay"
          width="100%"
          height="100%"
          className="absolute inset-0 z-30 pointer-events-none overflow-hidden w-full h-full"
        >
          {/* Deselect Overlay - only clickable in select mode */}
          {tool === 'select' && (
            <rect 
              width="100%" 
              height="100%" 
              fill="transparent" 
              className="pointer-events-auto"
              onPointerDown={(e) => {
                e.stopPropagation();
                setSelectedElementId(null);
              }}
            />
          )}

          {/* Ongoing Stroke */}
          {isDrawing && activePoints.length > 1 && ['pen', 'marker', 'highlighter', 'eraser'].includes(tool) && (
            <path
              d={`M ${activePoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
              fill="none"
              stroke={tool === 'eraser' ? (bgDark ? '#1a1f2e' : '#f5f5f0') : color}
              strokeWidth={WB_SIZES[size] * (tool === 'highlighter' ? 4 : (tool === 'eraser' ? 3 : (tool === 'marker' ? 2.5 : 1)))}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={tool === 'highlighter' ? 0.35 : (tool === 'marker' ? 0.85 : 1)}
            />
          )}

          {/* Ongoing Shape Preview */}
          {isDrawing && (['rect', 'ellipse', 'line', 'arrow'].includes(tool)) && (() => {
            const lastPoint = activePoints[activePoints.length - 1] || startPos;
            const x0 = startPos.x;
            const y0 = startPos.y;
            const x1 = lastPoint.x;
            const y1 = lastPoint.y;
            
            const strokeVal = tool === 'eraser' ? (bgDark ? '#1a1f2e' : '#f5f5f0') : color;
            const sw = WB_SIZES[size];

            if (tool === 'rect') {
              return <rect x={Math.min(x0, x1)} y={Math.min(y0, y1)} width={Math.abs(x1-x0)} height={Math.abs(y1-y0)} fill="none" stroke={strokeVal} strokeWidth={sw} />;
            } else if (tool === 'ellipse') {
              return <ellipse cx={(x0+x1)/2} cy={(y0+y1)/2} rx={Math.abs(x1-x0)/2} ry={Math.abs(y1-y0)/2} fill="none" stroke={strokeVal} strokeWidth={sw} />;
            } else if (tool === 'line' || tool === 'arrow') {
              return (
                <g>
                  <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={strokeVal} strokeWidth={sw} strokeLinecap="round" />
                  {tool === 'arrow' && (() => {
                    const angle = Math.atan2(y1 - y0, x1 - x0);
                    const headLen = 15;
                    return (
                      <path 
                        d={`M ${x1} ${y1} L ${x1 - headLen * Math.cos(angle - 0.4)} ${y1 - headLen * Math.sin(angle - 0.4)} L ${x1 - headLen * Math.cos(angle + 0.4)} ${y1 - headLen * Math.sin(angle + 0.4)} Z`}
                        fill={strokeVal}
                      />
                    );
                  })()}
                </g>
              );
            }
            return null;
          })()}

          {elements.map((el) => {
            const isSelected = selectedElementId === el.id;
            
            const handleDragElement = (_: any, info: { offset: { x: number, y: number } }) => {
              if (tool !== 'select' || isResizing || !dragStartRef.current) return;
              const start = dragStartRef.current;
              const nextX = start.x + info.offset.x;
              const nextY = start.y + info.offset.y;
              
              setElements(prev => prev.map(item => {
                if (item.id === el.id) {
                  return { ...item, x: nextX, y: nextY };
                }
                return item;
              }));
            };

            const handleResizeImage = (_: any, info: { offset: { x: number, y: number } }) => {
              if (tool !== 'select' || !resizeStartRef.current) return;
              const { width: sw, height: sh, ratio } = resizeStartRef.current;
              
              // Use diagonal movement for more natural resizing
              const deltaX = info.offset.x;
              const deltaY = info.offset.y;
              
              // We'll base the scale on the axis that changed more or just X
              const newWidth = Math.max(40, sw + deltaX);
              const newHeight = newWidth / ratio;
              
              setElements(prev => prev.map(item => {
                if (item.id === el.id) {
                  return { ...item, width: newWidth, height: newHeight };
                }
                return item;
              }));
            };

            const elementProps = {
              onPointerDown: (e: React.PointerEvent) => {
                if (tool === 'select') {
                  e.stopPropagation();
                  setSelectedElementId(el.id);
                } else if (tool === 'text' && el.type === 'text') {
                  e.stopPropagation();
                  setEditingText({ id: el.id, x: el.x, y: el.y, value: el.text || '' });
                }
              }
            };

            // Logic to determine if element can catch events
            const isSelectable = tool === 'select';
            const interactiveStyle = {
              pointerEvents: isSelectable ? 'auto' : 'none' as any,
              cursor: isSelectable ? (isSelected ? 'grabbing' : 'grab') : 'none',
              filter: isSelected ? 'drop-shadow(0 0 4px var(--accent))' : 'none'
            };

            const dragProps = {
              onPan: isSelectable && !isResizing ? handleDragElement : undefined,
              onPanStart: () => {
                if (isSelectable) {
                  setSelectedElementId(el.id);
                  dragStartRef.current = { x: el.x, y: el.y };
                }
              },
              onPanEnd: () => {
                dragStartRef.current = null;
              },
              ...elementProps,
              style: interactiveStyle
            };

            if (el.type === 'path' && el.points) {
              const d = `M ${el.points.map(p => `${p.x + el.x},${p.y + el.y}`).join(' L ')}`;
              return (
                <motion.g key={el.id} {...dragProps}>
                  <path
                    d={d}
                    fill="none"
                    stroke={el.color}
                    strokeWidth={el.strokeWidth + (isSelectable ? 14 : 0)} // Wider buffer for selection
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity={el.opacity}
                  />
                  {isSelected && (
                    <path
                      d={d}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      className="pointer-events-none"
                    />
                  )}
                </motion.g>
              );
            }
            
            if (el.type === 'line') {
              const x0 = el.x;
              const y0 = el.y;
              const x1 = el.x + (el.width || 0);
              const y1 = el.y + (el.height || 0);
              return (
                <motion.g key={el.id} {...dragProps}>
                  <line 
                    x1={x0} y1={y0} x2={x1} y2={y1} 
                    stroke={el.color} 
                    strokeWidth={el.strokeWidth + (isSelectable ? 14 : 0)} 
                    strokeLinecap="round" 
                    strokeOpacity={el.opacity}
                  />
                  {isSelected && (
                    <line 
                      x1={x0} y1={y0} x2={x1} y2={y1} 
                      stroke="var(--accent)" 
                      strokeWidth={1} 
                      strokeDasharray="4 4"
                      className="pointer-events-none"
                    />
                  )}
                  {el.tool === 'arrow' && (() => {
                    const angle = Math.atan2(y1 - y0, x1 - x0);
                    const headLen = 15;
                    return (
                      <path 
                        d={`M ${x1} ${y1} L ${x1 - headLen * Math.cos(angle - 0.4)} ${y1 - headLen * Math.sin(angle - 0.4)} L ${x1 - headLen * Math.cos(angle + 0.4)} ${y1 - headLen * Math.sin(angle + 0.4)} Z`}
                        fill={el.color}
                        style={{ opacity: el.opacity }}
                      />
                    );
                  })()}
                </motion.g>
              );
            }

            if (el.type === 'rect') {
              return (
                <motion.g key={el.id} {...dragProps}>
                  <rect
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
                    fill={isSelectable ? "rgba(255,255,255,0.05)" : "none"}
                    stroke={el.color}
                    strokeWidth={el.strokeWidth}
                    strokeOpacity={el.opacity}
                  />
                  {isSelected && (
                    <rect 
                      x={el.x - 4} y={el.y - 4} width={(el.width || 0) + 8} height={(el.height || 0) + 8}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      className="pointer-events-none"
                    />
                  )}
                </motion.g>
              );
            }

            if (el.type === 'ellipse') {
              const rx = (el.width || 0) / 2;
              const ry = (el.height || 0) / 2;
              const cx = el.x + rx;
              const cy = el.y + ry;
              return (
                <motion.g key={el.id} {...dragProps}>
                  <ellipse
                    cx={cx}
                    cy={cy}
                    rx={rx}
                    ry={ry}
                    fill={isSelectable ? "rgba(255,255,255,0.05)" : "none"}
                    stroke={el.color}
                    strokeWidth={el.strokeWidth}
                    strokeOpacity={el.opacity}
                  />
                  {isSelected && (
                    <ellipse 
                      cx={cx} cy={cy} rx={rx + 4} ry={ry + 4}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      className="pointer-events-none"
                    />
                  )}
                </motion.g>
              );
            }

            if (el.type === 'text') {
              if (editingText?.id === el.id) return null;
              const fontSize = el.strokeWidth * 3 + 12;
              return (
                <motion.g key={el.id} {...dragProps}>
                  {/* Invisible background to make text easier to select */}
                  <rect
                    x={el.x - 4}
                    y={el.y - 4}
                    width={(el.text?.length || 0) * (fontSize * 0.6) + 8}
                    height={fontSize + 8}
                    fill={isSelectable ? "rgba(255,255,255,0.05)" : "none"}
                  />
                  <text
                    x={el.x}
                    y={el.y}
                    fill={el.color}
                    fontSize={fontSize}
                    fontWeight="500"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                    dominantBaseline="hanging"
                    pointerEvents="none"
                  >
                    {el.text}
                  </text>
                  {isSelected && (
                    <rect 
                      x={el.x-6} y={el.y-6} 
                      width={(el.text?.length || 0) * (fontSize * 0.6) + 12} 
                      height={fontSize + 12}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      className="pointer-events-none"
                    />
                  )}
                </motion.g>
              );
            }

            if (el.type === 'image' && el.src) {
              const rectX = el.x || 0;
              const rectY = el.y || 0;
              const rectW = el.width || 0;
              const rectH = el.height || 0;

              return (
                <g key={el.id}>
                  <motion.g {...dragProps}>
                    {/* Draggable background area to ensure interaction even on transparent image parts */}
                    <rect 
                      x={rectX} y={rectY} width={rectW} height={rectH} 
                      fill="transparent" 
                    />
                    <motion.image
                      x={rectX}
                      y={rectY}
                      width={rectW}
                      height={rectH}
                      href={el.src}
                      preserveAspectRatio="none"
                      style={{ filter: 'contrast(1.05) saturate(1.15) brightness(1.02)' }}
                    />
                  </motion.g>
                  {isSelected && (
                    <g className="pointer-events-none">
                      {/* Selection border */}
                      <rect 
                        x={rectX} y={rectY} width={rectW} height={rectH} 
                        fill="none" stroke="var(--accent)" strokeWidth={1} strokeDasharray="4 4" 
                      />
                      {/* Resize handle visual */}
                      <circle
                        cx={rectX + rectW}
                        cy={rectY + rectH}
                        r={6}
                        fill="white"
                        stroke="var(--accent)"
                        strokeWidth={2}
                      />
                    </g>
                  )}
                  {isSelected && (
                    <motion.circle
                      cx={rectX + rectW}
                      cy={rectY + rectH}
                      r={18}
                      fill="transparent"
                      className="cursor-nwse-resize pointer-events-auto"
                      onPanStart={() => {
                        setIsResizing(true);
                        const currentW = el.width || 0;
                        const currentH = el.height || 0;
                        resizeStartRef.current = { 
                          width: currentW, 
                          height: currentH, 
                          ratio: currentW / (currentH || 1) 
                        };
                      }}
                      onPan={handleResizeImage}
                      onPanEnd={() => {
                        resizeStartRef.current = null;
                        setIsResizing(false);
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  )}
                </g>
              );
            }

            return null;
          })}
        </svg>

        {/* Tool Panels */}
        <AnimatePresence>
          {showGrapher && (
            <motion.div 
              key="grapher-panel"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="absolute right-0 top-0 bottom-0 w-72 bg-[var(--surface)] border-l border-[var(--border)] z-50 p-4 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Function Grapher</span>
                <button onClick={() => setShowGrapher(false)} className="text-[var(--muted)] hover:text-white p-1 hover:bg-white/5 rounded-md"><X size={16} /></button>
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setFunctions([...functions, { expr: 'x^2', color: WB_COLORS[Math.floor(Math.random() * WB_COLORS.length)].value }])}
                  className="flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-[var(--border)] text-xs font-medium text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                >
                  <Plus size={14} /> Add Function
                </button>

                {functions.map((fn, i) => (
                  <div key={i} className="bg-[var(--surface2)] border border-[var(--border)] rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fn.color }} />
                      <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">Function {i + 1}</span>
                      <button 
                        onClick={() => setFunctions(functions.filter((_, idx) => idx !== i))}
                        className="ml-auto p-1 text-red-500 hover:bg-red-500/10 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs opacity-50">y =</span>
                      <input 
                        type="text" 
                        value={fn.expr}
                        onChange={e => {
                          const next = [...functions];
                          next[i].expr = e.target.value;
                          setFunctions(next);
                        }}
                        className="flex-1 bg-black/20 border border-white/5 rounded-md px-2 py-1 font-mono text-xs outline-none focus:border-[var(--accent)]"
                        placeholder="e.g. x^2 + 2x"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-[var(--border)]">
                <p className="text-[9px] text-[var(--muted)] uppercase font-bold tracking-tighter mb-2">Instructions</p>
                <p className="text-[10px] leading-relaxed text-[var(--muted)]">Type expressions using <code className="text-[var(--accent)]">x</code>. Use <code className="text-[var(--accent)]">^</code> for powers, <code className="text-[var(--accent)]">*</code> for multiplication.</p>
              </div>
            </motion.div>
          )}

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
      onPointerDown={e => e.stopPropagation()}
      onClick={onClick}
      title={title}
      className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center transition-all text-[var(--muted)] hover:bg-white/10 hover:text-white active:scale-90",
        active && "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/50 shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]",
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
      type="button"
      onPointerDown={e => e.stopPropagation()}
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-sm",
        active 
          ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-[0_4px_15px_rgba(var(--accent-rgb),0.5)] translate-y-[-1px]" 
          : "bg-[var(--surface2)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-white"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function EqButton({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <button
      onPointerDown={e => e.stopPropagation()}
      onClick={onClick}
      className="px-3 py-1.5 bg-[var(--surface2)] border border-[var(--accent)]/30 rounded-md font-mono text-sm hover:bg-[var(--accent)]/20 hover:border-[var(--accent)] transition-all"
    >
      {label}
    </button>
  );
}

function RulerTool({ bgDark }: { bgDark: boolean }) {
  const [rotation, setRotation] = useState(0);
  const [width, setWidth] = useState(400);
  const dragControls = useDragControls();
  const pivotRef = useRef<HTMLDivElement>(null);
  
  return (
    <motion.div 
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      style={{ position: 'absolute', top: 100, left: 100, zIndex: 60, width: 8, height: 8 }}
      className="pointer-events-auto"
    >
      {/* Pivot Visualization (Optional, but helps user see anchor) */}
      <div className="absolute inset-0 bg-[var(--accent)]/40 rounded-full blur-[2px]" />

      <div style={{ position: 'relative', width: 0, height: 0, rotate: `${rotation}deg` }}>
        <div ref={pivotRef} className="absolute w-0 h-0 left-0 top-0" />
        <motion.div 
          onPointerDown={(e) => { e.stopPropagation(); dragControls.start(e); }}
          className={cn(
            "absolute top-[-48px] left-0 h-24 border rounded-xl shadow-2xl flex items-center justify-between px-0 cursor-grab active:cursor-grabbing select-none transition-colors overflow-hidden",
            bgDark ? "bg-black/40 border-white/20 backdrop-blur-3xl text-white" : "bg-slate-900/95 border-white/10 backdrop-blur-3xl text-white"
          )}
          style={{ width, transformOrigin: 'left center' }}
        >
          {/* Subtle Technical Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', 
              backgroundSize: '10px 10px' 
            }} 
          />

          {/* CM Markings (Top) */}
          <div className="absolute inset-x-0 top-0 flex items-start h-12 overflow-hidden pr-10 border-b border-white/10">
            <div className="flex shrink-0 w-8" />
            {Array.from({ length: Math.floor((width - 40) / 10) + 1 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center w-[10px] shrink-0">
                 <div className={cn("w-px transition-opacity", 
                   i % 10 === 0 ? "h-8 bg-[var(--accent)] opacity-100" : 
                   i % 5 === 0 ? "h-5 bg-[var(--accent)]/70 opacity-70" : 
                   "h-3 bg-[var(--accent)]/40 opacity-40"
                 )} />
                 {i % 10 === 0 && (
                   <div className="text-[9px] font-mono font-bold mt-0.5 leading-none flex flex-col items-center opacity-60">
                     <span>{i / 10}</span>
                     {i === 0 && <span className="text-[7px] -mt-0.5 opacity-50">cm</span>}
                   </div>
                 )}
              </div>
            ))}
            <span className="absolute right-4 top-1 text-[8px] font-bold text-[var(--accent)]/40 tracking-[0.2em] italic uppercase">Metric System</span>
          </div>
          
          {/* Inch Markings (Bottom) */}
          <div className="absolute inset-x-0 bottom-0 flex items-end h-12 overflow-hidden pr-10">
            <div className="flex shrink-0 w-8" />
            {Array.from({ length: Math.floor((width - 40) / 12.7) + 1 }).map((_, i) => (
              <div key={i} className="flex flex-col-reverse items-center w-[12.7px] shrink-0">
                 <div className={cn("w-px transition-opacity", 
                   i % 4 === 0 ? "h-8 bg-amber-500 opacity-100" : 
                   i % 2 === 0 ? "h-5 bg-amber-500/70 opacity-70" : 
                   "h-3.5 bg-amber-500/40 opacity-40"
                 )} />
                 {i % 4 === 0 && (
                   <div className="text-[9px] font-mono font-bold mb-0.5 leading-none flex flex-col-reverse items-center opacity-60">
                     <span>{i / 4}</span>
                     {i === 0 && <span className="text-[7px] -mb-0.5 opacity-50">in</span>}
                   </div>
                 )}
              </div>
            ))}
            <span className="absolute right-4 bottom-1 text-[8px] font-bold text-amber-500/40 tracking-[0.2em] italic uppercase">Imperial Unit</span>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-1/2 h-[1px] bg-white opacity-[0.05]" />
          </div>
          
          {/* Rotation Handle */}
          <button 
            onClick={(e) => { e.stopPropagation(); setRotation(prev => (prev + 15) % 360); }}
            onPointerDown={e => e.stopPropagation()}
            className="absolute -right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 hover:bg-[var(--accent)] border border-white/10 hover:border-[var(--accent)] flex items-center justify-center cursor-pointer transition-all hover:scale-110 shadow-2xl backdrop-blur-md group/rot z-50 overflow-hidden"
            title="Rotate 15°"
          >
            <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover/rot:opacity-20" />
            <Undo size={18} className="rotate-90 text-white/50 group-hover:text-white" />
          </button>

          {/* Resize Handle */}
          <div 
            className="absolute right-0 bottom-0 w-10 h-full cursor-ew-resize z-40 group/resize flex items-center justify-center bg-white/5 border-l border-white/5"
            onPointerDown={(e) => {
              e.stopPropagation();
              if (!pivotRef.current) return;
              
              const pivotRect = pivotRef.current.getBoundingClientRect();
              const pivotX = pivotRect.left;
              const pivotY = pivotRect.top;
              
              const rad = (rotation * Math.PI) / 180;
              const cos = Math.cos(rad);
              const sin = Math.sin(rad);
              
              const initialWidth = width;
              const startProjectedDist = (e.clientX - pivotX) * cos + (e.clientY - pivotY) * sin;

              const handlePointerMove = (ev: PointerEvent) => {
                const dx = ev.clientX - pivotX;
                const dy = ev.clientY - pivotY;
                const currentProjectedDist = dx * cos + dy * sin;
                const delta = currentProjectedDist - startProjectedDist;
                setWidth(Math.max(200, Math.min(1000, initialWidth + delta)));
              };
              
              const handlePointerUp = () => {
                document.removeEventListener('pointermove', handlePointerMove);
                document.removeEventListener('pointerup', handlePointerUp);
              };
              
              document.addEventListener('pointermove', handlePointerMove);
              document.addEventListener('pointerup', handlePointerUp);
            }}
          >
            <div className="w-1 h-8 bg-[var(--accent)]/30 group-hover/resize:bg-[var(--accent)] transition-colors rounded-full" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ProtractorTool({ bgDark }: { bgDark: boolean }) {
  const [rotation, setRotation] = useState(0);
  const [width, setWidth] = useState(320);
  const dragControls = useDragControls();
  const pivotRef = useRef<HTMLDivElement>(null);

    const radius = width / 2;
    const scale = width / 320;

  return (
    <motion.div 
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      style={{ position: 'absolute', top: 200, left: 150, zIndex: 60, width: 8, height: 8 }}
      className="pointer-events-auto group"
    >
      <div style={{ position: 'relative', width: 0, height: 0, rotate: `${rotation}deg` }}>
        <div ref={pivotRef} className="absolute w-0 h-0 left-0 bottom-0" />
        <div 
          onPointerDown={(e) => { e.stopPropagation(); dragControls.start(e); }}
          className={cn(
            "absolute bottom-0 rounded-t-full border-t border-x flex items-end justify-center shadow-2xl overflow-hidden transition-colors cursor-grab active:cursor-grabbing",
            bgDark ? "bg-transparent border-white/40 text-white" : "bg-transparent border-slate-900/40 text-slate-900"
          )}
          style={{ width, height: radius, left: -radius }} // left: -radius anchors the center
        >
          {/* Technical Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', 
              backgroundSize: '15px 15px' 
            }} 
          />

          <div className="absolute inset-0 flex items-end justify-center">
            <div className="w-full h-[1px] bg-[var(--accent)]/20 absolute bottom-0" />
            <div className="absolute bottom-0 w-3 h-3 bg-[var(--accent)] rounded-full -mb-1.5 shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)] z-10" />
          </div>

          {/* Degrees Markings */}
          {Array.from({ length: 181 }).map((_, i) => {
            const deg = i;
            const isFive = deg % 5 === 0;
            
            // Determine label frequency based on size to prevent overlap
            let labelStep = 10;
            if (width < 400) labelStep = 20;
            if (width < 250) labelStep = 30;
            
            const isLabel = deg % labelStep === 0;
            const isTick = deg % 5 === 0 || width >= 320;
            
            if (!isTick && !isLabel) return null;

            return (
              <div 
                key={i} 
                className="absolute bottom-0 w-px origin-bottom pointer-events-none" 
                style={{ transform: `rotate(${deg - 90}deg)`, height: radius }} 
              >
                <div className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 bg-current",
                  deg % 10 === 0 ? "h-full opacity-20" : isFive ? "opacity-60" : "opacity-40"
                )} style={{ height: deg % 10 === 0 ? '100%' : (isFive ? 20 * scale : 10 * scale), width: 1 }} />
                
                {isLabel && (
                  <>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[var(--accent)] w-0.5 opacity-80" style={{ height: 48 * scale }} />
                    {/* Outer Scale (Blue) */}
                    <div 
                      className="absolute left-1/2 -translate-x-1/2" 
                      style={{ 
                        transform: `rotate(${90 - deg}deg)`, 
                        top: 28 * scale,
                      }}
                    >
                      <div className={cn(
                        "flex items-center justify-center px-1 rounded-md backdrop-blur-xl border shadow-md transition-colors",
                        bgDark ? "bg-black/90 border-white/30" : "bg-white/90 border-black/20"
                      )}>
                        <span className="font-mono font-black text-[var(--accent)] tracking-tighter whitespace-nowrap leading-none py-1" style={{ fontSize: Math.max(9, 13 * scale) }}>{deg}</span>
                      </div>
                    </div>

                    {/* Inner Scale (Reverse) */}
                    <div 
                      className="absolute left-1/2 -translate-x-1/2" 
                      style={{ 
                        transform: `rotate(${90 - deg}deg)`, 
                        top: 78 * scale,
                      }}
                    >
                      <div className={cn(
                        "flex items-center justify-center px-1 rounded-md backdrop-blur-xl border shadow-md transition-colors",
                        bgDark ? "bg-black/90 border-white/30" : "bg-white/90 border-black/20"
                      )}>
                        <span className={cn(
                          "font-mono font-black whitespace-nowrap leading-none py-1 tracking-tighter",
                          bgDark ? "text-white" : "text-black"
                        )} style={{ fontSize: Math.max(8, 11 * scale) }}>{180 - deg}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          <div className="absolute inset-x-0 bottom-6 flex flex-col items-center justify-center opacity-20 pointer-events-none">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--accent)]">Angular Precision</span>
            <div className="w-16 h-[1px] bg-[var(--accent)] mt-1.5" />
          </div>
          
          {/* Rotation handle for protractor */}
          <button 
            onClick={(e) => { e.stopPropagation(); setRotation(prev => (prev + 15) % 360); }}
            onPointerDown={e => e.stopPropagation()}
            className="absolute left-1/2 bottom-8 -translate-x-1/2 w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-[var(--accent)] hover:border-[var(--accent)] flex items-center justify-center cursor-pointer transition-all opacity-0 group-hover:opacity-100 z-30 shadow-xl backdrop-blur-md"
            title="Rotate 15°"
          >
            <Undo size={16} className="rotate-90 text-white/50" />
          </button>

          {/* Resize Handle */}
          <div 
            className="absolute right-0 bottom-0 w-16 h-16 cursor-nwse-resize z-40 group/resize flex items-end justify-end p-3 active:scale-95 transition-transform"
            onPointerDown={(e) => {
              e.stopPropagation();
              if (!pivotRef.current) return;
              
              const pivotRect = pivotRef.current.getBoundingClientRect();
              const pivotX = pivotRect.left;
              const pivotY = pivotRect.top;
              
              const initialWidth = width;
              const dx = e.clientX - pivotX;
              const dy = e.clientY - pivotY;
              const initialRadius = Math.sqrt(dx * dx + dy * dy);

              const handlePointerMove = (mv: PointerEvent) => {
                const currentDx = mv.clientX - pivotX;
                const currentDy = mv.clientY - pivotY;
                const currentRadius = Math.sqrt(currentDx * currentDx + currentDy * currentDy);
                const deltaRadius = currentRadius - initialRadius;
                const newWidth = Math.max(240, Math.min(1000, (initialWidth / 2 + deltaRadius) * 2));
                setWidth(newWidth);
              };
              
              const handlePointerUp = () => {
                document.removeEventListener('pointermove', handlePointerMove);
                document.removeEventListener('pointerup', handlePointerUp);
              };
              
              document.addEventListener('pointermove', handlePointerMove);
              document.addEventListener('pointerup', handlePointerUp);
            }}
          >
            <div className="w-5 h-5 border-r-4 border-b-4 border-[var(--accent)]/20 group-hover/resize:border-[var(--accent)] transition-colors rounded-br-md shadow-sm" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CompassTool({ bgDark, color }: { bgDark: boolean, color: string }) {
  const [radius, setRadius] = useState(100);
  const [rotation, setRotation] = useState(0);
  const dragControls = useDragControls();
  const pivotRef = useRef<HTMLDivElement>(null);

  const handleRadiusDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!pivotRef.current) return;
    const pivotRect = pivotRef.current.getBoundingClientRect();
    const centerX = pivotRect.left;
    const centerY = pivotRect.top;

    const handlePointerMove = (mv: PointerEvent) => {
      const dx = mv.clientX - centerX;
      const dy = mv.clientY - centerY;
      // We calculate current dist but we need to respect the current rotation if we want precise "extension"
      // or we just set radius to the distance.
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      setRadius(Math.max(40, Math.min(400, currentDist)));
      
      // Update rotation to point towards the cursor if we want it to follow the grab
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      setRotation(angle);
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handleRotationDrag = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!pivotRef.current) return;
    const pivotRect = pivotRef.current.getBoundingClientRect();
    const centerX = pivotRect.left;
    const centerY = pivotRect.top;

    const handlePointerMove = (mv: PointerEvent) => {
      const dx = mv.clientX - centerX;
      const dy = mv.clientY - centerY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      setRotation(angle);
    };

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };
  
  return (
    <motion.div 
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      style={{ position: 'absolute', top: 150, left: 300, zIndex: 60, width: 8, height: 8 }}
      className="pointer-events-auto group"
    >
      <div style={{ position: 'relative', width: 0, height: 0 }}>
        {/* Pivot Center */}
        <div ref={pivotRef} className="absolute w-0 h-0 left-0 top-0" />
        
        {/* Main Body with rotation */}
        <div style={{ transform: `rotate(${rotation}deg)` }} className="absolute">
          {/* Compass Legs Visual */}
          <div className="absolute top-0 left-0" style={{ width: radius, height: 2, backgroundColor: 'var(--accent)', opacity: 0.3, transformOrigin: 'left center' }} />
          
          <div 
            onPointerDown={(e) => { e.stopPropagation(); dragControls.start(e); }}
            className="absolute flex items-center justify-center transform translate-x-[-50%] translate-y-[-50%] cursor-grab active:cursor-grabbing group/compass"
            style={{ width: radius * 2, height: radius * 2, top: 0, left: 0 }}
          >
            <div className={cn(
              "w-full h-full border-2 border-dashed rounded-full transition-all flex items-center justify-center shadow-2xl relative",
              bgDark ? "border-white/20 bg-black/5 backdrop-blur-[2px] text-[var(--accent)]" : "border-black/10 bg-slate-400/5 backdrop-blur-[2px] text-[var(--accent)]"
            )}>
              {/* Technical grid center overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ 
                  backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', 
                  backgroundSize: '20px 20px' 
                }} 
              />

              {/* Degree markings on the circular edge */}
              {Array.from({ length: 72 }).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute bg-current opacity-100" 
                  style={{ 
                    width: Math.max(6, radius / 15),
                    height: 1.5,
                    transform: `rotate(${i * 5}deg) translateX(${radius - Math.max(6, radius / 15)}px)` 
                  }} 
                />
              ))}
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-[1.5px] bg-[var(--accent)]/50 absolute" />
              <div className="h-full w-[1.5px] bg-[var(--accent)]/50 absolute" />
              
              {/* Axis Markings */}
              {Array.from({ length: Math.floor(radius / 10) + 1 }).map((_, i) => {
                if (i === 0) return null;
                const isTen = i % 10 === 0;
                if (!isTen && radius < 120) return null;
                
                const scale = radius / 100;
                const tickSize = (isTen ? 14 : 7) * scale;
                const labelSize = Math.max(10, 14 * scale);
                if (i % 5 !== 0) return null;
                
                return (
                  <React.Fragment key={i}>
                    <div className="absolute w-[2px] bg-[var(--accent)]" style={{ height: tickSize, left: `calc(50% + ${i * 10}px)` }} />
                    <div className="absolute w-[2px] bg-[var(--accent)]" style={{ height: tickSize, left: `calc(50% - ${i * 10}px)` }} />
                    <div className="absolute h-[2px] bg-[var(--accent)]" style={{ width: tickSize, top: `calc(50% + ${i * 10}px)` }} />
                    <div className="absolute h-[2px] bg-[var(--accent)]" style={{ width: tickSize, top: `calc(50% - ${i * 10}px)` }} />
                    
                    {isTen && (
                      <span 
                        className="absolute font-mono text-[var(--accent)] select-none font-bold" 
                        style={{ 
                          fontSize: labelSize, 
                          left: `calc(50% + ${i * 10}px)`, 
                          top: `calc(50% + ${12 * scale}px)`, 
                          transform: 'translateX(-50%)' 
                        }}
                      >
                        {i}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Pivot Needle (Center) */}
            <div className="absolute w-5 h-5 flex items-center justify-center z-10">
              <div className="w-full h-full bg-white rounded-full shadow-lg border-2 border-[var(--accent)]" />
              <div className="absolute w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
            </div>
            
            {/* Pencil Point (Adjustable Radius) */}
            <div 
              className="absolute right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(var(--accent-rgb),0.5)] border-2 border-white z-50 -mr-4 cursor-nwse-resize active:scale-110 transition-transform" 
              style={{ backgroundColor: color }} 
              onPointerDown={handleRadiusDrag}
              title="Drag to resize & rotate"
            >
              <div className="w-2 h-2 bg-white rounded-full" />
              
              {/* Radius Label */}
              <div 
                className="absolute bottom-full mb-4 bg-black/90 backdrop-blur-md border border-white/20 px-3 py-1 rounded-lg font-black font-mono text-[var(--accent)] shadow-2xl whitespace-nowrap tracking-widest text-sm"
                style={{ transform: `rotate(${-rotation}deg)` }}
              >
                R-{(radius / 10).toFixed(1)}
              </div>
            </div>
            

          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Whiteboard;
