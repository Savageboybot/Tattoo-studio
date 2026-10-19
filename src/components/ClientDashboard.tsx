import React, { useState, useEffect } from 'react';
import { 
  User, Calendar as CalendarIcon, Clock, Shield, Bell, 
  ExternalLink, Download, PenTool, CheckCircle, Save, FileText, 
  Sparkles, Mail, ChevronRight, AlertCircle
} from 'lucide-react';
import { Appointment, ClientProfile } from '../types';
import { 
  getStoredAppointments, 
  getStoredClientProfile, 
  saveClientProfile 
} from '../utils/storage';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

interface ClientDashboardProps {
  onSelectAppointment: (bookingCode: string) => void;
  onOpenBooking: () => void;
  onOpenEmailPreview: (appointment: Appointment) => void;
  onOpenReviewModal: (appointment: Appointment) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  onSelectAppointment,
  onOpenBooking,
  onOpenEmailPreview,
  onOpenReviewModal
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'history' | 'profile' | 'schedule'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>(getStoredAppointments());
  const [profile, setProfile] = useState<ClientProfile>(getStoredClientProfile());
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setAppointments(getStoredAppointments());
      setProfile(getStoredClientProfile());
    };
    window.addEventListener('atelier_data_updated', handleUpdate);
    window.addEventListener('atelier_profile_updated', handleUpdate);
    return () => {
      window.removeEventListener('atelier_data_updated', handleUpdate);
      window.removeEventListener('atelier_profile_updated', handleUpdate);
    };
  }, []);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveClientProfile(profile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const activeAppointments = appointments.filter(a => a.status !== 'completed');
  const pastAppointments = appointments.filter(a => a.status === 'completed');
  const totalDepositsPaid = appointments.reduce((sum, a) => sum + (a.payment?.totalPaid || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-[#111317] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 font-display font-bold text-xl">
              {profile.name.split(' ').map(n => n[0]).join('') || 'AR'}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
                <span>Personal Client Portal</span>
                <span aria-hidden="true">·</span>
                <span>Verified Client</span>
              </div>
              <h1 className="text-2xl font-display font-bold text-white mt-0.5">
                {profile.name}
              </h1>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {profile.email} · {profile.phone}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenBooking}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              Book New Tattoo Session
            </button>
          </div>
        </div>

        {/* Quick summary stats in tabular-nums */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">Active Bookings</span>
            <span className="text-2xl font-display font-bold text-white tabular-nums mt-0.5 block">{activeAppointments.length}</span>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">Total Upfront Fees Paid</span>
            <span className="text-2xl font-display font-bold text-amber-400 tabular-nums mt-0.5 block">${totalDepositsPaid}</span>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">Stencils Awaiting Review</span>
            <span className="text-2xl font-display font-bold text-white tabular-nums mt-0.5 block">
              {appointments.filter(a => a.status === 'sketch_ready_for_review').length}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">Next Scheduled Date</span>
            <span className="text-sm font-display font-bold text-zinc-200 mt-2 block truncate">
              {activeAppointments[0]?.date ? `${activeAppointments[0].date} (${activeAppointments[0].timeSlot.split('-')[0]})` : 'None pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Tab Controls (buttons with click handlers) */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Active Bookings ({activeAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Booking History & Receipts</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Update Client Info & Sensitivities</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'schedule'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Studio Calendar & Reminders</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          {activeAppointments.length === 0 ? (
            <div className="bg-[#111317] border border-zinc-800 rounded-2xl p-10 text-center space-y-3">
              <Clock className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Active Appointments</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                You do not have any pending appointments. Book your next tattoo drawing session with one of our resident artists.
              </p>
              <button
                onClick={onOpenBooking}
                className="mt-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 rounded-lg hover:bg-amber-300"
              >
                Book a Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeAppointments.map(apt => {
                const latestSketch = apt.tattooDetails.artistSketches[0];
                return (
                  <div
                    key={apt.id}
                    className="bg-[#111317] border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5 group hover:border-zinc-700 transition-colors"
                  >
                    <div>
                      {/* Top status bar */}
                      <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3 mb-4">
                        <span className="text-xs font-mono text-amber-400 font-bold">
                          {apt.bookingCode}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {apt.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>

                      {/* Artist and session info */}
                      <div className="flex items-start gap-4">
                        <img
                          src={apt.artistAvatar}
                          alt={apt.artistName}
                          className="w-14 h-14 rounded-xl object-cover border border-zinc-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white">{apt.artistName}</p>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">{apt.tattooDetails.style}</p>
                          <p className="text-xs text-zinc-300 mt-1 font-medium">
                            {apt.tattooDetails.placement} · {apt.tattooDetails.size}
                          </p>
                        </div>
                      </div>

                      {/* Stencil preview thumbnail if available */}
                      {latestSketch && (
                        <div className="mt-4 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={latestSketch.url}
                              alt="Sketch preview"
                              className="w-10 h-10 rounded-lg object-cover border border-zinc-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="text-[11px] font-mono text-amber-400 uppercase block">Drawing Proof</span>
                              <p className="text-xs text-zinc-200 truncate">{latestSketch.title}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${latestSketch.isApproved ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-400/10 text-amber-400 border border-amber-400/30'}`}>
                            {latestSketch.isApproved ? 'Approved' : 'Review'}
                          </span>
                        </div>
                      )}

                      {/* Schedule info */}
                      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
                        <span className="flex items-center gap-1.5 text-white">
                          <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span>{apt.date}</span>
                        </span>
                        <span>{apt.timeSlot}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2 pt-2 border-t border-zinc-800">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectAppointment(apt.bookingCode)}
                          className="w-full py-2 px-3 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors text-center"
                        >
                          Track Status & Stencil
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => onOpenEmailPreview(apt)}
                          className="w-full py-2 px-3 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors flex items-center justify-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Reminders</span>
                        </button>
                      </div>

                      {/* Calendar quick sync */}
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 pt-1 font-mono">
                        <a
                          href={generateGoogleCalendarUrl(apt)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-amber-400 flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Google Cal</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => downloadIcsFile(apt)}
                          className="hover:text-amber-400 flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>Apple/ICS</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BOOKING HISTORY & RECEIPTS */}
      {activeTab === 'history' && (
        <div className="bg-[#111317] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                All Appointment Bookings & Upfront Fee Invoices
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Full chronological ledger of your tattoo requests, drawing fees, and deposit receipts.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 border-b border-zinc-800 bg-zinc-900/40">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Artist & Placement</th>
                  <th className="py-3 px-4">Session Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Upfront Paid</th>
                  <th className="py-3 px-4">Receipt / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {appointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-amber-400">
                      {apt.bookingCode}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <p className="font-semibold text-white">{apt.artistName}</p>
                      <p className="text-[11px] text-zinc-400">{apt.tattooDetails.placement}</p>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      {apt.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300">
                        {apt.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white tabular-nums">
                      ${apt.payment.totalPaid}.00
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectAppointment(apt.bookingCode)}
                          className="px-2.5 py-1 text-[11px] font-sans font-semibold rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                        >
                          View Details
                        </button>
                        {apt.status === 'completed' && !apt.reviewSubmitted && (
                          <button
                            type="button"
                            onClick={() => onOpenReviewModal(apt)}
                            className="px-2.5 py-1 text-[11px] font-sans font-semibold rounded bg-amber-400 text-black hover:bg-amber-300 transition-colors"
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: UPDATE CLIENT INFO & HEALTH PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-[#111317] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-3xl">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                Client Profile Management
              </span>
              <h3 className="text-lg font-display font-bold text-white mt-0.5">
                Update Your Contact Details & Medical Pre-Screening
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Updates saved here synchronize automatically with all your active and upcoming tattoo sessions.
              </p>
            </div>

            {saveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Client information and health sensitivities updated successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Email (Receives Drawing Drafts & Reminders)
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Emergency Contact (Name & Phone)
                </label>
                <input
                  type="text"
                  value={profile.emergencyContactName ? `${profile.emergencyContactName} - ${profile.emergencyContactPhone}` : ''}
                  onChange={e => {
                    const parts = e.target.value.split('-');
                    setProfile({
                      ...profile,
                      emergencyContactName: parts[0]?.trim() || '',
                      emergencyContactPhone: parts[1]?.trim() || ''
                    });
                  }}
                  placeholder="Taylor Rivera - (555) 902-1847"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Allergies, Skin Sensitivities & Medical Considerations
              </label>
              <textarea
                rows={3}
                value={profile.allergiesOrSensitivities}
                onChange={e => setProfile({ ...profile, allergiesOrSensitivities: e.target.value })}
                placeholder="Mention any sensitivities to latex, lidocaine, medical tape, eczema, or blood thinning medications..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                Past Tattoo Healing Experience
              </label>
              <input
                type="text"
                value={profile.healingHistory}
                onChange={e => setProfile({ ...profile, healingHistory: e.target.value })}
                placeholder="e.g. Heals well with SecondSkin; tends to peel quickly after day 4..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Notification preferences */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                Automated Notification Preferences
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.notificationPreferences.emailReminders}
                    onChange={e => setProfile({
                      ...profile,
                      notificationPreferences: { ...profile.notificationPreferences, emailReminders: e.target.checked }
                    })}
                    className="rounded bg-zinc-900 border-zinc-700 text-amber-400 focus:ring-0"
                  />
                  <span className="text-xs text-zinc-300">
                    Send 48-hour pre-session preparation guide & hydration protocol via email
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.notificationPreferences.sketchAlerts}
                    onChange={e => setProfile({
                      ...profile,
                      notificationPreferences: { ...profile.notificationPreferences, sketchAlerts: e.target.checked }
                    })}
                    className="rounded bg-zinc-900 border-zinc-700 text-amber-400 focus:ring-0"
                  />
                  <span className="text-xs text-zinc-300">
                    Send instant alerts when artist uploads a new digital tattoo drawing draft
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Information</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: STUDIO SCHEDULE & CALENDAR SYNC */}
      {activeTab === 'schedule' && (
        <div className="bg-[#111317] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-display font-bold text-white">
                Studio Scheduling & Integrated Calendar Sync
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Sync all booked appointments with Google Calendar, Apple Calendar, or Outlook.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Visual Upcoming Schedule Card */}
            <div className="md:col-span-2 p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                  Upcoming Booked Time Blocks
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  Atelier Noir Studio 3B
                </span>
              </div>

              <div className="space-y-3">
                {activeAppointments.map(apt => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{apt.date}</span>
                        <span className="text-xs font-mono text-amber-400">· {apt.timeSlot}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Artist: {apt.artistName} · Placement: {apt.tattooDetails.placement}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={generateGoogleCalendarUrl(apt)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700 flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                        <span>Google Cal</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => downloadIcsFile(apt)}
                        className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700 flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>.ICS File</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preparation protocols card */}
            <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Appointment Preparation</span>
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                Before your in-chair session:
              </p>
              <ul className="space-y-2 text-zinc-300 list-disc list-inside">
                <li>Drink 2.5L water daily starting 48 hours prior.</li>
                <li>No alcohol or blood-thinners 24 hours prior.</li>
                <li>Eat a solid meal 1–2 hours before arriving.</li>
                <li>Wear comfortable clothing allowing easy access.</li>
                <li>Bring a valid state ID or passport for studio consent.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
