'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu, ArrowUpRight, Volume2, VolumeX } from 'lucide-react';

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const videoRef = useRef(null);

  // Focus trap / handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Synchronize mute state with video ref
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, isOpen]);

  return (
    <main className="relative min-h-screen bg-[#060608] text-white flex flex-col justify-between overflow-hidden">
      
      {/* =========================================================================
          BACKGROUND VISUALS & AMBIEINT GLOWS
          ========================================================================= */}
      
      {/* Purple Glow Spot - Animated Smoothly */}
      <motion.div
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 50, 0],
          scale: [1, 1.12, 0.95, 1],
          opacity: [0.12, 0.22, 0.16, 0.12]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-900/10 blur-[140px] pointer-events-none mix-blend-screen z-0"
      />

      {/* Deep Blue Glow Spot - Animated Smoothly */}
      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 60, -30, 0],
          scale: [1, 0.93, 1.08, 1],
          opacity: [0.18, 0.28, 0.14, 0.18]
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-blue-950/15 blur-[150px] pointer-events-none mix-blend-screen z-0"
      />

      {/* Cinematic Portrait Backdrop - Shifted Right with Luxury Overlays */}
      <div className="absolute top-0 right-0 w-full md:w-[60%] h-full pointer-events-none z-0">
        <div 
          className="w-full h-full bg-cover bg-right md:bg-center bg-no-repeat opacity-15 md:opacity-25 transition-opacity duration-1000"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1920&q=80')" }}
        />
        {/* Left radial fade for desktop readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060608] via-[#060608]/75 to-transparent hidden md:block" />
        {/* Central overlay for mobile readability */}
        <div className="absolute inset-0 bg-[#060608]/60 md:hidden" />
        {/* Top/Bottom ambient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-transparent to-[#060608]/30" />
      </div>

      {/* =========================================================================
          HEADER SECTION
          ========================================================================= */}
      <header className="z-30 w-full px-6 py-6 md:py-8 max-w-7xl mx-auto flex justify-between items-center relative">
        {/* Brand Logo & Subtext */}
        <div className="flex flex-col select-none">
          <span className="font-cinzel text-xl md:text-2xl tracking-[0.35em] text-white font-medium leading-none">É C L A T</span>
          <span className="font-sans text-[8px] md:text-[9px] tracking-[0.3em] uppercase text-zinc-500 mt-2 font-light">By RG Graphic</span>
        </div>

        {/* Navigation pill - Frosted Glass */}
        <nav className="hidden md:flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] shadow-2xl">
          <a href="#home" className="text-[10px] tracking-[0.25em] font-light text-zinc-400 hover:text-white px-5 py-2.5 rounded-full transition-all duration-300 hover:bg-white/[0.03]">HOME</a>
          <a href="#portfolio" className="text-[10px] tracking-[0.25em] font-light text-zinc-400 hover:text-white px-5 py-2.5 rounded-full transition-all duration-300 hover:bg-white/[0.03]">PORTFOLIO</a>
          <a href="#about" className="text-[10px] tracking-[0.25em] font-light text-zinc-400 hover:text-white px-5 py-2.5 rounded-full transition-all duration-300 hover:bg-white/[0.03]">ABOUT</a>
          <a href="#contact" className="text-[10px] tracking-[0.25em] font-light text-zinc-400 hover:text-white px-5 py-2.5 rounded-full transition-all duration-300 hover:bg-white/[0.03]">CONTACT</a>
        </nav>

        {/* Header CTA Button */}
        <div className="hidden md:block">
          <a href="#contact" className="px-6 py-3 rounded-full border border-white/10 hover:border-white/30 text-[10px] tracking-[0.2em] uppercase font-light text-zinc-300 hover:text-white transition-all duration-300 bg-white/[0.01] hover:bg-white/[0.03]">
            GET IN TOUCH
          </a>
        </div>

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      {/* Mobile navigation menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-24 left-6 right-6 p-6 rounded-3xl bg-[#09090b]/95 backdrop-blur-2xl border border-white/10 z-40 md:hidden flex flex-col gap-4 shadow-3xl"
          >
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className="text-[11px] tracking-[0.2em] font-light text-zinc-300 hover:text-white py-2.5 border-b border-white/5 transition-all">HOME</a>
            <a href="#portfolio" onClick={() => setMobileMenuOpen(false)} className="text-[11px] tracking-[0.2em] font-light text-zinc-300 hover:text-white py-2.5 border-b border-white/5 transition-all">PORTFOLIO</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-[11px] tracking-[0.2em] font-light text-zinc-300 hover:text-white py-2.5 border-b border-white/5 transition-all">ABOUT</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-[11px] tracking-[0.2em] font-light text-zinc-300 hover:text-white py-2.5 border-b border-white/5 transition-all">CONTACT</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="mt-2 text-center py-3.5 rounded-full bg-white/5 text-[11px] tracking-[0.2em] uppercase font-light text-white border border-white/10">GET IN TOUCH</a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          HERO CONTENT SECTION
          ========================================================================= */}
      <section className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col justify-center relative z-10 py-12 md:py-24">
        <div className="max-w-2xl flex flex-col gap-6 md:gap-8 text-left">
          
          {/* Subtitle Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <span className="h-[1px] w-6 bg-zinc-600"></span>
            <span className="text-[9px] md:text-[10px] tracking-[0.45em] text-zinc-400 font-light uppercase">
              Award-Winning Actor & Producer
            </span>
          </motion.div>

          {/* Main Actor Name Layout - Metallic Text Clip */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex flex-col gap-1 md:gap-2 select-none"
          >
            <h1 className="font-cinzel text-5xl md:text-7xl lg:text-8xl font-medium tracking-[0.25em] leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500">
              D I N U K A
            </h1>
            <h2 className="font-cinzel text-3xl md:text-5xl lg:text-6xl font-light tracking-[0.3em] leading-normal text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 via-white to-zinc-600 -mt-1 md:-mt-2">
              SENANAYAKE
            </h2>
          </motion.div>

          {/* Description Body */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xs md:text-sm font-light text-zinc-400 max-w-lg leading-relaxed tracking-wider"
          >
            A masterclass in cinematic expression. Captivating audiences worldwide with nuanced performances, intense presence, and a commitment to storytelling that transcends screens.
          </motion.p>

          {/* Luxury Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mt-2"
          >
            {/* Play Showreel - Frosted Glass, Ambient Hover Glow */}
            <button
              onClick={() => setIsOpen(true)}
              className="group px-8 py-4 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/10 text-white text-[10px] tracking-[0.25em] uppercase font-medium transition-all duration-500 hover:scale-105 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_35px_rgba(255,255,255,0.35)] flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>PLAY SHOWREEL</span>
              <span className="text-xs group-hover:translate-x-0.5 transition-transform duration-300">🎬</span>
            </button>

            {/* Download Press Kit - Thin Frosted Outline */}
            <a
              href="#press-kit"
              className="px-8 py-4 rounded-full bg-transparent border border-white/5 hover:border-white/20 text-zinc-400 hover:text-white text-[10px] tracking-[0.25em] uppercase font-light transition-all duration-500 hover:scale-103 hover:bg-white/[0.01] flex items-center justify-center gap-2"
            >
              <span>DOWNLOAD PRESS KIT</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-60 hover:opacity-100 transition-opacity" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          SIGNATURE WATERMARK & SCROLL INDICATOR
          ========================================================================= */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center z-10 gap-4 mt-auto">
        <span className="text-[9px] tracking-[0.4em] uppercase text-zinc-600 font-light text-center md:text-left select-none">
          An ÉCLAT Premium Experience
        </span>
        
        {/* Animated Scroll Down Indicator */}
        <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
          <span className="text-[8px] tracking-[0.3em] uppercase text-zinc-500 font-light">
            Scroll to explore
          </span>
          <div className="h-8 w-[1px] bg-gradient-to-b from-zinc-500 to-transparent relative overflow-hidden">
            <motion.div 
              animate={{ y: [0, 32] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} 
              className="absolute top-0 left-0 w-full h-3 bg-white" 
            />
          </div>
        </div>
      </footer>

      {/* =========================================================================
          CINEMATIC SHOWREEL MODAL
          ========================================================================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl"
          >
            {/* Click backdrop to close */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)} />

            {/* Video Content Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl aspect-video rounded-2xl border border-white/10 overflow-hidden bg-zinc-950 shadow-2xl z-10"
            >
              {/* Top Controls Overlay */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
                <span className="font-cinzel text-xs tracking-[0.3em] uppercase text-white/70 bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/5 pointer-events-auto">
                  DINUKA SENANAYAKE — SHOWREEL
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 rounded-full bg-black/40 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer pointer-events-auto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Video Element (Plays premium fashion/cinematic clip) */}
              <video
                ref={videoRef}
                src="https://assets.mixkit.co/videos/preview/mixkit-fashion-woman-with-silver-glitter-makeup-40455-large.mp4"
                autoPlay
                loop
                className="w-full h-full object-cover"
              />

              {/* Bottom Mute Control */}
              <div className="absolute bottom-4 right-4 flex items-center gap-3 z-20">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-3 rounded-full bg-black/40 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
