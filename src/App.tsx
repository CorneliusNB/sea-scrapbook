import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Waves, Compass, Sparkles, Anchor, Ship } from 'lucide-react';
import AnniversaryCounter from './components/AnniversaryCounter';
import SeashellSoundscapes from './components/SeashellSoundscapes';
import BottleWishWells from './components/BottleWishWells';
import MemoryTimeline from './components/MemoryTimeline';
import CoralOracle from './components/CoralOracle';
import BackgroundSea from './components/BackgroundSea';
import { CoupleConfig, MemoryMilestone, LoveLetter } from './types';
import { oceanAudio } from './utils/audio';

const DEFAULT_CONFIG: CoupleConfig = {
  partner1: 'Enjie',
  partner2: 'Cornel',
  anniversaryDate: '2025-06-12', // Anniversary date: June 12, 2025
};

const DEFAULT_MEMORIES: MemoryMilestone[] = [
  {
    id: 'default-memory-1',
    date: '2025-06-24',
    title: 'First sushi with bob',
    description: '',
    icon: 'fish',
    image: 'images/sushi.jpg'
  },
  {
    id: 'default-memory-2',
    date: '2025-09-03',
    title: 'First ramenya with bob',
    description: '',
    icon: 'shell',
    image: 'images/ramen.jpg'
  },
  {
    id: 'default-memory-3',
    date: '2025-10-10',
    title: 'Bob birthday yayyy',
    description: '',
    icon: 'starfish',
    image: 'images/birthday.jpg'
  },
  {
    id: 'default-memory-4',
    date: '2026-02-14',
    title: 'Trip to pik with bob',
    description: '',
    icon: 'anchor',
    image: 'images/pik.jpg'
  },
  {
    id: 'default-memory-5',
    date: '2026-03-16',
    title: 'Trip to dufan with bob',
    description: '',
    icon: 'turtle',
    image: 'images/dufan.jpeg'
  },
  {
    id: 'default-memory-6',
    date: '2026-04-24',
    title: 'First cosplay beruang with bob',
    description: '',
    icon: 'jellyfish',
    image: 'images/bear.jpg'
  }
];

const DEFAULT_LETTERS: LoveLetter[] = [
  {
    id: 'default-letter-1',
    sender: 'Cornel',
    content: 'to enjie, you are the one I love the most. This year was my happiest year cause I got to spend it with you, I love you very very much and I hope that we can be together forever. Love you bob, from cornel',
    timestamp: 'June 12, 2026',
    hasCodedSeal: false,
    isFavorite: true
  }
];

export default function App() {
  const [config, setConfig] = useState<CoupleConfig>(DEFAULT_CONFIG);
  const [memories, setMemories] = useState<MemoryMilestone[]>(DEFAULT_MEMORIES);
  const [letters, setLetters] = useState<LoveLetter[]>(DEFAULT_LETTERS);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const storedConfig = localStorage.getItem('sea_couple_config');
      if (storedConfig) {
        setConfig(JSON.parse(storedConfig));
      } else {
        localStorage.setItem('sea_couple_config', JSON.stringify(DEFAULT_CONFIG));
      }

      const storedMemories = localStorage.getItem('sea_milestones');
      let parsedMemories: MemoryMilestone[] = [];
      if (storedMemories) {
        parsedMemories = JSON.parse(storedMemories);
      }
      
      DEFAULT_MEMORIES.forEach(defMem => {
        const existingIdx = parsedMemories.findIndex(m => m.id === defMem.id);
        if (existingIdx === -1) {
          parsedMemories.push(defMem);
        } else {
          parsedMemories[existingIdx].description = defMem.description;
        }
      });
      
      parsedMemories.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      localStorage.setItem('sea_milestones', JSON.stringify(parsedMemories));
      setMemories(parsedMemories);

      const storedLetters = localStorage.getItem('sea_wishes');
      let parsedLetters: LoveLetter[] = [];
      if (storedLetters) {
        parsedLetters = JSON.parse(storedLetters);
      }

      const hasDefault = parsedLetters.some(l => l.id === 'default-letter-1');
      if (!hasDefault) {
        parsedLetters = [DEFAULT_LETTERS[0], ...parsedLetters];
        localStorage.setItem('sea_wishes', JSON.stringify(parsedLetters));
      }
      setLetters(parsedLetters);
    } catch (e) {
      console.error('LocalStorage failed to read presets:', e);
    }
  }, []);

  // Update Config handler
  const handleUpdateConfig = (newConfig: CoupleConfig) => {
    setConfig(newConfig);
    localStorage.setItem('sea_couple_config', JSON.stringify(newConfig));
  };

  // Add Memory handler
  const handleAddMemory = (newMemory: Omit<MemoryMilestone, 'id'>) => {
    const freshMemory: MemoryMilestone = {
      ...newMemory,
      id: Math.random().toString(36).substring(2, 9),
    };
    const updated = [...memories, freshMemory];
    setMemories(updated);
    localStorage.setItem('sea_milestones', JSON.stringify(updated));
  };

  // Update Memory handler (e.g. to add/change image)
  const handleUpdateMemory = (id: string, updatedFields: Partial<MemoryMilestone>) => {
    const updated = memories.map(m => m.id === id ? { ...m, ...updatedFields } : m);
    setMemories(updated);
    localStorage.setItem('sea_milestones', JSON.stringify(updated));
  };

  // Delete Memory handler
  const handleDeleteMemory = (id: string) => {
    const memoryToDelete = memories.find(m => m.id === id);
    if (memoryToDelete && memoryToDelete.image && memoryToDelete.image.startsWith('image-')) {
      import('./utils/imageDb').then(({ deleteImageLocal }) => {
        deleteImageLocal(memoryToDelete.image!);
      });
    }
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    localStorage.setItem('sea_milestones', JSON.stringify(updated));
  };

  // Add Letter/Bottle wish handler
  const handleAddLetter = (newLetter: Omit<LoveLetter, 'id' | 'timestamp'>) => {
    const freshLetter: LoveLetter = {
      ...newLetter,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
    };
    const updated = [...letters, freshLetter];
    setLetters(updated);
    localStorage.setItem('sea_wishes', JSON.stringify(updated));
  };

  // Delete Letter handler
  const handleDeleteLetter = (id: string) => {
    const updated = letters.filter(l => l.id !== id);
    setLetters(updated);
    localStorage.setItem('sea_wishes', JSON.stringify(updated));
  };

  return (
    <div className="bg-sea-dark min-h-screen text-sea-mint relative pb-16 scroll-smooth antialiased overflow-x-hidden selection:bg-sea-cyan/35 selection:text-white font-sans">
      
      {/* Background Sea Life (Fish swimming) */}
      <BackgroundSea />
      
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-sea-teal/15 rounded-full blur-[150px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-[30%] left-[40%] w-[20%] h-[20%] bg-amber-500/5 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

      {/* Decorative absolute marine bubbles floating in deep backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-sky-400/20 blur-[1px] animate-pulse"
            style={{
              bottom: `${10 + i * 8}%`,
              left: `${Math.sin(i) * 35 + 45}%`,
              width: `${12 + (i % 4) * 8}px`,
              height: `${12 + (i % 4) * 8}px`,
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Core Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10 sm:pt-14">
        
        {/* Aesthetic App Title Board with Glassmorphism */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 pb-6 border-b border-white/10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 py-1 px-3.5 rounded-full text-[11px] text-sky-300 font-mono tracking-widest uppercase mb-3 shadow-md backdrop-blur-md animate-pulse">
              <Waves className="w-3.5 h-3.5 animate-bounce-slow" /> Anniversary Cove <Waves className="w-3.5 h-3.5 animate-bounce-slow" />
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-serif font-light italic text-white mb-2">
              Our Love <span className="text-sky-300 font-normal">Scrapbook</span>
            </h1>
            
            <p className="text-[#BFDBF7]/70 text-xs sm:text-sm tracking-widest uppercase font-mono">
              Celebrating {config.partner1} & {config.partner2}'s beautiful memories & wishes
            </p>
          </div>
        </header>

        {/* Dashboard Bento-Grid Pattern */}
        <main className="space-y-6 sm:space-y-8">
          
          {/* Top Priority Block: Live Counter */}
          <section id="counter-section">
            <AnniversaryCounter config={config} onUpdateConfig={handleUpdateConfig} />
          </section>

          {/* Core Interactive Modules */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            
            {/* Left Column (Main Interactions) */}
            <section id="interaction-column" className="lg:col-span-7 space-y-6 sm:space-y-8">
              
              {/* Floating bubble popping and bottle wishes logs */}
              <BottleWishWells
                customLetters={letters}
                onAddLetter={handleAddLetter}
                onDeleteLetter={handleDeleteLetter}
                partnerNames={{ partner1: config.partner1, partner2: config.partner2 }}
              />

              {/* Memory journaling timeline */}
              <MemoryTimeline
                memories={memories}
                onAddMemory={handleAddMemory}
                onUpdateMemory={handleUpdateMemory}
                onDeleteMemory={handleDeleteMemory}
              />
            </section>

            {/* Right Column (Aesthetics and Music) */}
            <section id="aesthetics-column" className="lg:col-span-5 space-y-6 sm:space-y-8">
              
              {/* Enjie & Cornel's customized interactive MP3 lyric player */}
              <SeashellSoundscapes />

              {/* Jellyfish animal counselor & server-side Gemini poem Generator */}
              <CoralOracle
                partner1={config.partner1}
                partner2={config.partner2}
                anniversaryDate={config.anniversaryDate}
                memoriesCount={memories.length}
              />
            </section>
          </div>
        </main>

        {/* Humblest footer credits */}
        <footer className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-[#BFDBF7]/40 gap-2">
          <span>© 2026 {config.partner1.toUpperCase()} & {config.partner2.toUpperCase()} • ANNIVERSARY EDITION</span>
        </footer>
      </div>
    </div>
  );
}
