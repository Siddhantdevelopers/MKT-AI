import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, ExternalLink } from 'lucide-react';

export default function JoinChannelPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initial delay before first appearance
    const initialDelay = setTimeout(() => {
      setIsVisible(true);
      // Hide after 4 seconds
      setTimeout(() => setIsVisible(false), 4000);
    }, 5000);

    const interval = setInterval(() => {
      setIsVisible(true);
      // Automatically hide after 3 seconds to give breathing room
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    }, 10000); // 10s cycle
    
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          className="fixed bottom-6 right-6 z-[200] max-w-xs w-full bg-[#0d0d0d] border border-[#F27D26]/30 rounded-xl p-4 shadow-2xl overflow-hidden"
          style={{
            boxShadow: '0 0 20px rgba(242, 125, 38, 0.1)',
          }}
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#F27D26] to-transparent animate-pulse" />
          
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#F27D26]/10 rounded-lg flex items-center justify-center border border-[#F27D26]/20 shrink-0">
              <MessageSquare className="text-[#F27D26]" size={20} />
            </div>
            
            <div className="space-y-1 pr-4">
              <p className="text-[8px] font-black text-[#F27D26] uppercase tracking-[0.2em]">Signal Alert</p>
              <h4 className="text-xs font-black text-white uppercase tracking-tight">Join Official Channel</h4>
              <p className="text-[9px] text-gray-400 font-bold uppercase leading-tight opacity-70">Node access & system metrics transmission.</p>
            </div>
          </div>

          <a 
            href="https://t.me/+1a7Mti90G7o0NWU1"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-[#F27D26] text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-md hover:bg-[#FF8C00] transition-all group"
          >
            Sync Channel <ExternalLink size={10} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
