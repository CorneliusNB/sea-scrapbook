import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Anchor, Sparkles, Plus, Trash2, Calendar, Waves, Heart, Ship, Compass, Wind, Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import { MemoryMilestone, SeaIconType } from '../types';
import { oceanAudio } from '../utils/audio';
import { saveImageLocal, getImageLocal } from '../utils/imageDb';

const ICON_MAP = {
  shell: { icon: Waves, label: 'Shell', color: 'text-sky-400 bg-sky-500/10 border-sky-400/20' },
  starfish: { icon: Sparkles, label: 'Starfish', color: 'text-amber-400 bg-amber-500/10 border-amber-400/20' },
  pearl: { icon: Heart, label: 'Pearl', color: 'text-sky-300 bg-sky-500/10 border-sky-300/20' },
  jellyfish: { icon: Wind, label: 'Jellyfish', color: 'text-purple-400 bg-purple-500/10 border-purple-400/20' },
  turtle: { icon: Ship, label: 'Turtle', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-400/20' },
  fish: { icon: Compass, label: 'Angelfish', color: 'text-sky-400 bg-sky-500/10 border-sky-400/20' },
  anchor: { icon: Anchor, label: 'Anchor', color: 'text-teal-400 bg-teal-500/10 border-teal-400/20' },
};

// Sub-component to load images asynchronously from IndexedDB
export const PolaroidImage = ({ imageSrc, alt, className }: { imageSrc: string; alt: string; className?: string }) => {
  const [src, setSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    if (!imageSrc) {
      setIsLoading(false);
      return;
    }
    if (imageSrc.startsWith('image-')) {
      getImageLocal(imageSrc).then(base64 => {
        if (base64) {
          setSrc(base64);
        }
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    } else {
      setSrc(imageSrc);
      setIsLoading(false);
    }
  }, [imageSrc]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50/5 text-sky-400/40">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (!src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 text-center text-[10px]">
        <ImageIcon className="w-5 h-5 mb-1" />
        Missing Image
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
    />
  );
};

interface MemoryProps {
  memories: MemoryMilestone[];
  onAddMemory: (memory: Omit<MemoryMilestone, 'id'>) => void;
  onUpdateMemory: (id: string, updated: Partial<MemoryMilestone>) => void;
  onDeleteMemory: (id: string) => void;
}

export default function MemoryTimeline({ memories, onAddMemory, onUpdateMemory, onDeleteMemory }: MemoryProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<SeaIconType>('shell');
  const [formImage, setFormImage] = useState('');
  const [previewSrc, setPreviewSrc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingCardId, setUploadingCardId] = useState<string | null>(null);

  const handleFormImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    oceanAudio.triggerBubblePop();

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const tempKey = `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        await saveImageLocal(tempKey, base64);
        setFormImage(tempKey);
        setPreviewSrc(base64);
        oceanAudio.triggerStarfishChime();
      } catch (err) {
        console.error("Local save failed:", err);
        alert("Failed to save image locally.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExistingCardUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCardId(id);
    oceanAudio.triggerBubblePop();

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const storageKey = `image-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        await saveImageLocal(storageKey, base64);
        onUpdateMemory(id, { image: storageKey });
        oceanAudio.triggerStarfishChime();
      } catch (err) {
        console.error("Local save failed:", err);
        alert("Failed to save photo locally.");
      } finally {
        setUploadingCardId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !description.trim()) return;

    onAddMemory({
      date,
      title: title.trim(),
      description: description.trim(),
      icon: selectedIcon,
      image: formImage || undefined,
    });

    setTitle('');
    setDate('');
    setDescription('');
    setSelectedIcon('shell');
    setFormImage('');
    setPreviewSrc('');
    setIsFormOpen(false);

    oceanAudio.triggerStarfishChime();
  };

  const sortedMemories = [...memories].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div id="memory-timeline" className="w-full relative">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="bg-sky-500/10 p-2.5 rounded-xl text-sky-400 border border-sky-500/20">
              <Heart className="w-5 h-5 fill-sky-400/20" />
            </div>
            <div>
              <h3 className="font-bold tracking-wide font-serif text-lg">Our Memories</h3>
              <p className="text-xs text-[#BFDBF7]/60 font-mono">A timeline of us</p>
            </div>
          </div>

          <button
            id="toggle-add-memory-form"
            onClick={() => {
              setIsFormOpen(!isFormOpen);
              oceanAudio.triggerBubblePop();
            }}
            className="bg-sky-400 text-white hover:bg-white hover:text-sky-500 py-2 px-4 rounded-full text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto active:scale-95 shadow-lg shrink-0 cursor-pointer"
          >
            {isFormOpen ? (
              <>
                <Waves className="w-4 h-4" /> Close
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add Memory
              </>
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isFormOpen && (
            <motion.form
              key="form"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleSubmit}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 space-y-4 overflow-hidden shadow-inner"
            >
              <h4 className="text-xs uppercase tracking-widest font-mono text-sky-300 font-bold">Add a new memory</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-sky-300/60 mb-1 font-mono">Date</label>
                  <input
                    id="memory-date-input"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-sky-300/60 mb-1 font-mono">Title</label>
                  <input
                    id="memory-title-input"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Memory title"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-300"
                  />
                </div>
              </div>

              {/* Photo Upload Area */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-sky-300/60 mb-1 font-mono">Photo</label>
                <div className="flex items-center gap-4 bg-white/5 border border-dashed border-white/10 rounded-xl p-4">
                  {formImage ? (
                    <div className="relative w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-md">
                      <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormImage('');
                          setPreviewSrc('');
                          oceanAudio.triggerBubblePop();
                        }}
                        className="absolute top-1 right-1 bg-black/75 hover:bg-black text-white p-1 rounded-full text-[8px]"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-white/5 rounded-lg flex items-center justify-center text-white/30 border border-white/5 shrink-0">
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                      ) : (
                        <Camera className="w-6 h-6" />
                      )}
                    </div>
                  )}

                  <div className="flex-1">
                    <input
                      type="file"
                      id="form-photo-upload"
                      accept="image/*"
                      onChange={handleFormImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="form-photo-upload"
                      className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono inline-flex items-center gap-1.5 active:scale-95 transition-all text-sky-300"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      {isUploading ? "Uploading..." : formImage ? "Change Image" : "Upload Photo"}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-sky-300/60 mb-1 font-mono">Icon</label>
                <div className="grid grid-cols-7 gap-2">
                  {(Object.keys(ICON_MAP) as SeaIconType[]).map((iconKey) => {
                    const mapped = ICON_MAP[iconKey];
                    const IconComp = mapped.icon;
                    return (
                      <button
                        key={iconKey}
                        id={`icon-select-${iconKey}`}
                        type="button"
                        onClick={() => {
                          setSelectedIcon(iconKey);
                          oceanAudio.triggerBubblePop();
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          selectedIcon === iconKey
                            ? 'border-sky-400 bg-sky-400/20 text-white shadow-md scale-105'
                            : 'border-white/10 bg-white/5 text-white/50 hover:text-white'
                        }`}
                        title={mapped.label}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-sky-300/60 mb-1 font-mono">Description</label>
                <textarea
                  id="memory-desc-textarea"
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write about this memory..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-300 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  id="cancel-memory-button"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-white/10 rounded-xl text-xs text-white/50 hover:bg-white/5 font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-memory-button"
                  type="submit"
                  className="bg-sky-400 hover:bg-white text-white hover:text-sky-500 py-2 px-5 rounded-full text-xs font-bold font-mono active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  Add Memory
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Timeline Path Rendering */}
        <div className="relative pl-6 md:pl-10 space-y-10">
          
          {/* Vertical Twine Rope */}
          {sortedMemories.length > 0 && (
            <div className="absolute left-3 md:left-5 top-2 bottom-2 w-[3px] bg-gradient-to-b from-[#8C6239]/40 via-[#8C6239]/20 to-transparent border-l border-[#d4a373]/30" />
          )}

          {sortedMemories.length === 0 ? (
            <div className="text-center py-10">
              <Compass className="w-10 h-10 mx-auto text-sky-400/40 animate-spin-slow mb-3" />
              <p className="text-xs text-[#BFDBF7]/50 italic font-mono">Add some photos of our memories above.</p>
            </div>
          ) : (
            sortedMemories.map((milestone, idx) => {
              const mapped = ICON_MAP[milestone.icon] || ICON_MAP.shell;
              const IconComp = mapped.icon;

              const rotationDegrees = (idx % 2 === 0 ? 1.5 : -1.5) + (idx % 3 === 0 ? 0.5 : -0.5);

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="relative group"
                  style={{ transform: `rotate(${rotationDegrees}deg)` }}
                >
                  {/* Clothespin / Wooden Peg Pin on the rope */}
                  <div className="absolute -left-[32px] md:-left-[48px] -top-1 w-6 md:w-8 h-8 flex flex-col items-center z-20">
                    <div className="w-1.5 h-6 bg-[#d4a373] rounded-t-sm shadow-md border-x border-[#c69363]" />
                    <div className="w-2.5 h-1 bg-[#b58353] -mt-2.5 shadow-sm" />
                    <div className="w-1.5 h-3 bg-[#a47343] rounded-b-sm" />
                  </div>

                  {/* Polaroid Card */}
                  <div className="bg-[#FCFBF9] border border-black/5 rounded-sm p-4 md:p-5 pb-8 relative transition-all duration-300 shadow-xl group-hover:shadow-2xl group-hover:scale-[1.01] text-slate-800">
                    
                    {/* Square Photo Box */}
                    <div className="aspect-square w-full bg-[#FAF9F5] border border-slate-200 relative overflow-hidden rounded-xs shadow-inner flex items-center justify-center mb-5 group/image">
                      {milestone.image ? (
                        <PolaroidImage
                          imageSrc={milestone.image}
                          alt={milestone.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-4">
                          <ImageIcon className="w-8 h-8 text-slate-300 mb-2 group-hover/image:text-sky-400 transition-colors" />
                          <p className="text-[10px] text-slate-400 font-mono tracking-wider">No photo yet</p>
                          
                          <input
                            type="file"
                            id={`card-upload-${milestone.id}`}
                            accept="image/*"
                            onChange={(e) => handleExistingCardUpload(milestone.id, e)}
                            className="hidden"
                          />
                          <label
                            htmlFor={`card-upload-${milestone.id}`}
                            className="cursor-pointer mt-3 bg-sky-500/5 hover:bg-sky-500/10 border border-sky-500/10 px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono text-sky-500 inline-flex items-center gap-1 active:scale-95 transition-all"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            Upload Photo
                          </label>
                        </div>
                      )}

                      {/* Card Uploading Spinner */}
                      {uploadingCardId === milestone.id && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-15">
                          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                        </div>
                      )}

                      {/* Polaroid Watermark/Label */}
                      <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-sm border border-slate-100 text-[8px] uppercase tracking-widest text-slate-400 font-mono scale-90">
                        {mapped.label}
                      </div>
                    </div>

                    {/* Polaroid Handwritten Caption Section */}
                    <div className="text-center px-1">
                      
                      {/* Date */}
                      <div className="flex justify-center items-center gap-1 text-[11px] text-slate-400 font-mono tracking-widest uppercase mb-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(milestone.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>

                      {/* Title */}
                      <h4 className="text-lg md:text-xl font-serif font-bold text-slate-800 tracking-wide mb-2 inline-flex items-center gap-1.5 justify-center">
                        {milestone.title}
                        <IconComp className="w-4 h-4 text-sky-400 fill-sky-500/10" />
                      </h4>

                      {/* Description */}
                      <p className="font-handwritten text-2xl text-slate-600 leading-snug px-3 antialiased whitespace-pre-wrap">
                        {milestone.description}
                      </p>
                    </div>

                    {/* Delete button */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                      <button
                        id={`delete-memory-${milestone.id}`}
                        onClick={() => {
                          onDeleteMemory(milestone.id);
                          oceanAudio.triggerBubblePop();
                        }}
                        className="text-rose-500 hover:text-white bg-rose-50 hover:bg-rose-500 p-1.5 rounded-lg border border-rose-100 hover:border-rose-500 transition-all cursor-pointer"
                        title="Delete Memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
