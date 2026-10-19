export type TattooStyle =
  | 'Fine-Line & Micro-Realism'
  | 'Dark Blackwork & Geometric'
  | 'Botanical & Illustrative'
  | 'Neo-Traditional & Japanese'
  | 'Custom Freehand Lettering';

export type PlacementOption =
  | 'Forearm (Inner / Outer)'
  | 'Upper Arm / Bicep'
  | 'Chest / Collarbone'
  | 'Ribcage / Side'
  | 'Thigh / Leg'
  | 'Calf / Ankle'
  | 'Spine / Upper Back'
  | 'Hand / Finger';

export type SizeCategory =
  | 'Small (2" - 3")'
  | 'Medium (4" - 6")'
  | 'Large (7" - 10")'
  | 'Custom Half / Full Sleeve';

export type AppointmentStatus =
  | 'consultation_review'
  | 'sketch_in_progress'
  | 'sketch_ready_for_review'
  | 'design_approved'
  | 'session_confirmed'
  | 'completed'
  | 'rescheduled';

export interface ReferenceImage {
  id: string;
  url: string;
  name: string;
  notes?: string;
  isCustomUpload?: boolean;
}

export interface ArtistSketch {
  id: string;
  url: string;
  title: string;
  version: number;
  uploadedAt: string;
  notes?: string;
  clientFeedback?: string;
  isApproved?: boolean;
}

export interface TimelineEntry {
  status: AppointmentStatus;
  title: string;
  timestamp: string;
  description: string;
  completed: boolean;
}

export interface EmailReminder {
  id: string;
  type: 'booking_confirmation' | 'sketch_ready' | 'prep_guide_48h' | 'reminder_24h' | 'aftercare_review';
  subject: string;
  sentAt: string;
  recipientEmail: string;
  previewSnippet: string;
  status: 'sent' | 'scheduled';
}

export interface Artist {
  id: string;
  name: string;
  title: string;
  specialty: TattooStyle;
  bio: string;
  hourlyRate: number;
  depositRequired: number;
  avatarUrl: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  portfolioTags: string[];
}

export interface ClientProfile {
  name: string;
  email: string;
  phone: string;
  allergiesOrSensitivities: string;
  healingHistory: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notificationPreferences: {
    emailReminders: boolean;
    smsReminders: boolean;
    sketchAlerts: boolean;
  };
}

export interface UpfrontPayment {
  depositAmount: number;
  drawingFee: number;
  totalPaid: number;
  paymentMethod: 'credit_card' | 'apple_pay' | 'google_pay';
  transactionId: string;
  paidAt: string;
  receiptNumber: string;
}

export interface Appointment {
  id: string;
  bookingCode: string;
  artistId: string;
  artistName: string;
  artistAvatar: string;
  client: ClientProfile;
  date: string;
  timeSlot: string;
  tattooDetails: {
    conceptDescription: string;
    placement: PlacementOption;
    size: SizeCategory;
    style: TattooStyle;
    colorPreference: 'Black & Grey' | 'Full Color' | 'Minimalist Red & Black';
    estimatedDurationHours: number;
    referenceImages: ReferenceImage[];
    artistSketches: ArtistSketch[];
  };
  payment: UpfrontPayment;
  status: AppointmentStatus;
  timeline: TimelineEntry[];
  reminders: EmailReminder[];
  reviewSubmitted?: boolean;
  createdAt: string;
}

export interface StudioReview {
  id: string;
  appointmentId?: string;
  bookingCode?: string;
  clientName: string;
  artistId: string;
  artistName: string;
  rating: number;
  date: string;
  tattooTitle: string;
  placement: string;
  comment: string;
  imageUrl?: string;
  verifiedBooking: boolean;
}
