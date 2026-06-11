import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Calendar, Settings, Save, Ship, Sparkles } from 'lucide-react';
import { CoupleConfig } from '../types';

interface CounterProps {
  config: CoupleConfig;
  onUpdateConfig: (newConfig: CoupleConfig) => void;
}

export default function AnniversaryCounter({ config, onUpdateConfig }: CounterProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempPartner1, setTempPartner1] = useState(config.partner1);
  const [tempPartner2, setTempPartner2] = useState(config.partner2);
  const [tempDate, setTempDate] = useState(config.anniversaryDate);

  const [timeTogether, setTimeTogether] = useState({
    totalDays: 0,
    years: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calculate live counter
  useEffect(() => {
    const calculateTime = () => {
      const parts = config.anniversaryDate.split('-');
      const startYearVal = parseInt(parts[0], 10);
      const startMonthVal = parseInt(parts[1], 10) - 1;
      const startDayVal = parseInt(parts[2], 10);

      const start = new Date(startYearVal, startMonthVal, startDayVal, 0, 0, 0, 0);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();

      if (diffMs < 0) {
        setTimeTogether({ totalDays: 0, years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      // Live computation
      const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      const nowYear = now.getFullYear();
      let calculatedYears = nowYear - startYearVal;
      
      let anniversaryThisYear = new Date(nowYear, startMonthVal, startDayVal, 0, 0, 0, 0);
      
      if (now < anniversaryThisYear) {
        calculatedYears--;
        anniversaryThisYear = new Date(nowYear - 1, startMonthVal, startDayVal, 0, 0, 0, 0);
      }

      const diffFromLastAnniversary = now.getTime() - anniversaryThisYear.getTime();
      const days = Math.floor(diffFromLastAnniversary / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffFromLastAnniversary % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffFromLastAnniversary % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffFromLastAnniversary % (1000 * 60)) / 1000);

      setTimeTogether({
        totalDays,
        years: calculatedYears,
        days,
        hours,
        minutes,
        seconds,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [config.anniversaryDate]);

  const handleSave = () => {
    onUpdateConfig({
      partner1: tempPartner1.trim() || 'Alex',
      partner2: tempPartner2.trim() || 'Sam',
      anniversaryDate: tempDate || '2024-06-04',
    });
    setIsEditing(false);
  };

  return (
    <div id="anniversary-counter" className="w-full relative">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] md:rounded-[40px] p-8 md:p-10 shadow-2xl relative overflow-hidden text-white">
        
        {/* Subtle decorative warm blue lighting */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

        <div className="flex justify-end mb-8 relative z-10">
          <button
            id="toggle-edit-button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-sky-300 hover:text-white hover:bg-white/10 p-2 rounded-xl border border-white/5 transition-all duration-200 cursor-pointer"
            title="Configure Details"
          >
            <Settings className="w-5 h-5 text-sky-300" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div
              key="display"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="text-center relative z-10"
            >
              {/* Couple's names block */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-4">
                <span className="text-4xl md:text-6xl font-serif font-light italic text-white">
                  {config.partner1}
                </span>
                <div className="relative flex items-center justify-center py-2 sm:py-0">
                  <motion.div
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <Heart className="w-10 h-10 text-sky-400 fill-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]" />
                  </motion.div>
                </div>
                <span className="text-4xl md:text-6xl font-serif font-light italic text-sky-300">
                  {config.partner2}
                </span>
              </div>

              <div className="text-xs text-[#BFDBF7]/80 font-mono mb-8 flex justify-center items-center gap-1.5 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-sky-300" />
                Sailing since {new Date(config.anniversaryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              {/* Big Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
                {[
                  { label: 'Years', val: timeTogether.years },
                  { label: 'Days', val: timeTogether.days },
                  { label: 'Hours', val: timeTogether.hours },
                  { label: 'Mins', val: timeTogether.minutes },
                  { label: 'Secs', val: timeTogether.seconds },
                  { label: 'Anchor Days', val: timeTogether.totalDays, full: true }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center backdrop-blur-md shadow-lg transition-transform hover:scale-105 duration-305 ${
                      item.full ? 'col-span-2 sm:col-span-1 border-sky-500/20 bg-sky-500/5' : ''
                    }`}
                  >
                    <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono leading-none">
                      {item.val}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#BFDBF7]/60 font-semibold mt-2 font-mono">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-sky-500/10 text-sky-200 text-sm font-light italic px-6 py-3 rounded-full border border-sky-400/20 inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-300 animate-spin-slow" />
                "I love you enjie my bluw my everything"
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4 max-w-md mx-auto relative z-10"
            >
              <h3 className="text-md font-semibold text-sky-300 mb-2 font-serif">Customize Anniversary Settings</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-sky-300/60 mb-1 font-mono">Partner 1</label>
                  <input
                    id="partner1-input"
                    type="text"
                    value={tempPartner1}
                    onChange={(e) => setTempPartner1(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-sky-400 focus:outline-none"
                    placeholder="Partner Name"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-sky-300/60 mb-1 font-mono">Partner 2</label>
                  <input
                    id="partner2-input"
                    type="text"
                    value={tempPartner2}
                    onChange={(e) => setTempPartner2(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-sky-400 focus:outline-none"
                    placeholder="Partner Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-sky-300/60 mb-1 font-mono">Anniversary Date</label>
                <input
                  id="anniversary-date-input"
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-sky-400 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-[#BFDBF7]/40 mt-1">When did your beautiful story first begin?</p>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  id="cancel-edit-button"
                  onClick={() => {
                    setTempPartner1(config.partner1);
                    setTempPartner2(config.partner2);
                    setTempDate(config.anniversaryDate);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white/50 hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="save-config-button"
                  onClick={handleSave}
                  className="bg-sky-400 text-white px-5 py-2.5 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 hover:bg-white hover:text-sky-500 active:scale-95 transition-all shadow-lg cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Chart
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
