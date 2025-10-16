export type Child = {
  id: string;
  name: string;
  birthDate: string; // ISO string format
};

export enum InsightCategory {
  Language = 'Language',
  Motor = 'Motor',
  Social = 'Social',
  Sleep = 'Sleep',
  Feeding = 'Feeding',
  Cognitive = 'Cognitive',
  Play = 'Play',
  Autonomy = 'Autonomy'
}

export enum InsightStatus {
  Excellent = 'excellent',
  OnTrack = 'on_track',
  Developing = 'developing',
  NeedsAttention = 'needs_attention'
}

export type IconName = 
  | 'MessageSquare' | 'Footprints' | 'Heart' | 'Moon' | 'UtensilsCrossed' 
  | 'BrainCircuit' | 'Palette' | 'User' | 'Plus' | 'ChevronDown' | 'Send' 
  | 'Baby' | 'Sparkles' | 'Loader2' | 'X' | 'TrendingUp' | 'CheckCircle2'
  | 'Hourglass' | 'AlertTriangle' | 'BookOpen' | 'Lightbulb' | 'Tag'
  | 'Brain' | 'Box' | 'Puzzle';

export type Insight = {
  id: string;
  childId: string;
  category: InsightCategory;
  title: string;
  observation: string;
  recommendation: string;
  status: InsightStatus;
  iconName: IconName;
  createdAt: string; // ISO string format
  type?: 'observation' | 'stimulation';
};

export type ChatMessage = {
  id: string;
  childId: string;
  role: 'user' | 'assistant';
  content: string;
  questionCategory?: InsightCategory;
  createdAt: string; // ISO string format
};
