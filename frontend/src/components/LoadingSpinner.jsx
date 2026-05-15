import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ fullPage = false }) => {
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        {/* Inner Ring */}
        <motion.div
          className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Spinning Outer Ring */}
        <motion.div
          className="absolute inset-0 border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Center Glow */}
        <div className="absolute inset-4 bg-emerald-500 rounded-full blur-md opacity-20 animate-pulse" />
      </div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 animate-pulse"
      >
        Syncing Data...
      </motion.p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
