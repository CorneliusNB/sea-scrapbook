import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Waves, Loader2 } from 'lucide-react';
import { oceanAudio } from '../utils/audio';

const LOCAL_WHISPERS = [
  "You make my world so much brighter just by being in it. 🌟",
  "I love every little thing about you, today and always. 💖",
  "You are my favorite person to talk to, laugh with, and dream with. 👩‍❤️‍👨",
  "Thank you for loving me and making me feel so incredibly happy. 🥰",
  "My heart is always warmest when I am right next to you. 🏡",
  "Every moment with you is a memory I treasure forever. 🐚",
  "You are the best decision I've ever made. I love you! ❤️"
];

interface OracleProps {
  partner1: string;
  partner2: string;
  anniversaryDate: string;
  memoriesCount: number;
}

export default function CoralOracle({ partner1, partner2, anniversaryDate, memoriesCount }: OracleProps) {
  const [whisper, setWhisper] = useState(LOCAL_WHISPERS[0]);
  const [aiPoem, setAiPoem] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const loadingPhrases = [
    "Writing poem...",
    "Finding words...",
    "Almost ready..."
  ];

  const handleGetWhisper = () => {
    const available = LOCAL_WHISPERS.filter(w => w !== whisper);
    const next = available[Math.floor(Math.random() * available.length)];
    setWhisper(next);
    oceanAudio.triggerBubblePop();
  };

  const handleGenerateAiPoem = async () => {
    setLoading(true);
    setAiPoem(null);
    oceanAudio.triggerStarfishChime();

    let phraseIdx = 0;
    setLoadingPhrase(loadingPhrases[0]);
    const phraseInterval = setInterval(() => {
      phraseIdx = (phraseIdx + 1) % loadingPhrases.length;
      setLoadingPhrase(loadingPhrases[phraseIdx]);
    }, 1500);

    try {
      const response = await fetch('/api/sea-poem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partner1,
          partner2,
          anniversaryDate,
          memoriesCount,
        }),
      });

      const data = await response.json();
      if (data.poem) {
        setAiPoem(data.poem);
      } else {
        throw new Error("Empty scroll received");
      }
    } catch (err) {
      console.warn("Using offline poem fallback:", err);
      const fallbackPoems = [
        `Upon the tides of life we drift, hand in hand, a perfect gift.\nNo wave can wash our bond away, we grow much deeper day by day.\n${partner1} and ${partner2}, two stars of the sea,\nForever together, forever to be.`,
        
        `Soft sand underfoot, warm coastal waves,\nIn the book of our lives, the sweetest of pages.\nSince ${anniversaryDate || 'June 12, 2025'}, when our journey began,\nI will love you, ${partner1}, as long as I can.`,
        
        `The ocean is vast, and the sea breezes blow,\nBut you are the anchor that keeps my heart low.\nThrough storm and through sunshine, our boat sails along,\nWith you, dearest ${partner1}, is where I belong.`,
        
        `The stars in the sky and the glowing night tides,\nAre nothing compared to the light in your eyes.\n${partner1} and ${partner2}, together as one,\nOur beautiful story has only begun.`,
        
        `A seashell we found on the glowing shore,\nWhispers a promise of love evermore.\n${partner2} and ${partner1}, hand in hand on the sand,\nThe happiest couple in all of the land.`,
        
        `As constant as tides that return to the shore,\nMy heart will adore you and love you still more.\nThrough oceans of time and through depths of the blue,\n${partner2} is forever devoted to ${partner1}.`
      ];
      const randomPoem = fallbackPoems[Math.floor(Math.random() * fallbackPoems.length)];
      setAiPoem(randomPoem);
    } finally {
      clearInterval(phraseInterval);
      setLoading(false);
    }
  };

  return (
    <div id="coral-oracle" className="w-full relative">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] md:rounded-[40px] p-8 shadow-2xl relative overflow-hidden text-white">
        
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left Block: Aurelia */}
          <div className="md:col-span-5 flex flex-col items-center text-center relative py-4">
            
            {/* Playground */}
            <div className="w-48 h-48 rounded-full border border-dashed border-sky-400/20 flex items-center justify-center relative bg-white/[0.01] shadow-[inset_0_0_15px_rgba(56,189,248,0.03)] mb-2 group">
              
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-sky-500/5 to-teal-400/5 blur-md animate-pulse pointer-events-none" />

              {/* Aurelia */}
              <motion.div
                key="aurelia-body"
                drag
                dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                dragElastic={0.5}
                dragSnapToOrigin={true}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                animate={isDragging ? undefined : {
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                whileTap={{ scale: 0.95 }}
                whileDrag={{ scale: 1.1, rotate: [0, -8, 8, -4, 4, 0] }}
                onTap={() => {
                  handleGetWhisper();
                }}
                className="relative w-32 h-32 flex flex-col items-center cursor-grab active:cursor-grabbing group z-20 touch-none select-none"
                title="Aurelia"
              >
                {/* Outer soft glow ring */}
                <div className="absolute inset-0 bg-sky-400/20 rounded-full blur-xl group-hover:bg-sky-400/30 transition-all duration-300" />

                {/* Jellyfish Bell/Head */}
                <div className="w-24 h-16 bg-gradient-to-tr from-sky-400 via-blue-300 to-teal-200 rounded-t-full shadow-[0_0_20px_rgba(56,189,248,0.4)] border border-white/20 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute bottom-1 w-full flex justify-between px-4 text-blue-900 text-[10px] font-mono leading-none">
                    <span>●</span> <span>●</span>
                  </div>
                  <Heart className="w-5 h-5 text-sky-500 fill-sky-500/30 absolute top-4 animate-pulse" />
                </div>

                {/* Jellyfish Ruffled Bottom Margin */}
                <div className="w-24 h-2.5 bg-gradient-to-r from-sky-400 via-blue-300 to-teal-300 rounded-full -mt-0.5 border border-white/10" />

                {/* Tentacles */}
                <div className="flex gap-2.5 justify-around w-20">
                  {[
                    { delay: 0.1, length: 'h-10' },
                    { delay: 0.4, length: 'h-14' },
                    { delay: 0.2, length: 'h-12' },
                    { delay: 0.5, length: 'h-16' },
                    { delay: 0.3, length: 'h-11' }
                  ].map((tentacle, idx) => (
                    <motion.div
                      key={idx}
                      animate={{
                        scaleY: isDragging ? [1, 1.7, 0.6, 1] : [1, 1.25, 0.85, 1],
                        rotate: isDragging 
                          ? [0, idx % 2 === 0 ? 35 : -35, idx % 2 === 0 ? -15 : 15, 0]
                          : [0, idx % 2 === 0 ? 5 : -5, 0],
                      }}
                      transition={{
                        duration: isDragging ? 0.8 : 2.5,
                        repeat: Infinity,
                        delay: isDragging ? tentacle.delay * 0.25 : tentacle.delay,
                        ease: 'easeInOut',
                      }}
                      className={`w-1.5 origin-top rounded-b-full bg-gradient-to-b from-sky-400/80 via-blue-300/40 to-transparent ${tentacle.length}`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            <span className="text-[10px] uppercase font-mono tracking-widest text-sky-300 mt-2 block font-semibold">
              Aurelia
            </span>
            <p className="text-[11px] text-sky-300/60 font-mono italic">Drag or tap me</p>
          </div>

          {/* Right Block: Whispers & AI generator */}
          <div className="md:col-span-7 space-y-4">
            
            {/* 1. Compliment Card */}
            <div 
              className="bg-[#FAF5EF] border border-[#e8dfd2] rounded-2xl p-5 relative overflow-hidden min-h-[90px] flex flex-col justify-between shadow-lg text-slate-800"
              style={{ transform: "rotate(0.5deg)" }}
            >
              <div className="absolute top-1 left-2 text-[#a47343]/30 text-2xl font-serif font-bold">“</div>
              <p className="font-handwritten text-2xl text-slate-700 text-center leading-snug py-2 px-3">
                {whisper}
              </p>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#e8dfd2] font-mono text-[9px] text-[#a47343] font-bold">
                <span>A thought</span>
                <button
                  id="seek-whisper-button"
                  onClick={handleGetWhisper}
                  className="hover:underline font-bold text-sky-500 cursor-pointer"
                >
                  Next &rarr;
                </button>
              </div>
            </div>

            {/* 2. Write Sea Poem Container */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  id="generate-poem-button"
                  onClick={handleGenerateAiPoem}
                  disabled={loading}
                  className="flex-1 bg-sky-400 text-white hover:bg-white hover:text-sky-500 py-2.5 px-4 rounded-xl text-xs font-bold font-mono transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {loadingPhrase}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Write a poem
                    </>
                  )}
                </button>

                {aiPoem && (
                  <button
                    id="clear-poem-button"
                    onClick={() => {
                      setAiPoem(null);
                      oceanAudio.triggerBubblePop();
                    }}
                    className="border border-white/10 hover:bg-white/5 font-mono text-xs text-[#BFDBF7]/80 py-2.5 px-4 rounded-xl transition-all cursor-pointer animate-fade-in"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Generated Poem Display (Parchment scroll style) */}
              <AnimatePresence>
                {aiPoem && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-[#FAF5EF] border border-[#d4a373]/30 rounded-2xl p-6 overflow-hidden shadow-xl text-center relative text-slate-800"
                    style={{ transform: "rotate(-0.5deg)" }}
                  >
                    <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#d4a373]/30" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-[#d4a373]/30" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#d4a373]/30" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#d4a373]/30" />

                    <h5 className="text-[10px] uppercase font-mono tracking-widest text-[#a47343] font-bold mb-3 flex items-center justify-center gap-1">
                      <Waves className="w-3.5 h-3.5 text-[#a47343] animate-bounce" /> Love Poem <Waves className="w-3.5 h-3.5 text-[#a47343] animate-bounce" />
                    </h5>

                    <p className="font-handwritten text-3xl leading-relaxed text-slate-700 italic text-center py-2 antialiased whitespace-pre-line">
                      {aiPoem}
                    </p>

                    <div className="text-[9px] text-[#a47343] font-mono mt-3">
                      For {partner1} & {partner2}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
