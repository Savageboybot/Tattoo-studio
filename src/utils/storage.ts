import { Appointment, ClientProfile, StudioReview, AppointmentStatus, ArtistSketch, EmailReminder } from '../types';
import { INITIAL_APPOINTMENTS, DEFAULT_CLIENT_PROFILE, INITIAL_REVIEWS } from '../data/initialData';

const APPOINTMENTS_KEY = 'atelier_noir_appointments';
const CLIENT_KEY = 'atelier_noir_client_profile';
const REVIEWS_KEY = 'atelier_noir_reviews';

export function getStoredAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    if (!raw) {
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
      return INITIAL_APPOINTMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_APPOINTMENTS;
  }
}

export function saveAppointments(appointments: Appointment[]): void {
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  window.dispatchEvent(new Event('atelier_data_updated'));
}

export function getAppointmentByCode(code: string): Appointment | undefined {
  const list = getStoredAppointments();
  return list.find(a => a.bookingCode.trim().toUpperCase() === code.trim().toUpperCase() || a.id === code.trim());
}

export function createAppointment(newApt: Appointment): void {
  const current = getStoredAppointments();
  const updated = [newApt, ...current];
  saveAppointments(updated);
}

export function updateAppointment(id: string, updater: (apt: Appointment) => Appointment): Appointment | undefined {
  const current = getStoredAppointments();
  let found: Appointment | undefined;
  const updated = current.map(apt => {
    if (apt.id === id || apt.bookingCode === id) {
      const next = updater(apt);
      found = next;
      return next;
    }
    return apt;
  });
  if (found) {
    saveAppointments(updated);
  }
  return found;
}

export function getStoredClientProfile(): ClientProfile {
  try {
    const raw = localStorage.getItem(CLIENT_KEY);
    if (!raw) {
      localStorage.setItem(CLIENT_KEY, JSON.stringify(DEFAULT_CLIENT_PROFILE));
      return DEFAULT_CLIENT_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CLIENT_PROFILE;
  }
}

export function saveClientProfile(profile: ClientProfile): void {
  localStorage.setItem(CLIENT_KEY, JSON.stringify(profile));
  // Also sync client name and email into existing user appointments
  const apts = getStoredAppointments();
  const updated = apts.map(a => ({
    ...a,
    client: { ...a.client, ...profile }
  }));
  saveAppointments(updated);
  window.dispatchEvent(new Event('atelier_profile_updated'));
}

export function getStoredReviews(): StudioReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (!raw) {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REVIEWS;
  }
}

export function saveReview(review: StudioReview): void {
  const current = getStoredReviews();
  const updated = [review, ...current];
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));

  // Mark appointment as reviewSubmitted if applicable
  if (review.appointmentId) {
    updateAppointment(review.appointmentId, apt => ({
      ...apt,
      reviewSubmitted: true
    }));
  }
  window.dispatchEvent(new Event('atelier_reviews_updated'));
}

export function advanceAppointmentStatus(id: string, newStatus: AppointmentStatus, note?: string): Appointment | undefined {
  return updateAppointment(id, apt => {
    const stageTitles: Record<AppointmentStatus, string> = {
      consultation_review: 'Consultation & Concept Review',
      sketch_in_progress: 'Drawing & Composition Underway',
      sketch_ready_for_review: 'Draft Stencil Ready for Client Review',
      design_approved: 'Client Design Approval Confirmed',
      session_confirmed: 'Studio Chair Reserved & Locked',
      completed: 'Tattoo Session Completed & Bandaged',
      rescheduled: 'Session Rescheduled'
    };

    const statusOrder: AppointmentStatus[] = [
      'consultation_review',
      'sketch_in_progress',
      'sketch_ready_for_review',
      'design_approved',
      'session_confirmed',
      'completed'
    ];

    const newIndex = statusOrder.indexOf(newStatus);
    const updatedTimeline = apt.timeline.map((entry, idx) => {
      if (entry.status === newStatus) {
        return {
          ...entry,
          completed: true,
          timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
          description: note || entry.description
        };
      }
      if (newIndex >= 0 && idx < newIndex) {
        return { ...entry, completed: true };
      }
      return entry;
    });

    return {
      ...apt,
      status: newStatus,
      timeline: updatedTimeline
    };
  });
}

export function approveSketch(aptId: string, sketchId: string, feedbackNote?: string): Appointment | undefined {
  return updateAppointment(aptId, apt => {
    const updatedSketches = apt.tattooDetails.artistSketches.map(s => {
      if (s.id === sketchId) {
        return { ...s, isApproved: true, clientFeedback: feedbackNote || 'Approved by client' };
      }
      return s;
    });

    const approvedApt: Appointment = {
      ...apt,
      tattooDetails: {
        ...apt.tattooDetails,
        artistSketches: updatedSketches
      },
      status: 'design_approved'
    };

    // Update timeline
    const updatedTimeline = approvedApt.timeline.map(entry => {
      if (entry.status === 'design_approved') {
        return {
          ...entry,
          completed: true,
          timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
          description: feedbackNote ? `Client approved stencil with note: "${feedbackNote}"` : 'Digital stencil approved by client. Ready for thermal print.'
        };
      }
      return entry;
    });

    return {
      ...approvedApt,
      timeline: updatedTimeline
    };
  });
}

export function sendSimulatedEmailReminder(aptId: string, reminderType: EmailReminder['type']): EmailReminder | null {
  let createdReminder: EmailReminder | null = null;
  updateAppointment(aptId, apt => {
    const subjectMap: Record<EmailReminder['type'], string> = {
      booking_confirmation: `Booking Confirmation: Atelier Noir Studio [${apt.bookingCode}]`,
      sketch_ready: `Your Custom Tattoo Drawing is Ready for Review [${apt.bookingCode}]`,
      prep_guide_48h: `48-Hour Tattoo Prep & Hydration Guide [${apt.bookingCode}]`,
      reminder_24h: `Reminder: Your Tattoo Session is Tomorrow at ${apt.timeSlot.split('-')[0]} [${apt.bookingCode}]`,
      aftercare_review: `How is your new ink healing? Leave a review for ${apt.artistName} [${apt.bookingCode}]`
    };

    const snippetMap: Record<EmailReminder['type'], string> = {
      booking_confirmation: `Your upfront deposit has been received. ${apt.artistName} has received your inspiration photos and design brief.`,
      sketch_ready: `The first draft of your custom stencil has been uploaded to your client portal. Click to view high-resolution linework.`,
      prep_guide_48h: `Important prep: Drink at least 2.5L water daily, do not consume alcohol or aspirin within 24 hours, and wear comfortable clothing with easy access to your ${apt.tattooDetails.placement}.`,
      reminder_24h: `We look forward to seeing you tomorrow at Atelier Noir (442 Mercer Street, Suite 3B). Please arrive well-rested and bring a valid photo ID.`,
      aftercare_review: `We hope your new piece is healing cleanly! Please take a moment to leave a review and photo in your client portal.`
    };

    const reminder: EmailReminder = {
      id: `rem-sim-${Date.now()}`,
      type: reminderType,
      subject: subjectMap[reminderType],
      sentAt: new Date().toISOString(),
      recipientEmail: apt.client.email,
      previewSnippet: snippetMap[reminderType],
      status: 'sent'
    };

    createdReminder = reminder;

    return {
      ...apt,
      reminders: [reminder, ...apt.reminders]
    };
  });
  return createdReminder;
}
