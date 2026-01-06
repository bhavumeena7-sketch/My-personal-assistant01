
export interface ContentMetadata {
  title: string;
  description: string;
  hashtags: string[];
  thumbnailPrompt: string;
}

export interface LogEntry {
  time: string;
  msg: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  CONTENT = 'content',
  VOICE = 'voice',
  STATS = 'stats'
}

export interface AIState {
  isGenerating: boolean;
  lastGenerated?: ContentMetadata;
  thumbnailUrl?: string;
}
