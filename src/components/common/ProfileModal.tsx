import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, User, Mail, Check, Shield } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const { profile, updateProfile, isProfileModalOpen, setIsProfileModalOpen, addBanner } = useApp();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [saved, setSaved] = useState(false);

  if (!isProfileModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: name.trim() || 'Mikiyas', email: email.trim() });
    setSaved(true);
    addBanner({
      type: 'info',
      title: 'Profile Updated',
      message: `Settings saved for ${name.trim() || 'Mikiyas'}!`,
    });
    setTimeout(() => {
      setSaved(false);
      setIsProfileModalOpen(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 relative animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={() => setIsProfileModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close profile modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 font-bold text-xl">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Personal Profile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Stored securely in local browser storage
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Your Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mikiyas"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mikiyas@imakosolution.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Used for local project intake prompts and exports.</p>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Offline & Private. No cloud tracking.</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all ${
                saved
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-sky-600 hover:bg-sky-700 hover:shadow-sky-500/20 active:scale-95'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
