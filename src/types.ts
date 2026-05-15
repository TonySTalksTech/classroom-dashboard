/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Todo {
  text: string;
  icon: string;
  done: boolean;
}

export interface DayData {
  title: string;
  todos: Todo[];
}

export interface ClassData {
  id: string;
  name: string;
  traffic: 'red' | 'amb' | 'grn';
  workMode: 'sil' | 'whi' | 'nei' | 'tog' | null;
  bgUrl: string;
  bgOpacity: number;
  instructions: string;
  days: Record<string, DayData>;
  widgetLayouts?: Record<string, WidgetLayout>;
  whiteboardState?: WhiteboardState;
  timerSeconds?: number;
}

export interface WidgetLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  hidden: boolean;
  minimized?: boolean;
}

export type WhiteboardSize = 'sm' | 'md' | 'lg' | 'xl';

export interface WhiteboardElement {
  id: string;
  type: 'path' | 'rect' | 'ellipse' | 'text' | 'line' | 'image';
  tool: string;
  points?: { x: number, y: number }[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  strokeWidth: number;
  opacity: number;
  text?: string;
  src?: string;
  rotation?: number;
}

export interface WhiteboardState {
  data: string;
  elements: WhiteboardElement[];
  undoStack: string[];
  redoStack: string[];
  tool: string;
  color: string;
  size: WhiteboardSize;
  bgDark: boolean;
  showGrid: boolean;
  gridScale: number;
  showGridLabels: boolean;
  activeGeoTools: string[];
  showGrapher: boolean;
  showEqPanel: boolean;
  showMathTools?: boolean;
  functions: { expr: string, color: string }[];
}

export type ClockMode = '12' | '24' | 'analog';
export type TimerMode = 'down' | 'up';
