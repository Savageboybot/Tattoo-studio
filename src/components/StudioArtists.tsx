import React from 'react';
import { Star, Clock, Calendar, ShieldCheck, PenTool } from 'lucide-react';
import { INITIAL_ARTISTS } from '../data/initialData';
import { Artist } from '../types';

interface StudioArtistsProps {
  onSelectArtistToBook: (artistId: string) => void;
}

export const StudioArtists: React.FC<StudioArtistsProps> = ({
  onSelectArtistToBook
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
          <span>Resident Masters</span>
          <span aria-hidden="true">·</span>
          <span>Bespoke Stencil Illustrators</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
          Resident Tattoo Artists & Illustrators
        </h2>
        <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
          Each artist specializes in distinct needle disciplines and custom drafting. Select an artist to upload your reference inspo and book a drawing session.
        </p>
      </div>

      {/* 3-in-a-Row Grid as mandated by portfolio/photography reference */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {INITIAL_ARTISTS.map(artist => (
          <div
            key={artist.id}
            className="p-6 rounded-2xl bg-[#111317] border border-zinc-800 shadow-xl flex flex-col justify-between space-y-5 hover:border-zinc-700 transition-colors group"
          >
            <div>
              {/* Avatar and rating */}
              <div className="relative aspect-square rounded-xl overflow-hidden mb-4 border border-zinc-800 bg-zinc-950">
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-black/70 backdrop-blur-md border border-zinc-700/60 flex items-center justify-between text-xs text-white">
                  <span className="font-mono text-amber-400 font-bold">
                    ${artist.hourlyRate}/hr
                  </span>
                  <span className="flex items-center gap-1 font-mono text-zinc-300">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{artist.rating}</span>
                    <span className="text-zinc-500">({artist.reviewCount})</span>
                  </span>
                </div>
              </div>

              {/* Title & Speciality */}
              <h3 className="text-lg font-display font-bold text-white">
                {artist.name}
              </h3>
              <p className="text-xs font-mono text-amber-400 mt-0.5">
                {artist.specialty}
              </p>

              {/* Bio */}
              <p className="text-xs text-zinc-300 mt-3 leading-relaxed">
                {artist.bio}
              </p>

              {/* Unboxed portfolio tags */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                {artist.portfolioTags.map((tag, idx) => (
                  <React.Fragment key={tag}>
                    <span>{tag}</span>
                    {idx < artist.portfolioTags.length - 1 && (
                      <span aria-hidden="true" className="text-zinc-600">·</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Booking action */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <div className="text-[11px] font-mono text-zinc-400">
                <span>Deposit: </span>
                <span className="text-white font-bold">${artist.depositRequired}</span>
              </div>
              <button
                type="button"
                onClick={() => onSelectArtistToBook(artist.id)}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
              >
                Book with {artist.name.split(' ')[0]}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
