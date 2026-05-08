/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, createContext, useContext } from 'react';
import { motion, useDragControls } from 'motion/react';
import { GripVertical, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface WidgetContextType {
  width: number;
  height: number;
}

const WidgetContext = createContext<WidgetContextType>({ width: 300, height: 200 });

export const useWidgetSize = () => useContext(WidgetContext);

interface WidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { w: number; h: number };
  onClose?: () => void;
  onLayoutChange?: (id: string, layout: { x: number; y: number, w: number, h: number }) => void;
  onFocus?: () => void;
  isTop?: boolean;
  className?: string;
  bodyClassName?: string;
  dragConstraints?: React.RefObject<HTMLDivElement | null>;
}

const Widget: React.FC<WidgetProps> = ({
  id,
  title,
  children,
  defaultPosition = { x: 20, y: 20 },
  defaultSize = { w: 300, h: 200 },
  onClose,
  onLayoutChange,
  onFocus,
  isTop,
  className,
  bodyClassName,
  dragConstraints
}) => {
  const [size, setSize] = useState(defaultSize);
  const [pos, setPos] = useState(defaultPosition);

  // Sync state with props when they change
  useEffect(() => {
    setSize(defaultSize);
  }, [defaultSize.w, defaultSize.h]);

  useEffect(() => {
    setPos(defaultPosition);
  }, [defaultPosition.x, defaultPosition.y]);

  const dragControls = useDragControls();
  const widgetRef = useRef<HTMLDivElement>(null);

  const handleResize = (e: React.PointerEvent) => {
    onFocus?.();
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = size.w;
    const startH = size.h;

    let currentW = startW;
    let currentH = startH;

    const onPointerMove = (moveEvent: PointerEvent) => {
      currentW = Math.max(180, startW + (moveEvent.clientX - startX));
      currentH = Math.max(100, startH + (moveEvent.clientY - startY));
      setSize({ w: currentW, h: currentH });
    };

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      onLayoutChange?.(id, { ...pos, w: currentW, h: currentH });
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  return (
    <motion.div
      ref={widgetRef}
      drag
      dragConstraints={dragConstraints}
      dragElastic={0}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={false}
      onMouseDown={onFocus}
      onDragStart={onFocus}
      onDragEnd={(_, info) => {
        if (widgetRef.current && dragConstraints?.current) {
          const rect = widgetRef.current.getBoundingClientRect();
          const parentRect = dragConstraints.current.getBoundingClientRect();
          const newPos = {
            x: rect.left - parentRect.left,
            y: rect.top - parentRect.top
          };
          setPos(newPos);
          onLayoutChange?.(id, { ...newPos, w: size.w, h: size.h });
        } else {
          const newPos = { 
            x: pos.x + info.offset.x, 
            y: pos.y + info.offset.y 
          };
          setPos(newPos);
          onLayoutChange?.(id, { ...newPos, w: size.w, h: size.h });
        }
      }}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "just" }}
      style={{ 
        width: size.w, 
        height: size.h, 
        zIndex: isTop ? 40 : 10,
        position: 'absolute',
        left: 0,
        top: 0
      }}
      className={cn(
        "bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div 
        className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border-b border-[var(--border)] cursor-grab active:cursor-grabbing select-none shrink-0 group"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripVertical size={14} className="text-[var(--muted)]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] flex-1">
          {title}
        </span>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-[var(--muted)] hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className={cn("flex-1 overflow-auto custom-scrollbar", bodyClassName || "p-4")}>
        <WidgetContext.Provider value={{ width: size.w, height: size.h }}>
          {children}
        </WidgetContext.Provider>
      </div>

      {/* Resize Handle */}
      <div 
        className="absolute bottom-0 right-0 w-8 h-8 cursor-se-resize flex items-end justify-end p-1 z-[60] group hover:bg-white/5 active:bg-white/10 transition-colors rounded-tl-lg"
        onPointerDown={handleResize}
      >
        <div className="w-3 h-3 border-r-2 border-b-2 border-white/40 rounded-sm group-hover:border-[var(--accent)] transition-colors" />
      </div>
    </motion.div>
  );
};

export default Widget;
