import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Music, Play, Pause, Volume2, Sparkles, Radio } from 'lucide-react';

// =========================================================================
// DEVELOPER CONFIGURATION: CHANGE MUSIC & SYNCHRONIZED LYRICS HERE
// Only you can change this song by editing this direct file template definition!
// =========================================================================
const ACTIVE_TRACK = {
  title: "Somethin' Stupid",
  artist: "Frank Sinatra",
  url: "song.flac",
  lyrics: [
    { time: 0, text: "🎵 Our Ocean Symphony begins..." },
    { time: 9, text: "⛵ Sailing together into the deep blue..." },
    { time: 18, text: "💖 Enjie & Cornel • Side by side, tide after tide..." },
    { time: 27, text: "🌊 Since our beautiful Danniversary on 12 June 2025" },
    { time: 38, text: "⭐ The waves crash, but our hearts remain calm and safe" },
    { time: 51, text: "🐠 Deep in the bioluminescent cove of our memories..." },
    { time: 64, text: "🐚 Every seashell we gather has a poem written inside" },
    { time: 76, text: "✨ Underneath a blanket of shooting stars and sea spray" },
    { time: 89, text: "🎡 Hand-in-hand, walking along the glowing shoreline" },
    { time: 102, text: "🌅 Cornel, you are the lighthouse pointing home" },
    { time: 115, text: "💖 Enjie, your laughter is the sweet melody of the tides" },
    { time: 130, text: "🌊 No ocean is too vast when I am sailing with you..." },
    { time: 145, text: "🎹 The soft strings of the deep ocean echo our promises" },
    { time: 160, text: "🔮 Our journey is eternal • anniversary and beyond..." },
    { time: 178, text: "⚓ Locked together forever in this harbor of love" },
    { time: 195, text: "🐚 Enjie + Cornel • 12 June 2025 • Ocean Symphony" }
  ]
};

interface LyricLine {
  time: number;
  text: string;
}

// Robust custom parser for standard .lrc files
function parseLRC(lrcText: string): LyricLine[] {
  const lines = lrcText.split(/\r?\n/);
  const result: LyricLine[] = [];
  
  // Regex to extract times of the form [mm:ss.xx] or [mm:ss] or [mm:ss:xx]
  const timeRegex = /\[(\d+):(\d+)(?:\.(\d+))?\]/g;
  
  for (const line of lines) {
    timeRegex.lastIndex = 0;
    const timestamps: number[] = [];
    let match;
    
    while ((match = timeRegex.exec(line)) !== null) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const hundredths = match[3] ? parseInt(match[3], 10) : 0;
      const totalSeconds = mins * 60 + secs + hundredths / 100;
      timestamps.push(totalSeconds);
    }
    
    // Strip timestamps to get clean lyric text for display
    const cleanText = line.replace(/\[\d+:\d+(?:\.\d+)?\]/g, '').trim();
    
    // Support lines that contain empty lyric text as pause gaps
    for (const time of timestamps) {
      result.push({ time, text: cleanText });
    }
  }
  
  return result.sort((a, b) => a.time - b.time);
}

export default function SeashellSoundscapes() {
  const [lyrics, setLyrics] = useState<LyricLine[]>(ACTIVE_TRACK.lyrics);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const [volume, setVolume] = useState(0.5);
  const [trackMetadata, setTrackMetadata] = useState({
    title: ACTIVE_TRACK.title,
    artist: ACTIVE_TRACK.artist,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const lyricElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Use high-fidelity React ref to completely bypass stale state closure bugs in event listeners
  const lyricsRef = useRef<LyricLine[]>(ACTIVE_TRACK.lyrics);

  useEffect(() => {
    lyricsRef.current = lyrics;
  }, [lyrics]);

  // Load standard .lrc file and song metadata on mount
  useEffect(() => {
    fetch('/api/song-metadata')
      .then(res => res.json())
      .then(data => {
        if (data && data.title) {
          setTrackMetadata({
            title: data.title,
            artist: data.artist
          });
        }
      })
      .catch(err => {
        console.warn("Could not retrieve dynamic song metadata:", err);
      });

    fetch('lyrics.lrc')
      .then(res => {
        if (!res.ok) throw new Error("File not found");
        return res.text();
      })
      .then(text => {
        const parsed = parseLRC(text);
        if (parsed && parsed.length > 0) {
          setLyrics(parsed);
          console.log("Successfully loaded and parsed .lrc lyrics file!");
        }
      })
      .catch(err => {
        console.warn("Using embedded lyrics fallback. To customize, edit public/lyrics.lrc:", err);
      });
  }, []);

  // Initialize audio listeners and clean up
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);

      // Find current active lyric line dynamically
      const time = audio.currentTime;
      const currentList = lyricsRef.current;
      let currentIndex = -1;
      
      for (let i = 0; i < currentList.length; i++) {
        if (time >= currentList[i].time) {
          currentIndex = i;
        } else {
          break;
        }
      }
      setActiveLyricIndex(currentIndex);
    };

    const onDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setActiveLyricIndex(-1);
    };

    // If metadata is already loaded before event listeners bind
    if (audio.readyState >= 1) {
      setDuration(audio.duration || 0);
    }

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    // Apply init volume
    audio.volume = volume;

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // Handle auto-scrolling the lyrics container to keep the active lyric in view
  useEffect(() => {
    if (activeLyricIndex >= 0 && lyricElementsRef.current[activeLyricIndex]) {
      const activeElement = lyricElementsRef.current[activeLyricIndex];
      const container = lyricsContainerRef.current;
      if (activeElement && container) {
        // Calculate offset to center the active lyric element inside the viewport
        const containerHeight = container.clientHeight;
        const elemTop = crumbsOffsetTop(activeElement, container);
        const elemHeight = activeElement.clientHeight;
        
        container.scrollTo({
          top: elemTop - containerHeight / 2 + elemHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeLyricIndex]);

  // Helper function to find offset top of element relative to a specific parent
  const crumbsOffsetTop = (elem: HTMLElement, parent: HTMLElement): number => {
    let top = 0;
    let curr: HTMLElement | null = elem;
    while (curr && curr !== parent) {
      top += curr.offsetTop;
      curr = curr.offsetParent as HTMLElement | null;
    }
    return top;
  };

  const handlePlayToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Audio play interrupted or blocked by browser:", err);
      });
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Convert seconds to MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div id="seashell-soundscapes" className="w-full relative">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        
        {/* Ambient ocean sphere glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-sea-cyan/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Invisible Audio Element */}
        <audio
          ref={audioRef}
          src={ACTIVE_TRACK.url}
          preload="auto"
        />

        {/* Decorative Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/10 p-2.5 rounded-xl text-sea-cyan border border-white/10">
              <Music className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold tracking-wide font-serif text-lg">Our Symphony</h3>
              <p className="text-xs text-[#BFDBF7]/60 font-mono">Enjie & Cornel's Custom Anthem</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1 bg-white/5 border border-white/5 py-1 px-3 rounded-full text-[10px] text-amber-300 font-mono">
            <Sparkles className="w-3 h-3 text-amber-300" /> Dynamic Lyrics Active
          </div>
        </div>

        {/* MP3 Player Desk */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          <div className="lg:col-span-5 flex flex-col items-center">
            
            {/* Vintage Turntable Player */}
            <div className="relative mb-6 w-full flex items-center justify-center p-3 bg-white/5 border border-white/5 rounded-2xl shadow-inner">
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Glow behind vinyl */}
                <div className="absolute inset-4 bg-sky-500/10 rounded-full blur-xl animate-pulse pointer-events-none" />
                
                <motion.div
                  animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                  transition={isPlaying ? { repeat: Infinity, duration: 18, ease: "linear" } : { duration: 0.5 }}
                  className="w-40 h-40 rounded-full bg-[#111] border-4 border-[#222] flex items-center justify-center relative shadow-2xl overflow-hidden cursor-pointer"
                  onClick={handlePlayToggle}
                >
                  {/* Vinyl Grooves */}
                  <div className="absolute inset-2 border border-white/5 rounded-full" />
                  <div className="absolute inset-4 border border-white/10 rounded-full" />
                  <div className="absolute inset-8 border border-white/20 rounded-full" />
                  <div className="absolute inset-12 border-2 border-slate-800 rounded-full" />

                  {/* Disc Center Sticker */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-400 to-[#FAF5EF] flex flex-col items-center justify-center p-1 relative shadow-inner text-center">
                    <HeartIcon className="w-5 h-5 text-slate-800 animate-pulse fill-slate-800/30" />
                    <span className="text-[9px] font-mono font-bold text-slate-800 truncate w-full mt-0.5">E & C</span>
                  </div>

                  {/* Ambient music status nodes */}
                  {isPlaying && (
                    <div className="absolute bottom-2 right-2 flex gap-1 z-20">
                      <span className="w-1 h-3 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <span className="w-1 h-5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="w-1 h-2 bg-sky-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  )}
                </motion.div>

                {/* Turntable Tonearm Base */}
                <div className="absolute top-3 right-3 w-5 h-5 bg-[#d4a373] rounded-full border-2 border-[#a47343] shadow-md z-20" />
                
                {/* Turntable Tonearm Arm */}
                <motion.div
                  initial={{ rotate: -22 }}
                  animate={{ rotate: isPlaying ? 12 : -22 }}
                  transition={{ type: "spring", stiffness: 60, damping: 15 }}
                  style={{ transformOrigin: "top right" }}
                  className="absolute top-5 right-5 w-1.5 h-20 bg-gradient-to-b from-[#d4a373] via-slate-300 to-slate-400 rounded-full z-15 shadow-lg flex flex-col items-center"
                >
                  {/* Tonearm head (cartridge stylus) */}
                  <div className="w-3 h-5 bg-slate-800 rounded-xs mt-auto -mb-2 border border-slate-600 shadow-xs" />
                </motion.div>
              </div>
            </div>

            {/* Song Details */}
            <div className="text-center w-full px-2">
              <h4 className="text-md font-bold text-[#FAF5EF] tracking-wide truncate font-serif">
                {trackMetadata.title}
              </h4>
              <p className="text-[10px] text-sky-300 font-mono tracking-widest uppercase mt-0.5 mb-4">
                {trackMetadata.artist}
              </p>
            </div>

            {/* Play/Pause Main Control button */}
            <div className="flex items-center justify-center mb-4">
              <button
                id="mp3-play-toggle"
                onClick={handlePlayToggle}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform active:scale-90 cursor-pointer ${
                  isPlaying
                    ? 'bg-rose-500/10 text-rose-300 border-2 border-rose-500/40 hover:bg-rose-500/20'
                    : 'bg-sky-400 text-white hover:bg-white hover:text-sky-500'
                }`}
                title={isPlaying ? "Pause Anthem" : "Play Anthem"}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-rose-300" />
                ) : (
                  <Play className="w-6 h-6 fill-white ml-1" />
                )}
              </button>
            </div>

            {/* Timelines and volume bars */}
            <div className="w-full space-y-3 px-2">
              
              {/* Media Timeline Slider */}
              <div className="space-y-1">
                <input
                  id="mp3-timeline-slider"
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleProgressChange}
                  className="w-full accent-sky-400 cursor-pointer h-1.5 bg-white/10 rounded-lg outline-none"
                />
                <div className="flex justify-between text-[10px] text-[#BFDBF7]/60 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Volume Slider Section */}
              <div className="flex items-center gap-2 pt-1 text-[#BFDBF7]/80">
                <Volume2 className="w-4 h-4 text-sky-400 shrink-0" />
                <input
                  id="mp3-volume-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-sky-400 cursor-pointer h-1 bg-white/15 rounded-lg outline-none"
                />
                <span className="text-[10px] font-mono shrink-0 w-8 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>

            </div>

          </div>

          {/* Right Column: High Fidelity Scrolling Synchronized Lyrics Display */}
          <div className="lg:col-span-7 flex flex-col h-full self-stretch justify-between bg-white/5 border border-white/5 rounded-2xl p-4.5 min-h-[280px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3.5">
              <span className="text-xs uppercase tracking-wider text-sky-300 font-mono font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-sky-300 animate-pulse" /> Synchronized Lyrics
              </span>
              <span className="text-[10px] font-mono text-[#BFDBF7]/50">
                Scrolling Auto-Sync
              </span>
            </div>

            {/* Scrollable Transcript Box */}
            <div
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto max-h-[230px] pr-1 space-y-4 select-none scrollbar-thin text-center py-10 rounded-xl relative"
              style={{ scrollSnapType: 'y proximity' }}
            >
              {/* Fades around top & bottom of scrolling region */}
              <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-[#1c2c3d]/10 via-transparent to-transparent pointer-events-none z-10" />

              {lyrics.map((line, idx) => {
                const isActive = idx === activeLyricIndex;
                const isPast = idx < activeLyricIndex;

                return (
                  <div
                    key={idx}
                    ref={(el) => {
                      lyricElementsRef.current[idx] = el;
                    }}
                    onClick={() => {
                      // Allow skipping to lyric line timestamp by tapping it
                      if (audioRef.current) {
                        audioRef.current.currentTime = line.time;
                        setCurrentTime(line.time);
                      }
                    }}
                    className={`py-1.5 px-3 rounded-xl transition-all duration-300 cursor-pointer origin-center scroll-snap-align-center ${
                      isActive
                        ? 'text-sky-300 font-handwritten text-3xl font-semibold tracking-wide scale-105 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)] bg-white/5'
                        : isPast
                        ? 'text-[#BFDBF7]/40 text-xs hover:text-white/60'
                        : 'text-[#BFDBF7]/25 text-xs hover:text-white/40'
                    }`}
                  >
                    {line.text}
                  </div>
                );
              })}
            </div>

            {/* Bottom Disclaimer */}
            <div className="border-t border-white/5 pt-3 mt-3 flex justify-between items-center text-[9px] uppercase tracking-wider font-mono text-[#BFDBF7]/40">
              <span>🔒 Track locked by captain</span>
              <span>Change via project file</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

// Minimalist Heart Icon
function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      stroke="none"
      {...props}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}
