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
}

export interface WidgetLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  hidden: boolean;
}

export type ClockMode = '12' | '24' | 'analog';
export type TimerMode = 'down' | 'up';
