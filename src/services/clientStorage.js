// clientStorage.js
// Provides robust client-side storage persistence when deployed on static hosts (Vercel, Netlify)
// Ensures that Registration, Login, Bookings, and Services work even when backend server is offline

const STORAGE_KEY = 'salon_spa_client_db_v1';

const INITIAL_SERVICES = [
  {
    _id: 'srv_01',
    name: 'Deluxe Hair Spa & Cut',
    category: 'Hair Styling',
    durationMinutes: 60,
    price: 1200,
    description: 'Deep conditioning steam therapy, scalp massage and personalized styling.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500',
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    _id: 'srv_02',
    name: 'Gold Glow Radiance Facial',
    category: 'Facial & Skincare',
    durationMinutes: 45,
    price: 1500,
    description: 'Purifying gold dust scrub, collagen booster mask, and ultrasonic pore cleansing.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500',
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    _id: 'srv_03',
    name: 'Swedish Aromatherapy Full Body Massage',
    category: 'Massage & Spa',
    durationMinutes: 90,
    price: 2500,
    description: 'Relaxing lavender essential oils, hot towel wrap and muscle stress relief.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500',
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    _id: 'srv_04',
    name: 'Gel Nail Art & Royal Pedicure',
    category: 'Nail Art & Care',
    durationMinutes: 60,
    price: 950,
    description: 'Cuticle revival, organic botanical foot scrub and chip-resistant gel polish.',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500',
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    _id: 'srv_05',
    name: 'Himalayan Pink Salt Body Scrub',
    category: 'Body Scrub & Therapy',
    durationMinutes: 60,
    price: 1800,
    description: 'Detoxifying exfoliation followed by warm almond butter hydration lotion.',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=500',
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    _id: 'srv_06',
    name: 'Bridal Makeover & Styling Package',
    category: 'Bridal & Grooming',
    durationMinutes: 120,
    price: 4500,
    description: 'HD Bridal makeup, traditional saree/dress draping, hair styling and jewelry setting.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=500',
    isActive: true,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    _id: 'srv_07',
    name: 'Keratin Protein Hair Smoothing Treatment',
    category: 'Hair Styling',
    durationMinutes: 90,
    price: 3200,
    description: 'Formaldehyde-free keratin infusion to eliminate frizz, seal cuticles, and provide mirror-like silkiness.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500',
    isActive: true,
    createdAt: '2026-01-11T10:00:00Z'
  },
  {
    _id: 'srv_08',
    name: 'Balayage & Ombre Hair Color Couture',
    category: 'Hair Styling',
    durationMinutes: 120,
    price: 3800,
    description: 'Freehand bespoke highlights with Olaplex bond repair, gloss toner and blowout finish.',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500',
    isActive: true,
    createdAt: '2026-01-12T10:00:00Z'
  },
  {
    _id: 'srv_09',
    name: 'Moroccan Argan Oil Scalp Revival',
    category: 'Hair Styling',
    durationMinutes: 45,
    price: 1400,
    description: 'Warm organic Moroccan argan oil head massage followed by ozone scalp steaming.',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=500',
    isActive: true,
    createdAt: '2026-01-13T10:00:00Z'
  },
  {
    _id: 'srv_10',
    name: 'Ayurvedic Kesh Vardhak Botanical Therapy',
    category: 'Hair Styling',
    durationMinutes: 60,
    price: 1600,
    description: 'Brahmi, Bhringraj and Amla root strengthening paste with traditional Indian champi massage.',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500',
    isActive: true,
    createdAt: '2026-01-14T10:00:00Z'
  },
  {
    _id: 'srv_11',
    name: 'Hydra-Infusion Oxygen Glow Facial',
    category: 'Facial & Skincare',
    durationMinutes: 60,
    price: 2200,
    description: 'Hydro-dermabrasion with peptide serum infusion, hyperbaric oxygen spray and LED therapy.',
    image: 'https://images.unsplash.com/photo-1512290900672-1f41334c264d?w=500',
    isActive: true,
    createdAt: '2026-01-15T10:00:00Z'
  },
  {
    _id: 'srv_12',
    name: 'Anti-Aging Pearl Collagen Facial',
    category: 'Facial & Skincare',
    durationMinutes: 75,
    price: 2600,
    description: 'Marine collagen biocellulose mask, jade stone lymphatic drainage, and wrinkle plumping lift.',
    image: 'https://images.unsplash.com/photo-1522337094346-29b5314088a8?w=500',
    isActive: true,
    createdAt: '2026-01-16T10:00:00Z'
  },
  {
    _id: 'srv_13',
    name: 'Charcoal Detox Pore Clarifying Facial',
    category: 'Facial & Skincare',
    durationMinutes: 45,
    price: 1350,
    description: 'Activated bamboo charcoal peel, tea tree extraction, and mattifying clay compress.',
    image: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?w=500',
    isActive: true,
    createdAt: '2026-01-17T10:00:00Z'
  },
  {
    _id: 'srv_14',
    name: 'Vitamin C Brightening & De-Tan Facial',
    category: 'Facial & Skincare',
    durationMinutes: 50,
    price: 1750,
    description: 'Kakadu plum antioxidant peel, brightening vitamin C ampoule and sun damage repair cream.',
    image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=500',
    isActive: true,
    createdAt: '2026-01-18T10:00:00Z'
  },
  {
    _id: 'srv_15',
    name: 'Deep Tissue Sports Recovery Massage',
    category: 'Massage & Spa',
    durationMinutes: 60,
    price: 2400,
    description: 'Firm myofascial release, arnica pain relief balm, and targeted lower-back tension alleviation.',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=500',
    isActive: true,
    createdAt: '2026-01-19T10:00:00Z'
  },
  {
    _id: 'srv_16',
    name: 'Balinese Herbal Compress Body Spa',
    category: 'Massage & Spa',
    durationMinutes: 90,
    price: 2900,
    description: 'Steamed lemongrass, ginger and turmeric compress balls with rhythmic stretching massage.',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=500',
    isActive: true,
    createdAt: '2026-01-20T10:00:00Z'
  },
  {
    _id: 'srv_17',
    name: 'Volcanic Hot Stone Relaxation Therapy',
    category: 'Massage & Spa',
    durationMinutes: 75,
    price: 2800,
    description: 'Heated basalt volcanic stones placed on chakra centers, melting deep muscle tightness.',
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=500',
    isActive: true,
    createdAt: '2026-01-21T10:00:00Z'
  },
  {
    _id: 'srv_18',
    name: 'Traditional Thai Body Stretch & Reflexology',
    category: 'Massage & Spa',
    durationMinutes: 60,
    price: 2100,
    description: 'Mat-based yoga stretching combined with wooden acupressure foot reflexology.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500',
    isActive: true,
    createdAt: '2026-01-22T10:00:00Z'
  },
  {
    _id: 'srv_19',
    name: 'French Gel Acrylic Extensions & 3D Nail Art',
    category: 'Nail Art & Care',
    durationMinutes: 90,
    price: 1850,
    description: 'Custom sculpted UV acrylic tips, glitter encapsulation, chrome powders and high-gloss topcoat.',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500',
    isActive: true,
    createdAt: '2026-01-23T10:00:00Z'
  },
  {
    _id: 'srv_20',
    name: 'Paraffin Wax Rejuvenating Manicure & Pedicure',
    category: 'Nail Art & Care',
    durationMinutes: 60,
    price: 1250,
    description: 'Warm peach paraffin dip to deeply moisturize cracked heels and rough cuticles.',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500',
    isActive: true,
    createdAt: '2026-01-24T10:00:00Z'
  },
  {
    _id: 'srv_21',
    name: 'Rose Petal & Raw Milk Luxury Foot Spa',
    category: 'Nail Art & Care',
    durationMinutes: 45,
    price: 850,
    description: 'Copper basin soak with fresh Damascus rose petals, raw milk bath and sea salt foot buffer.',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=500',
    isActive: true,
    createdAt: '2026-01-25T10:00:00Z'
  },
  {
    _id: 'srv_22',
    name: 'Arabica Coffee & Brown Sugar Cellulite Polish',
    category: 'Body Scrub & Therapy',
    durationMinutes: 60,
    price: 1950,
    description: 'Roasted Arabica grounds blended with virgin coconut oil to stimulate circulation and smooth skin.',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500',
    isActive: true,
    createdAt: '2026-01-26T10:00:00Z'
  },
  {
    _id: 'srv_23',
    name: 'Dead Sea Mineral Mud Detox Body Wrap',
    category: 'Body Scrub & Therapy',
    durationMinutes: 75,
    price: 2400,
    description: 'Warm Jordan Dead Sea therapeutic mud cocoon to draw out impurities and replenish magnesium.',
    image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=500',
    isActive: true,
    createdAt: '2026-01-27T10:00:00Z'
  },
  {
    _id: 'srv_24',
    name: 'Sandalwood & Turmeric Ubtan Royal Glow Wrap',
    category: 'Body Scrub & Therapy',
    durationMinutes: 60,
    price: 2100,
    description: 'Traditional royal Indian herbal paste with sandalwood essence for radiant bridal skin polish.',
    image: 'https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f?w=500',
    isActive: true,
    createdAt: '2026-01-28T10:00:00Z'
  },
  {
    _id: 'srv_25',
    name: 'Groom Elegance Hair, Beard & Charcoal Facial',
    category: 'Bridal & Grooming',
    durationMinutes: 90,
    price: 2800,
    description: 'Precision shear haircut, hot lather beard sculpting with razor edge, and express detox facial.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500',
    isActive: true,
    createdAt: '2026-01-29T10:00:00Z'
  },
  {
    _id: 'srv_26',
    name: 'Royal Pre-Bridal 3-Hour Ultimate Glow Ritual',
    category: 'Bridal & Grooming',
    durationMinutes: 180,
    price: 6500,
    description: 'Complete ceremony package: Full body Ubtan polish, Gold Facial, Hair Spa and Deluxe Manicure.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500',
    isActive: true,
    createdAt: '2026-01-30T10:00:00Z'
  }
];

const INITIAL_USERS = [
  {
    _id: 'usr_admin_01',
    name: 'Priya Sharma (Admin)',
    email: 'admin@salon.edu',
    password: 'college123',
    role: 'Admin',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
  },
  {
    _id: 'usr_recept_01',
    name: 'Rohan Mehta (Receptionist)',
    email: 'reception@salon.edu',
    password: 'college123',
    role: 'Receptionist',
    phone: '+91 98765 43211',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    _id: 'usr_staff_01',
    name: 'Aarav Patel (Hair Stylist)',
    email: 'aarav@salon.edu',
    password: 'college123',
    role: 'Service Provider',
    phone: '+91 98765 43212',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    _id: 'usr_staff_02',
    name: 'Ananya Roy (Spa Therapist)',
    email: 'ananya@salon.edu',
    password: 'college123',
    role: 'Service Provider',
    phone: '+91 98765 43213',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
  },
  {
    _id: 'usr_cust_01',
    name: 'Neha Gupta (Customer)',
    email: 'customer@salon.edu',
    password: 'college123',
    role: 'Customer',
    phone: '+91 98765 43214',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  }
];

const INITIAL_STAFF = [
  {
    _id: 'stf_01',
    user: INITIAL_USERS[2],
    specialization: 'Senior Hair Stylist & Colorist',
    experienceYears: 6,
    bio: 'Trained at Toni&Guy Academy. Specializes in textured cuts, highlights and keratin treatments.',
    rating: 4.9,
    ratingCount: 24,
    isActive: true
  },
  {
    _id: 'stf_02',
    user: INITIAL_USERS[3],
    specialization: 'Ayurvedic & Aromatherapy Spa Therapist',
    experienceYears: 5,
    bio: 'Certified wellness practitioner focusing on deep-tissue reflexology and holistic skin rejuvenation.',
    rating: 4.8,
    ratingCount: 19,
    isActive: true
  }
];

const INITIAL_SCHEDULES = [
  { _id: 'sch_01', staff: 'usr_staff_01', dayOfWeek: 'Monday', startTime: '09:00', endTime: '18:00', breakStartTime: '13:00', breakEndTime: '14:00', isAvailable: true },
  { _id: 'sch_02', staff: 'usr_staff_01', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '18:00', breakStartTime: '13:00', breakEndTime: '14:00', isAvailable: true },
  { _id: 'sch_03', staff: 'usr_staff_01', dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '18:00', breakStartTime: '13:00', breakEndTime: '14:00', isAvailable: true },
  { _id: 'sch_04', staff: 'usr_staff_01', dayOfWeek: 'Thursday', startTime: '09:00', endTime: '18:00', breakStartTime: '13:00', breakEndTime: '14:00', isAvailable: true },
  { _id: 'sch_05', staff: 'usr_staff_01', dayOfWeek: 'Friday', startTime: '09:00', endTime: '18:00', breakStartTime: '13:00', breakEndTime: '14:00', isAvailable: true },
  { _id: 'sch_06', staff: 'usr_staff_01', dayOfWeek: 'Saturday', startTime: '10:00', endTime: '19:00', breakStartTime: '14:00', breakEndTime: '15:00', isAvailable: true },
  { _id: 'sch_07', staff: 'usr_staff_02', dayOfWeek: 'Monday', startTime: '10:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00', isAvailable: true },
  { _id: 'sch_08', staff: 'usr_staff_02', dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00', isAvailable: true },
  { _id: 'sch_09', staff: 'usr_staff_02', dayOfWeek: 'Thursday', startTime: '10:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00', isAvailable: true },
  { _id: 'sch_10', staff: 'usr_staff_02', dayOfWeek: 'Friday', startTime: '10:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00', isAvailable: true },
  { _id: 'sch_11', staff: 'usr_staff_02', dayOfWeek: 'Saturday', startTime: '10:00', endTime: '20:00', breakStartTime: '14:00', breakEndTime: '15:00', isAvailable: true },
  { _id: 'sch_12', staff: 'usr_staff_02', dayOfWeek: 'Sunday', startTime: '11:00', endTime: '17:00', breakStartTime: '13:00', breakEndTime: '14:00', isAvailable: true }
];

const INITIAL_APPOINTMENTS = [
  {
    _id: 'apt_01',
    customer: INITIAL_USERS[4],
    service: INITIAL_SERVICES[0],
    staff: INITIAL_USERS[2],
    appointmentDate: '2026-11-06',
    timeSlot: '11:00',
    durationMinutes: 60,
    status: 'Confirmed',
    notes: 'Please use anti-frizz serum during blow dry.',
    totalAmount: 1200,
    payment: { _id: 'pay_01', amount: 1200, paymentMethod: 'UPI', status: 'Completed' },
    createdAt: '2026-11-01T09:30:00Z'
  },
  {
    _id: 'apt_02',
    customer: INITIAL_USERS[4],
    service: INITIAL_SERVICES[2],
    staff: INITIAL_USERS[3],
    appointmentDate: '2026-11-08',
    timeSlot: '15:00',
    durationMinutes: 90,
    status: 'Pending',
    notes: 'Customer requested soft pressure on shoulder.',
    totalAmount: 2500,
    payment: null,
    createdAt: '2026-11-03T14:15:00Z'
  },
  {
    _id: 'apt_03',
    customer: INITIAL_USERS[4],
    service: INITIAL_SERVICES[1],
    staff: INITIAL_USERS[3],
    appointmentDate: '2026-10-25',
    timeSlot: '14:00',
    durationMinutes: 45,
    status: 'Completed',
    notes: 'Pre-wedding facial treatment.',
    totalAmount: 1500,
    payment: { _id: 'pay_02', amount: 1500, paymentMethod: 'Card', status: 'Completed' },
    review: { _id: 'rev_01', rating: 5, comment: 'Ananya was wonderful! My skin felt glowing for days.' },
    createdAt: '2026-10-20T10:00:00Z'
  }
];

export const getClientData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = {
        users: INITIAL_USERS,
        services: INITIAL_SERVICES,
        staff: INITIAL_STAFF,
        schedules: INITIAL_SCHEDULES,
        appointments: INITIAL_APPOINTMENTS,
        payments: [
          {
            _id: 'pay_01',
            appointment: { _id: 'apt_01', appointmentDate: '2026-11-06', timeSlot: '11:00', serviceName: 'Deluxe Hair Spa & Cut' },
            customer: INITIAL_USERS[4],
            amount: 1200,
            paymentMethod: 'UPI',
            status: 'Completed',
            transactionId: 'UPI-TXN-8829104',
            paidAt: '2026-11-01T09:35:00Z'
          },
          {
            _id: 'pay_02',
            appointment: { _id: 'apt_03', appointmentDate: '2026-10-25', timeSlot: '14:00', serviceName: 'Gold Glow Radiance Facial' },
            customer: INITIAL_USERS[4],
            amount: 1500,
            paymentMethod: 'Card',
            status: 'Completed',
            transactionId: 'CARD-TXN-4491023',
            paidAt: '2026-10-25T15:00:00Z'
          }
        ],
        reviews: [
          {
            _id: 'rev_01',
            appointment: 'apt_03',
            customer: INITIAL_USERS[4],
            service: INITIAL_SERVICES[1],
            staff: INITIAL_USERS[3],
            rating: 5,
            comment: 'Ananya was wonderful! My skin felt so refreshed and glowing for days.',
            createdAt: '2026-10-26T11:00:00Z'
          }
        ]
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading client storage:', err);
    return {
      users: INITIAL_USERS,
      services: INITIAL_SERVICES,
      staff: INITIAL_STAFF,
      schedules: INITIAL_SCHEDULES,
      appointments: INITIAL_APPOINTMENTS,
      payments: [],
      reviews: []
    };
  }
};

export const saveClientData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving client storage:', err);
  }
};
