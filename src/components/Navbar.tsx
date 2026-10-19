import React, { useState } from 'react';
import { Calendar, User, Compass, Star, Clock, Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: 'book' | 'tracker' | 'dashboard' | 'artists' | 'reviews';
  onSelectTab: (tab: 'book' | 'tracker' | 'dashboard' | 'artists' | 'reviews') => void;
  onOpenBooking: () => void;
  activeBookingCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenBooking,
  activeBookingCount = 0
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: 'book' | 'tracker' | 'dashboard' | 'artists' | 'reviews') => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d0f12]/95 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('dashboard')}
              className="text-left group flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-amber-400 font-display font-bold text-lg group-hover:border-amber-500/50 transition-colors">
                AN
              </div>
              <div>
                <span className="font-display font-bold text-lg tracking-wider text-white uppercase block leading-tight">
                  ATELIER NOIR
                </span>
                <span className="text-[11px] font-mono tracking-widest text-zinc-400 block uppercase">
                  Tattoo Drawing & Atelier
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-300">
            <button
              onClick={() => handleNavClick('tracker')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'tracker' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Track Drawing & Status</span>
              {activeBookingCount > 0 && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  {activeBookingCount} Active
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('dashboard')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'dashboard' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              <User className="w-4 h-4 text-zinc-400" />
              <span>Client Dashboard</span>
            </button>

            <button
              onClick={() => handleNavClick('artists')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'artists' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              <Compass className="w-4 h-4 text-zinc-400" />
              <span>Studio Artists</span>
            </button>

            <button
              onClick={() => handleNavClick('reviews')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'reviews' ? 'text-amber-400 font-semibold' : ''
              }`}
            >
              <Star className="w-4 h-4 text-zinc-400" />
              <span>Reviews & Healed Work</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenBooking}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-800 flex flex-col gap-2">
            <button
              onClick={() => handleNavClick('tracker')}
              className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                Track Drawing & Status
              </span>
              {activeBookingCount > 0 && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400">
                  {activeBookingCount} Active
                </span>
              )}
            </button>
            <button
              onClick={() => handleNavClick('dashboard')}
              className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg flex items-center gap-2"
            >
              <User className="w-4 h-4 text-zinc-400" />
              Client Dashboard
            </button>
            <button
              onClick={() => handleNavClick('artists')}
              className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-zinc-400" />
              Studio Artists
            </button>
            <button
              onClick={() => handleNavClick('reviews')}
              className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg flex items-center gap-2"
            >
              <Star className="w-4 h-4 text-zinc-400" />
              Reviews & Healed Work
            </button>
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="w-full py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors"
              >
                Book Appointment
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
