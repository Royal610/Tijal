import React from 'react';
import { motion } from 'motion/react';

export default function PrintingBackgroundEffects() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-slate-50">
      {/* Halftone / Registration Mark pattern overlay (subtle) */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px'
        }}
      />
      
      {/* CMYK animated blurred blobs */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 md:opacity-[0.15]"
        style={{ backgroundColor: '#00AEEF' }}
        animate={{
          x: [0, 50, 0],
          y: [0, 50, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 md:opacity-[0.15]"
        style={{ backgroundColor: '#EC008C' }}
        animate={{
          x: [0, -50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 md:opacity-[0.15]"
        style={{ backgroundColor: '#FFF200' }}
        animate={{
          x: [0, 30, 0],
          y: [0, -50, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />
      
      {/* Floating printing marks */}
      <div className="absolute inset-0 opacity-[0.07] hidden md:block">
        <RegistrationMark top="15%" left="8%" />
        <RegistrationMark top="75%" right="12%" />
        <RegistrationMark bottom="20%" left="15%" />
        <RegistrationMark top="25%" right="8%" />
        <RegistrationMark top="50%" left="4%" delay={10} />
      </div>
    </div>
  );
}

function RegistrationMark({ top, left, right, bottom, delay = 0 }: { top?: string, left?: string, right?: string, bottom?: string, delay?: number }) {
  return (
    <motion.div 
      className="absolute w-10 h-10 flex items-center justify-center pointer-events-none"
      style={{ top, left, right, bottom }}
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: 'linear', delay }}
    >
      <div className="absolute w-full h-[1px] bg-slate-900" />
      <div className="absolute h-full w-[1px] bg-slate-900" />
      <div className="absolute w-5 h-5 rounded-full border border-slate-900" />
    </motion.div>
  );
}
