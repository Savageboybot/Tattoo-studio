import React, { useState, useRef } from 'react';
import { 
  X, Check, ChevronRight, ChevronLeft, Upload, 
  Calendar as CalendarIcon, Clock, CreditCard, Shield, Image as ImageIcon,
  Sparkles, AlertCircle, Download, ExternalLink, Trash2
} from 'lucide-react';
import { Artist, PlacementOption, SizeCategory, TattooStyle, ReferenceImage, Appointment } from '../types';
import { INITIAL_ARTISTS, CURATED_INSPO_LIBRARY, DEFAULT_CLIENT_PROFILE } from '../data/initialData';
import { createAppointment, getStoredClientProfile } from '../utils/storage';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (bookingCode: string) => void;
  preselectedArtistId?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onBookingSuccess,
  preselectedArtistId
}) => {
  const [step, setStep] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const clientStored = getStoredClientProfile();
  const [selectedArtistId, setSelectedArtistId] = useState<string>(preselectedArtistId || INITIAL_ARTISTS[0].id);
  const [placement, setPlacement] = useState<PlacementOption>('Forearm (Inner / Outer)');
  const [size, setSize] = useState<SizeCategory>('Medium (4" - 6")');
  const [style, setStyle] = useState<TattooStyle>('Botanical & Illustrative');
  const [colorPreference, setColorPreference] = useState<'Black & Grey' | 'Full Color' | 'Minimalist Red & Black'>('Black & Grey');
  const [conceptNotes, setConceptNotes] = useState<string>('');

  // Reference Images
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([
    CURATED_INSPO_LIBRARY[0] // Preload 1 by default so the user immediately has inspo
  ]);
  const [customNoteInputs, setCustomNoteInputs] = useState<Record<string, string>>({});

  // Date & Time
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-27');
  const [selectedSlot, setSelectedSlot] = useState<string>('11:00 AM - 2:30 PM');

  // Client Details
  const [clientName, setClientName] = useState<string>(clientStored.name || 'Alex Rivera');
  const [clientEmail, setClientEmail] = useState<string>(clientStored.email || 'T5v9n2@gmail.com');
  const [clientPhone, setClientPhone] = useState<string>(clientStored.phone || '+1 (555) 382-9014');
  const [skinSensitivities, setSkinSensitivities] = useState<string>(clientStored.allergiesOrSensitivities || 'None known; mild skin sensitivity');
  const [emergencyContact, setEmergencyContact] = useState<string>(clientStored.emergencyContactName ? `${clientStored.emergencyContactName} - ${clientStored.emergencyContactPhone}` : 'Taylor Rivera - (555) 902-1847');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'apple_pay' | 'credit_card' | 'google_pay'>('apple_pay');
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 9204');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('842');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Success Confirmation State
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  if (!isOpen) return null;

  const currentArtist = INITIAL_ARTISTS.find(a => a.id === selectedArtistId) || INITIAL_ARTISTS[0];

  // Upfront fee calculations
  const drawingFee = 50;
  const depositAmount = currentArtist.depositRequired || 100;
  const totalUpfrontFee = drawingFee + depositAmount;

  // Handle image upload from computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newImg: ReferenceImage = {
          id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          url: dataUrl,
          name: file.name,
          notes: 'Uploaded inspiration image',
          isCustomUpload: true
        };
        setReferenceImages(prev => [...prev, newImg]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleToggleCuratedInspo = (inspo: ReferenceImage) => {
    const exists = referenceImages.some(img => img.id === inspo.id);
    if (exists) {
      setReferenceImages(referenceImages.filter(img => img.id !== inspo.id));
    } else {
      setReferenceImages([...referenceImages, inspo]);
    }
  };

  const handleRemoveImage = (imgId: string) => {
    setReferenceImages(referenceImages.filter(img => img.id !== imgId));
  };

  const handleUpdateImageNote = (imgId: string, note: string) => {
    setCustomNoteInputs(prev => ({ ...prev, [imgId]: note }));
    setReferenceImages(prev => prev.map(img => img.id === imgId ? { ...img, notes: note } : img));
  };

  const handleCompleteBooking = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const randomCode = `INK-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowIso = new Date().toISOString();
      const transactionId = `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const receiptNo = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newApt: Appointment = {
        id: `apt-${Date.now()}`,
        bookingCode: randomCode,
        artistId: currentArtist.id,
        artistName: currentArtist.name,
        artistAvatar: currentArtist.avatarUrl,
        client: {
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          allergiesOrSensitivities: skinSensitivities,
          healingHistory: 'Standard healing with protective adhesive film',
          emergencyContactName: emergencyContact.split('-')[0]?.trim() || 'Emergency Contact',
          emergencyContactPhone: emergencyContact.split('-')[1]?.trim() || '+1 (555) 000-0000',
          notificationPreferences: {
            emailReminders: true,
            smsReminders: true,
            sketchAlerts: true
          }
        },
        date: selectedDate,
        timeSlot: selectedSlot,
        tattooDetails: {
          conceptDescription: conceptNotes || `Custom ${style} design placed on ${placement}, calibrated to size ${size}.`,
          placement,
          size,
          style,
          colorPreference,
          estimatedDurationHours: size.includes('Large') ? 5 : size.includes('Medium') ? 3.5 : 2,
          referenceImages: referenceImages,
          artistSketches: [
            {
              id: `sketch-init-${Date.now()}`,
              url: referenceImages[0]?.url || currentArtist.avatarUrl,
              title: 'Draft Stencil - In Queue for Sketching',
              version: 1,
              uploadedAt: nowIso,
              notes: `${currentArtist.name} will begin sketching your composition 48 hours prior to appointment day.`,
              isApproved: false
            }
          ]
        },
        payment: {
          depositAmount,
          drawingFee,
          totalPaid: totalUpfrontFee,
          paymentMethod,
          transactionId,
          paidAt: nowIso,
          receiptNumber: receiptNo
        },
        status: 'consultation_review',
        timeline: [
          {
            status: 'consultation_review',
            title: 'Booking & Upfront Deposit Confirmed',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            description: `Upfront deposit of $${totalUpfrontFee} secured. Reference images submitted to ${currentArtist.name}.`,
            completed: true
          },
          {
            status: 'sketch_in_progress',
            title: 'Artist Drawing & Stencil Prep',
            timestamp: 'Queued',
            description: `${currentArtist.name} will draft your bespoke tattoo drawing stencil.`,
            completed: false
          },
          {
            status: 'sketch_ready_for_review',
            title: 'Draft Review & Feedback',
            timestamp: 'Expected 48h prior',
            description: 'Digital proof will be sent for your approval.',
            completed: false
          },
          {
            status: 'design_approved',
            title: 'Final Stencil Locked',
            timestamp: 'Pending Client Approval',
            description: 'Thermal transfer printed once client approves draft.',
            completed: false
          },
          {
            status: 'session_confirmed',
            title: 'Studio Chair Reserved',
            timestamp: `${selectedDate} · ${selectedSlot.split('-')[0]}`,
            description: `Session reserved at Atelier Noir for ${clientName}.`,
            completed: false
          },
          {
            status: 'completed',
            title: 'Tattoo Session & Bandage',
            timestamp: 'Post-Session',
            description: 'Final application, medical film wrap, and review invitation.',
            completed: false
          }
        ],
        reminders: [
          {
            id: `rem-${Date.now()}`,
            type: 'booking_confirmation',
            subject: `Booking Confirmed: Atelier Noir Tattoo Drawing [${randomCode}]`,
            sentAt: nowIso,
            recipientEmail: clientEmail,
            previewSnippet: `Deposit of $${totalUpfrontFee} confirmed for ${currentArtist.name}. Reference photos queued for digital drawing.`,
            status: 'sent'
          },
          {
            id: `rem-prep-${Date.now()}`,
            type: 'prep_guide_48h',
            subject: `48-Hour Tattoo Prep Guide [${randomCode}]`,
            sentAt: `Scheduled for 48h before ${selectedDate}`,
            recipientEmail: clientEmail,
            previewSnippet: 'Preparation instructions: Hydrate, avoid alcohol, and wear comfortable clothing.',
            status: 'scheduled'
          }
        ],
        createdAt: nowIso
      };

      createAppointment(newApt);
      setCreatedAppointment(newApt);
      setIsProcessing(false);
      setStep(6); // Success confirmation step
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#111317] border border-zinc-800 rounded-2xl shadow-2xl text-zinc-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header with step indicator */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
              {step <= 5 ? `Step 0${step} of 05` : 'Booking Complete'}
            </span>
            <h2 className="text-lg font-display font-bold text-white">
              {step === 1 && 'Choose Artist & Placement'}
              {step === 2 && 'Upload Tattoo Reference & Inspo'}
              {step === 3 && 'Schedule Date & Time Slot'}
              {step === 4 && 'Client Details & Health Check'}
              {step === 5 && 'Upfront Fee & Deposit Checkout'}
              {step === 6 && 'Appointment Successfully Booked!'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* STEP 1: Artist, Style, Placement, Size */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                  Select Resident Tattoo Artist
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {INITIAL_ARTISTS.map(artist => (
                    <button
                      key={artist.id}
                      type="button"
                      onClick={() => {
                        setSelectedArtistId(artist.id);
                        setStyle(artist.specialty);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-2 ${
                        selectedArtistId === artist.id
                          ? 'border-amber-400 bg-amber-400/10 text-white'
                          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={artist.avatarUrl}
                          alt={artist.name}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                        />
                        <div>
                          <p className="text-sm font-bold text-white leading-tight">{artist.name}</p>
                          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{artist.specialty.split('&')[0]}</p>
                        </div>
                      </div>
                      <div className="text-[11px] text-zinc-400 border-t border-zinc-800 pt-2 flex justify-between">
                        <span>Rate: ${artist.hourlyRate}/hr</span>
                        <span>Deposit: ${artist.depositRequired}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Placement & Size Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Anatomical Placement
                  </label>
                  <select
                    value={placement}
                    onChange={e => setPlacement(e.target.value as PlacementOption)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Forearm (Inner / Outer)">Forearm (Inner / Outer)</option>
                    <option value="Upper Arm / Bicep">Upper Arm / Bicep</option>
                    <option value="Chest / Collarbone">Chest / Collarbone</option>
                    <option value="Ribcage / Side">Ribcage / Side</option>
                    <option value="Thigh / Leg">Thigh / Leg</option>
                    <option value="Calf / Ankle">Calf / Ankle</option>
                    <option value="Spine / Upper Back">Spine / Upper Back</option>
                    <option value="Hand / Finger">Hand / Finger</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Approximate Size
                  </label>
                  <select
                    value={size}
                    onChange={e => setSize(e.target.value as SizeCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Small (2&quot; - 3&quot;)">Small (2" - 3") · Approx 1.5 - 2 hrs</option>
                    <option value="Medium (4&quot; - 6&quot;)">Medium (4" - 6") · Approx 3 - 4 hrs</option>
                    <option value="Large (7&quot; - 10&quot;)">Large (7" - 10") · Approx 4.5 - 6 hrs</option>
                    <option value="Custom Half / Full Sleeve">Custom Half / Full Sleeve · Multi-session</option>
                  </select>
                </div>
              </div>

              {/* Style & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Tattoo Art Style
                  </label>
                  <select
                    value={style}
                    onChange={e => setStyle(e.target.value as TattooStyle)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Botanical & Illustrative">Botanical & Illustrative</option>
                    <option value="Dark Blackwork & Geometric">Dark Blackwork & Geometric</option>
                    <option value="Fine-Line & Micro-Realism">Fine-Line & Micro-Realism</option>
                    <option value="Neo-Traditional & Japanese">Neo-Traditional & Japanese</option>
                    <option value="Custom Freehand Lettering">Custom Freehand Lettering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Color Palette Preference
                  </label>
                  <select
                    value={colorPreference}
                    onChange={e => setColorPreference(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Black & Grey">Black & Grey (Shading & Stippling)</option>
                    <option value="Full Color">Full Color (Vibrant Pigments)</option>
                    <option value="Minimalist Red & Black">Minimalist Dual-Tone (Red & Black)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Reference Image Upload & Inspo */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Upload Your Tattoo Inspiration & References
                  </label>
                  <span className="text-xs text-amber-400 font-mono">
                    {referenceImages.length} attached
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-3">
                  Upload sketches, photos, line-art, or real-life inspiration. Our artists use these to compose your customized drawing stencil.
                </p>

                {/* Upload drag/click container */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-700 hover:border-amber-400/70 bg-zinc-900/40 rounded-xl p-6 text-center cursor-pointer transition-colors group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-zinc-400 group-hover:text-amber-400 mx-auto mb-2 transition-colors" />
                  <p className="text-sm font-medium text-white">
                    Click to browse or drop reference images here
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Supports PNG, JPG, WEBP (Instant upload & visual preview)
                  </p>
                </div>
              </div>

              {/* Curated Studio Flash Library quick-picker */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                  Or pick from Atelier Noir Studio Archive Flash
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CURATED_INSPO_LIBRARY.map(inspo => {
                    const isSelected = referenceImages.some(img => img.id === inspo.id);
                    return (
                      <div
                        key={inspo.id}
                        onClick={() => handleToggleCuratedInspo(inspo)}
                        className={`relative rounded-lg overflow-hidden border cursor-pointer group transition-all ${
                          isSelected
                            ? 'border-amber-400 ring-2 ring-amber-400/30'
                            : 'border-zinc-800 opacity-70 hover:opacity-100 hover:border-zinc-700'
                        }`}
                      >
                        <img
                          src={inspo.url}
                          alt={inspo.name}
                          className="w-full h-24 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                        <div className="absolute bottom-1 left-1.5 right-1.5 text-[10px] text-white font-medium truncate">
                          {inspo.name}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected images list with notes */}
              {referenceImages.length > 0 && (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Selected Reference Images & Artist Guidance
                  </label>
                  <div className="space-y-2.5">
                    {referenceImages.map((img) => (
                      <div
                        key={img.id}
                        className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3"
                      >
                        <img
                          src={img.url}
                          alt={img.name}
                          className="w-14 h-14 rounded-lg object-cover border border-zinc-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-white truncate">{img.name}</p>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(img.id)}
                              className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                              title="Remove image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Add specific notes (e.g. 'I like the leaves here', 'Placement angle')..."
                            value={customNoteInputs[img.id] !== undefined ? customNoteInputs[img.id] : (img.notes || '')}
                            onChange={(e) => handleUpdateImageNote(img.id, e.target.value)}
                            className="mt-1 w-full text-xs px-2.5 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Concept description */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Overall Tattoo Concept & Story (Optional)
                </label>
                <textarea
                  rows={3}
                  value={conceptNotes}
                  onChange={e => setConceptNotes(e.target.value)}
                  placeholder="Describe any elements, personal symbolism, line weight preferences, or how you want the drawing to fit your body..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Date & Calendar Slot Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Select Appointment Date
                </label>
                <p className="text-xs text-zinc-400 mb-3">
                  Tattoo drawings are drafted 48 hours prior to this date so you can inspect and approve the digital stencil.
                </p>
                <input
                  type="date"
                  min="2026-10-20"
                  max="2026-12-31"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                  Select Studio Session Time Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { slot: '10:00 AM - 1:30 PM', label: 'Morning Session', sub: 'Optimal natural lighting' },
                    { slot: '2:00 PM - 5:30 PM', label: 'Afternoon Session', sub: 'Popular for medium pieces' },
                    { slot: '6:00 PM - 9:30 PM', label: 'Evening Session', sub: 'Calm post-work atelier slot' }
                  ].map(item => (
                    <button
                      key={item.slot}
                      type="button"
                      onClick={() => setSelectedSlot(item.slot)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        selectedSlot === item.slot
                          ? 'border-amber-400 bg-amber-400/10 text-white'
                          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-bold text-white mb-1">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>{item.slot}</span>
                      </div>
                      <p className="text-xs text-zinc-300 font-medium">{item.label}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{item.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-3">
                <CalendarIcon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Integrated Calendar Synchronization</p>
                  <p className="text-zinc-400 mt-0.5">
                    Upon checkout, you will receive an instant Google Calendar 1-click sync link and a downloadable Apple / Outlook `.ics` file.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Client Info & Medical Pre-Screening */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Email (For Automated Reminders & Stencils)
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Mobile Phone (SMS Notifications)
                  </label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Emergency Contact Name & Phone
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={e => setEmergencyContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Skin Sensitivities, Allergies, or Healing History
                </label>
                <textarea
                  rows={2}
                  value={skinSensitivities}
                  onChange={e => setSkinSensitivities(e.target.value)}
                  placeholder="e.g. Latex sensitivity, eczema near placement, lidocaine sensitivity, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  This health info is saved safely to your client profile and given to your artist prior to needle prep.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Upfront Fee & Deposit Checkout */}
          {step === 5 && (
            <div className="space-y-6">
              {/* Fee Breakdown Box */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-mono uppercase tracking-wider border-b border-zinc-800 pb-2">
                  <span>Upfront Itemized Fee</span>
                  <span>Amount</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-white">Custom Stencil Drawing & Consultation Fee</p>
                    <p className="text-xs text-zinc-400">Digital line art draft & 2 client revisions</p>
                  </div>
                  <span className="font-mono font-bold text-white tabular-nums">${drawingFee}.00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-white">Studio Chair & Appointment Lock Deposit</p>
                    <p className="text-xs text-zinc-400">100% credited directly toward final session cost</p>
                  </div>
                  <span className="font-mono font-bold text-white tabular-nums">${depositAmount}.00</span>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <span className="font-bold text-base text-white">Total Upfront Due Today</span>
                  <span className="font-display font-bold text-xl text-amber-400 tabular-nums">${totalUpfrontFee}.00</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'apple_pay'
                        ? 'border-amber-400 bg-amber-400/10 text-white'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Apple Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('google_pay')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'google_pay'
                        ? 'border-amber-400 bg-amber-400/10 text-white'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Google Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'border-amber-400 bg-amber-400/10 text-white'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Credit Card
                  </button>
                </div>
              </div>

              {/* Credit card inputs */}
              {paymentMethod === 'credit_card' && (
                <div className="space-y-3 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                        CVC Security
                      </label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={e => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>256-bit encrypted studio checkout. Fully refundable if cancelled 72h prior.</span>
              </div>
            </div>
          )}

          {/* STEP 6: Success Confirmation */}
          {step === 6 && createdAppointment && (
            <div className="text-center py-4 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                  Deposit Confirmed & Stencil In Queue
                </span>
                <h3 className="text-2xl font-display font-bold text-white mt-1">
                  You are booked with {createdAppointment.artistName}!
                </h3>
                <p className="text-sm text-zinc-300 mt-2 max-w-md mx-auto">
                  Your booking code is{' '}
                  <span className="font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                    {createdAppointment.bookingCode}
                  </span>
                  . A confirmation and 48-hour prep guide have been queued to{' '}
                  <span className="text-white font-medium">{createdAppointment.client.email}</span>.
                </p>
              </div>

              {/* Integrated Calendar Sync Actions */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-left max-w-lg mx-auto space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
                  <CalendarIcon className="w-4 h-4 text-amber-400" />
                  <span>Calendar Synchronization</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={generateGoogleCalendarUrl(createdAppointment)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>Add to Google Calendar</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => downloadIcsFile(createdAppointment)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Apple/ICS (.ics)</span>
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onBookingSuccess(createdAppointment.bookingCode)}
                  className="w-full sm:w-auto px-6 py-3 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors"
                >
                  Track Appointment in Real Time
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Close & View Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        {step <= 5 && (
          <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteBooking}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Securing Upfront Deposit...</span>
                ) : (
                  <>
                    <span>Pay ${totalUpfrontFee} & Confirm Booking</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
