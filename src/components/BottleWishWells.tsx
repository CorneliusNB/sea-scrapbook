import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Eye, X, Anchor, Heart, Waves, MessageCircle } from 'lucide-react';
import { FloatingBubble, LoveLetter } from '../types';
import { oceanAudio } from '../utils/audio';

const PRELOADED_QUOTES = [
  "I love you more than all the waves in the sea. 🌊",
  "You are the warmest, kindest part of my everyday life. 💖",
  "Every single sunset is more beautiful because I'm watching it with you. 🌅",
  "You make my heart feel completely safe and at home. 🏡",
  "Holding your hand is my favorite place in the world. 🤝",
  "Thank you for being my anchor when things get rough, and my sunshine every day. ⚓",
  "I am so incredibly lucky to walk through life side-by-side with you. 👩‍❤️‍👨",
  "My love for you grows deeper with every tide and every laughter we share. 🌊",
  "With you, even the simplest rainy day feels like a beautiful adventure. 🌧️✨",
  "You are my best friend, my greatest adventure, and my true love. 🐚❤️"
];

interface BottleWishProps {
  customLetters: LoveLetter[];
  onAddLetter: (letter: Omit<LoveLetter, 'id' | 'timestamp'>) => void;
  onDeleteLetter: (id: string) => void;
  partnerNames: { partner1: string; partner2: string };
}

export default function BottleWishWells({
  customLetters,
  onAddLetter,
  onDeleteLetter,
  partnerNames
}: BottleWishProps) {
  const [bubbles, setBubbles] = useState<FloatingBubble[]>([]);
  const [bottleInput, setBottleInput] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<LoveLetter | null>(null);
  const [recentPopMessage, setRecentPopMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [senderName, setSenderName] = useState(partnerNames.partner1);

  // Sync sender name when config changes
  useEffect(() => {
    setSenderName(partnerNames.partner1);
  }, [partnerNames]);

  // Spawn bubbles periodically
  useEffect(() => {
    const spawnBubble = () => {
      if (bubbles.length >= 15) return; // limit active bubbles
      
      const newBubble: FloatingBubble = {
        id: Math.random().toString(),
        x: Math.random() * 90 + 5, // 5% to 95% width
        size: Math.random() * 50 + 25, // 25px to 75px
        speed: Math.random() * 1.5 + 0.8,
        content: PRELOADED_QUOTES[Math.floor(Math.random() * PRELOADED_QUOTES.length)],
        opacity: Math.random() * 0.4 + 0.5,
      };

      setBubbles(prev => [...prev, newBubble]);
    };

    // Initial batch
    for (let i = 0; i < 5; i++) {
      setTimeout(spawnBubble, i * 400);
    }

    const interval = setInterval(spawnBubble, 2800);
    return () => clearInterval(interval);
  }, [bubbles.length]);

  // Animate bubbles drifting upwards
  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles(prev =>
        prev
          .map(b => ({ ...b, size: b.size })) // update states trigger render
          .filter(b => b.opacity > 0) // filters if we want decay
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handlePopBubble = (bubble: FloatingBubble) => {
    // Web audio feedback pop loop
    oceanAudio.triggerBubblePop();

    // Set romantic message overlay
    setRecentPopMessage(bubble.content);
    
    // Remove bubble
    setBubbles(prev => prev.filter(b => b.id !== bubble.id));

    // Reset message bubble after 5.5s
    setTimeout(() => {
      setRecentPopMessage(prev => prev === bubble.content ? null : prev);
    }, 5500);
  };

  const handleCastBottle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bottleInput.trim()) return;

    onAddLetter({
      sender: senderName,
      content: bottleInput.trim(),
      hasCodedSeal: false,
      isFavorite: false,
    });

    setBottleInput('');
    
    // Play sound feedback
    oceanAudio.triggerStarfishChime();

    // Spawn a rapid beautiful splash bubble!
    const splashBubble: FloatingBubble = {
      id: Math.random().toString(),
      x: 50,
      size: 80,
      speed: 3,
      content: `💖 Splash! message sent: "${bottleInput.trim().substring(0, 30)}..."`,
      opacity: 0.9,
    };
    setBubbles(prev => [...prev, splashBubble]);
  };

  return (
    <div id="bottle-wish-wells" className="w-full grid grid-cols-1 md:grid-cols-12 gap-6">
      
      {/* 1. Drift Zone Canvas Simulator */}
      <div className="md:col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] md:rounded-[40px] p-6 min-h-[420px] relative overflow-hidden flex flex-col justify-between shadow-2xl">
        
        {/* Animated Water layers for background aesthetics */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-sky-500/20 via-blue-500/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-sky-500/10 to-transparent z-0 pointer-events-none animate-pulse-slowDecay" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Anchor className="w-5 h-5 text-sky-400 animate-spin-slow" />
            <h4 className="font-bold text-white text-md tracking-wide font-serif">Love Notes</h4>
          </div>
        </div>

        {/* Live floating area */}
        <div ref={containerRef} className="w-full flex-1 relative min-h-[220px] overflow-hidden">
          
          <AnimatePresence>
            {/* Pop Quote HUD */}
            {recentPopMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-lg border border-sky-400/30 text-white rounded-2xl p-4 max-w-[85%] text-center z-40 shadow-2xl shadow-sky-500/10 inline-flex flex-col items-center gap-1.5"
              >
                <div className="bg-sky-500/10 p-1.5 rounded-full text-sky-300 border border-sky-400/30">
                  <Heart className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
                </div>
                <p className="text-xs leading-relaxed font-mono tracking-wide">{recentPopMessage}</p>
                <div className="text-[9px] uppercase tracking-wider text-sky-300 font-bold mt-1">Bubble Whisper</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bubbles Generator */}
          {bubbles.map((bubble) => (
            <motion.button
              key={bubble.id}
              id={`bubble-${bubble.id}`}
              onClick={() => handlePopBubble(bubble)}
              initial={{ y: 380, opacity: 0 }}
              animate={{
                y: -100,
                opacity: bubble.opacity,
              }}
              transition={{
                duration: 14 / bubble.speed,
                ease: 'linear',
              }}
              className="absolute rounded-full flex items-center justify-center cursor-pointer select-none border border-white/20 bg-gradient-to-tr from-sky-400/10 to-blue-200/20 shadow-[0_0_12px_rgba(56,189,248,0.15)] focus:outline-none hover:scale-110 active:scale-95 text-xs text-sky-100 font-bold group"
              style={{
                left: `${bubble.x}%`,
                width: bubble.size,
                height: bubble.size,
              }}
            >
              {/* Inner bubble shine ring */}
              <div className="absolute top-[10%] left-[10%] w-2 h-2 bg-white/40 rounded-full" />
              <div className="absolute inset-2 rounded-full border border-sky-300/10 bg-sky-400/5 group-hover:bg-sky-400/20 transition-all pointer-events-none" />
              
              {/* Tiny bubble heart decorative center */}
              <Heart className="w-2.5 h-2.5 text-sky-300/30 fill-sky-300/10 pointer-events-none group-hover:text-sky-300 group-hover:fill-sky-300/40 transition-colors" />
            </motion.button>
          ))}

          {/* Drifting Custom Bottles */}
          {customLetters.map((letter, index) => {
            const driftDuration = 18 + (index % 4) * 4;
            const bottomPos = 15 + (index % 5) * 15;

            return (
              <motion.button
                key={letter.id}
                id={`bottle-letter-${letter.id}`}
                onClick={() => {
                  oceanAudio.triggerStarfishChime();
                  setSelectedLetter(letter);
                }}
                initial={{ x: -80 }}
                animate={{ x: '110%' }}
                transition={{
                  repeat: Infinity,
                  duration: driftDuration,
                  ease: 'linear',
                }}
                style={{
                  top: `${bottomPos}%`,
                }}
                className="absolute cursor-pointer flex flex-col items-center justify-center p-2 rounded-2xl border border-sky-400/20 bg-gradient-to-b from-[#0e2238]/60 to-[#122e4e]/50 backdrop-blur-sm shadow-[0_4px_12px_rgba(56,189,248,0.15)] group hover:scale-110 active:scale-90 transition-transform"
              >
                {/* Cute corked bottle representation */}
                <div className="w-9 h-11 relative flex items-center justify-center">
                  <div className="absolute top-0 w-2.5 h-1.5 bg-[#d4a373] rounded-t-md border border-amber-950/20" /> {/* Cork */}
                  <div className="absolute top-1.5 w-1.5 h-2 bg-sky-300/30 border-x border-sky-200/50" /> {/* neck */}
                  <div className="w-7 h-9 rounded-xl border border-sky-300/30 bg-sky-500/10 group-hover:bg-sky-500/20 transition-colors flex items-center justify-center">
                    <Heart className="w-3 h-3 text-sky-300 fill-sky-300/50 group-hover:fill-sky-300 animate-pulse" />
                  </div>
                </div>
                <span className="text-[9px] uppercase tracking-wider font-semibold text-sky-200/80 font-mono mt-1 px-1 bg-black/10 rounded-md">
                  {letter.sender}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="relative pt-4 border-t border-white/5 z-10 flex justify-between items-center bg-white/5 rounded-b-xl px-4 py-2">
          <div className="flex items-center gap-1">
            <Waves className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[10px] font-mono text-sky-300/70">{customLetters.length} Messages</span>
          </div>
        </div>
      </div>
  
      {/* 2. Write and Lodge Letters Dashboard */}
      <div className="md:col-span-5 flex flex-col justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] md:rounded-[40px] p-6 shadow-2xl">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-2.5 rounded-xl text-sky-400 border border-white/10 shadow-sm">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm font-serif">Write a Message</h4>
              <p className="text-[11px] text-[#BFDBF7]/60 font-mono">Send a message to the board</p>
            </div>
          </div>
  
          <form onSubmit={handleCastBottle} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-sky-300/70 mb-1 font-mono">Messenger Name</label>
              <div className="flex gap-2">
                {[partnerNames.partner1, partnerNames.partner2].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSenderName(name)}
                    className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-semibold font-mono transition-all duration-200 cursor-pointer ${
                      senderName === name
                        ? 'border-sky-400/40 bg-sky-400/15 text-sky-300 shadow-sm'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:text-white'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
  
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-sky-300/70 mb-1 font-mono">Message</label>
              <textarea
                id="ocean-vow-textarea"
                rows={3}
                value={bottleInput}
                onChange={(e) => setBottleInput(e.target.value)}
                maxLength={200}
                placeholder="Write a message..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent resize-none leading-relaxed"
              />
              <div className="flex justify-between items-center text-[9px] text-[#BFDBF7]/40 font-mono px-0.5">
                <span>Max 200 characters</span>
                <span>{bottleInput.length}/200</span>
              </div>
            </div>
  
            <button
              id="submit-vow-button"
              type="submit"
              className="w-full bg-sky-400 text-white py-2.5 px-4 rounded-xl text-xs font-bold font-mono active:scale-95 transition-all flex items-center justify-center gap-1.5 hover:bg-white hover:text-sky-500 shadow-lg cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Send Message
            </button>
          </form>
        </div>

        {/* 3. Small Archive List */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <h5 className="text-xs uppercase tracking-widest font-mono text-[#BFDBF7]/60 mb-2">Message Logs</h5>
          <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1 text-xs">
            {customLetters.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic py-2 text-center font-mono">No messages yet...</p>
            ) : (
              customLetters.map((item) => (
                <div key={item.id} className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex items-center justify-between hover:bg-white/10 transition-colors">
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-sky-300 font-mono block mb-0.5">From {item.sender}</span>
                    <p className="text-[11px] text-[#BFDBF7] truncate leading-tight font-light italic">"{item.content}"</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      id={`view-letter-${item.id}`}
                      onClick={() => {
                        oceanAudio.triggerStarfishChime();
                        setSelectedLetter(item);
                      }}
                      className="text-sky-300 bg-white/5 border border-white/15 p-1.5 rounded-md hover:bg-white/10 transition-all text-[10px] cursor-pointer"
                      title="Open Letter"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`delete-letter-${item.id}`}
                      onClick={() => onDeleteLetter(item.id)}
                      className="text-rose-400 bg-rose-500/10 border border-rose-500/10 p-1.5 rounded-md hover:bg-rose-500/20 transition-all text-[10px] cursor-pointer"
                      title="Delete Message"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Love Letter Modal Reader Overlay */}
      <AnimatePresence>
        {selectedLetter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Modal Glass Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLetter(null)}
              className="absolute inset-0 bg-sea-dark/85 backdrop-blur-md"
            />

            {/* Letter Parchment Container */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-md bg-[#FAF5EF] border border-[#d4a373]/30 rounded-2xl p-6 md:p-8 shadow-2xl z-25 text-slate-800 overflow-hidden text-center"
              style={{ transform: `rotate(0.5deg)` }}
            >
              {/* Parchment aesthetic top ribbon */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-sky-400 via-blue-300 to-sky-400" />
              
              <div className="flex justify-center mb-4">
                <div className="bg-sky-100 p-3 rounded-full text-sky-500 border border-sky-200 shadow-inner">
                  <Heart className="w-6 h-6 fill-sky-400 text-sky-500" />
                </div>
              </div>

              <span className="text-[10px] uppercase font-mono tracking-widest text-[#a47343] font-bold block mb-1">
                MESSAGE FROM THE SEA
              </span>
              <h4 className="text-xs text-slate-500 font-mono mb-4">
                From {selectedLetter.sender} on {selectedLetter.timestamp}
              </h4>

              <div className="bg-[#FFFDFB] border border-[#e8dfd2] rounded-xl p-6 mb-6 select-text min-h-[140px] flex items-center justify-center relative shadow-sm">
                {/* Vintage decorative corners */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#d4a373]/30" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#d4a373]/30" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#d4a373]/30" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#d4a373]/30" />
                
                <p className="font-handwritten text-3xl leading-relaxed text-slate-700 text-center select-text">
                  "{selectedLetter.content}"
                </p>
              </div>

              <button
                id="close-letter-modal"
                onClick={() => setSelectedLetter(null)}
                className="w-full bg-[#8C6239] hover:bg-[#6f4b27] text-[#FCFBF9] font-mono py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Close Letter
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
