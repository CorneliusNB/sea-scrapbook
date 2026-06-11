import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SeaCreature {
  id: string;
  y: number; // percentage from top
  scale: number;
  duration: number;
  delay: number; // negative delay in seconds
  bobbingDuration: number;
  wiggleSpeed: number;
  type: 'sleek' | 'angelfish' | 'manta' | 'jellyfish' | 'turtle' | 'whale' | 'school';
  swimDirection: 'left-to-right' | 'right-to-left';
  opacity: number;
  blur: number;
  color: string;
}

interface Particle {
  id: string;
  x: number; // percent left
  y: number; // start Y percent
  size: number;
  duration: number;
  delay: number;
}

// 1. Sleek Watercolor Fish (Faces Left by default)
const SleekFish = ({ className, style, wiggleSpeed }: { className?: string; style?: React.CSSProperties; wiggleSpeed: number }) => (
  <svg viewBox="0 0 24 16" fill="currentColor" className={className} style={style}>
    {/* Body */}
    <path d="M 2 8 C 4 4, 10 3, 15 8 C 10 13, 4 12, 2 8 Z" />
    <circle cx="5" cy="7.5" r="0.8" fill="rgba(10, 25, 40, 0.4)" />
    
    {/* Flowing Tail */}
    <motion.g
      animate={{
        rotateY: [0, 15, 0, -15, 0],
        rotateZ: [0, 4, 0, -4, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: wiggleSpeed,
        ease: "easeInOut",
      }}
      style={{ transformOrigin: "62.5% 50%" }}
    >
      <path d="M 15 8 C 17 5, 20 4, 23 3 C 21 6, 21 10, 23 13 C 20 12, 17 11, 15 8 Z" opacity="0.8" />
      <path d="M 15 8 C 16 6.5, 18 6, 20 5 C 19 6.5, 19 9.5, 20 11 C 18 10, 16 9.5, 15 8 Z" opacity="0.4" />
    </motion.g>
  </svg>
);

// 2. Wavy Angelfish (Faces Left by default)
const Angelfish = ({ className, wiggleSpeed }: { className?: string; wiggleSpeed: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    {/* Body */}
    <path d="M 2 12 C 4 7, 10 5, 14 12 C 10 19, 4 17, 2 12 Z" />
    <circle cx="5" cy="11" r="0.8" fill="rgba(10, 25, 40, 0.4)" />
    
    {/* Long Fins */}
    <path d="M 8 9 C 9 5, 11 3, 11 1 C 11 3, 10 5, 8 9 Z" opacity="0.7" />
    <path d="M 8 15 C 9 19, 11 21, 11 23 C 11 21, 10 19, 8 15 Z" opacity="0.7" />

    {/* Tail fin wiggling */}
    <motion.g
      animate={{
        rotateY: [0, 18, 0, -18, 0],
        rotateZ: [0, 3, 0, -3, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: wiggleSpeed + 0.1,
        ease: "easeInOut",
      }}
      style={{ transformOrigin: "58.3% 50%" }}
    >
      <path d="M 14 12 C 16 9, 19 7, 22 5 C 20 9, 20 15, 22 19 C 19 17, 16 15, 14 12 Z" opacity="0.8" />
      <path d="M 14 12 C 15 11, 17 10, 19 9 C 18 11, 18 13, 19 15 C 17 14, 15 13, 14 12 Z" opacity="0.4" />
    </motion.g>
  </svg>
);

// 3. Side-view Manta Ray (Faces Left by default)
const MantaRay = ({ className, wiggleSpeed }: { className?: string; wiggleSpeed: number }) => (
  <svg viewBox="0 0 32 24" fill="currentColor" className={className}>
    {/* Body & Wings */}
    <motion.path
      d="M 2 12 C 4 10, 14 6, 16 6 C 18 6, 28 10, 30 12 C 28 13.5, 18 15, 16 15.5 C 14 15, 4 13.5, 2 12 Z"
      animate={{
        scaleY: [1, 0.78, 1, 1.15, 1], // flapping wings up/down
        skewY: [0, -3, 0, 3, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: wiggleSpeed * 2.2,
        ease: "easeInOut",
      }}
      style={{ transformOrigin: "50% 50%" }}
    />
    {/* Long Tail */}
    <path d="M 16 15.5 C 16 18, 15.5 21, 15.5 23 C 15.5 21, 16 18, 16 15.5 Z" opacity="0.6" />
    {/* Cephalic Horns */}
    <path d="M 13.5 6 C 12.5 5, 12.5 4, 13.5 3" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.8" />
    <path d="M 18.5 6 C 19.5 5, 19.5 4, 18.5 3" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.8" />
  </svg>
);

// 4. Jellyfish (Drifts vertically)
const Jellyfish = ({ className, wiggleSpeed }: { className?: string; wiggleSpeed: number }) => (
  <svg viewBox="0 0 20 26" fill="currentColor" className={className}>
    {/* Bell */}
    <path d="M 2 10 C 2 3, 18 3, 18 10 C 18 12, 2 12, 2 10 Z" />
    {/* Tentacles waving */}
    <motion.g
      animate={{
        skewX: [-6, 6, -6],
        scaleY: [0.95, 1.05, 0.95],
      }}
      transition={{
        repeat: Infinity,
        duration: wiggleSpeed * 1.4,
        ease: "easeInOut",
      }}
      style={{ transformOrigin: "10px 10px" }}
    >
      <path d="M 5 11 C 4 15, 6 20, 5 25" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.7" />
      <path d="M 10 11 C 11 16, 9 21, 10 25" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.9" />
      <path d="M 15 11 C 14 15, 16 20, 15 25" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.7" />
    </motion.g>
  </svg>
);

// 5. Sea Turtle (Faces Left by default)
const SeaTurtle = ({ className, wiggleSpeed }: { className?: string; wiggleSpeed: number }) => (
  <svg viewBox="0 0 28 16" fill="currentColor" className={className}>
    {/* Shell */}
    <path d="M 6 8 C 8 3, 18 3, 20 8 C 18 13, 8 13, 6 8 Z" />
    {/* Head */}
    <path d="M 4 8 C 3 7, 1 7, 1 8 C 1 9, 3 9, 4 8 Z" />
    {/* Flippers */}
    <motion.g
      animate={{
        rotate: [-18, 18, -18],
      }}
      transition={{
        repeat: Infinity,
        duration: wiggleSpeed * 1.8,
        ease: "easeInOut",
      }}
      style={{ transformOrigin: "10px 6px" }}
    >
      <path d="M 9 6 C 7 3, 4 1, 3 3 C 3 5, 6 8, 9 6 Z" />
    </motion.g>
    <motion.g
      animate={{
        rotate: [12, -12, 12],
      }}
      transition={{
        repeat: Infinity,
        duration: wiggleSpeed * 1.8,
        ease: "easeInOut",
      }}
      style={{ transformOrigin: "16px 10px" }}
    >
      <path d="M 16 10 C 18 12, 19 14, 20 14 C 21 13, 19 11, 16 10 Z" opacity="0.8" />
    </motion.g>
  </svg>
);

// 6. Majestic Whale (Faces Left by default)
const MajesticWhale = ({ className, wiggleSpeed }: { className?: string; wiggleSpeed: number }) => (
  <svg viewBox="0 0 40 20" fill="currentColor" className={className}>
    {/* Big Whale Body */}
    <path d="M 2 10 C 6 4, 18 3, 28 8 C 32 6, 36 5, 38 7 C 37 9, 34 10, 32 11 C 30 13, 22 17, 12 17 C 6 17, 2 14, 2 10 Z" />
    {/* Tail fin waving */}
    <motion.g
      animate={{
        rotate: [-5, 5, -5],
      }}
      transition={{
        repeat: Infinity,
        duration: wiggleSpeed * 2.2,
        ease: "easeInOut",
      }}
      style={{ transformOrigin: "28px 9px" }}
    >
      <path d="M 38 7 C 39 4, 40 3, 39 8 C 40 13, 39 12, 38 7 Z" />
    </motion.g>
  </svg>
);

// 7. School of Small Fish (Inherits parent color)
const SchoolOfFish = ({ className, wiggleSpeed }: { className?: string; wiggleSpeed: number }) => (
  <div className={`relative ${className}`} style={{ width: '100%', height: '100%' }}>
    {/* Leader */}
    <SleekFish className="absolute w-[35%] h-[35%]" wiggleSpeed={wiggleSpeed} style={{ top: '10%', left: '10%', opacity: 0.95 }} />
    {/* Followers */}
    <SleekFish className="absolute w-[30%] h-[30%]" wiggleSpeed={wiggleSpeed * 1.1} style={{ top: '35%', left: '32%', opacity: 0.75 }} />
    <SleekFish className="absolute w-[25%] h-[25%]" wiggleSpeed={wiggleSpeed * 0.9} style={{ top: '0%', left: '55%', opacity: 0.6 }} />
    <SleekFish className="absolute w-[30%] h-[30%]" wiggleSpeed={wiggleSpeed * 1.05} style={{ top: '55%', left: '18%', opacity: 0.8 }} />
    <SleekFish className="absolute w-[22%] h-[22%]" wiggleSpeed={wiggleSpeed * 0.95} style={{ top: '45%', left: '68%', opacity: 0.55 }} />
  </div>
);

export default function BackgroundSea() {
  const [creatures, setCreatures] = useState<SeaCreature[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // 35 default creatures heavily weighted toward whale, turtle, jellyfish, school
    const types: SeaCreature['type'][] = [
      'whale', 'turtle', 'jellyfish', 'school',
      'turtle', 'jellyfish', 'school', 'whale',
      'turtle', 'jellyfish', 'school', 'manta',
      'turtle', 'jellyfish', 'school', 'sleek',
      'whale', 'turtle', 'jellyfish', 'school',
      'angelfish', 'manta', 'turtle', 'jellyfish',
      'school', 'whale', 'turtle', 'jellyfish',
      'school', 'sleek', 'angelfish', 'school',
      'jellyfish', 'turtle', 'school'
    ];

    const generatedCreatures: SeaCreature[] = types.map((type, i) => {
      const swimDirection = i % 2 === 0 ? 'left-to-right' : 'right-to-left';
      
      // Determine sizes based on creature type (high size variance)
      let scale = 1.0;
      if (type === 'whale') {
        scale = 1.3 + Math.random() * 0.9;
      } else if (type === 'school') {
        scale = 0.9 + Math.random() * 0.7;
      } else if (type === 'turtle') {
        scale = 0.8 + Math.random() * 0.6;
      } else if (type === 'manta') {
        scale = 0.8 + Math.random() * 0.7;
      } else if (type === 'jellyfish') {
        scale = 0.7 + Math.random() * 0.6;
      } else { // sleek, angelfish
        scale = 0.6 + Math.random() * 0.9;
      }

      // Horizontal swimming duration
      let duration = 32 + Math.random() * 25;
      if (type === 'whale') {
        duration = 80 + Math.random() * 40;
      } else if (type === 'turtle') {
        duration = 55 + Math.random() * 25;
      } else if (type === 'jellyfish') {
        duration = 65 + Math.random() * 30;
      }

      // Negative delays to randomize initial start positions across the screen
      const delay = -Math.random() * duration;

      // Distribute vertically down the page using vertical bands (prevent clumping)
      const bandHeight = 85 / 35;
      const y = 8 + (i * bandHeight) + (Math.random() * bandHeight * 0.5);

      // Depth-based settings: foreground/midground/background
      let color = '#7DD3FC';
      let opacity = 0.25;
      let blur = 0.5;

      if (type === 'whale') {
        color = '#BAE6FD'; 
        opacity = 0.15 + Math.random() * 0.12; 
        blur = 1.0 + Math.random() * 1.5;
      } else if (type === 'turtle') {
        color = '#5EEAD4'; // Lovely green-teal turtle
        opacity = 0.28 + Math.random() * 0.15;
        blur = 0.2 + Math.random() * 0.6;
      } else if (type === 'jellyfish') {
        color = '#CFFAFE'; // Glowing white-cyan jellyfish
        opacity = 0.3 + Math.random() * 0.15;
        blur = 0.1 + Math.random() * 0.5;
      } else if (type === 'school') {
        color = '#A5F3FC'; // Glowing group
        opacity = 0.25 + Math.random() * 0.15;
        blur = 0.4 + Math.random() * 0.6;
      } else if (type === 'manta') {
        color = '#38BDF8';
        opacity = 0.3 + Math.random() * 0.15;
        blur = 0.2 + Math.random() * 0.6;
      } else {
        color = i % 2 === 0 ? '#7DD3FC' : '#22D3EE';
        if (scale < 0.9) {
          opacity = 0.18 + Math.random() * 0.1;
          blur = 0.8 + Math.random() * 0.8;
        } else {
          opacity = 0.35 + Math.random() * 0.15;
          blur = 0;
        }
      }

      return {
        id: `creature-${i}-${type}`,
        y,
        scale,
        duration,
        delay,
        bobbingDuration: 7 + Math.random() * 7,
        wiggleSpeed: type === 'whale' ? 2.5 + Math.random() * 0.8 : type === 'turtle' ? 1.6 + Math.random() * 0.6 : 0.6 + Math.random() * 0.5,
        type,
        swimDirection,
        opacity,
        blur,
        color,
      };
    });

    setCreatures(generatedCreatures);

    // Drifting bioluminescent particles
    const generatedParticles: Particle[] = Array.from({ length: 30 }).map((_, i) => ({
      id: `particle-${i}`,
      x: Math.random() * 100,
      y: 70 + Math.random() * 30,
      size: 2.5 + Math.random() * 4.5,
      duration: 10 + Math.random() * 12,
      delay: -Math.random() * 20,
    }));
    setParticles(generatedParticles);
  }, []);

  // Listen for Aurelia popping event
  useEffect(() => {
    const handleCustomJellyfish = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number; direction: 'left-to-right' | 'right-to-left' }>;
      const { x, y, direction } = customEvent.detail;
      
      const duration = 38 + Math.random() * 12; // 38s to 50s swim
      
      // Calculate fraction of swim completed based on drag drop X coordinate
      const isLeftToRight = direction === 'left-to-right';
      const fraction = isLeftToRight ? (x + 25) / 150 : (125 - x) / 150;
      const delay = -Math.max(0.01, Math.min(0.99, fraction)) * duration;

      const newJelly: SeaCreature = {
        id: `summoned-jelly-${Date.now()}-${Math.random()}`,
        y,
        scale: 0.85 + Math.random() * 0.45,
        duration,
        delay, // starts swimming right from the drop location!
        bobbingDuration: 5 + Math.random() * 5,
        wiggleSpeed: 0.8 + Math.random() * 0.4,
        type: 'jellyfish',
        swimDirection: direction,
        opacity: 0.55 + Math.random() * 0.15, // extra glowing foreground jellyfish
        blur: 0, // crisp and clear
        color: '#CFFAFE', // beautiful glowing ice-cyan
      };

      setCreatures((prev) => [newJelly, ...prev]);
    };

    window.addEventListener('swim-jellyfish', handleCustomJellyfish);
    return () => {
      window.removeEventListener('swim-jellyfish', handleCustomJellyfish);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0 bg-[#061320]">
      
      {/* 1. Volumetric God Rays (swaying light shafts) */}
      <div 
        className="absolute top-0 inset-x-0 h-[45vh] pointer-events-none opacity-45 filter blur-[8px] mix-blend-screen"
        style={{
          background: `repeating-linear-gradient(
            95deg,
            rgba(74, 144, 226, 0) 0%,
            rgba(74, 144, 226, 0.03) 6%,
            rgba(74, 144, 226, 0) 12%
          )`,
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0))',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0))',
        }}
      >
        <motion.div
          animate={{
            skewX: [-4, 4, -4],
            x: [-15, 15, -15],
          }}
          transition={{
            repeat: Infinity,
            duration: 16,
            ease: "easeInOut",
          }}
          className="w-full h-full"
        />
      </div>

      {/* 2. Glowing Bioluminescent Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: '105%', x: `${p.x}%`, opacity: 0 }}
          animate={{
            y: '-5%',
            opacity: [0, 0.4, 0.4, 0],
            x: [`${p.x}%`, `${p.x + (Math.sin(parseInt(p.id.split('-')[1])) * 6)}%`],
          }}
          transition={{
            repeat: Infinity,
            duration: p.duration,
            delay: p.delay,
            ease: 'easeInOut',
          }}
          className="absolute rounded-full bg-sky-200/40 filter blur-[1px] shadow-[0_0_8px_rgba(125,211,252,0.4)]"
          style={{
            width: p.size,
            height: p.size,
          }}
        />
      ))}

      {/* 3. Soft Glowing Sea Creatures */}
      {creatures.map((c) => {
        const isLeftToRight = c.swimDirection === 'left-to-right';
        const flipX = isLeftToRight ? -1 : 1;

        // Custom size maps with base dimension * scale
        let width = 60;
        let height = 40;
        if (c.type === 'whale') {
          width = 240 * c.scale;
          height = 120 * c.scale;
        } else if (c.type === 'school') {
          width = 140 * c.scale;
          height = 105 * c.scale;
        } else if (c.type === 'manta') {
          width = 95 * c.scale;
          height = 75 * c.scale;
        } else if (c.type === 'turtle') {
          width = 80 * c.scale;
          height = 50 * c.scale;
        } else if (c.type === 'jellyfish') {
          width = 50 * c.scale;
          height = 65 * c.scale;
        } else if (c.type === 'angelfish') {
          width = 65 * c.scale;
          height = 65 * c.scale;
        } else { // sleek
          width = 65 * c.scale;
          height = 45 * c.scale;
        }

        return (
          <div
            key={c.id}
            className="absolute filter drop-shadow-[0_0_8px_rgba(74,144,226,0.25)]"
            style={{
              top: `${c.y}%`,
              width: `${width}px`,
              height: `${height}px`,
              color: c.color,
              opacity: c.opacity,
              filter: c.blur > 0 ? `blur(${c.blur}px)` : 'none',
              // CSS horizontal animation utilizing negative delay for even distribution
              animation: `${isLeftToRight ? 'swim-lr' : 'swim-rl'} ${c.duration}s linear infinite`,
              animationDelay: `${c.delay}s`,
            }}
          >
            {/* Inner Bobbing Container (gentle bobbing and micro tilt) */}
            <motion.div
              animate={{
                y: [0, -6, 0, 6, 0],
                rotate: [0, 3, 0, -3, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: c.bobbingDuration,
                ease: 'easeInOut',
              }}
              style={{
                width: '100%',
                height: '100%',
                scaleX: flipX,
              }}
            >
              {c.type === 'whale' ? (
                <MajesticWhale className="w-full h-full" wiggleSpeed={c.wiggleSpeed} />
              ) : c.type === 'turtle' ? (
                <SeaTurtle className="w-full h-full" wiggleSpeed={c.wiggleSpeed} />
              ) : c.type === 'jellyfish' ? (
                <Jellyfish className="w-full h-full" wiggleSpeed={c.wiggleSpeed} />
              ) : c.type === 'school' ? (
                <SchoolOfFish className="w-full h-full" wiggleSpeed={c.wiggleSpeed} />
              ) : c.type === 'manta' ? (
                <MantaRay className="w-full h-full" wiggleSpeed={c.wiggleSpeed} />
              ) : c.type === 'angelfish' ? (
                <Angelfish className="w-full h-full" wiggleSpeed={c.wiggleSpeed} />
              ) : (
                <SleekFish className="w-full h-full" wiggleSpeed={c.wiggleSpeed} />
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
