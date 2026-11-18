import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import type { UserProfile } from '../types/marketplace';

export type ActiveTab = 'marketplace' | 'kuppi' | 'sell' | 'orders' | 'ai' | 'profile';

interface TopNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentUser: UserProfile | null;
  onOpenGate: () => void;
}

const NAV_ITEMS: Array<{ id: ActiveTab; label: string }> = [
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'kuppi', label: 'Kuppi & Study' },
  { id: 'sell', label: 'Sell & Free' },
  { id: 'orders', label: 'Orders' },
  { id: 'ai', label: 'Campus AI' },
  { id: 'profile', label: 'My Profile' },
];

export function TopNav({ activeTab, onSelectTab, currentUser, onOpenGate }: TopNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 pt-3 px-4 sm:px-6 pointer-events-none">
      <div className="max-w-[1240px] mx-auto pointer-events-auto">
        <div className="glass-nav rounded-2xl px-4 sm:px-5 h-16 flex items-center justify-between gap-3 lg:gap-6">
          {/* Zone 1: Brand Emblem + Single-line Wordmark */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => handleNavClick('marketplace')}
            className="inline-flex items-center gap-2.5 font-display text-base sm:text-lg font-bold tracking-tight text-[#0B1F3A] whitespace-nowrap shrink-0 cursor-pointer pr-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B1F3A]"
          >
            <img
              src="/src/assets/images/sliit_hub_emblem.png"
              alt="SLIIT Freelance Hub logo"
              className="w-8 h-8 rounded-xl object-cover shadow-xs border border-white/80 shrink-0"
            />
            <span>SLIIT Freelance Hub</span>
          </motion.button>

          {/* Zone 2: Animated Frosted Navigation Rail */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-1 bg-slate-900/[0.045] p-1 rounded-xl border border-white/70"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative px-3 py-2 rounded-lg text-[13px] font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B1F3A] ${
                    isActive ? 'text-[#0B1F3A]' : 'text-slate-600 hover:text-[#0B1F3A]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="topnav-active-pill"
                      transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                      className="absolute inset-0 bg-white/95 rounded-lg shadow-sm ring-1 ring-slate-900/5"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Drawer Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenGate}
              className="hidden sm:inline-flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-xl whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer bg-[#0B1F3A] text-white hover:bg-slate-800 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B1F3A]"
            >
              {currentUser ? `${currentUser.displayName.split(' ')[0]} · ${currentUser.sliitStudentId}` : 'Verify SLIIT Access'}
            </motion.button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden p-2.5 rounded-xl text-slate-700 hover:bg-white/70 border border-white/60 focus-visible:outline-2 focus-visible:outline-[#0B1F3A]"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Animated Tablet/Mobile Frosted Glass Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden mt-2 glass-panel rounded-2xl p-3 space-y-1.5"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-white text-[#0B1F3A] shadow-xs ring-1 ring-slate-900/5'
                        : 'text-slate-700 hover:bg-white/60'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onOpenGate();
                }}
                className="w-full mt-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#0B1F3A] text-white text-center shadow-xs"
              >
                {currentUser ? `${currentUser.displayName} (${currentUser.sliitStudentId})` : 'Verify SLIIT Access'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
