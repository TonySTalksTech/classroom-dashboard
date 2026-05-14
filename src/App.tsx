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
  AlertCircle,
  Lightbulb,
  BookOpen,
  Beaker,
  Palette,
  Music,
  Trophy,
  Laptop,
  Apple,
  Star,
  Backpack,
  School,
  Bus,
  Ruler,
  Calendar,
  ClipboardList,
  Library,
  Microscope,
  Telescope,
  GraduationCap,
  Bell,
  MapPin,
  Map,
  Puzzle,
  Dice5,
  Drama,
  Clapperboard,
  Calculator,
  Dna,
  Globe,
  Languages,
  Hammer,
  Hash,
  Clock as LucideClock,
  Camera,
  Coffee,
  Cloud,
  Sun,
  Moon,
  Dumbbell,
  Music2,
  Mic,
  Video,
  Phone,
  Mail,
  Heart,
  Flag,
  CheckSquare,
  Circle,
  Target,
  Trophy as LucideTrophy,
  Medal,
  Bike,
  Utensils,
  Gamepad2,
  FlaskConical,
  BarChart3,
  Stethoscope,
  History,
  Tablet,
  Keyboard,
  Landmark,
  PenTool,
  Atom,
  Image,
  Orbit,
  Tv,
  Users,
  Recycle,
  Waves,
  MessageCircle,
  User,
  ClipboardCheck,
  Thermometer,
  Wrench,
  Printer,
  Briefcase,
  HelpCircle,
  StickyNote,
  Paintbrush,
  FileText,
  Type,
  Minus,
  Divide,
  X,
  Folder,
  Leaf,
  Settings,
  TableProperties,
  Volume2,
  Activity,
  Award,
  Book,
  HandMetal,
  Infinity,
  LanguagesIcon,
  Layers,
  LifeBuoy,
  Navigation,
  Palmtree,
  PieChart,
  Shapes,
  Shuffle,
  RotateCcw,
  Save,
  EyeOff,
  Sprout,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { ClassData, WidgetLayout, Todo, WhiteboardState } from '@/src/types';
import { useWidgetSize } from '@/src/components/Widget';
import Widget from '@/src/components/Widget';
import Clock from '@/src/components/Clock';
import Timer from '@/src/components/Timer';
import Whiteboard, { WhiteboardHandle } from '@/src/components/Whiteboard';

const IconMap: Record<string, any> = {
  // Numbers support (handled by logic, but mappings for safety)
  '0': Hash, '1': Hash, '2': Hash, '3': Hash, '4': Hash, '5': Hash, '6': Hash, '7': Hash, '8': Hash, '9': Hash,
  
  // Core School Mappings
  pencil: Pencil,
  abacus: TableProperties,
  apple: Apple,
  art: Palette,
  backpack: Backpack,
  ball: Circle,
  band: Music,
  beaker: Beaker,
  bell: Bell,
  bike: Bike,
  book: Book,
  books: BookOpen,
  bus: Bus,
  calculator: Calculator,
  calendar: Calendar,
  camera: Camera,
  chess: Gamepad2,
  choir: Music,
  clock: LucideClock,
  coffee: Coffee,
  computer: Laptop,
  cooking: Utensils,
  dance: Music2,
  dice: Dice5,
  dictionary: BookOpen,
  divide: Divide,
  dna: Dna,
  drama: Drama,
  drawing: Pencil,
  earth: Globe,
  eating: Utensils,
  essay: FileText,
  experiment: FlaskConical,
  fieldtrip: Bus,
  film: Clapperboard,
  folder: Folder,
  fruit: Apple,
  flute: Music,
  game: Gamepad2,
  geography: Map,
  globe: Globe,
  glue: StickyNote,
  graduation: GraduationCap,
  graph: BarChart3,
  guitar: Music,
  gym: Dumbbell,
  hammer: Hammer,
  health: Stethoscope,
  history: History,
  homework: Pencil,
  ipad: Tablet,
  journal: BookOpen,
  keyboard: Keyboard,
  lab: FlaskConical,
  laptop: Laptop,
  lecture: Mic,
  library: Library,
  lunch: Utensils,
  map: Map,
  math: Calculator,
  meeting: Users,
  microscope: Microscope,
  minus: Minus,
  museum: Landmark,
  music: Music,
  notebook: BookOpen,
  notes: ClipboardList,
  paint: Paintbrush,
  palette: Palette,
  pen: PenTool,
  phone: Phone,
  physics: Atom,
  piano: Music,
  picture: Image,
  planets: Orbit,
  play: Tv,
  playground: Sun,
  plus: Plus,
  points: Star,
  presentation: Clapperboard,
  printing: Printer,
  project: Briefcase,
  protractor: Ruler,
  puzzle: Puzzle,
  quiz: HelpCircle,
  reading: BookOpen,
  recycle: Recycle,
  recess: Sun,
  recorder: Mic,
  report: FileText,
  ruler: Ruler,
  school: School,
  science: Beaker,
  singing: Mic,
  snack: Utensils,
  soccer: Target,
  speech: MessageCircle,
  spelling: Type,
  sports: Activity,
  star: Star,
  story: Book,
  study: Book,
  swimming: Waves,
  tablets: Tablet,
  talk: MessageCircle,
  teacher: User,
  telescope: Telescope,
  test: ClipboardCheck,
  theater: Drama,
  thermometer: Thermometer,
  time: LucideClock,
  times: X,
  toilet: User,
  tools: Wrench,
  trophy: LucideTrophy,
  trumpet: Music,
  violin: Music,
  weather: Cloud,
  workshop: Wrench,
  writing: Pencil,
  yoga: Heart,
  zoom: Video,
  
  // Extra help aliases
  maths: Calculator,
  draw: Pencil,
  movie: Clapperboard,
  media: Camera,
  photo: Camera,
  journaling: BookOpen,
  multiply: X,
  x: X,
  winner: Award,
  prize: Award,
  nature: Leaf,
  outside: Palmtree,
  water: Waves,
  lightning: Zap,
  energy: Zap,
  logic: Shapes,
  idea: Lightbulb,
  brain: Lightbulb,
  list: ClipboardList
};

const PICTOGRAM_BASE_URL = 'https://static.classroomscreen.com/timetable/';
const SCHOOL_ICONS = [
  { name: '0', labels: ['zero', 'number', 'start'] },
  { name: '1', labels: ['one', 'number', 'step', 'first'] },
  { name: '2', labels: ['two', 'number', 'step', 'second'] },
  { name: '3', labels: ['three', 'number', 'step', 'third'] },
  { name: '4', labels: ['four', 'number', 'step'] },
  { name: '5', labels: ['five', 'number', 'step'] },
  { name: '6', labels: ['six', 'number', 'step'] },
  { name: '7', labels: ['seven', 'number', 'step'] },
  { name: '8', labels: ['eight', 'number', 'step'] },
  { name: '9', labels: ['nine', 'number', 'step'] },
  { name: 'pencil', labels: ['write', 'paper', 'note', 'homework', 'task', 'pencil'] },
  { name: 'abacus', labels: ['math', 'calculator', 'abacus', 'counting'] },
  { name: 'apple', labels: ['apple', 'fruit', 'teacher', 'snack', 'food'] },
  { name: 'art', labels: ['art', 'paint', 'draw', 'creative', 'design'] },
  { name: 'backpack', labels: ['backpack', 'school', 'bag', 'travel'] },
  { name: 'ball', labels: ['ball', 'play', 'gym', 'sports'] },
  { name: 'band', labels: ['band', 'music', 'orchestra', 'instrument'] },
  { name: 'beaker', labels: ['science', 'experiment', 'chemistry', 'lab'] },
  { name: 'bell', labels: ['bell', 'alarm', 'time', 'alert'] },
  { name: 'bike', labels: ['bike', 'cycling', 'transport', 'wheels'] },
  { name: 'book', labels: ['book', 'read', 'study', 'literature'] },
  { name: 'books', labels: ['books', 'library', 'reading', 'stacks'] },
  { name: 'bus', labels: ['bus', 'travel', 'transport', 'commute'] },
  { name: 'calculator', labels: ['calculator', 'math', 'counting', 'calculation'] },
  { name: 'calendar', labels: ['calendar', 'date', 'schedule', 'planning'] },
  { name: 'camera', labels: ['camera', 'photo', 'video', 'media'] },
  { name: 'chess', labels: ['chess', 'strategy', 'game', 'logic'] },
  { name: 'choir', labels: ['choir', 'singing', 'music', 'voice'] },
  { name: 'clock', labels: ['clock', 'time', 'alarm', 'schedule'] },
  { name: 'coffee', labels: ['coffee', 'break', 'drink', 'teacher'] },
  { name: 'computer', labels: ['computer', 'laptop', 'tech', 'coding'] },
  { name: 'cooking', labels: ['cooking', 'food', 'chef', 'kitchen'] },
  { name: 'dance', labels: ['dance', 'ballet', 'music', 'movement'] },
  { name: 'dice', labels: ['dice', 'game', 'math', 'probability'] },
  { name: 'dictionary', labels: ['dictionary', 'words', 'language', 'spelling'] },
  { name: 'divide', labels: ['divide', 'math', 'calculator'] },
  { name: 'dna', labels: ['dna', 'biology', 'science', 'health'] },
  { name: 'drama', labels: ['theater', 'drama', 'mask', 'stage'] },
  { name: 'drawing', labels: ['drawing', 'art', 'sketch', 'pencil'] },
  { name: 'earth', labels: ['earth', 'globe', 'science', 'geography'] },
  { name: 'eating', labels: ['eating', 'food', 'lunch', 'break'] },
  { name: 'essay', labels: ['essay', 'writing', 'english', 'test'] },
  { name: 'experiment', labels: ['experiment', 'science', 'lab', 'beaker'] },
  { name: 'fieldtrip', labels: ['fieldtrip', 'bus', 'travel', 'outside'] },
  { name: 'film', labels: ['film', 'movie', 'video', 'media'] },
  { name: 'folder', labels: ['folder', 'files', 'paper', 'organize'] },
  { name: 'fruit', labels: ['fruit', 'healthy', 'food', 'snack'] },
  { name: 'flute', labels: ['flute', 'music', 'instrument'] },
  { name: 'game', labels: ['game', 'play', 'fun', 'controller'] },
  { name: 'geography', labels: ['geography', 'map', 'earth', 'world'] },
  { name: 'globe', labels: ['globe', 'world', 'geography', 'earth'] },
  { name: 'glue', labels: ['glue', 'art', 'craft', 'stick'] },
  { name: 'graduation', labels: ['graduation', 'cap', 'degree', 'success'] },
  { name: 'graph', labels: ['graph', 'data', 'math', 'stats'] },
  { name: 'guitar', labels: ['guitar', 'music', 'instrument'] },
  { name: 'gym', labels: ['gym', 'sports', 'pe', 'fitness'] },
  { name: 'hammer', labels: ['tools', 'workshop', 'build', 'repair'] },
  { name: 'health', labels: ['health', 'medical', 'doctor', 'nurse'] },
  { name: 'history', labels: ['history', 'old', 'past', 'museum'] },
  { name: 'homework', labels: ['homework', 'task', 'pencil', 'study'] },
  { name: 'ipad', labels: ['ipad', 'tablet', 'tech', 'computer'] },
  { name: 'journal', labels: ['journal', 'notebook', 'writing', 'diary'] },
  { name: 'keyboard', labels: ['keyboard', 'typing', 'computer', 'piano'] },
  { name: 'lab', labels: ['lab', 'science', 'chemistry', 'microscope'] },
  { name: 'laptop', labels: ['laptop', 'computer', 'tech'] },
  { name: 'lecture', labels: ['lecture', 'speech', 'talk', 'listening'] },
  { name: 'library', labels: ['library', 'books', 'study'] },
  { name: 'lunch', labels: ['lunch', 'eating', 'food', 'break'] },
  { name: 'map', labels: ['map', 'location', 'geography'] },
  { name: 'math', labels: ['math', 'numbers', 'calculator', 'geometry'] },
  { name: 'meeting', labels: ['meeting', 'talk', 'group', 'together'] },
  { name: 'microscope', labels: ['microscope', 'science', 'biology', 'lab'] },
  { name: 'minus', labels: ['minus', 'subtract', 'math', 'calculator'] },
  { name: 'museum', labels: ['museum', 'history', 'art', 'statue'] },
  { name: 'music', labels: ['music', 'song', 'note', 'choir', 'band'] },
  { name: 'notebook', labels: ['notebook', 'paper', 'writing', 'journal'] },
  { name: 'notes', labels: ['notes', 'paper', 'writing', 'list'] },
  { name: 'paint', labels: ['paint', 'art', 'brush', 'color'] },
  { name: 'palette', labels: ['art', 'paint', 'palette'] },
  { name: 'pen', labels: ['pen', 'ink', 'writing', 'signature'] },
  { name: 'phone', labels: ['phone', 'mobile', 'call', 'talk'] },
  { name: 'physics', labels: ['physics', 'science', 'atoms', 'energy'] },
  { name: 'piano', labels: ['piano', 'music', 'instrument', 'keys'] },
  { name: 'picture', labels: ['picture', 'photo', 'art', 'frame'] },
  { name: 'planets', labels: ['planets', 'space', 'science', 'astronomy'] },
  { name: 'play', labels: ['play', 'game', 'fun', 'recess'] },
  { name: 'playground', labels: ['playground', 'slide', 'recess', 'play'] },
  { name: 'plus', labels: ['plus', 'add', 'math', 'calculator'] },
  { name: 'points', labels: ['points', 'star', 'score', 'grade'] },
  { name: 'presentation', labels: ['presentation', 'slide', 'project', 'talk'] },
  { name: 'printing', labels: ['printing', 'paper', 'copy', 'machine'] },
  { name: 'project', labels: ['project', 'work', 'presentation', 'study'] },
  { name: 'protractor', labels: ['math', 'geometry', 'measure'] },
  { name: 'puzzle', labels: ['puzzle', 'piece', 'logic', 'game'] },
  { name: 'quiz', labels: ['quiz', 'test', 'question', 'answer'] },
  { name: 'reading', labels: ['reading', 'book', 'study', 'literature'] },
  { name: 'recycle', labels: ['recycle', 'green', 'earth', 'trash'] },
  { name: 'recess', labels: ['recess', 'play', 'break', 'outside'] },
  { name: 'recorder', labels: ['recorder', 'music', 'flute'] },
  { name: 'report', labels: ['report', 'card', 'grade', 'pencil'] },
  { name: 'ruler', labels: ['ruler', 'measure', 'math', 'length'] },
  { name: 'school', labels: ['school', 'building', 'education', 'classroom'] },
  { name: 'science', labels: ['science', 'lab', 'beaker', 'biology'] },
  { name: 'singing', labels: ['singing', 'choir', 'music', 'vocal'] },
  { name: 'snack', labels: ['snack', 'food', 'break', 'apple'] },
  { name: 'soccer', labels: ['soccer', 'ball', 'sports', 'pe'] },
  { name: 'speech', labels: ['speech', 'talk', 'listening', 'presentation'] },
  { name: 'spelling', labels: ['spelling', 'words', 'dictionary', 'letters'] },
  { name: 'sports', labels: ['sports', 'ball', 'field', 'gym'] },
  { name: 'star', labels: ['star', 'grade', 'points', 'excellent', 'gold'] },
  { name: 'story', labels: ['story', 'reading', 'book', 'talk'] },
  { name: 'study', labels: ['study', 'reading', 'homework', 'library'] },
  { name: 'swimming', labels: ['swimming', 'pool', 'sports', 'water'] },
  { name: 'tablets', labels: ['tablets', 'tech', 'computer', 'ipad'] },
  { name: 'talk', labels: ['talk', 'listening', 'speech', 'together'] },
  { name: 'teacher', labels: ['teacher', 'apple', 'school', 'desk'] },
  { name: 'telescope', labels: ['telescope', 'space', 'science', 'astronomy'] },
  { name: 'test', labels: ['test', 'quiz', 'grade', 'paper'] },
  { name: 'theater', labels: ['theater', 'drama', 'mask', 'stage'] },
  { name: 'thermometer', labels: ['thermometer', 'science', 'temp', 'weather'] },
  { name: 'time', labels: ['time', 'clock', 'wait', 'schedule'] },
  { name: 'times', labels: ['times', 'math', 'multiply', 'calculator'] },
  { name: 'toilet', labels: ['toilet', 'bathroom', 'room', 'restroom'] },
  { name: 'tools', labels: ['tools', 'hammer', 'wrench', 'workshop'] },
  { name: 'trophy', labels: ['winner', 'first', 'prize', 'sports'] },
  { name: 'trumpet', labels: ['trumpet', 'music', 'instrument'] },
  { name: 'violin', labels: ['violin', 'music', 'instrument'] },
  { name: 'weather', labels: ['weather', 'sun', 'rain', 'thermometer'] },
  { name: 'workshop', labels: ['workshop', 'tools', 'build', 'repair'] },
  { name: 'writing', labels: ['writing', 'pencil', 'essay', 'homework'] },
  { name: 'yoga', labels: ['yoga', 'stretch', 'gym', 'calm'] },
  { name: 'zoom', labels: ['zoom', 'video', 'call', 'online'] },
];

function DynamicIcon({ name, size = 20, className }: { name: string, size?: number, className?: string }) {
  const [error, setError] = useState(false);
  const nameLower = name.toLowerCase();

  useEffect(() => {
    setError(false);
  }, [nameLower]);

  // Handle numbering icons 0-99
  if (/^\d{1,2}$/.test(nameLower)) {
    const isSingleDigit = nameLower.length === 1;
    return (
      <div 
        className={cn("flex items-center justify-center font-bold text-white bg-[var(--accent)]/90 rounded-full shrink-0 select-none shadow-sm", className)}
        style={{ width: size, height: size, fontSize: size * (isSingleDigit ? 0.65 : 0.5) }}
        title={name}
      >
        {nameLower}
      </div>
    );
  }

  const isPictogram = SCHOOL_ICONS.some(icon => icon.name === nameLower);

  if (isPictogram && !error) {
    return (
      <img 
        src={`${PICTOGRAM_BASE_URL}${nameLower}.svg`} 
        alt={name} 
        title={name}
        className={className} 
        style={{ 
          width: size, 
          height: size,
          filter: 'contrast(1.1) saturate(1.2) drop-shadow(0 1px 2px rgba(0,0,0,0.15))' 
        }} 
        referrerPolicy="no-referrer" 
        onError={() => setError(true)}
      />
    );
  }
  
  const IconComponent = IconMap[nameLower];
  
  if (!IconComponent) {
    const letters = name.slice(0, 2).toUpperCase();
    return (
      <div 
        className={cn("flex items-center justify-center font-black rounded bg-white/5 border border-white/10 text-[var(--muted)]/50 leading-none select-none", className)}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        title={`${name} (No icon)`}
      >
        <span className="opacity-40">{letters}</span>
      </div>
    );
  }

  return <IconComponent size={size} className={className} />;
}

const STORAGE_KEY = 'classroom_dashboard_v3';
const LAYOUT_KEY = 'classroom_custom_layout_v1';

const DEFAULT_WIDGETS = {
  'w-clock': { x: 40, y: 40, w: 300, h: 180, hidden: false },
  'w-timer': { x: 360, y: 40, w: 300, h: 180, hidden: false },
  'w-traffic': { x: 680, y: 40, w: 300, h: 180, hidden: false },
  'w-work': { x: 1000, y: 40, w: 300, h: 180, hidden: false },
  'w-agenda': { x: 40, y: 240, w: 400, h: 520, hidden: false },
  'w-whiteboard': { x: 460, y: 240, w: 840, h: 520, hidden: false },
  'w-instr': { x: 40, y: 780, w: 1260, h: 180, hidden: false },
  'w-bg': { x: 1320, y: 240, w: 300, h: 180, hidden: true },
};

const PRESET_BGS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&q=80',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80',
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80',
  'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=1200&q=80'
];

const DEFAULT_WHITEBOARD_STATE: WhiteboardState = {
  data: '',
  elements: [],
  undoStack: [],
  redoStack: [],
  tool: 'pen',
  color: '#ffffff',
  size: 'sm',
  bgDark: true,
  showGrid: false,
  gridScale: 30,
  showGridLabels: true,
  activeGeoTools: [],
  showGrapher: false,
  showEqPanel: false,
  showMathTools: false,
  functions: []
};

export default function App() {
  const [classes, setClasses] = useState<Record<string, ClassData>>({});
  const [activeClassId, setActiveClassId] = useState<string>('');
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('pencil');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearch, setEmojiSearch] = useState('');

  const filteredIcons = SCHOOL_ICONS.filter(icon => 
    emojiSearch === '' || 
    icon.name.toLowerCase().includes(emojiSearch.toLowerCase()) ||
    icon.labels.some(label => label.toLowerCase().includes(emojiSearch.toLowerCase()))
  );
  const [widgetLayouts, _setWidgetLayouts] = useState<Record<string, WidgetLayout>>(DEFAULT_WIDGETS);

  // Helper to update layouts both locally and in the class state
  const setWidgetLayouts = (updater: Record<string, WidgetLayout> | ((prev: Record<string, WidgetLayout>) => Record<string, WidgetLayout>)) => {
    _setWidgetLayouts(updater);
    
    // Also push to classes state
    if (activeClassId) {
      setClasses(prev => {
        const currentClass = prev[activeClassId];
        if (!currentClass) return prev;
        
        const newLayouts = typeof updater === 'function' ? updater(currentClass.widgetLayouts || DEFAULT_WIDGETS) : updater;
        
        return {
          ...prev,
          [activeClassId]: {
            ...currentClass,
            widgetLayouts: newLayouts
          }
        };
      });
    }
  };
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isWhiteboardMaximized, setIsWhiteboardMaximized] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [topWidgetId, setTopWidgetId] = useState<string>('');
  const [whiteboardState, _setWhiteboardState] = useState<WhiteboardState>(DEFAULT_WHITEBOARD_STATE);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Helper to update whiteboard both locally and in class state
  const setWhiteboardState = (updater: WhiteboardState | ((prev: WhiteboardState) => WhiteboardState)) => {
    const isStateSame = (a: WhiteboardState, b: WhiteboardState) => {
      const isArrSame = (arrA: any[], arrB: any[]) => {
        if (arrA === arrB) return true;
        if (!arrA || !arrB) return false;
        if (arrA.length !== arrB.length) return false;
        return JSON.stringify(arrA) === JSON.stringify(arrB);
      };

      return a.tool === b.tool && 
             a.color === b.color && 
             a.size === b.size && 
             a.bgDark === b.bgDark &&
             a.showGrid === b.showGrid &&
             a.gridScale === b.gridScale &&
             a.showGridLabels === b.showGridLabels &&
             a.showGrapher === b.showGrapher &&
             a.showEqPanel === b.showEqPanel &&
             a.showMathTools === b.showMathTools &&
             a.data === b.data &&
             isArrSame(a.elements, b.elements) &&
             isArrSame(a.undoStack, b.undoStack) &&
             isArrSame(a.redoStack, b.redoStack) &&
             isArrSame(a.activeGeoTools, b.activeGeoTools) &&
             isArrSame(a.functions, b.functions);
    };

    _setWhiteboardState(prev => {
      const newState = typeof updater === 'function' ? updater(prev) : updater;
      if (isStateSame(prev, newState)) return prev;
      return newState;
    });

    if (activeClassId) {
      setClasses(prev => {
        const currentClass = prev[activeClassId];
        if (!currentClass) return prev;
        const currentWS = currentClass.whiteboardState || DEFAULT_WHITEBOARD_STATE;
        const newState = typeof updater === 'function' ? updater(currentWS) : updater;
        
        if (isStateSame(currentWS, newState)) return prev;
        
        return {
          ...prev,
          [activeClassId]: { ...currentClass, whiteboardState: newState }
        };
      });
    }
  };
  
  const whiteboardRef = useRef<WhiteboardHandle>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.classes) {
          setClasses(parsed.classes);
          if (parsed.activeClassId && parsed.classes[parsed.activeClassId]) {
            const active = parsed.classes[parsed.activeClassId];
            setActiveClassId(parsed.activeClassId);
            _setWidgetLayouts(active.widgetLayouts || DEFAULT_WIDGETS);
            _setWhiteboardState(active.whiteboardState || DEFAULT_WHITEBOARD_STATE);
          } else {
            const firstId = Object.keys(parsed.classes)[0];
            if (firstId) {
              const active = parsed.classes[firstId];
              setActiveClassId(firstId);
              _setWidgetLayouts(active.widgetLayouts || DEFAULT_WIDGETS);
              _setWhiteboardState(active.whiteboardState || DEFAULT_WHITEBOARD_STATE);
            }
          }
        }
        
        if (parsed.whiteboardState) setWhiteboardState(parsed.whiteboardState);
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
          activeClassId,
          whiteboardState
        }));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        setSaveStatus('error');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [classes, widgetLayouts, activeClassId, whiteboardState]);

  function createDefaultClass(name: string): ClassData {
    return {
      id: Math.random().toString(36).substring(7),
      name,
      traffic: 'grn',
      workMode: null,
      bgUrl: '',
      bgOpacity: 18,
      instructions: "Today's lesson details...",
      days: {},
      widgetLayouts: JSON.parse(JSON.stringify(DEFAULT_WIDGETS)),
      whiteboardState: JSON.parse(JSON.stringify(DEFAULT_WHITEBOARD_STATE)),
      timerSeconds: 300
    };
  }

  const resetLayout = () => {
    // Try to load custom layout first, then fallback to default
    const savedLayout = localStorage.getItem(LAYOUT_KEY);
    let layoutToUse = DEFAULT_WIDGETS;
    
    if (savedLayout) {
      try {
        layoutToUse = JSON.parse(savedLayout);
      } catch (e) {
        console.error("Failed to parse saved default layout", e);
      }
    }

    const freshLayout = JSON.parse(JSON.stringify(layoutToUse));
    setWidgetLayouts(freshLayout);
    // Visual feedback
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 500);
  };

  const saveCurrentAsDefault = () => {
    try {
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(widgetLayouts));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      setSaveStatus('error');
    }
  };

  const hideAllWidgets = () => {
    const hiddenLayout = Object.keys(widgetLayouts).reduce((acc, id) => {
      acc[id] = { ...widgetLayouts[id], hidden: true };
      return acc;
    }, {} as Record<string, WidgetLayout>);
    
    setWidgetLayouts(hiddenLayout);
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('idle'), 1000);
  };

  const activeClass = classes[activeClassId] || { 
    id: activeClassId, 
    name: 'Loading...', 
    bgUrl: '', 
    bgOpacity: 0, 
    instructions: '', 
    days: {}, 
    traffic: null, 
    workMode: null,
    widgetLayouts: DEFAULT_WIDGETS,
    whiteboardState: DEFAULT_WHITEBOARD_STATE 
  };

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
    
    // Get the "original" location from saved layout or defaults
    const savedLayoutStr = localStorage.getItem(LAYOUT_KEY);
    let originalLayout: Record<string, WidgetLayout> = DEFAULT_WIDGETS;
    if (savedLayoutStr) {
      try {
        originalLayout = JSON.parse(savedLayoutStr);
      } catch (e) {}
    }
    
    // Ensure we have the home location for this specific ID
    const widgetHome = originalLayout[id] || DEFAULT_WIDGETS[id as keyof typeof DEFAULT_WIDGETS];

    setWidgetLayouts(prev => ({
      ...prev,
      [id]: { 
        ...prev[id], 
        x: widgetHome?.x ?? prev[id].x,
        y: widgetHome?.y ?? prev[id].y,
        w: widgetHome?.w ?? prev[id].w,
        h: widgetHome?.h ?? prev[id].h,
        hidden: false 
      }
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
      whiteboardState,
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
          if (data.whiteboardState) setWhiteboardState(data.whiteboardState);
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

  const deleteClass = (id: string) => {
    const classIds = Object.keys(classes);
    if (classIds.length <= 1) {
      alert("You must have at least one period.");
      return;
    }
    
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      // Increased timeout slightly
      setTimeout(() => setDeleteConfirmId(prev => (prev === id ? null : prev)), 5000);
      return;
    }

    // If deleting active class, switch to another one first to avoid null states
    if (id === activeClassId) {
      const remainingIds = classIds.filter(cid => cid !== id);
      const nextId = remainingIds[0];
      const nextClass = classes[nextId];
      
      if (nextClass) {
        setActiveClassId(nextId);
        _setWidgetLayouts(nextClass.widgetLayouts || DEFAULT_WIDGETS);
        _setWhiteboardState(nextClass.whiteboardState || DEFAULT_WHITEBOARD_STATE);
      }
    }

    setClasses(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setDeleteConfirmId(null);
  };

  const handleClassSwitch = (id: string) => {
    setActiveClassId(id);
    _setWidgetLayouts(classes[id].widgetLayouts || DEFAULT_WIDGETS);
    _setWhiteboardState(classes[id].whiteboardState || DEFAULT_WHITEBOARD_STATE);
  };

  const getHomeLayout = () => {
    const saved = localStorage.getItem(LAYOUT_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_WIDGETS;
  };

  const homeLayout = getHomeLayout();

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
      <header className="flex flex-wrap items-center gap-y-2 gap-x-4 px-4 py-2 bg-[var(--surface)] border-b border-[var(--border)] shrink-0 z-50 min-h-[48px]">
        <div className="flex flex-wrap gap-1.5 items-center flex-1 min-w-0">
          {Object.keys(classes).map(id => (
            <div 
              key={id} 
              title={classes[id].name}
              onClick={() => handleClassSwitch(id)}
              onDoubleClick={(e) => { e.stopPropagation(); renameClass(id, classes[id].name); }}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border border-[var(--border)] flex items-center gap-2 cursor-pointer select-none h-8 group relative",
                id === activeClassId 
                  ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-md" 
                  : "text-[var(--muted)] hover:text-white hover:border-white/30"
              )}
            >
              {editingClassId === id ? (
                <input
                  autoFocus
                  className="bg-transparent border-none outline-none text-[11px] font-semibold w-16 sm:w-20 text-white"
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
                  <span className="max-w-[90px] truncate">{classes[id].name}</span>
                  <div className={cn(
                    "flex items-center gap-1 transition-all",
                    id === activeClassId ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); renameClass(id, classes[id].name); }}
                      onDoubleClick={(e) => e.stopPropagation()}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                      title="Rename period"
                    >
                      <Pencil size={11} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteClass(id); }}
                      onDoubleClick={(e) => e.stopPropagation()}
                      className={cn(
                        "p-1 rounded transition-all flex items-center gap-1 shrink-0",
                        deleteConfirmId === id 
                          ? "bg-red-500 text-white" 
                          : "hover:bg-red-500/20 text-red-400"
                      )}
                      title={deleteConfirmId === id ? "Click again to confirm" : "Delete period"}
                    >
                      <Trash2 size={deleteConfirmId === id ? 10 : 11} />
                      {deleteConfirmId === id && <span className="text-[9px] font-bold">Confirm</span>}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
            <button 
              onClick={() => {
                const id = 'c' + Date.now();
                const nextNum = Object.keys(classes).length + 1;
                const newName = `Period ${nextNum}`;
                const newClass = createDefaultClass(newName);
                setClasses(prev => ({ ...prev, [id]: newClass }));
                setActiveClassId(id);
                _setWidgetLayouts(newClass.widgetLayouts || DEFAULT_WIDGETS);
                _setWhiteboardState(newClass.whiteboardState || DEFAULT_WHITEBOARD_STATE);
                setEditingClassId(id);
                setEditValue(newName);
              }}
              title="Create New Period"
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-dashed border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all h-8 flex items-center justify-center shrink-0"
            >
              <Plus size={12} className="mr-1" />
              New
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0 py-1">
            {saveStatus !== 'idle' && (
              <div className={cn(
                "text-[9px] font-bold uppercase tracking-widest flex items-center gap-1",
                saveStatus === 'saved' ? "text-green-400" : saveStatus === 'saving' ? "text-[var(--muted)]" : "text-red-400"
              )}>
                {saveStatus === 'saving' ? "..." : saveStatus === 'saved' ? "\u2713" : "!"}
              </div>
            )}

          <div className="h-4 w-px bg-[var(--border)]" />
          
          <div className="flex items-center gap-1 text-[var(--muted)]">
            <button 
              onClick={hideAllWidgets}
              title="Hide all widgets"
              className="p-1.5 rounded-lg bg-[var(--surface2)] hover:text-white transition-all active:scale-95 border border-[var(--border)]"
            >
              <EyeOff size={15} />
            </button>
            <button 
              onClick={saveCurrentAsDefault}
              title="Save current layout as default"
              className="p-1.5 rounded-lg bg-[var(--surface2)] text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all active:scale-95 border border-[var(--accent)]/30"
            >
              <Save size={15} />
            </button>
            <button 
              onClick={resetLayout}
              title="Reset Layout to Grid"
              className="p-1.5 rounded-lg bg-[var(--surface2)] hover:text-white transition-all active:scale-95 border border-[var(--border)]"
            >
              <RotateCcw size={15} />
            </button>
            <div className="w-px h-3 bg-[var(--border)] mx-0.5" />
            <button 
              onClick={exportSession}
              title="Export Session"
              className="p-1.5 rounded-lg bg-[var(--surface2)] hover:text-white transition-all active:scale-95 border border-[var(--border)]"
            >
              <Download size={15} />
            </button>
            <label 
              title="Import Session"
              className="p-1.5 rounded-lg bg-[var(--surface2)] hover:text-white transition-all active:scale-95 border border-[var(--border)] cursor-pointer"
            >
              <Upload size={15} />
              <input type="file" hidden onChange={importSession} accept=".json" />
            </label>
          </div>

          <button 
            onClick={handleFullscreen}
            title="Toggle Fullscreen"
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
              opacity: activeClass.bgOpacity / 100,
              filter: 'contrast(1.1) saturate(1.2)'
            }}
          />
        )}

        {/* Dynamic Widgets */}
        <AnimatePresence>
          {!widgetLayouts['w-clock'].hidden && (
            <Widget 
              key={`w-clock-${activeClassId}`}
              id="w-clock" title="Clock" 
              defaultPosition={{ x: widgetLayouts['w-clock'].x, y: widgetLayouts['w-clock'].y }}
              defaultSize={{ w: widgetLayouts['w-clock'].w, h: widgetLayouts['w-clock'].h }}
              homePosition={{ x: homeLayout['w-clock'].x, y: homeLayout['w-clock'].y }}
              homeSize={{ w: homeLayout['w-clock'].w, h: homeLayout['w-clock'].h }}
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
              key={`w-timer-${activeClassId}`}
              id="w-timer" title="Timer" 
              defaultPosition={{ x: widgetLayouts['w-timer'].x, y: widgetLayouts['w-timer'].y }}
              defaultSize={{ w: widgetLayouts['w-timer'].w, h: widgetLayouts['w-timer'].h }}
              homePosition={{ x: homeLayout['w-timer'].x, y: homeLayout['w-timer'].y }}
              homeSize={{ w: homeLayout['w-timer'].w, h: homeLayout['w-timer'].h }}
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
              key={`w-traffic-${activeClassId}`}
              id="w-traffic" title="Traffic Light" 
              defaultPosition={{ x: widgetLayouts['w-traffic'].x, y: widgetLayouts['w-traffic'].y }}
              defaultSize={{ w: widgetLayouts['w-traffic'].w, h: widgetLayouts['w-traffic'].h }}
              homePosition={{ x: homeLayout['w-traffic'].x, y: homeLayout['w-traffic'].y }}
              homeSize={{ w: homeLayout['w-traffic'].w, h: homeLayout['w-traffic'].h }}
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
              key={`w-work-${activeClassId}`}
              id="w-work" title="Work Mode" 
              defaultPosition={{ x: widgetLayouts['w-work'].x, y: widgetLayouts['w-work'].y }}
              defaultSize={{ w: widgetLayouts['w-work'].w, h: widgetLayouts['w-work'].h }}
              homePosition={{ x: homeLayout['w-work'].x, y: homeLayout['w-work'].y }}
              homeSize={{ w: homeLayout['w-work'].w, h: homeLayout['w-work'].h }}
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
              key={`w-instr-${activeClassId}`}
              id="w-instr" title="Instructions" 
              defaultPosition={{ x: widgetLayouts['w-instr'].x, y: widgetLayouts['w-instr'].y }}
              defaultSize={{ w: widgetLayouts['w-instr'].w, h: widgetLayouts['w-instr'].h }}
              homePosition={{ x: homeLayout['w-instr'].x, y: homeLayout['w-instr'].y }}
              homeSize={{ w: homeLayout['w-instr'].w, h: homeLayout['w-instr'].h }}
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
              key={`w-agenda-${activeClassId}`}
              id="w-agenda" title="Agenda & Tasks" 
              defaultPosition={{ x: widgetLayouts['w-agenda'].x, y: widgetLayouts['w-agenda'].y }}
              defaultSize={{ w: widgetLayouts['w-agenda'].w, h: widgetLayouts['w-agenda'].h }}
              homePosition={{ x: homeLayout['w-agenda'].x, y: homeLayout['w-agenda'].y }}
              homeSize={{ w: homeLayout['w-agenda'].w, h: homeLayout['w-agenda'].h }}
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
                filteredIcons={filteredIcons}
              />
            </Widget>
          )}

          {!widgetLayouts['w-bg'].hidden && (
            <Widget 
              key={`w-bg-${activeClassId}`}
              id="w-bg" title="Appearance" 
              defaultPosition={{ x: widgetLayouts['w-bg'].x, y: widgetLayouts['w-bg'].y }}
              defaultSize={{ w: widgetLayouts['w-bg'].w, h: widgetLayouts['w-bg'].h }}
              homePosition={{ x: homeLayout['w-bg'].x, y: homeLayout['w-bg'].y }}
              homeSize={{ w: homeLayout['w-bg'].w, h: homeLayout['w-bg'].h }}
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
              key={`w-whiteboard-${activeClassId}`}
              id="w-whiteboard" title="Whiteboard" 
              defaultPosition={{ x: widgetLayouts['w-whiteboard'].x, y: widgetLayouts['w-whiteboard'].y }}
              defaultSize={{ w: widgetLayouts['w-whiteboard'].w, h: widgetLayouts['w-whiteboard'].h }}
              homePosition={{ x: homeLayout['w-whiteboard'].x, y: homeLayout['w-whiteboard'].y }}
              homeSize={{ w: homeLayout['w-whiteboard'].w, h: homeLayout['w-whiteboard'].h }}
              onClose={() => hideWidget('w-whiteboard')}
              onLayoutChange={(id, layout) => setWidgetLayouts(prev => ({ ...prev, [id]: { ...prev[id], ...layout } }))}
              bodyClassName="p-0 flex flex-col"
              isTop={topWidgetId === 'w-whiteboard'}
              onFocus={() => bringToFront('w-whiteboard')}
              dragConstraints={canvasRef}
            >
              {!isWhiteboardMaximized && (
                <Whiteboard 
                  ref={whiteboardRef} 
                  onToggleMaximize={() => setIsWhiteboardMaximized(true)} 
                  sharedState={whiteboardState}
                  onSharedStateChange={(updates) => setWhiteboardState(prev => ({ ...prev, ...updates }))}
                />
              )}
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
                sharedState={whiteboardState}
                onSharedStateChange={(updates) => setWhiteboardState(prev => ({ ...prev, ...updates }))}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrafficButton({ active, color, label, onClick }: { active: boolean, color: 'red' | 'amber' | 'green', label: string, onClick: () => void }) {
  const { width, height } = useWidgetSize();
  const scale = Math.min(width / 300, (height - 60) / 250); // subtract some for the bottom message
  
  const lightSize = Math.max(20, Math.min(48, 32 * scale));
  const labelFontSize = Math.max(9, Math.min(18, 12 * scale));
  const subFontSize = Math.max(7, Math.min(12, 9 * scale));
  const paddingX = Math.max(12, Math.min(32, 20 * scale));
  const paddingY = Math.max(8, Math.min(24, 16 * scale));
  const gap = Math.max(6, Math.min(20, 14 * scale));
  const isCompact = height < 180;
  
  const colorClasses = {
    red: {
      active: "bg-red-500/30 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]",
      light: "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]",
      inactive: "bg-red-950/40 border-white/5 text-[var(--muted)]"
    },
    amber: {
      active: "bg-amber-500/30 border-amber-500/50 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]",
      light: "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]",
      inactive: "bg-amber-950/40 border-white/5 text-[var(--muted)]"
    },
    green: {
      active: "bg-green-500/30 border-green-500/50 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]",
      light: "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]",
      inactive: "bg-green-950/40 border-white/5 text-[var(--muted)]"
    }
  };

  const current = colorClasses[color];

  return (
    <button 
      onClick={onClick}
      style={{ padding: `${paddingY}px ${paddingX}px`, gap: `${gap}px` }}
      className={cn(
        "flex items-center rounded-2xl border transition-all duration-300 relative group overflow-hidden flex-1",
        active ? current.active : "bg-white/5 border-white/5 text-[var(--muted)] hover:bg-white/10"
      )}
    >
      {/* Light Circle */}
      <div className="relative shrink-0">
        <div 
          style={{ width: `${lightSize}px`, height: `${lightSize}px` }}
          className={cn(
            "rounded-full transition-all duration-500 border-2 border-black/40",
            active ? current.light : "bg-black/40 opacity-40"
          )} 
        />
        {active && (
          <div 
            style={{ width: `${lightSize}px`, height: `${lightSize}px` }}
            className={cn(
              "absolute inset-0 rounded-full animate-pulse blur-md opacity-50",
              color === 'red' ? "bg-red-500" : color === 'amber' ? "bg-amber-500" : "bg-green-500"
            )} 
          />
        )}
      </div>

      <div className="flex flex-col items-start min-w-0">
        <span 
          style={{ fontSize: `${labelFontSize}px` }}
          className={cn(
            "font-black uppercase tracking-[0.2em] transition-colors truncate w-full text-left",
            active ? "text-white" : "text-[var(--muted)]"
          )}
        >
          {label}
        </span>
        {!isCompact && width > 150 && (
          <span 
            style={{ fontSize: `${subFontSize}px` }}
            className="font-mono opacity-40 uppercase tracking-widest mt-0.5 truncate w-full text-left"
          >
            {color === 'red' ? 'Silence' : color === 'amber' ? 'Whisper' : 'Public'} Mode
          </span>
        )}
      </div>
      
      {/* Active Indicator Bar */}
      {active && (
        <motion.div 
          layoutId="traffic-active"
          className={cn(
            "absolute right-0 top-0 bottom-0 w-1",
            color === 'red' ? "bg-red-500" : color === 'amber' ? "bg-amber-500" : "bg-green-500"
          )}
        />
      )}
    </button>
  );
}

function TrafficLightWidget({ traffic, onUpdate }: { traffic: string, onUpdate: (t: 'red' | 'amb' | 'grn') => void }) {
  const { width, height } = useWidgetSize();
  const scale = Math.min(width / 300, height / 250);
  const fontSize = Math.max(10, Math.min(24, 14 * scale));
  const mainGap = Math.max(4, Math.min(16, 12 * scale));
  const housingPadding = Math.max(4, Math.min(12, 8 * scale));

  return (
    <div className="flex flex-col h-full" style={{ gap: `${mainGap}px` }}>
      {/* Vertical Housing */}
      <div 
        style={{ gap: `${mainGap}px`, padding: `${housingPadding}px` }}
        className="flex flex-col flex-1 bg-black/30 rounded-[2rem] border border-white/5 shadow-inner backdrop-blur-sm"
      >
        <TrafficButton 
          active={traffic === 'red'} 
          color="red" label="Red Light" 
          onClick={() => onUpdate('red')} 
        />
        <TrafficButton 
          active={traffic === 'amb'} 
          color="amber" label="Yellow Light" 
          onClick={() => onUpdate('amb')} 
        />
        <TrafficButton 
          active={traffic === 'grn'} 
          color="green" label="Green Light" 
          onClick={() => onUpdate('grn')} 
        />
      </div>

      {height > 150 && (
        <motion.div 
          key={traffic}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "text-center font-mono font-bold py-3 rounded-2xl bg-[var(--surface2)] border border-[var(--border)] shrink-0 px-4 shadow-lg",
            traffic === 'red' ? "text-red-400 border-red-500/20" : traffic === 'amb' ? "text-amber-400 border-amber-500/20" : "text-green-400 border-green-500/20"
          )}
          style={{ fontSize: `${fontSize}px` }}
        >
          <div className="flex items-center justify-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full animate-ping", 
               traffic === 'red' ? "bg-red-500" : traffic === 'amb' ? "bg-amber-500" : "bg-green-500"
            )} />
            <span className="uppercase tracking-widest">
              {traffic === 'red' ? "Voices Off" : traffic === 'amb' ? "Whispers Only" : "Normal Communication"}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function WorkModeButton({ id, active, label, icon, onClick }: { id: string, active: boolean, label: string, icon: string, onClick: () => void }) {
  const { width, height } = useWidgetSize();
  const scale = Math.min(width / 300, height / 250);
  
  const iconSize = Math.max(16, Math.min(72, 40 * scale));
  const labelFontSize = Math.max(7, Math.min(20, 11 * scale));
  const padding = Math.max(4, Math.min(24, 12 * scale));
  const gap = Math.max(2, Math.min(12, 6 * scale));
  
  return (
    <button 
      onClick={onClick}
      style={{ padding: `${padding}px`, gap: `${gap}px` }}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border transition-all h-full flex-1 min-w-0 min-h-0",
        active 
          ? "bg-[var(--accent2)]/20 border-[var(--accent2)] text-[var(--accent2)] shadow-lg shadow-[var(--accent2)]/10" 
          : "bg-white/5 border-white/5 text-[var(--muted)] hover:bg-white/10"
      )}
    >
      <span style={{ fontSize: `${iconSize}px` }} className="shrink-0 leading-none">{icon}</span>
      <span 
        style={{ fontSize: `${labelFontSize}px` }}
        className="font-black uppercase tracking-wider text-center leading-tight truncate w-full px-1"
      >
        {label}
      </span>
    </button>
  );
}

function WorkModeWidget({ activeMode, onUpdate }: { activeMode: string | null, onUpdate: (m: any) => void }) {
  const { width, height } = useWidgetSize();
  const scale = Math.min(width / 300, height / 250);
  const gap = Math.max(4, Math.min(16, 8 * scale));

  return (
    <div className="grid grid-cols-2 h-full" style={{ gap: `${gap}px` }}>
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
  filteredIcons 
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
              style={{ width: `${todoSize * 2.2}px`, height: `${todoSize * 2.2}px` }}
            >
              {todo.icon ? <DynamicIcon name={todo.icon} size={todoSize * 1.4} /> : (i + 1)}
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
                placeholder="Search icons..."
                className="w-full bg-white/5 border border-white/10 rounded-md py-1 pl-6 pr-2 text-[10px] outline-none focus:border-[var(--accent)]/50 transition-colors"
                value={emojiSearch}
                onChange={(e) => setEmojiSearch(e.target.value)}
              />
            </div>
      <div className="grid grid-cols-5 gap-1 max-h-[150px] overflow-y-auto custom-scrollbar p-1">
              {filteredIcons.map((icon: any) => (
                <button 
                  key={icon.name}
                  onClick={() => { 
                    setSelectedEmoji(icon.name); 
                    setShowEmojiPicker(false); 
                    setEmojiSearch('');
                  }}
                  className="w-9 h-9 flex items-center justify-center hover:bg-[var(--accent)] text-[var(--muted)] hover:text-white rounded-lg transition-all"
                  title={icon.labels.join(', ')}
                >
                  <DynamicIcon name={icon.name} size={18} />
                </button>
              ))}
              {filteredIcons.length === 0 && (
                <div className="col-span-5 py-4 text-center text-[9px] text-[var(--muted)] uppercase font-bold tracking-wider">
                  No icons found
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex gap-2 h-full items-center">
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/5 shrink-0"
          >
            <DynamicIcon name={selectedEmoji} size={20} />
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
    </div>
  );
}
