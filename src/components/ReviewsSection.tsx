import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, ShieldCheck, Camera, Plus, X } from 'lucide-react';
import { StudioReview, Appointment } from '../types';
import { getStoredReviews, saveReview, getStoredAppointments } from '../utils/storage';
import { INITIAL_ARTISTS } from '../data/initialData';

interface ReviewsSectionProps {
  onOpenBooking: () => void;
  reviewTargetAppointment?: Appointment | null;
  onCloseTargetModal?: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  onOpenBooking,
  reviewTargetAppointment,
  onCloseTargetModal
}) => {
  const [reviews, setReviews] = useState<StudioReview[]>(getStoredReviews());
  const [artistFilter, setArtistFilter] = useState<string>('all');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(!!reviewTargetAppointment);

  // Form State
  const [clientName, setClientName] = useState<string>('Alex Rivera');
  const [artistId, setArtistId] = useState<string>(reviewTargetAppointment?.artistId || INITIAL_ARTISTS[0].id);
  const [rating, setRating] = useState<number>(5);
  const [tattooTitle, setTattooTitle] = useState<string>('Botanical Linework Forearm Piece');
  const [placement, setPlacement] = useState<string>('Forearm');
  const [comment, setComment] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = () => setReviews(getStoredReviews());
    window.addEventListener('atelier_reviews_updated', handleUpdate);
    return () => window.removeEventListener('atelier_reviews_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (reviewTargetAppointment) {
      setArtistId(reviewTargetAppointment.artistId);
      setPlacement(reviewTargetAppointment.tattooDetails.placement);
      setTattooTitle(reviewTargetAppointment.tattooDetails.style);
      setIsWriteModalOpen(true);
    }
  }, [reviewTargetAppointment]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const chosenArtist = INITIAL_ARTISTS.find(a => a.id === artistId) || INITIAL_ARTISTS[0];

    const newRev: StudioReview = {
      id: `rev-${Date.now()}`,
      appointmentId: reviewTargetAppointment?.id,
      bookingCode: reviewTargetAppointment?.bookingCode,
      clientName: clientName.trim() || 'Verified Client',
      artistId: chosenArtist.id,
      artistName: chosenArtist.name,
      rating,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      tattooTitle: tattooTitle.trim() || 'Custom Tattoo Stencil',
      placement,
      comment: comment.trim(),
      imageUrl: photoUrl || reviewTargetAppointment?.tattooDetails.artistSketches[0]?.url,
      verifiedBooking: true
    };

    saveReview(newRev);
    setIsSubmittedSuccess(true);
    setTimeout(() => {
      setIsSubmittedSuccess(false);
      setIsWriteModalOpen(false);
      if (onCloseTargetModal) onCloseTargetModal();
      setComment('');
    }, 1800);
  };

  const filteredReviews = artistFilter === 'all'
    ? reviews
    : reviews.filter(r => r.artistId === artistFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header and Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
            <span>Verified Client Feedback</span>
            <span aria-hidden="true">·</span>
            <span>Healed Tattoo Gallery</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Client Reviews & Healed Craftsmanship
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Every review is tied to an authentic drawing consultation and session booking with our resident artists.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsWriteModalOpen(true)}
            className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Leave a Review</span>
          </button>
        </div>
      </div>

      {/* Interactive Filter Segmented Control */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 mr-2 shrink-0">Filter by Artist:</span>
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
          <button
            type="button"
            onClick={() => setArtistFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              artistFilter === 'all'
                ? 'bg-amber-400 text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Artists ({reviews.length})
          </button>
          {INITIAL_ARTISTS.map(a => (
            <button
              key={a.id}
              type="button"
              onClick={() => setArtistFilter(a.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                artistFilter === a.id
                  ? 'bg-amber-400 text-black font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredReviews.map(rev => (
          <div
            key={rev.id}
            className="p-6 rounded-2xl bg-[#111317] border border-zinc-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors"
          >
            <div>
              {/* Star Rating & Verified Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`}
                    />
                  ))}
                </div>
                {rev.verifiedBooking && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Booking
                  </span>
                )}
              </div>

              {/* Title & Placement */}
              <h3 className="text-base font-bold text-white leading-snug">
                {rev.tattooTitle}
              </h3>
              
              {/* Unboxed metadata line with typographic separators */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono mt-1 mb-3">
                <span>{rev.artistName}</span>
                <span aria-hidden="true">·</span>
                <span>{rev.placement}</span>
              </div>

              {/* Comment */}
              <p className="text-xs text-zinc-300 leading-relaxed">
                "{rev.comment}"
              </p>
            </div>

            {/* Optional Photo and Reviewer Attribution */}
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">{rev.clientName}</p>
                <p className="text-[10px] text-zinc-400 font-mono">{rev.date}</p>
              </div>

              {rev.imageUrl && (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 group cursor-pointer">
                  <img
                    src={rev.imageUrl}
                    alt={rev.tattooTitle}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* WRITE A REVIEW MODAL */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#111317] border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                  Client Feedback
                </span>
                <h3 className="text-lg font-display font-bold text-white">
                  Leave a Verified Tattoo Review
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsWriteModalOpen(false);
                  if (onCloseTargetModal) onCloseTargetModal();
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSubmittedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Review Published!</h4>
                <p className="text-xs text-zinc-400">Thank you for sharing your experience with the studio.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                      Artist
                    </label>
                    <select
                      value={artistId}
                      onChange={e => setArtistId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      {INITIAL_ARTISTS.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                      Star Rating
                    </label>
                    <div className="flex items-center gap-1.5 pt-1.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400' : 'text-zinc-700'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                      Tattoo Title / Piece
                    </label>
                    <input
                      type="text"
                      value={tattooTitle}
                      onChange={e => setTattooTitle(e.target.value)}
                      placeholder="e.g. Fine-line Mountain Rose"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                      Placement
                    </label>
                    <input
                      type="text"
                      value={placement}
                      onChange={e => setPlacement(e.target.value)}
                      placeholder="e.g. Forearm, Spine, Ribs"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Your Experience & Healing Review
                  </label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    required
                    placeholder="Describe how the artist translated your reference sketch, the studio atmosphere, and how your ink healed..."
                    className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
                  >
                    Post Verified Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
