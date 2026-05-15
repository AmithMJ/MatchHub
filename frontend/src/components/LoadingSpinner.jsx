import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingSpinner = ({ fullPage = false }) => {
  const [loadingText, setLoadingText] = useState("Preparing the Pitch...");
  const texts = [
    "Padding up...",
    "Checking NRR...",
    "Setting the Field...",
    "Umpire Decision Pending...",
    "Strategic Timeout...",
    "Polishing the Ball...",
    "Checking the Boundary..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText(texts[Math.floor(Math.random() * texts.length)]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="relative flex flex-col items-center">
        {/* Pulsing Wickets */}
        <div className="flex gap-3 mb-2">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-12 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.3)]"
              animate={{ 
                height: [48, 56, 48],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        {/* The Spinning "Cherry" (Ball) */}
        <motion.div
          className="w-12 h-12 bg-rose-600 rounded-full relative overflow-hidden border-2 border-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.4)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          {/* Seam Stitching */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-full h-1.5 bg-white/30 border-y border-white/40 flex items-center justify-around px-1">
                {[1,2,3,4,5].map(s => <div key={s} className="w-[1px] h-full bg-white/20" />)}
             </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center rotate-90">
             <div className="w-full h-[1px] bg-white/10" />
          </div>
          {/* Ball Shine */}
          <div className="absolute top-1 left-2 w-3 h-3 bg-white/20 rounded-full blur-[2px]" />
        </motion.div>

        {/* Dynamic Shadow */}
        <div className="w-14 h-2 bg-black/40 rounded-full blur-md mt-4 animate-pulse" />
      </div>
      
      <div className="text-center min-h-[40px]">
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]"
          >
            {loadingText}
          </motion.p>
        </AnimatePresence>
        <p className="text-[7px] font-bold text-slate-500 uppercase tracking-[0.5em] mt-3">MatchHub Elite Series</p>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
