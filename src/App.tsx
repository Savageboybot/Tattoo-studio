import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BookingModal } from './components/BookingModal';
import { StatusTracker } from './components/StatusTracker';
import { ClientDashboard } from './components/ClientDashboard';
import { StudioArtists } from './components/StudioArtists';
import { ReviewsSection } from './components/ReviewsSection';
import { EmailReminderModal } from './components/EmailReminderModal';
import { Appointment } from './types';
import { getStoredAppointments } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'book' | 'tracker' | 'dashboard' | 'artists' | 'reviews'>('dashboard');
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [preselectedArtistId, setPreselectedArtistId] = useState<string | undefined>(undefined);
  const [activeTrackingCode, setActiveTrackingCode] = useState<string>('INK-8492');
  
  // Modal for reviewing a target appointment
  const [reviewTargetAppointment, setReviewTargetAppointment] = useState<Appointment | null>(null);
  
  // Modal for previewing email reminders
  const [emailPreviewAppointment, setEmailPreviewAppointment] = useState<Appointment | null>(null);

  // Stored appointments count
  const [appointments, setAppointments] = useState<Appointment[]>(getStoredAppointments());

  useEffect(() => {
    const handleUpdate = () => {
      setAppointments(getStoredAppointments());
    };
    window.addEventListener('atelier_data_updated', handleUpdate);
    return () => window.removeEventListener('atelier_data_updated', handleUpdate);
  }, []);

  const handleOpenBookingWithArtist = (artistId?: string) => {
    setPreselectedArtistId(artistId);
    setIsBookingOpen(true);
  };

  const handleBookingSuccess = (newCode: string) => {
    setActiveTrackingCode(newCode);
    setIsBookingOpen(false);
    setActiveTab('tracker');
    setAppointments(getStoredAppointments());
  };

  const handleSelectAppointmentFromDashboard = (code: string) => {
    setActiveTrackingCode(code);
    setActiveTab('tracker');
  };

  const activeCount = appointments.filter(a => a.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#e2e4e9] flex flex-col font-sans selection:bg-amber-400/20 selection:text-amber-200">
      
      {/* Universal Top Navigation Bar adhering to 3-zone contract */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenBooking={() => handleOpenBookingWithArtist()}
        activeBookingCount={activeCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* If in tracker tab, render hero banner optionally or jump straight to tracker */}
        {activeTab === 'dashboard' && (
          <>
            <Hero
              onOpenBooking={() => handleOpenBookingWithArtist()}
              onOpenTracker={() => {
                setActiveTrackingCode('INK-8492');
                setActiveTab('tracker');
              }}
              onExploreArtists={() => setActiveTab('artists')}
            />
            <ClientDashboard
              onSelectAppointment={handleSelectAppointmentFromDashboard}
              onOpenBooking={() => handleOpenBookingWithArtist()}
              onOpenEmailPreview={apt => setEmailPreviewAppointment(apt)}
              onOpenReviewModal={apt => setReviewTargetAppointment(apt)}
            />
          </>
        )}

        {activeTab === 'tracker' && (
          <StatusTracker
            initialBookingCode={activeTrackingCode}
            onOpenBooking={() => handleOpenBookingWithArtist()}
            onOpenReviewModal={apt => setReviewTargetAppointment(apt)}
            onOpenEmailPreview={apt => setEmailPreviewAppointment(apt)}
          />
        )}

        {activeTab === 'artists' && (
          <StudioArtists
            onSelectArtistToBook={artistId => handleOpenBookingWithArtist(artistId)}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsSection
            onOpenBooking={() => handleOpenBookingWithArtist()}
            reviewTargetAppointment={reviewTargetAppointment}
            onCloseTargetModal={() => setReviewTargetAppointment(null)}
          />
        )}
      </main>

      {/* 5-Step Online Booking & Inspo Upload Wizard */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onBookingSuccess={handleBookingSuccess}
        preselectedArtistId={preselectedArtistId}
      />

      {/* Automated Email Reminders Preview & Test Dispatcher Modal */}
      <EmailReminderModal
        appointment={emailPreviewAppointment}
        isOpen={!!emailPreviewAppointment}
        onClose={() => setEmailPreviewAppointment(null)}
        onReminderSent={() => setAppointments(getStoredAppointments())}
      />

      {/* Review submission modal trigger from tracker if active */}
      {reviewTargetAppointment && activeTab !== 'reviews' && (
        <ReviewsSection
          onOpenBooking={() => handleOpenBookingWithArtist()}
          reviewTargetAppointment={reviewTargetAppointment}
          onCloseTargetModal={() => setReviewTargetAppointment(null)}
        />
      )}

      {/* Clean Editorial Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-10 mt-16 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <span className="font-display font-bold text-sm tracking-wider text-white uppercase">
              ATELIER NOIR
            </span>
            <span className="hidden sm:inline text-zinc-700">|</span>
            <span className="font-mono text-[11px]">
              442 Mercer Street, Suite 3B · Bespoke Custom Tattoo Drawing & Appointment Atelier
            </span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="hover:text-white transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className="hover:text-white transition-colors"
            >
              Live Tracker
            </button>
            <button
              onClick={() => setActiveTab('artists')}
              className="hover:text-white transition-colors"
            >
              Artists
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className="hover:text-white transition-colors"
            >
              Reviews
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
