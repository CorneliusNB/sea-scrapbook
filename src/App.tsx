import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Waves, Compass, Sparkles, Anchor, Ship, Settings, Database, Copy, Check, Info } from 'lucide-react';
import AnniversaryCounter from './components/AnniversaryCounter';
import SeashellSoundscapes from './components/SeashellSoundscapes';
import BottleWishWells from './components/BottleWishWells';
import MemoryTimeline from './components/MemoryTimeline';
import CoralOracle from './components/CoralOracle';
import BackgroundSea from './components/BackgroundSea';
import { CoupleConfig, MemoryMilestone, LoveLetter } from './types';
import { oceanAudio } from './utils/audio';
import {
  initSupabase,
  disconnectSupabase,
  isSupabaseConnected,
  syncWishes,
  syncMilestones,
  pushSingleWish,
  pushSingleMilestone,
  deleteSingleWish,
  deleteSingleMilestone,
  SUPABASE_SQL_SCHEMA
} from './utils/supabaseSync';

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
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSupabaseActive, setIsSupabaseActive] = useState(isSupabaseConnected());
  const [syncing, setSyncing] = useState(false);

  // Load and Sync Data on mount
  useEffect(() => {
    // 1. Check for Supabase URL query parameters
    const searchParams = new URLSearchParams(window.location.search);
    const sUrl = searchParams.get('supabaseUrl');
    const sKey = searchParams.get('supabaseKey');
    if (sUrl && sKey) {
      initSupabase(sUrl, sKey);
      setIsSupabaseActive(true);
      // Clean URL parameters from display
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const loadAndSync = async () => {
      let parsedMemories: MemoryMilestone[] = [];
      let parsedLetters: LoveLetter[] = [];

      try {
        const storedConfig = localStorage.getItem('sea_couple_config');
        if (storedConfig) {
          setConfig(JSON.parse(storedConfig));
        } else {
          localStorage.setItem('sea_couple_config', JSON.stringify(DEFAULT_CONFIG));
        }

        const storedMemories = localStorage.getItem('sea_milestones');
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
        setMemories(parsedMemories);

        const storedLetters = localStorage.getItem('sea_wishes');
        if (storedLetters) {
          parsedLetters = JSON.parse(storedLetters);
        }

        const hasDefault = parsedLetters.some(l => l.id === 'default-letter-1');
        if (!hasDefault) {
          parsedLetters = [DEFAULT_LETTERS[0], ...parsedLetters];
        }
        setLetters(parsedLetters);
      } catch (e) {
        console.error('LocalStorage failed to read presets:', e);
      }

      // 2. Perform Supabase Sync in background if active
      if (isSupabaseConnected()) {
        setSyncing(true);
        try {
          const syncedWishes = await syncWishes(parsedLetters);
          setLetters(syncedWishes);
          localStorage.setItem('sea_wishes', JSON.stringify(syncedWishes));

          const syncedMems = await syncMilestones(parsedMemories);
          syncedMems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setMemories(syncedMems);
          localStorage.setItem('sea_milestones', JSON.stringify(syncedMems));
        } catch (err) {
          console.error("Auto sync failed:", err);
        } finally {
          setSyncing(false);
        }
      }
    };

    loadAndSync();
  }, []);

  // Update Config handler
  const handleUpdateConfig = (newConfig: CoupleConfig) => {
    setConfig(newConfig);
    localStorage.setItem('sea_couple_config', JSON.stringify(newConfig));
  };

  // Add Memory handler
  const handleAddMemory = async (newMemory: Omit<MemoryMilestone, 'id'>) => {
    const freshMemory: MemoryMilestone = {
      ...newMemory,
      id: Math.random().toString(36).substring(2, 9),
    };
    const updated = [...memories, freshMemory];
    setMemories(updated);
    localStorage.setItem('sea_milestones', JSON.stringify(updated));

    if (isSupabaseConnected()) {
      await pushSingleMilestone(freshMemory);
    }
  };

  // Update Memory handler (e.g. to add/change image)
  const handleUpdateMemory = async (id: string, updatedFields: Partial<MemoryMilestone>) => {
    const updated = memories.map(m => m.id === id ? { ...m, ...updatedFields } : m);
    setMemories(updated);
    localStorage.setItem('sea_milestones', JSON.stringify(updated));

    if (isSupabaseConnected()) {
      const fullMemory = updated.find(m => m.id === id);
      if (fullMemory) {
        await pushSingleMilestone(fullMemory);
      }
    }
  };

  // Delete Memory handler
  const handleDeleteMemory = async (id: string) => {
    const memoryToDelete = memories.find(m => m.id === id);
    if (memoryToDelete && memoryToDelete.image && memoryToDelete.image.startsWith('image-')) {
      import('./utils/imageDb').then(({ deleteImageLocal }) => {
        deleteImageLocal(memoryToDelete.image!);
      });
    }
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    localStorage.setItem('sea_milestones', JSON.stringify(updated));

    if (isSupabaseConnected()) {
      await deleteSingleMilestone(id, memoryToDelete?.image);
    }
  };

  // Add Letter/Bottle wish handler
  const handleAddLetter = async (newLetter: Omit<LoveLetter, 'id' | 'timestamp'>) => {
    const freshLetter: LoveLetter = {
      ...newLetter,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
    };
    const updated = [...letters, freshLetter];
    setLetters(updated);
    localStorage.setItem('sea_wishes', JSON.stringify(updated));

    if (isSupabaseConnected()) {
      await pushSingleWish(freshLetter);
    }
  };

  // Delete Letter handler
  const handleDeleteLetter = async (id: string) => {
    const updated = letters.filter(l => l.id !== id);
    setLetters(updated);
    localStorage.setItem('sea_wishes', JSON.stringify(updated));

    if (isSupabaseConnected()) {
      await deleteSingleWish(id);
    }
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

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold font-mono tracking-wider uppercase border transition-all duration-300 active:scale-95 cursor-pointer shadow-md backdrop-blur-md ${
                isSupabaseActive 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20' 
                  : 'bg-white/5 border-white/10 text-sky-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{isSupabaseActive ? 'Live Synced' : 'Enable Sync'}</span>
              <div className={`w-2 h-2 rounded-full ml-1 ${isSupabaseActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            </button>
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

      {/* Cloud Sync Setup Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-[#0b1b2b] border border-white/10 rounded-[32px] p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto text-white shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2.5">
                <div className="bg-sky-500/10 p-2.5 rounded-xl text-sky-400 border border-sky-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-wide font-serif">Cloud Sync Configuration</h3>
                  <p className="text-[10px] text-sky-300/60 font-mono uppercase">Sync wishes & memories in real-time</p>
                </div>
              </div>
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="text-white/40 hover:text-white transition-colors text-xl font-mono p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6">
              <p className="text-xs text-[#BFDBF7]/70 leading-relaxed">
                Connect your scrapbook to a free **Supabase** database to automatically keep wishes, memories, and photos synchronized in real-time between your devices (e.g. your phone and your partner's phone).
              </p>

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#BFDBF7]/50 mb-1.5 font-bold">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://your-project-id.supabase.co"
                    defaultValue={localStorage.getItem('supabase_sync_url') || ''}
                    id="supabase-url-input"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-[#BFDBF7]/50 mb-1.5 font-bold">
                    Supabase Anon Public API Key
                  </label>
                  <textarea
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    defaultValue={localStorage.getItem('supabase_sync_key') || ''}
                    id="supabase-key-input"
                    rows={3}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={async () => {
                    const urlVal = (document.getElementById('supabase-url-input') as HTMLInputElement)?.value.trim();
                    const keyVal = (document.getElementById('supabase-key-input') as HTMLTextAreaElement)?.value.trim();
                    if (!urlVal || !keyVal) {
                      alert("Please provide both the Supabase URL and Anon Key!");
                      return;
                    }
                    const success = initSupabase(urlVal, keyVal);
                    if (success) {
                      setIsSupabaseActive(true);
                      alert("Successfully connected to Supabase! Syncing data now...");
                      setSyncing(true);
                      try {
                        const syncedWishes = await syncWishes(letters);
                        setLetters(syncedWishes);
                        localStorage.setItem('sea_wishes', JSON.stringify(syncedWishes));

                        const syncedMems = await syncMilestones(memories);
                        syncedMems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        setMemories(syncedMems);
                        localStorage.setItem('sea_milestones', JSON.stringify(syncedMems));
                        
                        alert("Sync complete! You are now live.");
                      } catch (err: any) {
                        alert("Connected, but initial sync encountered an error: " + (err.message || err));
                      } finally {
                        setSyncing(false);
                        setIsSyncModalOpen(false);
                      }
                    } else {
                      alert("Failed to initialize Supabase client. Please check your inputs.");
                    }
                  }}
                  className="flex-1 bg-sky-400 hover:bg-white text-slate-900 hover:text-sky-500 py-3 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all duration-300 text-center active:scale-95 cursor-pointer"
                >
                  {syncing ? 'Connecting & Syncing...' : 'Connect & Sync'}
                </button>

                {isSupabaseActive && (
                  <button
                    onClick={() => {
                      disconnectSupabase();
                      setIsSupabaseActive(false);
                      alert("Disconnected. Your data will now remain local on this device.");
                      setIsSyncModalOpen(false);
                    }}
                    className="bg-rose-500/15 border border-rose-500/30 hover:bg-rose-500/25 text-rose-300 py-3 px-6 rounded-xl text-xs font-bold font-mono tracking-wider uppercase transition-all duration-300 text-center active:scale-95 cursor-pointer"
                  >
                    Disconnect
                  </button>
                )}
              </div>

              {/* Shareable Link Helper */}
              {isSupabaseActive && (
                <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/5 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <Info className="w-3.5 h-3.5" /> Easy Partner Connection Link
                  </div>
                  <p className="text-[10px] text-[#BFDBF7]/60 leading-relaxed text-left">
                    Send this link to your partner. When they open it, their scrapbook will automatically configure itself to use your database!
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}${window.location.pathname}?supabaseUrl=${encodeURIComponent(localStorage.getItem('supabase_sync_url') || '')}&supabaseKey=${encodeURIComponent(localStorage.getItem('supabase_sync_key') || '')}`}
                      id="shareable-link-input"
                      className="flex-1 bg-slate-950/60 border border-white/5 rounded-lg px-3 py-1.5 text-[10px] font-mono text-slate-400 select-all focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const linkEl = document.getElementById('shareable-link-input') as HTMLInputElement;
                        if (linkEl) {
                          linkEl.select();
                          navigator.clipboard.writeText(linkEl.value);
                          alert("Link copied to clipboard! Send this link to Enjie.");
                        }
                      }}
                      className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono active:scale-95 transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Schema SQL Instruction */}
              <div className="p-4 bg-slate-900/40 rounded-2xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#BFDBF7]/80 inline-flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-sky-400" /> Database Setup Script
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                      alert("Database schema script copied to clipboard!");
                    }}
                    className="text-[10px] font-mono text-sky-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Copy SQL
                  </button>
                </div>
                <p className="text-[10px] text-[#BFDBF7]/50 leading-normal text-left">
                  Create a new project on **Supabase**, click on **SQL Editor** in the sidebar, paste the script below, and click **Run**:
                </p>
                <pre className="bg-slate-950/80 p-3 rounded-xl text-[9px] font-mono text-[#BFDBF7]/65 max-h-48 overflow-y-auto border border-white/5 text-left whitespace-pre-wrap select-all">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
