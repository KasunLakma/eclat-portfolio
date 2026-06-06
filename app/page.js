'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu, ArrowUpRight, Volume2, VolumeX, Film, Link as LinkIcon } from 'lucide-react';
import profileData from '@/src/data/profile.json';
import { getProfile, submitInquiry } from './admin/actions';

function getEmbedUrl(url) {
  if (!url) return '';
  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/')) {
    return url;
  }
  if (url.includes('youtube.com/watch')) {
    try {
      const urlObj = new URL(url);
      const v = urlObj.searchParams.get('v');
      return `https://www.youtube.com/embed/${v}?autoplay=1`;
    } catch (e) {
      return url;
    }
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${id}?autoplay=1`;
  }
  if (url.includes('vimeo.com/')) {
    const id = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${id}?autoplay=1`;
  }
  return url;
}

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const videoRef = useRef(null);

  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [profile, setProfile] = useState(profileData);

  useEffect(() => {
    async function loadLatestProfile() {
      const latest = await getProfile();
      if (latest) {
        setProfile(latest);
      }
    }
    loadLatestProfile();
  }, []);

  const [toastMessage, setToastMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) return;
    setIsSubmitting(true);

    try {
      const res = await submitInquiry(formState.name, formState.email, formState.message);
      setIsSubmitting(false);
      if (res.success) {
        setSubmitted(true);
        setToastMessage('Message Sent Successfully!');
        setFormState({ name: '', email: '', message: '' });
        setTimeout(() => {
          setSubmitted(false);
          setToastMessage(null);
        }, 4000);
      } else {
        alert(res.error || 'Failed to send message.');
      }
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  // Focus trap / handle ESC key to close showreel modal
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
    <main className="relative min-h-screen bg-[#060608] text-white flex flex-col overflow-y-auto overflow-x-hidden scroll-smooth">
      
      {/* =========================================================================
          BACKGROUND VISUALS & AMBIENT GLOWS
          ========================================================================= */}
      
      {/* Top Purple Glow Spot - Animated Smoothly */}
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

      {/* Top Deep Blue Glow Spot - Animated Smoothly */}
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
        className="absolute top-[20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-blue-950/15 blur-[150px] pointer-events-none mix-blend-screen z-0"
      />

      {/* Gallery Section Ambient Glow (Scroll Transition Support) */}
      <motion.div
        animate={{
          scale: [1, 1.1, 0.92, 1],
          opacity: [0.08, 0.16, 0.12, 0.08]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[110vh] left-[-20%] w-[800px] h-[800px] rounded-full bg-purple-950/10 blur-[160px] pointer-events-none mix-blend-screen z-0"
      />

      {/* Cinematic Portrait Backdrop - Confined to Hero Viewport Height */}
      <div className="absolute top-0 right-0 w-full md:w-[60%] h-[100vh] pointer-events-none z-0 overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-right md:bg-center bg-no-repeat opacity-30 md:opacity-50 transition-opacity duration-1000"
          style={{ backgroundImage: `url('${profile.heroImage || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1920&q=80"}')` }}
        />
        {/* Left radial fade for desktop readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060608] via-[#060608]/45 to-transparent hidden md:block" />
        {/* Central overlay for mobile readability */}
        <div className="absolute inset-0 bg-[#060608]/30 md:hidden" />
        {/* Top/Bottom ambient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-transparent to-[#060608]/20" />
      </div>

      {/* =========================================================================
          HEADER SECTION
          ========================================================================= */}
      <header className="z-30 w-full px-6 py-6 md:py-8 max-w-7xl mx-auto flex justify-between items-center relative">
        {/* Brand Logo */}
        <div className="flex flex-col items-start select-none max-w-max">
          <span className="font-serif text-xl md:text-2xl font-medium tracking-[0.35em] text-white uppercase leading-none">
            ÉCLAT
          </span>
        </div>

        {/* Navigation pill - Frosted Glass */}
        <nav className="hidden md:flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] shadow-2xl">
          <a href="#" className="text-[10px] tracking-[0.25em] font-light text-zinc-400 hover:text-white px-5 py-2.5 rounded-full transition-all duration-300 hover:bg-white/[0.03]">HOME</a>
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
            <a href="#" onClick={() => setMobileMenuOpen(false)} className="text-[11px] tracking-[0.2em] font-light text-zinc-300 hover:text-white py-2.5 border-b border-white/5 transition-all">HOME</a>
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
      <section id="about" className="min-h-[85vh] md:min-h-[90vh] w-full max-w-7xl mx-auto px-6 flex flex-col justify-center relative z-10 py-12 md:py-24">
        <div className="max-w-2xl flex flex-col gap-6 md:gap-8 text-left">
          


          {/* Main Actor Name Layout - Metallic Text Clip */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex flex-col gap-1 md:gap-2 select-none"
          >
            <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-[0.2em] md:tracking-[0.25em] leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 whitespace-nowrap">
              {profile.firstName}
            </h1>
            <h2 className="font-cinzel text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.25em] md:tracking-[0.3em] leading-normal text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 via-white to-zinc-600 -mt-1 md:-mt-2 whitespace-nowrap">
              {profile.lastName}
            </h2>
          </motion.div>

          {/* Description Body */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xs md:text-sm font-light text-zinc-400 max-w-lg leading-relaxed tracking-wider"
          >
            {profile.description}
          </motion.p>

          {/* Casting Stats Grid */}
          {profile.stats && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl max-w-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              <div className="flex flex-col gap-1 border-l border-white/5 pl-3">
                <span className="text-[8px] tracking-[0.25em] uppercase text-zinc-500 font-medium">Height</span>
                <span className="text-xs text-zinc-200 font-medium tracking-wide">{profile.stats.height}</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/5 pl-3">
                <span className="text-[8px] tracking-[0.25em] uppercase text-zinc-500 font-medium">Build</span>
                <span className="text-xs text-zinc-200 font-medium tracking-wide">{profile.stats.build}</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/5 pl-3">
                <span className="text-[8px] tracking-[0.25em] uppercase text-zinc-500 font-medium">Eyes</span>
                <span className="text-xs text-zinc-200 font-medium tracking-wide">{profile.stats.eyes}</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/5 pl-3">
                <span className="text-[8px] tracking-[0.25em] uppercase text-zinc-500 font-medium">Hair</span>
                <span className="text-xs text-zinc-200 font-medium tracking-wide">{profile.stats.hair}</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/5 pl-3">
                <span className="text-[8px] tracking-[0.25em] uppercase text-zinc-500 font-medium">Languages</span>
                <span className="text-xs text-zinc-200 font-medium tracking-wide truncate" title={profile.stats.languages}>{profile.stats.languages}</span>
              </div>
              <div className="flex flex-col gap-1 border-l border-white/5 pl-3">
                <span className="text-[8px] tracking-[0.25em] uppercase text-zinc-500 font-medium">Special Skills</span>
                <span className="text-xs text-zinc-200 font-medium tracking-wide truncate" title={profile.stats.specialSkills}>{profile.stats.specialSkills}</span>
              </div>
            </motion.div>
          )}

          {/* Luxury Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex mt-2"
          >
            {/* Play Showreel - Frosted Glass, Ambient Hover Glow */}
            <button
              onClick={() => setIsOpen(true)}
              className="group px-8 py-4 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/10 text-white text-[10px] tracking-[0.25em] uppercase font-medium transition-all duration-500 hover:scale-105 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_35px_rgba(255,255,255,0.35)] flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>PLAY SHOWREEL</span>
              <span className="text-xs group-hover:translate-x-0.5 transition-transform duration-300">🎬</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE HEADSHOT GALLERY SECTION
          ========================================================================= */}
      <section id="portfolio" className="w-full max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">
        
        {/* Section Header */}
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-3"
            >
              <span className="h-[1px] w-6 bg-zinc-600"></span>
              <span className="text-[9px] md:text-[10px] tracking-[0.45em] text-zinc-500 font-light uppercase">
                PORTFOLIO / CHARACTER STUDIES
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1 }}
              className="font-cinzel text-3xl md:text-5xl font-medium tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400"
            >
              HEADSHOTS
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-xs text-xs font-light text-zinc-500 leading-relaxed tracking-wider"
          >
            Exploring character duality and dramatic light. A series of fine-art portraits captured on medium format film.
          </motion.p>
        </div>

        {/* Asymmetrical Portrait Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 items-start">
          {profile.headshots.map((item) => (
            <div
              key={item.id}
              className={`relative group ${item.offset}`}
            >
              {/* Ambient Neon Glow behind card */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-purple-500/20 via-purple-600/10 to-blue-500/25 opacity-0 group-hover:opacity-100 blur-3xl transition-all duration-700 scale-90 group-hover:scale-110 pointer-events-none" />

              {/* Main Card */}
              <motion.div
                initial={{ opacity: 0, y: 45 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, delay: item.delay }}
                whileHover="hover"
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/20 backdrop-blur-sm cursor-pointer shadow-lg hover:shadow-[0_0_30px_rgba(147,51,234,0.15)] transition-all duration-500 w-full"
                style={{ aspectRatio: item.aspect }}
              >
                {/* Zooming Image container */}
                <motion.div
                  variants={{
                    hover: { scale: 1.05 }
                  }}
                  transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                  className="w-full h-full"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover filter grayscale contrast-125 transition-all duration-700 group-hover:grayscale-0 group-hover:contrast-100"
                  />
                </motion.div>

                {/* Gradient card shadow overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                {/* Frosted glass text capsule - Elegant design */}
                <motion.div
                  variants={{
                    initial: { y: 0 },
                    hover: { y: -4 }
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#09090b]/80 backdrop-blur-xl border border-white/10 flex flex-col gap-1 shadow-2xl transition-all duration-300 group-hover:border-purple-500/30 group-hover:bg-[#09090b]/90"
                >
                  <span className="font-sans text-[10px] tracking-[0.3em] font-medium text-white/90 uppercase transition-colors duration-300 group-hover:text-purple-300">
                    {item.title}
                  </span>
                  <span className="font-sans text-[8px] tracking-[0.2em] font-light text-zinc-500 uppercase transition-colors duration-300 group-hover:text-zinc-400">
                    {item.subtitle}
                  </span>
                </motion.div>
              </motion.div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          CINEMATIC FILMOGRAPHY GRID
          ========================================================================= */}
      <section id="filmography" className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10">
        
        {/* Section Header */}
        <div className="mb-10 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="h-[1px] w-6 bg-zinc-700"></span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-light">
              FILMOGRAPHY / ARCHIVE
            </span>
          </div>
          <h2 className="font-cinzel text-2xl md:text-4xl font-medium tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 mt-1">
            SELECTED WORKS
          </h2>
        </div>

        {/* Filmography Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {profile.films.map((film) => (
            <motion.div
              key={film.id}
              className="w-full"
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            >
              <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 bg-zinc-950/20 backdrop-blur-sm cursor-pointer group shadow-2xl transition-shadow duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(139,92,246,0.1)]">
                {/* Poster Image */}
                <div className="w-full h-full overflow-hidden">
                  <img
                    src={film.image}
                    alt={film.title}
                    className="w-full h-full object-cover filter grayscale contrast-110 group-hover:scale-105 group-hover:grayscale-0 group-hover:contrast-100 transition-all duration-700 ease-out"
                  />
                </div>

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90 group-hover:opacity-85 transition-opacity duration-300 pointer-events-none" />

                {/* Translucent Details Overlay at bottom */}
                <div className="absolute bottom-0 inset-x-0 p-5 bg-[#09090b]/80 backdrop-blur-md border-t border-white/10 flex flex-col gap-1.5 transition-colors duration-300 group-hover:bg-[#09090b]/95 group-hover:border-purple-500/20">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-sans text-[11px] tracking-[0.25em] font-medium text-white/90 uppercase truncate">
                      {film.title}
                    </span>
                    <span className="font-sans text-[9px] tracking-[0.1em] font-light text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 shrink-0">
                      {film.year}
                    </span>
                  </div>
                  
                  <div className="h-[1px] w-full bg-white/5 my-1" />
                  
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[8px] tracking-[0.15em] uppercase text-zinc-500">
                      <span>ROLE</span>
                      <span className="text-zinc-300 font-light truncate max-w-[150px]">{film.role}</span>
                    </div>
                    <div className="flex justify-between text-[8px] tracking-[0.15em] uppercase text-zinc-500">
                      <span>DIRECTOR</span>
                      <span className="text-zinc-300 font-light truncate max-w-[150px]">{film.director}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          VIP CONTACT & EPK DOWNLOAD SECTION
          ========================================================================= */}
      {/* =========================================================================
          VIP CONTACT & SOCIALS GRID SECTION
          ========================================================================= */}
      <section id="contact" className="w-full max-w-6xl mx-auto px-6 py-16 md:py-24 relative z-10 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          
          {/* Left Column: VIP Contact Form */}
          <div className="flex flex-col gap-8 justify-between w-full">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-6 bg-zinc-700"></span>
                <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-light">
                  VIP INQUIRIES
                </span>
              </div>
              <h2 className="font-cinzel text-2xl md:text-4xl font-medium tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400 mt-1">
                SECURE PORTAL
              </h2>
              <p className="text-xs text-zinc-500 font-light leading-relaxed tracking-wider max-w-md">
                For casting directors, representation, and production inquiries, please submit a secured message below. A representative will respond within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">NAME</label>
                <input 
                  type="text" 
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="Your name" 
                  required
                  disabled={isSubmitting || submitted}
                  className="w-full px-5 py-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-zinc-600 text-xs tracking-wider transition-all duration-300 focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:outline-none disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  placeholder="your.email@domain.com" 
                  required
                  disabled={isSubmitting || submitted}
                  className="w-full px-5 py-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-zinc-600 text-xs tracking-wider transition-all duration-300 focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:outline-none disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">MESSAGE</label>
                <textarea 
                  rows="4" 
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder="Specify project details, timeline, or casting requirements..." 
                  required
                  disabled={isSubmitting || submitted}
                  className="w-full px-5 py-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-zinc-600 text-xs tracking-wider transition-all duration-300 focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:outline-none resize-none disabled:opacity-50"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || submitted || !formState.name || !formState.email || !formState.message}
                className="w-full py-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white text-[10px] tracking-[0.25em] uppercase font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-3 w-3 border-2 border-white/50 border-t-white rounded-full" />
                    <span>SENDING...</span>
                  </span>
                ) : submitted ? (
                  <span className="text-purple-400 font-bold">MESSAGE RECEIVED ✓</span>
                ) : (
                  <span>SEND MESSAGE</span>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Premium Minimalist Social Links Grid */}
          <div className="flex flex-col justify-between p-8 md:p-10 rounded-3xl border border-white/10 bg-zinc-950/20 backdrop-blur-md h-full">
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-6 bg-zinc-700"></span>
                <span className="text-[10px] tracking-[0.3em] uppercase text-purple-400 font-semibold">
                  CONNECT
                </span>
              </div>
              <h2 className="font-cinzel text-2xl md:text-3xl font-medium tracking-[0.2em] text-white mt-1">
                DIGITAL TOUCHPOINTS
              </h2>
              <p className="text-xs text-zinc-500 font-light leading-relaxed tracking-wider max-w-sm">
                Explore official databases, social platforms, and talent representation profiles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
              {/* Instagram Card */}
              {profile.socials?.instagram && (
                <a
                  href={profile.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col justify-between p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-zinc-500 group-hover:text-purple-400 transition-colors"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-col gap-0.5 mt-8">
                    <span className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light">Instagram</span>
                    <span className="text-xs text-zinc-300 font-medium tracking-wide font-sans">@dinuka_s</span>
                  </div>
                </a>
              )}

              {/* IMDb Card */}
              {profile.socials?.imdb && (
                <a
                  href={profile.socials.imdb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col justify-between p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <Film className="w-5 h-5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-col gap-0.5 mt-8">
                    <span className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light">IMDb</span>
                    <span className="text-xs text-zinc-300 font-medium tracking-wide font-sans">Official Profile</span>
                  </div>
                </a>
              )}

              {/* YouTube Card */}
              {profile.socials?.youtube && (
                <a
                  href={profile.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col justify-between p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5 text-zinc-500 group-hover:text-purple-400 transition-colors"
                    >
                      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
                      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                    </svg>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-col gap-0.5 mt-8">
                    <span className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light">YouTube</span>
                    <span className="text-xs text-zinc-300 font-medium tracking-wide font-sans">Official Channel</span>
                  </div>
                </a>
              )}

              {/* LinkedIn / Agency Card */}
              {profile.socials?.agency && (
                <a
                  href={profile.socials.agency}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col justify-between p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <LinkIcon className="w-5 h-5 text-zinc-500 group-hover:text-purple-400 transition-colors" />
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-col gap-0.5 mt-8">
                    <span className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light">LinkedIn / Agency</span>
                    <span className="text-xs text-zinc-300 font-medium tracking-wide font-sans">Talent Representation</span>
                  </div>
                </a>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          FOOTER SECTION
          ========================================================================= */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center z-10 gap-6 mt-16">
        <div className="flex flex-col gap-1.5 text-center md:text-left select-none">
          <span className="text-[9px] tracking-[0.4em] uppercase text-zinc-500 font-medium">
            AN ÉCLAT PREMIUM EXPERIENCE
          </span>
          <span className="text-[8px] tracking-[0.2em] uppercase text-zinc-600 font-light">
            © {new Date().getFullYear()}
          </span>
        </div>
        
        {/* Animated Scroll Up Button */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer focus:outline-none group/btn"
        >
          <span className="text-[8px] tracking-[0.3em] uppercase text-zinc-500 font-light group-hover/btn:text-white transition-colors duration-300">
            Back to top
          </span>
          <div className="h-8 w-[1px] bg-gradient-to-b from-zinc-500 to-transparent relative overflow-hidden">
            <motion.div 
              animate={{ y: [0, -32] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} 
              className="absolute bottom-0 left-0 w-full h-3 bg-white" 
            />
          </div>
        </button>
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

              {/* Video Element or Embed */}
              {profile.showreelUrl && (profile.showreelUrl.includes('youtube') || profile.showreelUrl.includes('youtu.be') || profile.showreelUrl.includes('vimeo')) ? (
                <iframe
                  src={getEmbedUrl(profile.showreelUrl)}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Showreel"
                />
              ) : (
                <>
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
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl bg-zinc-950/80 backdrop-blur-xl border border-purple-500/30 text-white shadow-2xl flex items-center gap-3"
          >
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-ping" />
            <span className="text-[10px] tracking-[0.2em] font-medium uppercase">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
