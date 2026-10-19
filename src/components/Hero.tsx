import React from 'react';
import { Calendar, Search, ShieldCheck, PenTool, ArrowRight } from 'lucide-react';
import { HERO_IMAGE } from '../data/initialData';

interface HeroProps {
  onOpenBooking: () => void;
  onOpenTracker: () => void;
  onExploreArtists: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenBooking,
  onOpenTracker,
  onExploreArtists
}) => {
  return (
    <div className="relative pt-6 pb-14 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-500/5 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split-Screen Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Quiet text kicker with typographic separator */}
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400/90 mb-4">
              <span>Bespoke Drawing Atelier</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span>Online Booking & Stencil Preview</span>
            </div>

            {/* Headline with balanced wrapping */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-display font-bold text-white tracking-tight leading-[1.12] mb-6 max-w-2xl text-balance">
              Custom tattoo drawing, transparent booking, and real-time design tracking.
            </h1>

            {/* Lead copy */}
            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed mb-8 max-w-xl">
              Upload your reference inspiration, collaborate directly with resident tattoo masters on custom stencils, pay upfront deposits securely, and monitor your session progress in real time.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-black bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors shadow-md whitespace-nowrap"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Tattoo Session</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenTracker}
                className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-medium text-zinc-200 bg-zinc-900 border border-zinc-700/80 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors whitespace-nowrap"
              >
                <Search className="w-4 h-4 text-zinc-400" />
                <span>Track Appointment [INK-8492]</span>
              </button>
            </div>

            {/* Subtle editorial trust markers */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400 border-t border-zinc-800/80 pt-5">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400/90" />
                <span>100% Upfront Deposit Applied to Final Price</span>
              </span>
              <span className="flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-amber-400/90" />
                <span>Digital Stencil Approval Prior to Needle</span>
              </span>
            </div>
          </div>

          {/* Right Column: High-Resolution Atelier Visual */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl group">
              <img
                src={HERO_IMAGE}
                alt="Atelier Noir master artist sketching custom linework tattoo flash"
                className="w-full h-80 sm:h-96 lg:h-[440px] object-cover object-center group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

              {/* Foreground Artist Sketch Tag Card */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-zinc-700/60 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
                    <span>Active Session</span>
                    <span aria-hidden="true">·</span>
                    <span>Elena Vance</span>
                  </div>
                  <p className="text-sm font-medium text-white mt-0.5">
                    Wild Mountain Rose & Alpine Fern
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Forearm contour stencil · 4-hour slot
                  </p>
                </div>
                <button
                  onClick={onExploreArtists}
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300 border border-amber-400/30 rounded-md hover:bg-amber-400/10 transition-colors whitespace-nowrap"
                >
                  View Artists
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width 4-metric strip below hero split as mandated */}
        <div className="mt-14 pt-8 border-t border-zinc-800/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
              <div className="text-2xl sm:text-3xl font-display font-bold text-white tabular-nums">
                2,450+
              </div>
              <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-mono">
                Custom Sketches Drawn
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
              <div className="text-2xl sm:text-3xl font-display font-bold text-amber-400 tabular-nums">
                $100
              </div>
              <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-mono">
                Transparent Upfront Deposit
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
              <div className="text-2xl sm:text-3xl font-display font-bold text-white tabular-nums">
                48 Hours
              </div>
              <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-mono">
                Digital Stencil Preview Guarantee
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
              <div className="text-2xl sm:text-3xl font-display font-bold text-white tabular-nums">
                4.98 / 5.0
              </div>
              <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-mono">
                Verified Client Rating
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
