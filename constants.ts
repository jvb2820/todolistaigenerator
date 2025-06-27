import { PriorityLevel, AiLanguageCode, AiLanguageOption } from './types'; // Removed SortCriteria, SortOrder

export const PRIORITY_STYLES: Record<PriorityLevel, { name: string; badgeColor: string; textColor: string; ringColor: string; sortOrder: number }> = {
  [PriorityLevel.HIGH]: {
    name: 'High', // This will be translated by the main app's i18n
    badgeColor: 'bg-red-100',
    textColor: 'text-red-700',
    ringColor: 'ring-red-500',
    sortOrder: 0, // This was used for priority sorting, can remain as a property
  },
  [PriorityLevel.MEDIUM]: {
    name: 'Medium', // This will be translated by the main app's i18n
    badgeColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    ringColor: 'ring-yellow-500',
    sortOrder: 1, // This was used for priority sorting, can remain as a property
  },
  [PriorityLevel.LOW]: {
    name: 'Low', // This will be translated by the main app's i18n
    badgeColor: 'bg-green-100',
    textColor: 'text-green-700',
    ringColor: 'ring-green-500',
    sortOrder: 2, // This was used for priority sorting, can remain as a property
  },
};

export const PRIORITY_OPTIONS = [
  { value: PriorityLevel.HIGH, label: 'High' }, // Label will be translated
  { value: PriorityLevel.MEDIUM, label: 'Medium' },
  { value: PriorityLevel.LOW, label: 'Low' },
];

// Removed SORT_CRITERIA_OPTIONS
// Removed DEFAULT_SORT_OPTIONS

export const PAPER_THEME_COLORS = [
  'bg-amber-400', // Original image like
  'bg-sky-400',
  'bg-rose-400',
  'bg-lime-400',
  'bg-violet-400',
];

export const AI_LANGUAGE_OPTIONS: AiLanguageOption[] = [
  { code: AiLanguageCode.ENGLISH, label: 'English', name: 'English' },
  { code: AiLanguageCode.HINDI, label: 'Hindi (हिन्दी)', name: 'Hindi' },
];