'use client';

import { useState, useEffect } from 'react';
import { getProfile, saveProfile, loginUser, updateAdminCredentials, uploadImage } from './actions';
import { Save, ArrowLeft, CheckCircle, Loader2, ShieldAlert, Upload, Image as ImageIcon } from 'lucide-react';

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // { name, email, role }
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  // Account Settings States
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsError, setSettingsError] = useState(null);
  const [settingsSuccess, setSettingsSuccess] = useState(null);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Fetch initial profile data on mount
  useEffect(() => {
    async function loadData() {
      const profile = await getProfile();
      if (profile) {
        setData(profile);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthenticating(true);

    try {
      const res = await loginUser(email, password);
      if (res.success) {
        setCurrentUser(res.user);
        setIsExiting(true);
        setTimeout(() => {
          setIsAuthenticated(true);
          setAuthenticating(false);
        }, 500);
      } else {
        setAuthError(res.error || 'Invalid credentials. Please try again.');
        setAuthenticating(false);
      }
    } catch (err) {
      console.error(err);
      setAuthError('An unexpected error occurred. Please try again.');
      setAuthenticating(false);
    }
  };

  // Save changes handler
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const result = await saveProfile(data);
    setSaving(false);
    if (result.success) {
      setStatus('success');
      setTimeout(() => setStatus(null), 3000);
    } else {
      setStatus('error');
    }
  };

  // Helper functions to handle changes
  const handleGeneralChange = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleHeadshotChange = (index, key, value) => {
    setData((prev) => {
      const newHeadshots = [...prev.headshots];
      newHeadshots[index] = { ...newHeadshots[index], [key]: value };
      return { ...prev, headshots: newHeadshots };
    });
  };

  const handleFilmChange = (index, key, value) => {
    setData((prev) => {
      const newFilms = [...prev.films];
      newFilms[index] = { ...newFilms[index], [key]: value };
      return { ...prev, films: newFilms };
    });
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;

    setUploadingIndex(index);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await uploadImage(formData);
      if (res.success) {
        handleHeadshotChange(index, 'image', res.url);
      } else {
        alert(res.error || 'Failed to upload image.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during file upload.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    setSettingsError(null);
    setSettingsSuccess(null);

    if (newPassword && newPassword !== confirmPassword) {
      setSettingsError('New password and confirmation do not match.');
      return;
    }

    if (!newEmail && !newPassword) {
      setSettingsError('Please provide a new email or password to update.');
      return;
    }

    setUpdatingSettings(true);
    try {
      const res = await updateAdminCredentials(currentUser.id, newEmail, newPassword);
      if (res.success) {
        setSettingsSuccess('Credentials updated successfully! Use your new details next time.');
        if (newEmail) {
          setCurrentUser(prev => ({ ...prev, email: newEmail.toLowerCase().trim() }));
        }
        setNewEmail('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSettingsError(res.error || 'Failed to update credentials.');
      }
    } catch (err) {
      console.error(err);
      setSettingsError('An error occurred while updating credentials.');
    } finally {
      setUpdatingSettings(false);
    }
  };

  // Role permissions checker
  const isReadOnly = (section) => {
    if (!currentUser) return true;
    if (currentUser.role === 'ADMIN') return false;
    if (currentUser.role === 'MANAGER') {
      return section === 'headshots'; // Manager can't edit headshots
    }
    if (currentUser.role === 'PHOTOGRAPHER') {
      return section === 'hero' || section === 'films'; // Photographer can't edit hero or films
    }
    return true;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#060608] text-white flex flex-col justify-center items-center gap-4">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        <span className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase font-light">Loading Admin Panel...</span>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#060608] text-white flex flex-col justify-center items-center gap-4 p-6 text-center">
        <span className="text-red-500 text-xs tracking-widest uppercase">Failed to load profile database</span>
        <p className="text-zinc-500 text-[11px] max-w-xs font-light">Please verify if `src/data/profile.json` exists and is formatted correctly.</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#060608] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
        {/* Animated Purple Glow Spot */}
        <div className="absolute top-[30%] left-[30%] w-[350px] h-[350px] rounded-full bg-purple-900/10 blur-[100px] pointer-events-none mix-blend-screen z-0" />
        
        <form 
          onSubmit={handleLogin} 
          className={`relative z-10 w-full max-w-sm p-8 md:p-10 rounded-3xl border border-white/10 bg-zinc-950/40 backdrop-blur-2xl shadow-3xl flex flex-col gap-6 items-center transition-all duration-500 ease-in-out ${
            isExiting ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 animate-fade-in-up'
          }`}
        >
          <div className="flex flex-col items-center select-none text-center gap-1.5">
            <span className="font-cinzel text-xl font-bold text-white tracking-[0.4em] uppercase">ÉCLAT</span>
            <span className="font-sans text-[8px] tracking-[0.25em] uppercase text-purple-400 font-light mt-0.5">ADMIN ACCESS</span>
          </div>

          <div className="h-[1px] w-full bg-white/5" />

          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">EMAIL ADDRESS</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="actor@eclat.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-zinc-700 text-xs transition-all focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:outline-none"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">PASSWORD</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
                className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-zinc-700 text-xs transition-all focus:border-purple-500/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] focus:outline-none"
              />
            </div>

            {authError && (
              <span className="text-red-500 text-[9px] tracking-wide text-center mt-1 font-light animate-pulse">{authError}</span>
            )}
          </div>

          <button 
            type="submit"
            disabled={authenticating}
            className="w-full py-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-white/30 text-white text-[10px] tracking-[0.25em] uppercase font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
          >
            {authenticating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>VERIFYING CREDENTIALS...</span>
              </>
            ) : (
              <span>VERIFY PORTAL ACCESS</span>
            )}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#060608] text-white flex flex-col overflow-y-auto pb-32 relative animate-fade-in-up">
      
      {/* Header bar */}
      <header className="z-30 w-full px-6 py-6 border-b border-white/5 bg-[#09090b]/50 backdrop-blur-md sticky top-0">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex flex-col select-none">
            <span className="font-cinzel text-sm font-semibold text-white tracking-[0.4em] uppercase">ÉCLAT</span>
            <span className="font-sans text-[7px] tracking-[0.15em] uppercase text-purple-400 font-light mt-0.5">
              {currentUser?.role === 'ADMIN' ? 'ACTOR PORTAL' : currentUser?.role === 'MANAGER' ? 'MANAGER PORTAL' : 'PHOTOGRAPHER PORTAL'} · {currentUser?.name}
            </span>
          </div>
          
          <a 
            href="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-white text-[10px] tracking-[0.2em] font-light transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>VIEW LANDING PAGE</span>
          </a>
        </div>
      </header>

      {/* Main Form Area */}
      <form onSubmit={handleSave} className="w-full max-w-5xl mx-auto px-6 py-12 flex flex-col gap-12">
        
        {/* Section 1: Hero & Profile Details */}
        <section className="flex flex-col gap-6 p-6 md:p-8 rounded-2xl border border-white/10 bg-zinc-950/20 backdrop-blur-sm shadow-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-6 bg-purple-500/50"></span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-medium">HERO & INTRODUCTION</span>
            </div>
            {isReadOnly('hero') && (
              <span className="flex items-center gap-1 text-[8px] tracking-[0.25em] bg-purple-950/30 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded uppercase font-light">
                <ShieldAlert className="w-2.5 h-2.5" /> READ-ONLY (ROLE RESTRICTED)
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">FIRST NAME</label>
              <input 
                type="text" 
                value={data.firstName}
                onChange={(e) => handleGeneralChange('firstName', e.target.value)}
                disabled={isReadOnly('hero')}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-zinc-700 text-xs tracking-wider transition-all focus:border-purple-500/50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">LAST NAME</label>
              <input 
                type="text" 
                value={data.lastName}
                onChange={(e) => handleGeneralChange('lastName', e.target.value)}
                disabled={isReadOnly('hero')}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-zinc-700 text-xs tracking-wider transition-all focus:border-purple-500/50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                required
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[9px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">SUBTITLE</label>
              <input 
                type="text" 
                value={data.subtitle}
                onChange={(e) => handleGeneralChange('subtitle', e.target.value)}
                disabled={isReadOnly('hero')}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-zinc-700 text-xs tracking-wider transition-all focus:border-purple-500/50 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                required
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[9px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">BIOGRAPHY DESCRIPTION</label>
              <textarea 
                rows="4"
                value={data.description}
                onChange={(e) => handleGeneralChange('description', e.target.value)}
                disabled={isReadOnly('hero')}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-zinc-700 text-xs tracking-wider transition-all focus:border-purple-500/50 focus:outline-none resize-none disabled:opacity-40 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>
        </section>

        {/* Section 2: Headshot Gallery */}
        <section className="flex flex-col gap-6 p-6 md:p-8 rounded-2xl border border-white/10 bg-zinc-950/20 backdrop-blur-sm shadow-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-6 bg-purple-500/50"></span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-medium">INTERACTIVE HEADSHOTS GALLERY</span>
            </div>
            {isReadOnly('headshots') && (
              <span className="flex items-center gap-1 text-[8px] tracking-[0.25em] bg-purple-950/30 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded uppercase font-light">
                <ShieldAlert className="w-2.5 h-2.5" /> READ-ONLY (ROLE RESTRICTED)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            {data.headshots.map((item, index) => (
              <div key={item.id} className="p-5 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 relative">
                <div className="absolute top-4 right-4 bg-zinc-800 text-zinc-400 rounded-full px-2 py-0.5 text-[8px] tracking-wider uppercase font-semibold">
                  Card {index + 1}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">PORTRAIT TITLE</label>
                  <input 
                    type="text" 
                    value={item.title}
                    onChange={(e) => handleHeadshotChange(index, 'title', e.target.value)}
                    disabled={isReadOnly('headshots')}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.02] border border-white/10 text-white text-[11px] tracking-wide focus:border-purple-500/30 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">THEME SUBTITLE</label>
                  <input 
                    type="text" 
                    value={item.subtitle}
                    onChange={(e) => handleHeadshotChange(index, 'subtitle', e.target.value)}
                    disabled={isReadOnly('headshots')}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.02] border border-white/10 text-white text-[11px] tracking-wide focus:border-purple-500/30 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">PORTRAIT IMAGE</label>
                  
                  <div className="flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                    {/* Thumbnail preview */}
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-zinc-900 border border-white/10 flex-shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.title || "Preview"} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-zinc-700" />
                      )}
                      
                      {uploadingIndex === index && (
                        <div className="absolute inset-0 bg-[#060608]/75 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Upload button wrapper */}
                    <div className="flex flex-col gap-1.5 flex-grow">
                      <span className="text-[9px] text-zinc-500 tracking-wide font-light truncate max-w-[180px]">
                        {item.image ? item.image.split('/').pop() : 'No file uploaded'}
                      </span>
                      
                      <label className={`group/btn px-4 py-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-white text-[9px] tracking-wider uppercase font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${isReadOnly('headshots') ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}>
                        <Upload className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-white transition-colors" />
                        <span>Upload New Image</span>
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(index, e.target.files[0])}
                          disabled={isReadOnly('headshots')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">ASPECT RATIO</label>
                    <select
                      value={item.aspect}
                      onChange={(e) => handleHeadshotChange(index, 'aspect', e.target.value)}
                      disabled={isReadOnly('headshots')}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-[10px] tracking-wide focus:border-purple-500/30 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <option value="3/3.8">Short Portrait (3/3.8)</option>
                      <option value="3/4">Standard (3/4)</option>
                      <option value="3/4.6">Tall Portrait (3/4.6)</option>
                      <option value="3/4.8">Cinema Portrait (3/4.8)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">GRID OFFSET</label>
                    <select
                      value={item.offset}
                      onChange={(e) => handleHeadshotChange(index, 'offset', e.target.value)}
                      disabled={isReadOnly('headshots')}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-[10px] tracking-wide focus:border-purple-500/30 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <option value="md:mt-0">Align Top (0px)</option>
                      <option value="md:mt-6">Slight Offset (24px)</option>
                      <option value="md:mt-16">Medium Offset (64px)</option>
                      <option value="md:mt-24">Deep Offset (96px)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Filmography */}
        <section className="flex flex-col gap-6 p-6 md:p-8 rounded-2xl border border-white/10 bg-zinc-950/20 backdrop-blur-sm shadow-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-6 bg-purple-500/50"></span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-medium">FILMOGRAPHY ARCHIVES</span>
            </div>
            {isReadOnly('films') && (
              <span className="flex items-center gap-1 text-[8px] tracking-[0.25em] bg-purple-950/30 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded uppercase font-light">
                <ShieldAlert className="w-2.5 h-2.5" /> READ-ONLY (ROLE RESTRICTED)
              </span>
            )}
          </div>

          <div className="flex flex-col gap-6 mt-4">
            {data.films.map((film, index) => (
              <div key={film.id} className="p-5 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-4 relative">
                <div className="absolute top-4 right-4 bg-zinc-800 text-zinc-400 rounded-full px-2 py-0.5 text-[8px] tracking-wider uppercase font-semibold">
                  Movie {index + 1}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">FILM TITLE</label>
                    <input 
                      type="text" 
                      value={film.title}
                      onChange={(e) => handleFilmChange(index, 'title', e.target.value)}
                      disabled={isReadOnly('films')}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.02] border border-white/10 text-white text-[11px] tracking-wide focus:border-purple-500/30 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">RELEASE YEAR</label>
                    <input 
                      type="text" 
                      value={film.year}
                      onChange={(e) => handleFilmChange(index, 'year', e.target.value)}
                      disabled={isReadOnly('films')}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.02] border border-white/10 text-white text-[11px] tracking-wide focus:border-purple-500/30 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">ACTOR ROLE</label>
                    <input 
                      type="text" 
                      value={film.role}
                      onChange={(e) => handleFilmChange(index, 'role', e.target.value)}
                      disabled={isReadOnly('films')}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.02] border border-white/10 text-white text-[11px] tracking-wide focus:border-purple-500/30 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">DIRECTOR</label>
                    <input 
                      type="text" 
                      value={film.director}
                      onChange={(e) => handleFilmChange(index, 'director', e.target.value)}
                      disabled={isReadOnly('films')}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.02] border border-white/10 text-white text-[11px] tracking-wide focus:border-purple-500/30 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">UNSPLASH POSTER IMAGE URL</label>
                  <input 
                    type="url" 
                    value={film.image}
                    onChange={(e) => handleFilmChange(index, 'image', e.target.value)}
                    disabled={isReadOnly('films')}
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.02] border border-white/10 text-white text-[10px] tracking-wide focus:border-purple-500/30 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

      </form>

      {/* Account Settings Section - Admin Only */}
      {currentUser?.role === 'ADMIN' && (
        <div className="w-full max-w-5xl mx-auto px-6 pb-12">
          <form onSubmit={handleUpdateCredentials} className="flex flex-col gap-6 p-6 md:p-8 rounded-2xl border border-white/10 bg-zinc-950/20 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-6 bg-purple-500/50"></span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-medium">ACCOUNT SECURITY SETTINGS</span>
            </div>
            
            <p className="text-zinc-500 text-[10px] tracking-wide font-light max-w-lg">
              Update your Admin login credentials here. Leave any field blank to keep its current value.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">NEW EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={currentUser.email}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-zinc-700 text-xs tracking-wider transition-all focus:border-purple-500/50 focus:outline-none"
                />
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">NEW PASSWORD</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-zinc-700 text-xs tracking-wider transition-all focus:border-purple-500/50 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[8px] tracking-[0.2em] uppercase text-zinc-500 font-light ml-1">CONFIRM PASSWORD</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-zinc-700 text-xs tracking-wider transition-all focus:border-purple-500/50 focus:outline-none"
                />
              </div>
            </div>

            {settingsError && (
              <span className="text-red-500 text-[9px] tracking-wide mt-1 font-light">{settingsError}</span>
            )}

            {settingsSuccess && (
              <span className="text-purple-400 text-[10px] tracking-wide mt-1 font-semibold uppercase">{settingsSuccess}</span>
            )}

            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={updatingSettings}
                className="px-6 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white text-[9px] tracking-[0.25em] uppercase font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {updatingSettings ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>UPDATING CREDENTIALS...</span>
                  </>
                ) : (
                  <span>UPDATE CREDENTIALS</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Save Actions bar */}
      <div className="fixed bottom-0 inset-x-0 py-6 px-6 bg-[#060608]/80 backdrop-blur-lg border-t border-white/5 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {status === 'success' && (
              <span className="flex items-center gap-2 text-purple-400 text-[10px] tracking-widest font-bold uppercase select-none transition-all">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                <span>CHANGES SAVED SUCCESSFULLY</span>
              </span>
            )}
            {status === 'error' && (
              <span className="text-red-500 text-[10px] tracking-widest font-bold uppercase select-none transition-all">
                FAILED TO SAVE CHANGES
              </span>
            )}
            {!status && (
              <span className="text-zinc-500 text-[9px] tracking-widest uppercase font-light select-none">
                Unsaved modifications exist in memory.
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="group px-8 py-4 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/10 text-white text-[10px] tracking-[0.25em] uppercase font-semibold transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:border-purple-500/30 hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>SAVING CHANGES...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>SAVE CHANGES</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
