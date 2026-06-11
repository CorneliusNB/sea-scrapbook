export interface CoupleConfig {
  partner1: string;
  partner2: string;
  anniversaryDate: string; // YYYY-MM-DD format
}

export type SeaIconType = 'shell' | 'starfish' | 'pearl' | 'jellyfish' | 'turtle' | 'fish' | 'anchor';

export interface MemoryMilestone {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: SeaIconType;
  image?: string;
}

export interface LoveLetter {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  hasCodedSeal: boolean; // secret bottle letter
  isFavorite: boolean;
}

export interface FloatingBubble {
  id: string;
  x: number; // percentage width (0-100)
  size: number; // size in px
  speed: number; // speed multiplier
  content: string; // sweet word or quote inside
  opacity: number;
}

export interface SoundtrackSettings {
  ambientVolume: number; // 0 to 1
  melodyVolume: number; // 0 to 1
  bellVolume: number; // 0 to 1
  chimeVolume: number; // 0 to 1
  synthType: 'sine' | 'triangle' | 'sine-delayed';
  tempoSecs: number; // delay between arpeggio notes
}
