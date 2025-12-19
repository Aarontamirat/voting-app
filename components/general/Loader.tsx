// import React from 'react'
import { motion } from "framer-motion";

const Loader = () => {
  return (
    <div
      className="h-screen flex flex-col items-center justify-center bg-gradient-to-br 
    from-gray-100 via-white to-gray-200 
    dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"
    >
      <div className="relative w-28 h-28">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-blue-300/50"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border-4 border-cyan-400/60"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-8 rounded-full border-2 border-sky-400/70"
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.4, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        />
      </div>
      <p className="text-sky-600 text-sm mt-6 tracking-widest uppercase animate-pulse">
        Initializing Live Attendance...
      </p>
    </div>
  );
};

export default Loader;
