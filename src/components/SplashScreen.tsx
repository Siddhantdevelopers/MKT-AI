import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExit(true);
      setTimeout(onComplete, 1000); // Wait for exit animation
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: exit ? 0 : 1 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2 
        }}
        className="relative w-48 h-48 mb-8 flex items-center justify-center bg-gradient-to-tr from-[#F27D26] to-[#FF8C00] rounded-3xl p-[2px] shadow-[0_0_50px_rgba(242,125,38,0.4)] overflow-hidden"
      >
        <div className="w-full h-full bg-[#050505] rounded-[22px] flex items-center justify-center overflow-hidden">
          <img 
            src="https://i.ibb.co/kVH7mzvR/IMG-8546.jpg" 
            alt="MKT AI Logo" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <motion.div
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-[#F27D26] blur-2xl rounded-full -z-10"
        />
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-4xl font-bold tracking-tighter text-[#F27D26] uppercase"
      >
        MKT AI
      </motion.h1>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{ delay: 0.8, duration: 1.5 }}
        className="h-1 bg-[#F27D26] mt-4 rounded-full opacity-50"
      />
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.2 }}
        className="mt-4 text-xs font-mono tracking-widest uppercase"
      >
        Initializing AI Systems...
      </motion.p>
    </motion.div>
  );
}
