import type { PriorityLevel } from './types';

/** Priority level label. */
export function priorityLevelLabel(level: PriorityLevel): string {
  switch (level) {
    case 'routine':
      return 'Routine - Standard processing';
    case 'urgent':
      return 'Urgent - Requires prompt attention';
    case 'emergency':
      return 'Emergency - Immediate action required';
    default:
      return `Priority: ${level}`;
  }
}

/** Priority level colour class. */
export function priorityLevelColor(level: PriorityLevel): string {
  switch (level) {
    case 'routine':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'urgent':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'emergency':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}
