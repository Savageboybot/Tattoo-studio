import React, { useState } from 'react';
import { 
  Search, CheckCircle, Clock, Calendar as CalendarIcon, 
  ExternalLink, Download, PenTool, ShieldCheck, 
  ArrowRight, Sparkles, MessageSquare, Mail, RefreshCw
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../types';
import { 
  getStoredAppointments, 
  advanceAppointmentStatus, 
  approveSketch, 
  sendSimulatedEmailReminder 
} from '../utils/storage';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

interface StatusTrackerProps {
  initialBookingCode?: string;
  onOpenBooking: () => void;
  onOpenReviewModal: (appointment: Appointment) => void;
  onOpenEmailPreview: (appointment: Appointment) => void;
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({
  initialBookingCode = 'INK-8492',
  onOpenBooking,
  onOpenReviewModal,
  onOpenEmailPreview
}) => {
  const [searchInput, setSearchInput] = useState<string>(initialBookingCode);
  const [activeCode, setActiveCode] = useState<string>(initialBookingCode);
  const [appointments, setAppointments] = useState<Appointment[]>(getStoredAppointments());
  const [clientFeedback, setClientFeedback] = useState<string>('');
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [inspectImageModal, setInspectImageModal] = useState<string | null>(null);

  // Refresh appointments from storage
  const refreshData = () => {
    setAppointments(getStoredAppointments());
  };

  // Find currently viewed appointment
  const currentAppointment = appointments.find(
    a => a.bookingCode.trim().toUpperCase() === activeCode.trim().toUpperCase() || a.id === activeCode.trim()
  ) || appointments[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveCode(searchInput.trim());
      refreshData();
    }
  };

  // Simulation controls for real-time testing
  const handleSimulateStatus = (status: AppointmentStatus, note?: string) => {
    if (!currentAppointment) return;
    advanceAppointmentStatus(currentAppointment.id, status, note);
    refreshData();
  };

  const handleApproveCurrentSketch = (sketchId: string) => {
    if (!currentAppointment) return;
    approveSketch(currentAppointment.id, sketchId, clientFeedback);
    setFeedbackSuccess('Digital stencil drawing approved! Your artist has been notified to print thermal stencils.');
    setClientFeedback('');
    refreshData();
    setTimeout(() => setFeedbackSuccess(null), 5000);
  };

  const handleTriggerSimulatedReminder = (type: 'prep_guide_48h' | 'sketch_ready' | 'reminder_24h') => {
    if (!currentAppointment) return;
    sendSimulatedEmailReminder(currentAppointment.id, type);
    refreshData();
    onOpenEmailPreview(currentAppointment);
  };

  if (!currentAppointment) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h3 className="text-xl font-bold text-white mb-2">No Appointment Found</h3>
        <p className="text-sm text-zinc-400 mb-6">We could not locate an appointment with code "{activeCode}".</p>
        <button
          onClick={onOpenBooking}
          className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 rounded-lg hover:bg-amber-300"
        >
          Book a Tattoo Session
        </button>
      </div>
    );
  }

  const latestSketch = currentAppointment.tattooDetails.artistSketches[0];
  const primaryInspo = currentAppointment.tattooDetails.referenceImages[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Search and Quick Selector Bar */}
      <div className="bg-[#111317] border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Real-Time Appointment & Drawing Tracker</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-1">
              Tracking Booking Reference: <span className="text-amber-400 font-mono">{currentAppointment.bookingCode}</span>
            </h2>
          </div>

          {/* Quick search input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Enter INK-XXXX..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
            >
              Lookup
            </button>
          </form>
        </div>

        {/* Quick select active bookings */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span className="font-mono text-[11px] uppercase text-zinc-400">Active Bookings:</span>
          {appointments.map(a => (
            <button
              key={a.id}
              onClick={() => {
                setActiveCode(a.bookingCode);
                setSearchInput(a.bookingCode);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                a.bookingCode === currentAppointment.bookingCode
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              {a.bookingCode} · {a.artistName.split(' ')[0]} ({a.status.replace(/_/g, ' ')})
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Details + Interactive Stencil + Real-time Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Digital Stencil Review + Details + Upfront Fee */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* DIGITAL STENCIL & DRAWING INSPECTION PANE */}
          <div className="bg-[#111317] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Custom Tattoo Drawing Stencil Proof</span>
                </span>
                <h3 className="text-lg font-display font-bold text-white mt-0.5">
                  Artist Stencil Draft: {latestSketch?.title || 'Linework Composition'}
                </h3>
              </div>
              
              <div className="text-right">
                <span className={`text-xs font-mono px-2.5 py-1 rounded-md border ${
                  latestSketch?.isApproved || currentAppointment.status === 'design_approved' || currentAppointment.status === 'session_confirmed'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold'
                    : 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                }`}>
                  {latestSketch?.isApproved || currentAppointment.status === 'design_approved' || currentAppointment.status === 'session_confirmed'
                    ? 'APPROVED BY CLIENT'
                    : 'AWAITING CLIENT APPROVAL'}
                </span>
              </div>
            </div>

            {/* Side-by-Side: Customer Inspo Reference vs. Artist's Bespoke Tattoo Drawing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Inspo photo */}
              <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono">
                  <span>Client Reference Inspo</span>
                  <span>{primaryInspo?.name?.slice(0, 20)}...</span>
                </div>
                <div 
                  onClick={() => primaryInspo && setInspectImageModal(primaryInspo.url)}
                  className="relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 aspect-[4/3] cursor-pointer group"
                >
                  {primaryInspo ? (
                    <img
                      src={primaryInspo.url}
                      alt="Client tattoo reference inspiration"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                      No reference attached
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-xs bg-black/80 px-2 py-1 rounded text-white font-mono">Click to Inspect</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 mt-2 italic">
                  "{primaryInspo?.notes || 'Customer inspiration reference'}"
                </p>
              </div>

              {/* Artist's Drawn Stencil */}
              <div className="p-3 rounded-xl bg-zinc-900/70 border border-amber-500/20">
                <div className="flex items-center justify-between text-xs text-amber-400 mb-2 font-mono">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Artist Stencil Proof</span>
                  </span>
                  <span>Version {latestSketch?.version || 1}.0</span>
                </div>
                <div
                  onClick={() => latestSketch && setInspectImageModal(latestSketch.url)}
                  className="relative rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 aspect-[4/3] cursor-pointer group"
                >
                  {latestSketch ? (
                    <img
                      src={latestSketch.url}
                      alt="Artist custom tattoo drawing stencil proof"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                      Draft in queue
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-xs bg-black/80 px-2 py-1 rounded text-white font-mono">Click to Inspect Stencil</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-300 mt-2">
                  {latestSketch?.notes || `${currentAppointment.artistName} is finalizing fine-line stencils.`}
                </p>
              </div>
            </div>

            {/* Approval and Feedback Controls */}
            {feedbackSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{feedbackSuccess}</span>
              </div>
            )}

            {!(latestSketch?.isApproved || currentAppointment.status === 'design_approved' || currentAppointment.status === 'session_confirmed' || currentAppointment.status === 'completed') ? (
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300">
                  Client Stencil Feedback & Approval Form
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={clientFeedback}
                    onChange={e => setClientFeedback(e.target.value)}
                    placeholder="e.g. 'Looks beautiful! Can we curve the lower stem slightly?' or 'Approved as is!'"
                    className="flex-1 px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => latestSketch && handleApproveCurrentSketch(latestSketch.id)}
                    className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve Stencil Drawing</span>
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Approving confirms your stencil design. Once approved, the artist prints thermal stencils for application on session day.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-zinc-300 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>Digital Drawing Approved. Your stencil is locked for session day!</span>
                </div>
                <button
                  onClick={() => handleSimulateStatus('sketch_ready_for_review', 'Reopened sketch for revisions')}
                  className="text-xs text-zinc-400 hover:text-white underline font-mono"
                >
                  Request Changes
                </button>
              </div>
            )}
          </div>

          {/* TATTOO SPECS & UPFRONT DEPOSIT RECEIPT CARD */}
          <div className="bg-[#111317] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-display font-bold text-white flex items-center justify-between">
              <span>Tattoo Specifications & Upfront Fee Breakdown</span>
              <span className="text-xs font-mono text-zinc-400 font-normal">
                Receipt: {currentAppointment.payment.receiptNumber}
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 uppercase font-mono text-[10px] block">Placement</span>
                <span className="font-semibold text-white mt-0.5 block">{currentAppointment.tattooDetails.placement}</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 uppercase font-mono text-[10px] block">Size</span>
                <span className="font-semibold text-white mt-0.5 block">{currentAppointment.tattooDetails.size}</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 uppercase font-mono text-[10px] block">Style</span>
                <span className="font-semibold text-white mt-0.5 block">{currentAppointment.tattooDetails.style}</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 uppercase font-mono text-[10px] block">Palette</span>
                <span className="font-semibold text-white mt-0.5 block">{currentAppointment.tattooDetails.colorPreference}</span>
              </div>
            </div>

            {/* Upfront payment row */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <span className="text-zinc-400 block font-mono">
                  Upfront Fee Paid via {currentAppointment.payment.paymentMethod.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-white font-mono text-sm font-bold tabular-nums">
                  ${currentAppointment.payment.totalPaid}.00 Paid ($50 Drawing Fee + ${currentAppointment.payment.depositAmount} Deposit)
                </span>
                <span className="text-zinc-500 block text-[11px] mt-0.5 font-mono">
                  Txn ID: {currentAppointment.payment.transactionId} · {new Date(currentAppointment.payment.paidAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <a
                  href={generateGoogleCalendarUrl(currentAppointment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>Google Calendar</span>
                </a>
                <button
                  type="button"
                  onClick={() => downloadIcsFile(currentAppointment)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>.ICS File</span>
                </button>
              </div>
            </div>
          </div>

          {/* SIMULATOR CONTROLS BAR (FOR INTERACTIVE REAL-TIME VERIFICATION) */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Live Studio Progression Simulator</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">Click to advance real-time status:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSimulateStatus('sketch_in_progress', `${currentAppointment.artistName} began drafting stencils`)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                  currentAppointment.status === 'sketch_in_progress'
                    ? 'bg-amber-400 text-black border-amber-400 font-bold'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                1. Sketch In Progress
              </button>
              
              <button
                type="button"
                onClick={() => handleSimulateStatus('sketch_ready_for_review', 'Artist uploaded draft stencil proof')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                  currentAppointment.status === 'sketch_ready_for_review'
                    ? 'bg-amber-400 text-black border-amber-400 font-bold'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                2. Sketch Ready for Review
              </button>

              <button
                type="button"
                onClick={() => handleSimulateStatus('design_approved', 'Client approved stencil drawing')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                  currentAppointment.status === 'design_approved'
                    ? 'bg-amber-400 text-black border-amber-400 font-bold'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                3. Design Approved
              </button>

              <button
                type="button"
                onClick={() => handleSimulateStatus('session_confirmed', 'Studio chair and needles prepared')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                  currentAppointment.status === 'session_confirmed'
                    ? 'bg-amber-400 text-black border-amber-400 font-bold'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                4. Session Confirmed
              </button>

              <button
                type="button"
                onClick={() => handleSimulateStatus('completed', 'Tattoo inked and SecondSkin applied')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                  currentAppointment.status === 'completed'
                    ? 'bg-emerald-400 text-black border-emerald-400 font-bold'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                5. Completed (Invite Review)
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-zinc-400 font-mono">
                Automated Email Reminders & Notifications:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleTriggerSimulatedReminder('prep_guide_48h')}
                  className="px-2.5 py-1 text-[11px] rounded bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 flex items-center gap-1 font-mono"
                >
                  <Mail className="w-3 h-3" />
                  <span>Send Test 48h Prep Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenEmailPreview(currentAppointment)}
                  className="px-2.5 py-1 text-[11px] rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-mono"
                >
                  View Reminders Log ({currentAppointment.reminders.length})
                </button>
              </div>
            </div>
          </div>

          {/* If completed, prompt review */}
          {currentAppointment.status === 'completed' && !currentAppointment.reviewSubmitted && (
            <div className="p-5 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">Your tattoo session is completed!</p>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Share your experience with {currentAppointment.artistName} and help future clients see your healed piece.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenReviewModal(currentAppointment)}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap"
              >
                Leave a Review
              </button>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Real-Time Status Timeline */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#111317] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                Live Timeline
              </span>
              <h3 className="text-lg font-display font-bold text-white mt-0.5">
                Appointment Lifecycle
              </h3>
            </div>

            {/* Vertical timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
              {currentAppointment.timeline.map((item, idx) => {
                const isCurrent = item.status === currentAppointment.status;
                return (
                  <div key={idx} className="relative group">
                    {/* Node marker */}
                    <div
                      className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.completed
                          ? 'bg-amber-400 border-amber-400 text-black'
                          : isCurrent
                          ? 'bg-zinc-950 border-amber-400 text-amber-400'
                          : 'bg-zinc-900 border-zinc-700 text-zinc-600'
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle className="w-3 h-3 stroke-[3]" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-amber-400' : item.completed ? 'text-white' : 'text-zinc-500'}`}>
                          {item.title}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                        {item.timestamp}
                      </span>
                      <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Artist Card */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
              <img
                src={currentAppointment.artistAvatar}
                alt={currentAppointment.artistName}
                className="w-12 h-12 rounded-full object-cover border border-zinc-700 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-mono uppercase tracking-wider text-amber-400">Assigned Artist</p>
                <p className="text-sm font-bold text-white truncate">{currentAppointment.artistName}</p>
                <p className="text-xs text-zinc-400 font-mono">
                  {currentAppointment.date} · {currentAppointment.timeSlot.split('-')[0]}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Inspect Image Modal */}
      {inspectImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-4xl max-h-[90vh] bg-zinc-950 p-2 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col">
            <button
              onClick={() => setInspectImageModal(null)}
              className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-mono border border-zinc-700 hover:bg-zinc-800"
            >
              Close (✕)
            </button>
            <img
              src={inspectImageModal}
              alt="High resolution tattoo drawing inspection"
              className="w-full h-auto max-h-[82vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
