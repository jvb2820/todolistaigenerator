export enum PriorityLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface Task {
  id: string;
  text: string;
  priority: PriorityLevel;
  dueDate: string; // YYYY-MM-DD format
  completed: boolean;
  createdAt: number; // Timestamp for original order tie-breaking
}

export interface TaskSet {
  id: string;
  title: string;
  tasks: Task[];
  themeColor: string; // e.g., 'bg-amber-400' for header
  createdAt: number;
  // sortOptions: SortOptions; <-- Removed
}

// For parsing Gemini response
export interface AiGeneratedTask {
  text: string;
  priority: 'High' | 'Medium' | 'Low'; // AI returns these in English
  dueDateOffset: number; // Days from today
}

// For AI Content Generation Language
export enum AiLanguageCode {
  ENGLISH = 'en',
  HINDI = 'hi',
}

export interface AiLanguageOption {
  code: AiLanguageCode;
  label: string;
  name: string; // Full language name for prompts
}