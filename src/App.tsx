/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Maximize2, 
  ExternalLink, 
  Download, 
  Upload, 
  Check, 
  Pencil,
  Search,
  ChevronLeft, 
  ChevronRight,
  Smile,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Analytics } from '@vercel/analytics/react';
import { cn } from '@/src/lib/utils';
import { ClassData, WidgetLayout, Todo } from '@/src/types';
import { useWidgetSize } from '@/src/components/Widget';
import Widget from '@/src/components/Widget';
import Clock from '@/src/components/Clock';
import Timer from '@/src/components/Timer';
import Whiteboard, { WhiteboardHandle } from '@/src/components/Whiteboard';

const STORAGE_KEY = 'classroom_dashboard_v3';

const DEFAULT_WIDGETS = {
  'w-clock': { x: 20, y: 20, w: 270, h: 200, hidden: false },
  'w-timer': { x: 310, y: 20, w: 285, h: 230, hidden: false },
  'w-traffic': { x: 20, y: 240, w: 265, h: 200, hidden: false },
  'w-work': { x: 310, y: 270, w: 285, h: 185, hidden: false },
  'w-instr': { x: 615, y: 20, w: 310, h: 175, hidden: false },
  'w-agenda': { x: 615, y: 215, w: 380, h: 370, hidden: false },
  'w-bg': { x: 20, y: 460, w: 570, h: 170, hidden: false },
  'w-whiteboard': { x: 1010, y: 20, w: 520, h: 480, hidden: false },
};

const PRESET_BGS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80',
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80',
  'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=1200&q=80'
];

export default function App() {
  const [classes, setClasses] = useState<Record<string, ClassData>>({});
  const [activeClassId, setActiveClassId] = useState<string>('');
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📝');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');

  const SCHOOL_EMOJIS = [
    { char: '📝', labels: ['write', 'paper', 'note', 'homework', 'task'] },
    { char: '💡', labels: ['idea', 'light', 'smart', 'thought', 'brain'] },
    { char: '📖', labels: ['book', 'read', 'open book', 'study'] },
    { char: '🧪', labels: ['science', 'experiment', 'chemistry', 'lab'] },
    { char: '🎨', labels: ['art', 'paint', 'draw', 'creative', 'design'] },
    { char: '🎵', labels: ['music', 'song', 'note', 'choir', 'band'] },
    { char: '⚽', labels: ['sports', 'soccer', 'play', 'gym', 'ball'] },
    { char: '💻', labels: ['computer', 'coding', 'tech', 'typing', 'laptop'] },
    { char: '🍎', labels: ['apple', 'fruit', 'teacher', 'snack', 'food'] },
    { char: '⭐', labels: ['star', 'grade', 'points', 'excellent', 'gold'] },
    { char: '🎒', labels: ['backpack', 'school', 'bag', 'travel'] },
    { char: '🏫', labels: ['school', 'building', 'education', 'classroom'] },
    { char: '🚌', labels: ['bus', 'travel', 'transport', 'commute'] },
    { char: '📏', labels: ['ruler', 'measure', 'math', 'length'] },
    { char: '✏️', labels: ['pencil', 'write', 'draw', 'sketch'] },
    { char: '📅', labels: ['calendar', 'date', 'schedule', 'planning'] },
    { char: '📊', labels: ['chart', 'graph', 'data', 'math', 'stats'] },
    { char: '📋', labels: ['clipboard', 'list', 'check', 'task'] },
    { char: '📚', labels: ['books', 'library', 'study', 'literature'] },
    { char: '🔬', labels: ['microscope', 'science', 'biology', 'lab'] },
    { char: '🔭', labels: ['telescope', 'space', 'science', 'astronomy'] },
    { char: '📐', labels: ['triangle', 'math', 'geometry', 'set square'] },
    { char: '🌡️', labels: ['thermometer', 'science', 'heat', 'weather'] },
    { char: '🛠️', labels: ['tools', 'workshop', 'build', 'repair'] },
    { char: '🎓', labels: ['graduation', 'cap', 'degree', 'success'] },
    { char: '🏆', labels: ['trophy', 'winner', 'first', 'prize'] },
    { char: '🔔', labels: ['bell', 'alarm', 'time', 'alert'] },
    { char: '📍', labels: ['pin', 'map', 'location', 'here'] },
    { char: '🧩', labels: ['puzzle', 'piece', 'logic', 'game'] },
    { char: '♟️', labels: ['chess', 'strategy', 'game', 'logic'] },
    { char: '🎭', labels: ['theater', 'drama', 'mask', 'stage'] },
    { char: '🎬', labels: ['clapper', 'movie', 'film', 'media'] },
    { char: '1️⃣', labels: ['one', '1', 'number', 'step', 'first'] },
    { char: '2️⃣', labels: ['two', '2', 'number', 'step', 'second'] },
    { char: '3️⃣', labels: ['three', '3', 'number', 'step', 'third'] },
    { char: '4️⃣', labels: ['four', '4', 'number', 'step'] },
    { char: '5️⃣', labels: ['five', '5', 'number', 'step'] },
    { char: '6️⃣', labels: ['six', '6', 'number', 'step'] },
    { char: '7️⃣', labels: ['seven', '7', 'number', 'step'] },
    { char: '8️⃣', labels: ['eight', '8', 'number', 'step'] },
    { char: '9️⃣', labels: ['nine', '9', 'number', 'step'] },
    { char: '🧪', labels: ['chemistry', 'experiment', 'flask', 'science'] },
    { char: '🧬', labels: ['dna', 'biology', 'science', 'health'] },
    { char: '➗', labels: ['divide', 'math', 'calculator'] },
    { char: '✖️', labels: ['multiply', 'math', 'calculator', 'times'] },
    { char: '➕', labels: ['plus', 'add', 'math', 'calculator'] },
    { char: '➖', labels: ['minus', 'subtract', 'math', 'calculator'] },
    { char: '🧮', labels: ['abacus', 'math', 'counting', 'calculation'] },
  ];

  const filteredEmojis = SCHOOL_EMOJIS.filter(e => 
    emojiSearch === '' || e.labels.some(label => label.includes(emojiSearch.toLowerCase()))
  );
  const [widgetLayouts, setWidgetLayouts] = useState<Record<string, WidgetLayout>>(DEFAULT_WIDGETS);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isWhiteboardMaximized, setIsWhiteboardMaximized] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [topWidgetId, setTopWidgetId] = useState<string>('');
  
  const whiteboardRef = useRef<WhiteboardHandle>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setClasses(parsed.classes || {});
        setWidgetLayouts(parsed.widgetLayouts || DEFAULT_WIDGETS);
        if (parsed.activeClassId) setActiveClassId(parsed.activeClassId);
        else setActiveClassId(Object.keys(parsed.classes || {})[0] || '');
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    } else {
      // Default classes
      const initial: Record<string, ClassData> = {
        'p1': createDefaultClass('Period 1'),
        'p2': createDefaultClass('Period 2'),
        'p3': createDefaultClass('Period 3'),
      };
      setClasses(initial);
      setActiveClassId('p1');
    }
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (Object.keys(classes).length === 0) return;
    
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          classes,
          widgetLayouts,
          activeClassId
        }));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        setSaveStatus('error');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [classes, widgetLayouts, activeClassId]);

  function createDefaultClass(name: string): ClassData {
    return {
      id: Math.random().toString(36).substring(7),
      name,
      traffic: 'grn',
      workMode: null,
      bgUrl: '',
      bgOpacity: 18,
      instructions: "Today's lesson details...",
      days: {}
    };
  }

  const activeClass = classes[activeClassId];

  const updateActiveClass = (updates: Partial<ClassData>) => {
    if (!activeClassId) return;
    setClasses(prev => ({
      ...prev,
      [activeClassId]: { ...prev[activeClassId], ...updates }
    }));
  };

  const getDayData = () => {
    if (!activeClass) return { title: '', todos: [] };
    return activeClass.days['main'] || { title: '', todos: [] };
  };

  const updateDayData = (updates: Partial<{ title: string, todos: Todo[] }>) => {
    if (!activeClass) return;
    const currentDay = getDayData();
    updateActiveClass({
      days: {
        ...activeClass.days,
        ['main']: { ...currentDay, ...updates }
      }
    });
  };

  const handleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          // If native fullscreen fails, show a helpful message
          const confirmOpen = window.confirm("Browser fullscreen is restricted in this embed (common on Google Sites). Would you like to open this app in a new tab to enable fullscreen mode?");
          if (confirmOpen) {
            window.open(window.location.href, '_blank');
          }
        });
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {
      // Fallback for older browsers or extreme restriction
      window.open(window.location.href, '_blank');
    }
  };

  const shiftDay = (n: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + n);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const hideWidget = (id: string) => {
    setWidgetLayouts(prev => ({
      ...prev,
      [id]: { ...prev[id], hidden: true }
    }));
  };

  const showWidget = (id: string) => {
    setTopWidgetId(id);
    setWidgetLayouts(prev => ({
      ...prev,
      [id]: { ...prev[id], hidden: false }
    }));
  };

  const bringToFront = (id: string) => {
    setTopWidgetId(id);
  };

  const exportSession = () => {
    const data = {
      classes,
      widgetLayouts,
      activeClassId,
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `classroom_session_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSession = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.classes && data.widgetLayouts) {
          setClasses(data.classes);
          setWidgetLayouts(data.widgetLayouts);
          if (data.activeClassId) setActiveClassId(data.activeClassId);
          // Optional: set a visual feedback or just allow the state update to trigger a save
        } else {
          alert("Invalid session file format.");
        }
      } catch (err) {
        alert("Failed to parse session file.");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const renameClass = (id: string, name: string) => {
    setEditingClassId(id);
    setEditValue(name);
  };

  const saveRename = (id: string) => {
    if (editValue.trim()) {
      setClasses(prev => ({
        ...prev,
        [id]: { ...prev[id], name: editValue.trim() }
      }));
    }
    setEditingClassId(null);
  };

  if (!activeClassId) return <div className="h-screen bg-[var(--bg)] flex items-center justify-center">Loading...</div>;

  return (
    <div className="h-screen flex flex-col font-sans bg-[var(--bg)] text-[var(--text)] overflow-hidden selection:bg-[var(--accent)] selection:text-white">
      {/* Header */}
      <header className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border-b border-[var(--border)] shrink-0 z-50">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {Object.keys(classes).map(id => (
            <div 
              key={id} 
              onClick={() => setActiveClassId(id)}
              onDoubleClick={(e) => { e.stopPropagation(); renameClass(id, classes[id].name); }}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border border-[var(--border)] flex items-center gap-1 cursor-pointer select-none h-7",
                id === activeClassId 
                  ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg" 
                  : "text-[var(--muted)] hover:text-white hover:border-white/30"
              )}
            >
              {editingClassId === id ? (
                <input
                  autoFocus
                  className="bg-transparent border-none outline-none text-xs font-semibold w-16 sm:w-24 text-white"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveRename(id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveRename(id);
                    if (e.key === 'Escape') setEditingClassId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span>{classes[id].name}</span>
                  {id === activeClassId && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); renameClass(id, classes[id].name); }}
                      onDoubleClick={(e) => e.stopPropagation()}
                      className="p-0.5 hover:bg-white/20 rounded transition-colors"
                      title="Rename period"
                    >
                      <div className="flex items-center">
                        <span className="w-px h-3 bg-white/30 mx-1" />
                        <Pencil size={10} />
                      </div>
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
          <button 
            onClick={() => {
              const id = 'c' + Date.now();
              const nextNum = Object.keys(classes).length + 1;
              const newName = `Period ${nextNum}`;
              setClasses(prev => ({ ...prev, [id]: createDefaultClass(newName) }));
              setActiveClassId(id);
              setEditingClassId(id);
              setEditValue(newName);
            }}
            className="px-3 py-1 rounded-full text-xs font-semibold border border-dashed border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all h-7 flex items-center justify-center shrink-0"
          >
            <Plus size={14} className="mr-1" />
            New Period
          </button>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {saveStatus !== 'idle' && (
            <div className={cn(
              "text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
              saveStatus === 'saved' ? "text-green-400" : saveStatus === 'saving' ? "text-[var(--muted)]" : "text-red-400"
            )}>
              {saveStatus === 'saving' ? "Saving..." : saveStatus === 'saved' ? "Changes Saved \u2713" : "Save Error"}
            </div>
          )}

          <div className="h-4 w-px bg-[var(--border)]" />
          
          <div className="flex items-center gap-1">
            <button 
              onClick={exportSession}
              title="Export Session JSON"
              className="px-2 py-1.5 rounded-lg bg-[var(--surface2)] text-[var(--muted)] hover:text-white transition-all active:scale-95 border border-[var(--border)] flex items-center gap-2"
            >
              <Download size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Export</span>
            </button>
            <label className="px-2 py-1.5 rounded-lg bg-[var(--surface2)] text-[var(--muted)] hover:text-white transition-all active:scale-95 border border-[var(--border)] cursor-pointer flex items-center gap-2">
              <Upload size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Import</span>
              <input type="file" accept=".json" onChange={importSession} className="hidden" />
            </label>
          </div>

          <button 
            onClick={handleFullscreen}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-bold shadow-lg shadow-[var(--accent)]/20 hover:bg-[var(--accent)]/90 transition-all active:scale-95"
          >
            <Maximize2 size={14} />
            Fullscreen
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main id="dashboard-canvas" ref={canvasRef} className="relative flex-1 overflow-hidden">
        {/* Background Layer */}
        {activeClass.bgUrl && (
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-700 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${activeClass.bgUrl})`, 
              opacity: activeClass.bgOpacity / 100 
            }}
          />
        )}

        {/* Dynamic Widgets */}
        <AnimatePresence>
          {!widgetLayouts['w-clock'].hidden && (
            <Widget 
              key="w-clock"
              id="w-clock" title="Clock" 
              defaultPosition={{ x: widgetLayouts['w-clock'].x, y: widgetLayouts['w-clock'].y }}
              defaultSize={{ w: widgetLayouts['w-clock'].w, h: widgetLayouts['w-clock'].h }}
              onClose={() => hideWidget('w-clock')}
              onLayoutChange={(id, layout) => setWidgetLayouts(prev => ({ ...prev, [id]: { ...prev[id], ...layout } }))}
              isTop={topWidgetId === 'w-clock'}
              onFocus={() => bringToFront('w-clock')}
              dragConstraints={canvasRef}
            >
              <Clock />
            </Widget>
          )}

          {!widgetLayouts['w-timer'].hidden && (
            <Widget 
              key="w-timer"
              id="w-timer" title="Timer" 
              defaultPosition={{ x: widgetLayouts['w-timer'].x, y: widgetLayouts['w-timer'].y }}
              defaultSize={{ w: widgetLayouts['w-timer'].w, h: widgetLayouts['w-timer'].h }}
              onClose={() => hideWidget('w-timer')}
              onLayoutChange={(id, layout) => setWidgetLayouts(prev => ({ ...prev, [id]: { ...prev[id], ...layout } }))}
              isTop={topWidgetId === 'w-timer'}
              onFocus={() => bringToFront('w-timer')}
              dragConstraints={canvasRef}
            >
              <Timer />
            </Widget>
          )}

          {!widgetLayouts['w-traffic'].hidden && (
            <Widget 
              key="w-traffic"
              id="w-traffic" title="Traffic Light" 
              defaultPosition={{ x: widgetLayouts['w-traffic'].x, y: widgetLayouts['w-traffic'].y }}
              defaultSize={{ w: widgetLayouts['w-traffic'].w, h: widgetLayouts['w-traffic'].h }}
              onClose={() => hideWidget('w-traffic')}
              onLayoutChange={(id, layout) => setWidgetLayouts(prev => ({ ...prev, [id]: { ...prev[id], ...layout } }))}
              isTop={topWidgetId === 'w-traffic'}
              onFocus={() => bringToFront('w-traffic')}
              dragConstraints={canvasRef}
            >
              <TrafficLightWidget 
                traffic={activeClass.traffic} 
                onUpdate={(t) => updateActiveClass({ traffic: t })} 
              />
            </Widget>
          )}

          {!widgetLayouts['w-work'].hidden && (
            <Widget 
              key="w-work"
              id="w-work" title="Work Mode" 
              defaultPosition={{ x: widgetLayouts['w-work'].x, y: widgetLayouts['w-work'].y }}
              defaultSize={{ w: widgetLayouts['w-work'].w, h: widgetLayouts['w-work'].h }}
              onClose={() => hideWidget('w-work')}
              onLayoutChange={(id, layout) => setWidgetLayouts(prev => ({ ...prev, [id]: { ...prev[id], ...layout } }))}
              isTop={topWidgetId === 'w-work'}
              onFocus={() => bringToFront('w-work')}
              dragConstraints={canvasRef}
            >
              <WorkModeWidget 
                activeMode={activeClass.workMode} 
                onUpdate={(m) => updateActiveClass({ workMode: activeClass.workMode === m ? null : m })} 
              />
            </Widget>
          )}

          {!widgetLayouts['w-instr'].hidden && (
            <Widget 
              key="w-instr"
              id="w-instr" title="Instructions" 
              defaultPosition={{ x: widgetLayouts['w-instr'].x, y: widgetLayouts['w-instr'].y }}
              defaultSize={{ w: widgetLayouts['w-instr'].w, h: widgetLayouts['w-instr'].h }}
              onClose={() => hideWidget('w-instr')}
              onLayoutChange={(id, layout) => setWidgetLayouts(prev => ({ ...prev, [id]: { ...prev[id], ...layout } }))}
              isTop={topWidgetId === 'w-instr'}
              onFocus={() => bringToFront('w-instr')}
              dragConstraints={canvasRef}
            >
              <InstructionsWidget 
                instructions={activeClass.instructions} 
                onUpdate={(val) => updateActiveClass({ instructions: val })} 
              />
            </Widget>
          )}

          {!widgetLayouts['w-agenda'].hidden && (
            <Widget 
              key="w-agenda"
              id="w-agenda" title="Agenda & Tasks" 
              defaultPosition={{ x: widgetLayouts['w-agenda'].x, y: widgetLayouts['w-agenda'].y }}
              defaultSize={{ w: widgetLayouts['w-agenda'].w, h: widgetLayouts['w-agenda'].h }}
              onClose={() => hideWidget('w-agenda')}
              onLayoutChange={(id, layout) => setWidgetLayouts(prev => ({ ...prev, [id]: { ...prev[id], ...layout } }))}
              isTop={topWidgetId === 'w-agenda'}
              onFocus={() => bringToFront('w-agenda')}
              dragConstraints={canvasRef}
            >
              <AgendaWidget 
                getDayData={getDayData}
                updateDayData={updateDayData}
                selectedEmoji={selectedEmoji}
                setSelectedEmoji={setSelectedEmoji}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                emojiSearch={emojiSearch}
                setEmojiSearch={setEmojiSearch}
                filteredEmojis={filteredEmojis}
              />
            </Widget>
          )}

          {!widgetLayouts['w-bg'].hidden && (
            <Widget 
              key="w-bg"
              id="w-bg" title="Appearance" 
              defaultPosition={{ x: widgetLayouts['w-bg'].x, y: widgetLayouts['w-bg'].y }}
              defaultSize={{ w: widgetLayouts['w-bg'].w, h: widgetLayouts['w-bg'].h }}
              onClose={() => hideWidget('w-bg')}
              onLayoutChange={(id, layout) => setWidgetLayouts(prev => ({ ...prev, [id]: { ...prev[id], ...layout } }))}
              isTop={topWidgetId === 'w-bg'}
              onFocus={() => bringToFront('w-bg')}
              dragConstraints={canvasRef}
            >
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={activeClass.bgUrl}
                    onChange={e => updateActiveClass({ bgUrl: e.target.value })}
                    placeholder="Paste image URL here..."
                    className="flex-1 bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
                  />
                  <button onClick={() => updateActiveClass({ bgUrl: '' })} className="px-3 py-1.5 text-xs font-bold border border-[var(--border)] rounded-lg hover:text-red-400">Clear</button>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {PRESET_BGS.map(url => (
                    <button 
                      key={url}
                      onClick={() => updateActiveClass({ bgUrl: url })}
                      className={cn(
                        "w-12 h-12 rounded-lg bg-cover bg-center shrink-0 border-2 transition-all hover:scale-105",
                        activeClass.bgUrl === url ? "border-[var(--accent)]" : "border-transparent"
                      )}
                      style={{ backgroundImage: `url(${url})` }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] shrink-0">Opacity</span>
                  <input 
                    type="range" min="5" max="70" step="1" 
                    value={activeClass.bgOpacity}
                    onChange={e => updateActiveClass({ bgOpacity: parseInt(e.target.value) })}
                    className="flex-1 accent-[var(--accent)]"
                  />
                  <span className="text-xs font-mono text-[var(--muted)] min-w-[30px]">{activeClass.bgOpacity}%</span>
                </div>
              </div>
            </Widget>
          )}

          {!widgetLayouts['w-whiteboard'].hidden && (
            <Widget 
              key="w-whiteboard"
              id="w-whiteboard" title="Whiteboard" 
              defaultPosition={{ x: widgetLayouts['w-whiteboard'].x, y: widgetLayouts['w-whiteboard'].y }}
              defaultSize={{ w: widgetLayouts['w-whiteboard'].w, h: widgetLayouts['w-whiteboard'].h }}
              onClose={() => hideWidget('w-whiteboard')}
              onLayoutChange={(id, layout) => setWidgetLayouts(prev => ({ ...prev, [id]: { ...prev[id], ...layout } }))}
              bodyClassName="p-0 flex flex-col"
              isTop={topWidgetId === 'w-whiteboard'}
              onFocus={() => bringToFront('w-whiteboard')}
              dragConstraints={canvasRef}
            >
              <Whiteboard 
                ref={whiteboardRef} 
                onToggleMaximize={() => setIsWhiteboardMaximized(true)} 
              />
            </Widget>
          )}
        </AnimatePresence>

        {/* Hidden Widgets Panel */}
        <div className="absolute bottom-4 right-4 flex gap-2 flex-wrap items-end justify-end pointer-events-none max-w-lg z-50">
          <div className="flex items-center gap-2 p-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/5 pointer-events-auto shadow-2xl">
            {Object.keys(DEFAULT_WIDGETS).map(id => {
              if (!widgetLayouts[id].hidden) return null;
              return (
                <button
                  key={id}
                  onClick={() => showWidget(id)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-white transition-all whitespace-nowrap"
                >
                  + {id.replace('w-', '')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Buy Me A Coffee Button */}
        <div className="absolute bottom-4 left-4 z-50 pointer-events-none">
          <a 
            href="https://buymeacoffee.com/thespinnraker" target="_blank" rel="noopener"
            className="pointer-events-auto h-10 hover:scale-105 transition-transform block"
          >
            <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" className="h-full shadow-2xl rounded-lg" />
          </a>
        </div>
      </main>

      {/* Maximized Whiteboard Overlay */}
      <AnimatePresence>
        {isWhiteboardMaximized && (
          <motion.div 
            key="whiteboard-modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] bg-[var(--bg)] flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface)] border-b border-[var(--border)] shrink-0">
              <div className="flex items-center gap-2">
                <Smile className="text-[var(--accent)]" size={18} />
                <span className="text-sm font-bold tracking-tight">Full-Screen Whiteboard</span>
              </div>
              <button 
                onClick={() => setIsWhiteboardMaximized(false)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/30 text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
              >
                Close Whiteboard
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {/* NOTE: We render the same Whiteboard component here. 
                  The math tools are INSIDE the Whiteboard component, so they WILL be present in this maximized view! */}
              <Whiteboard 
                isMaximized 
                onToggleMaximize={() => setIsWhiteboardMaximized(false)} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrafficButton({ active, color, label, onClick }: { active: boolean, color: 'red' | 'amber' | 'green', label: string, onClick: () => void }) {
  const { width } = useWidgetSize();
  const isSmall = width < 250;
  
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all h-full",
        active 
          ? color === 'red' ? "bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
          : color === 'amber' ? "bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
          : "bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
          : "bg-white/5 border-white/5 text-[var(--muted)] hover:bg-white/10"
      )}
    >
      <div className={cn(
        "rounded-full shadow-inner transition-all",
        color === 'red' ? "bg-red-500" : color === 'amber' ? "bg-amber-500" : "bg-green-500",
        !active && "opacity-20 grayscale-[0.5]",
        isSmall ? "w-6 h-6" : "w-8 h-8"
      )} />
      {!isSmall && <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>}
    </button>
  );
}

function TrafficLightWidget({ traffic, onUpdate }: { traffic: string, onUpdate: (t: 'red' | 'amb' | 'grn') => void }) {
  const { width, height } = useWidgetSize();
  const fontSize = Math.max(10, Math.min(width / 20, height / 15));

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grid grid-cols-3 gap-2 flex-1">
        <TrafficButton 
          active={traffic === 'red'} 
          color="red" label="Silence" 
          onClick={() => onUpdate('red')} 
        />
        <TrafficButton 
          active={traffic === 'amb'} 
          color="amber" label="Whisper" 
          onClick={() => onUpdate('amb')} 
        />
        <TrafficButton 
          active={traffic === 'grn'} 
          color="green" label="Talk" 
          onClick={() => onUpdate('grn')} 
        />
      </div>
      {height > 120 && (
        <div 
          className={cn(
            "text-center font-bold py-2 rounded-lg bg-black/20 border border-white/5 shrink-0 px-2",
            traffic === 'red' ? "text-red-400" : traffic === 'amb' ? "text-amber-400" : "text-green-400"
          )}
          style={{ fontSize: `${fontSize}px` }}
        >
          {traffic === 'red' ? "Silent — no talking please" : traffic === 'amb' ? "Whisper voices only" : "Normal talking — go for it"}
        </div>
      )}
    </div>
  );
}

function WorkModeButton({ id, active, label, icon, onClick }: { id: string, active: boolean, label: string, icon: string, onClick: () => void }) {
  const { width } = useWidgetSize();
  const isSmall = width < 250;
  
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all h-full",
        active 
          ? "bg-[var(--accent2)]/20 border-[var(--accent2)] text-[var(--accent2)] shadow-lg shadow-[var(--accent2)]/10" 
          : "bg-white/5 border-white/5 text-[var(--muted)] hover:bg-white/10"
      )}
    >
      <span className={cn(isSmall ? "text-xl" : "text-2xl")}>{icon}</span>
      {!isSmall && <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">{label}</span>}
    </button>
  );
}

function WorkModeWidget({ activeMode, onUpdate }: { activeMode: string | null, onUpdate: (m: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 h-full">
      <WorkModeButton 
        id="sil" active={activeMode === 'sil'} 
        label="Silent Work" icon="🤫" 
        onClick={() => onUpdate('sil')} 
      />
      <WorkModeButton 
        id="whi" active={activeMode === 'whi'} 
        label="Whisper Only" icon="🤐" 
        onClick={() => onUpdate('whi')} 
      />
      <WorkModeButton 
        id="nei" active={activeMode === 'nei'} 
        label="Ask Neighbor" icon="👥" 
        onClick={() => onUpdate('nei')} 
      />
      <WorkModeButton 
        id="tog" active={activeMode === 'tog'} 
        label="Work Together" icon="🙌" 
        onClick={() => onUpdate('tog')} 
      />
    </div>
  );
}

function InstructionsWidget({ instructions, onUpdate }: { instructions: string, onUpdate: (val: string) => void }) {
  const { width, height } = useWidgetSize();
  const fontSize = Math.max(12, Math.min(width/25, height/15));

  return (
    <textarea 
      value={instructions}
      onChange={e => onUpdate(e.target.value)}
      className="w-full h-full bg-[var(--surface2)] border border-[var(--border)] rounded-lg p-3 focus:border-[var(--accent)] outline-none resize-none custom-scrollbar"
      style={{ fontSize: `${fontSize}px` }}
      placeholder="Type lesson instructions here..."
    />
  );
}

function AgendaWidget({ 
  getDayData, 
  updateDayData, 
  selectedEmoji, 
  setSelectedEmoji, 
  showEmojiPicker, 
  setShowEmojiPicker, 
  emojiSearch, 
  setEmojiSearch, 
  filteredEmojis 
}: any) {
  const { width, height } = useWidgetSize();
  const titleSize = Math.max(14, Math.min(width/15, height/10));
  const todoSize = Math.max(11, Math.min(width/20, height/15));
  const inputHeight = Math.max(40, Math.min(height/6, 60));

  return (
    <div className="flex flex-col h-full gap-3 overflow-hidden">
      <div className="flex items-center gap-2 shrink-0">
        <input 
          type="text" 
          value={getDayData().title}
          onChange={e => updateDayData({ title: e.target.value })}
          placeholder="Lesson Topic..."
          className="flex-1 bg-transparent border-none font-bold outline-none placeholder:text-white/20"
          style={{ fontSize: `${titleSize}px` }}
        />
      </div>

      <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden shrink-0">
        <div 
          className="h-full bg-[var(--accent2)] transition-all duration-500" 
          style={{ width: `${getDayData().todos.length ? (getDayData().todos.filter((t: any) => t.done).length / getDayData().todos.length * 100) : 0}%` }} 
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 py-1">
        {getDayData().todos.map((todo: any, i: number) => (
          <div 
            key={todo.text + i}
            onClick={() => {
              const newTodos = [...getDayData().todos];
              newTodos[i].done = !newTodos[i].done;
              updateDayData({ todos: newTodos });
            }}
            className={cn(
              "group flex items-center gap-3 p-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl cursor-pointer transition-all hover:border-white/10 select-none",
              todo.done && "opacity-40"
            )}
          >
            <div 
              className="flex items-center justify-center bg-white/5 rounded-lg shrink-0"
              style={{ width: `${todoSize * 2.2}px`, height: `${todoSize * 2.2}px`, fontSize: `${todoSize * 1.5}px` }}
            >
              {todo.icon || (i + 1)}
            </div>
            <span 
              className={cn("flex-1 font-medium truncate", todo.done && "line-through")}
              style={{ fontSize: `${todoSize}px` }}
            >{todo.text}</span>
            <div 
              className={cn(
                "rounded-md border-2 border-white/20 flex items-center justify-center transition-all shrink-0",
                todo.done && "bg-[var(--accent)] border-[var(--accent)]"
              )}
              style={{ width: `${todoSize * 1.5}px`, height: `${todoSize * 1.5}px` }}
            >
              {todo.done && <Check size={todoSize} className="text-white" />}
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const newTodos = [...getDayData().todos];
                newTodos.splice(i, 1);
                updateDayData({ todos: newTodos });
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-400/10 rounded-md transition-all shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {getDayData().todos.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--muted)] opacity-20 py-10">
            <Plus size={48} strokeWidth={1} />
            <p className="text-xs uppercase font-bold tracking-widest mt-2">No tasks added</p>
          </div>
        )}
      </div>

      <div 
        className="relative flex flex-col gap-2 bg-[var(--surface2)] border border-[var(--border)] p-2 rounded-xl shrink-0"
        style={{ minHeight: `${inputHeight}px` }}
      >
        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 mb-2 p-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl z-[60] flex flex-col gap-2 min-w-[200px]">
            <div className="relative">
              <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input 
                autoFocus
                type="text"
                placeholder="Search emoji..."
                className="w-full bg-white/5 border border-white/10 rounded-md py-1 pl-6 pr-2 text-[10px] outline-none focus:border-[var(--accent)]/50 transition-colors"
                value={emojiSearch}
                onChange={(e) => setEmojiSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-5 gap-1 max-h-[150px] overflow-y-auto custom-scrollbar p-1">
              {filteredEmojis.map((emoji: any) => (
                <button 
                  key={emoji.char}
                  onClick={() => { 
                    setSelectedEmoji(emoji.char); 
                    setShowEmojiPicker(false); 
                    setEmojiSearch('');
                  }}
                  className="w-9 h-9 flex items-center justify-center hover:bg-[var(--accent)]/20 hover:text-white rounded-lg transition-all text-xl"
                  title={emoji.labels.join(', ')}
                >
                  {emoji.char}
                </button>
              ))}
              {filteredEmojis.length === 0 && (
                <div className="col-span-5 py-4 text-center text-[9px] text-[var(--muted)] uppercase font-bold tracking-wider">
                  No emojis found
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex gap-2 h-full items-center">
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg text-lg hover:bg-white/10 transition-colors border border-white/5 shrink-0"
          >
            {selectedEmoji}
          </button>
          <input 
            id="todo-input"
            type="text" 
            placeholder="Add task..." 
            className="flex-1 bg-transparent border-none text-sm outline-none"
            onKeyDown={(e: any) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                if (!input.value.trim()) return;
                updateDayData({ 
                  todos: [...getDayData().todos, { text: input.value, icon: selectedEmoji, done: false }] 
                });
                input.value = '';
              }
            }}
          />
          <button 
            onClick={() => {
                const input = document.getElementById('todo-input') as HTMLInputElement;
                if (!input.value.trim()) return;
                updateDayData({ 
                  todos: [...getDayData().todos, { text: input.value, icon: selectedEmoji, done: false }] 
                });
                input.value = '';
            }}
            className="bg-[var(--accent)] text-white p-2 rounded-lg shrink-0 hover:bg-[var(--accent)]/90 transition-all active:scale-95"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <Analytics />
    </div>
  );
}
