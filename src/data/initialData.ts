import { Artist, Appointment, StudioReview, ClientProfile, ReferenceImage } from '../types';

export const HERO_IMAGE = '/src/assets/images/hero_tattoo_studio_1792389118597.jpg';
export const ARTIST_ELENA_IMG = '/src/assets/images/tattoo_artist_elena_1792389120992.jpg';
export const ARTIST_MARCUS_IMG = '/src/assets/images/tattoo_artist_marcus_1792389119570.jpg';
export const INSPO_BOTANICAL_IMG = '/src/assets/images/tattoo_inspo_botanical_1792389120369.jpg';
export const INSPO_BLACKWORK_IMG = '/src/assets/images/tattoo_inspo_blackwork_1792389120741.jpg';

export const INITIAL_ARTISTS: Artist[] = [
  {
    id: 'artist-elena',
    name: 'Elena Vance',
    title: 'Senior Botanical & Illustrative Specialist',
    specialty: 'Botanical & Illustrative',
    bio: 'Specializing in delicate botanical flora, single-needle linework, and soft-whip shading. Trained in fine art illustration in Florence before transitioning to tattoo mastery.',
    hourlyRate: 180,
    depositRequired: 100,
    avatarUrl: ARTIST_ELENA_IMG,
    experienceYears: 9,
    rating: 4.98,
    reviewCount: 142,
    portfolioTags: ['Fine Line', 'Floral Anatomy', 'Single Needle', 'Stippling']
  },
  {
    id: 'artist-marcus',
    name: 'Marcus Thorne',
    title: 'Lead Dark Blackwork & Geometric Artist',
    specialty: 'Dark Blackwork & Geometric',
    bio: 'Pioneer of high-contrast sacred geometry, heavy solid black saturation, and architectural mandalas engineered to contour the human musculoskeletal flow.',
    hourlyRate: 200,
    depositRequired: 120,
    avatarUrl: ARTIST_MARCUS_IMG,
    experienceYears: 12,
    rating: 4.95,
    reviewCount: 198,
    portfolioTags: ['Blackwork', 'Sacred Geometry', 'Mandalas', 'Sleeve Flow']
  },
  {
    id: 'artist-rowan',
    name: 'Rowan Jin',
    title: 'Micro-Realism & Fine Line Resident',
    specialty: 'Fine-Line & Micro-Realism',
    bio: 'Focused on miniature architectural portraits, classical Renaissance statues, and micro-realistic wildlife with obsessive single-pass precision.',
    hourlyRate: 190,
    depositRequired: 100,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    experienceYears: 7,
    rating: 4.96,
    reviewCount: 116,
    portfolioTags: ['Micro-Realism', 'Statue Detail', 'Fine Needle', 'Custom Typo']
  }
];

export const CURATED_INSPO_LIBRARY: ReferenceImage[] = [
  {
    id: 'inspo-1',
    url: INSPO_BOTANICAL_IMG,
    name: 'Alpine Fern & Wild Meadow Rose Stencil Flash',
    notes: 'Micro-stippled petals, crisp single-needle stem lines, natural curvature.'
  },
  {
    id: 'inspo-2',
    url: INSPO_BLACKWORK_IMG,
    name: 'Celestial Sacred Geometry & Lunar Cycles',
    notes: 'Solid black saturation, precise geometric framing, dotwork gradient.'
  },
  {
    id: 'inspo-3',
    url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=600&q=80',
    name: 'Neo-Traditional Mountain & Raven Outline',
    notes: 'Bold linework with dynamic weight variation, ideal for shoulder or outer bicep.'
  },
  {
    id: 'inspo-4',
    url: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?auto=format&fit=crop&w=600&q=80',
    name: 'Minimalist Constellation & Fine Orbit Coordinates',
    notes: 'Subtle clean lines, ideal for inner wrist or collarbone.'
  }
];

export const DEFAULT_CLIENT_PROFILE: ClientProfile = {
  name: 'Alex Rivera',
  email: 'T5v9n2@gmail.com',
  phone: '+1 (555) 382-9014',
  allergiesOrSensitivities: 'Mild latex sensitivity (nitrile gloves required); no known lidocaine allergies',
  healingHistory: 'Heals best with SecondSkin medical adhesive; prone to slight redness in first 24h',
  emergencyContactName: 'Taylor Rivera',
  emergencyContactPhone: '+1 (555) 902-1847',
  notificationPreferences: {
    emailReminders: true,
    smsReminders: true,
    sketchAlerts: true
  }
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001',
    bookingCode: 'INK-8492',
    artistId: 'artist-elena',
    artistName: 'Elena Vance',
    artistAvatar: ARTIST_ELENA_IMG,
    client: DEFAULT_CLIENT_PROFILE,
    date: '2026-10-24',
    timeSlot: '11:00 AM - 2:30 PM',
    tattooDetails: {
      conceptDescription: 'A custom botanical piece combining wild mountain roses, delicate fern leaves, and micro-stippled shading following the natural muscle line of the inner forearm.',
      placement: 'Forearm (Inner / Outer)',
      size: 'Medium (4" - 6")',
      style: 'Botanical & Illustrative',
      colorPreference: 'Black & Grey',
      estimatedDurationHours: 3.5,
      referenceImages: [
        {
          id: 'ref-1',
          url: INSPO_BOTANICAL_IMG,
          name: 'Primary Inspo: Wild Rose & Fern Flash',
          notes: 'Focus on the curved fern branch for the wrist taper.'
        }
      ],
      artistSketches: [
        {
          id: 'sketch-v1',
          url: INSPO_BOTANICAL_IMG,
          title: 'Draft Stencil - Version 1 (Placement Contoured)',
          version: 1,
          uploadedAt: '2026-10-18T14:30:00Z',
          notes: 'Elena: "Here is your initial stencil draft! I adjusted the stem curve to wrap gently around your inner forearm contour. Please review and approve or suggest revisions."',
          isApproved: false
        }
      ]
    },
    payment: {
      depositAmount: 50,
      drawingFee: 50,
      totalPaid: 100,
      paymentMethod: 'apple_pay',
      transactionId: 'TXN-98410294-APPLE',
      paidAt: '2026-10-17T18:22:00Z',
      receiptNumber: 'REC-2026-8492'
    },
    status: 'sketch_ready_for_review',
    timeline: [
      {
        status: 'consultation_review',
        title: 'Booking & Inspo Received',
        timestamp: 'Oct 17, 2026 · 6:22 PM',
        description: 'Upfront drawing fee & booking deposit processed. Concept brief assigned to Elena Vance.',
        completed: true
      },
      {
        status: 'sketch_in_progress',
        title: 'Drawing & Composition',
        timestamp: 'Oct 18, 2026 · 10:15 AM',
        description: 'Elena is actively illustrating the custom floral composition contoured to forearm anatomical lines.',
        completed: true
      },
      {
        status: 'sketch_ready_for_review',
        title: 'Draft Stencil Ready For Review',
        timestamp: 'Oct 18, 2026 · 2:30 PM',
        description: 'Draft drawing uploaded to your client portal. Please review and provide feedback or confirm approval.',
        completed: true
      },
      {
        status: 'design_approved',
        title: 'Design Approval & Stencil Prep',
        timestamp: 'Pending Client Approval',
        description: 'Once you approve the digital draft, high-resolution thermal stencils will be printed for session day.',
        completed: false
      },
      {
        status: 'session_confirmed',
        title: 'Studio Chair Reserved',
        timestamp: 'Scheduled for Oct 24, 2026 · 11:00 AM',
        description: 'Private studio booth reserved at Atelier Noir. Automated reminder sent 48h and 24h prior.',
        completed: false
      },
      {
        status: 'completed',
        title: 'Ink Session & Aftercare',
        timestamp: 'Post-Session',
        description: 'Aftercare SecondSkin bandage application, care kit provided, and final invoice reconciliation.',
        completed: false
      }
    ],
    reminders: [
      {
        id: 'rem-1',
        type: 'booking_confirmation',
        subject: 'Booking Confirmed: Atelier Noir Tattoo Drawing [INK-8492]',
        sentAt: '2026-10-17T18:22:30Z',
        recipientEmail: 'T5v9n2@gmail.com',
        previewSnippet: 'We have received your concept notes and $100 upfront deposit. Elena Vance has commenced your custom sketch.',
        status: 'sent'
      },
      {
        id: 'rem-2',
        type: 'sketch_ready',
        subject: 'Action Needed: Elena Vance uploaded your tattoo drawing draft [INK-8492]',
        sentAt: '2026-10-18T14:30:15Z',
        recipientEmail: 'T5v9n2@gmail.com',
        previewSnippet: 'Your draft stencil is ready for review in your client dashboard. Inspect line weights and approve or request adjustments.',
        status: 'sent'
      },
      {
        id: 'rem-3',
        type: 'prep_guide_48h',
        subject: '48-Hour Tattoo Prep Guide & Studio Protocols [INK-8492]',
        sentAt: 'Scheduled for Oct 22, 2026 · 11:00 AM',
        recipientEmail: 'T5v9n2@gmail.com',
        previewSnippet: 'How to prepare: Stay deeply hydrated, avoid alcohol or aspirin 24h prior, eat a protein-rich meal 2 hours before your session.',
        status: 'scheduled'
      }
    ],
    createdAt: '2026-10-17T18:22:00Z'
  },
  {
    id: 'apt-002',
    bookingCode: 'INK-3195',
    artistId: 'artist-marcus',
    artistName: 'Marcus Thorne',
    artistAvatar: ARTIST_MARCUS_IMG,
    client: DEFAULT_CLIENT_PROFILE,
    date: '2026-11-05',
    timeSlot: '2:00 PM - 6:00 PM',
    tattooDetails: {
      conceptDescription: 'Sacred geometry celestial spine piece featuring aligned moon phases with high-density blackwork and sacred geometry lattice.',
      placement: 'Spine / Upper Back',
      size: 'Large (7" - 10")',
      style: 'Dark Blackwork & Geometric',
      colorPreference: 'Black & Grey',
      estimatedDurationHours: 4.5,
      referenceImages: [
        {
          id: 'ref-2',
          url: INSPO_BLACKWORK_IMG,
          name: 'Lunar Phases & Geometric Lattice',
          notes: 'Align along vertical vertebrae line.'
        }
      ],
      artistSketches: [
        {
          id: 'sketch-v2',
          url: INSPO_BLACKWORK_IMG,
          title: 'Final Master Stencil - Approved',
          version: 2,
          uploadedAt: '2026-10-15T11:00:00Z',
          notes: 'Marcus: "Lattice proportions calibrated to your upper spine measurements."',
          isApproved: true
        }
      ]
    },
    payment: {
      depositAmount: 60,
      drawingFee: 60,
      totalPaid: 120,
      paymentMethod: 'credit_card',
      transactionId: 'TXN-41920841-VISA',
      paidAt: '2026-10-12T14:10:00Z',
      receiptNumber: 'REC-2026-3195'
    },
    status: 'session_confirmed',
    timeline: [
      {
        status: 'consultation_review',
        title: 'Booking & Inspo Received',
        timestamp: 'Oct 12, 2026 · 2:10 PM',
        description: 'Booking deposit confirmed. Geometry brief assigned to Marcus Thorne.',
        completed: true
      },
      {
        status: 'sketch_in_progress',
        title: 'Drawing & Mathematical Grid',
        timestamp: 'Oct 14, 2026 · 11:00 AM',
        description: 'Marcus constructed the symmetrical lunar lattice to match spinal curvature.',
        completed: true
      },
      {
        status: 'sketch_ready_for_review',
        title: 'Draft Stencil Review',
        timestamp: 'Oct 15, 2026 · 11:00 AM',
        description: 'Client reviewed lunar orbit spacing.',
        completed: true
      },
      {
        status: 'design_approved',
        title: 'Client Approval Received',
        timestamp: 'Oct 15, 2026 · 4:18 PM',
        description: 'Final design locked and formatted for thermal stencil transfer.',
        completed: true
      },
      {
        status: 'session_confirmed',
        title: 'Studio Chair Reserved',
        timestamp: 'Confirmed for Nov 5, 2026 · 2:00 PM',
        description: 'Private studio booth reserved at Atelier Noir.',
        completed: true
      },
      {
        status: 'completed',
        title: 'Ink Session & Aftercare',
        timestamp: 'Pending Session Date',
        description: 'Scheduled for November 5, 2026.',
        completed: false
      }
    ],
    reminders: [
      {
        id: 'rem-201',
        type: 'booking_confirmation',
        subject: 'Booking Confirmed: Atelier Noir Geometric Session [INK-3195]',
        sentAt: '2026-10-12T14:10:30Z',
        recipientEmail: 'T5v9n2@gmail.com',
        previewSnippet: 'Your session with Marcus Thorne is locked for Nov 5, 2026.',
        status: 'sent'
      }
    ],
    createdAt: '2026-10-12T14:10:00Z'
  }
];

export const INITIAL_REVIEWS: StudioReview[] = [
  {
    id: 'rev-01',
    clientName: 'Soren Vance',
    artistId: 'artist-elena',
    artistName: 'Elena Vance',
    rating: 5,
    date: 'October 14, 2026',
    tattooTitle: 'Wild Dogwood & Honeybee Linework',
    placement: 'Right Collarbone & Shoulder',
    comment: 'The digital sketch preview process gave me complete confidence before stepping into the studio. Elena made two minor adjustments to the petal angles within hours. The studio hygiene and healing aftercare pack were exemplary.',
    imageUrl: INSPO_BOTANICAL_IMG,
    verifiedBooking: true
  },
  {
    id: 'rev-02',
    clientName: 'Devon Miller',
    artistId: 'artist-marcus',
    artistName: 'Marcus Thorne',
    rating: 5,
    date: 'October 8, 2026',
    tattooTitle: 'Fibonacci Spiral & Sacred Mandala',
    placement: 'Full Calf & Shin',
    comment: 'Marcus is an absolute technician. The upfront fee calculation was transparent, the automated email reminders kept me prepared, and the calendar sync dropped straight into my phone. The saturated blacks healed rich and crisp.',
    imageUrl: INSPO_BLACKWORK_IMG,
    verifiedBooking: true
  },
  {
    id: 'rev-03',
    clientName: 'Claire Beauchamp',
    artistId: 'artist-elena',
    artistName: 'Elena Vance',
    rating: 5,
    date: 'September 28, 2026',
    tattooTitle: 'Micro Fine-Line Fern Sprig',
    placement: 'Inner Forearm',
    comment: 'I uploaded three reference sketches and Elena fused them into a one-of-a-kind design that followed my arm anatomy naturally. Being able to track status and approve the sketch online made this the smoothest tattoo experience I have ever had.',
    imageUrl: INSPO_BOTANICAL_IMG,
    verifiedBooking: true
  }
];
