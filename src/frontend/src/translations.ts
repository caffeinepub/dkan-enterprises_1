export type Language = 'hi' | 'en';

export type TranslationEntry = { hi: string; en: string };

export const translations = {
  nav: {
    home: { hi: 'होम', en: 'Home' },
    services: { hi: 'सेवाएं', en: 'Services' },
    booking: { hi: 'बुकिंग', en: 'Booking' },
    testimonials: { hi: 'समीक्षाएं', en: 'Reviews' },
    contact: { hi: 'संपर्क', en: 'Contact' },
    admin: { hi: 'एडमिन', en: 'Admin' },
    langToggle: { hi: 'EN', en: 'हिं' },
    langLabel: { hi: 'Switch to English', en: 'हिंदी में बदलें' },
  },
  hero: {
    badge: { hi: 'उत्तर प्रदेश सरकार का सेवामित्र पार्टनर', en: 'Uttar Pradesh Sarkar ka SevaMitra Partner' },
    headline: { hi: 'घर बैठे पाएं सर्वश्रेष्ठ होम अप्लायंस रिपेयर सेवा', en: 'Get the Best Home Appliance Repair Service at Your Doorstep' },
    headline1: { hi: 'इलेक्ट्रॉनिक्स रिपेयर', en: 'Electronics Repair' },
    headline2: { hi: 'एक्सपर्ट्स - All India', en: 'Experts - All India' },
    subheadline: { hi: 'AC, वाशिंग मशीन, फ्रिज, माइक्रोवेव और अधिक की मरम्मत', en: 'Repair of AC, Washing Machine, Fridge, Microwave and more' },
    subtext: {
      hi: 'मोबाइल, लैपटॉप, AC, फ्रिज — सभी इलेक्ट्रॉनिक्स की चिप-लेवल रिपेयर आपके घर पर',
      en: 'Mobile, Laptop, AC, Fridge — Chip-level repair for all electronics at your doorstep',
    },
    cta: { hi: 'अभी बुक करें', en: 'Book Now' },
    ctaSub: { hi: 'फ्री पिकअप & डिलीवरी', en: 'Free Pickup & Delivery' },
    upGovPartnership: { hi: 'उत्तर प्रदेश सरकार के साथ साझेदारी में', en: 'In partnership with Uttar Pradesh Government' },
    stats: {
      customers: { hi: '5000+ खुश ग्राहक', en: '5000+ Happy Customers' },
      experience: { hi: '10+ साल अनुभव', en: '10+ Years Experience' },
      warranty: { hi: '90 दिन वारंटी', en: '90 Day Warranty' },
    },
  },
  services: {
    title: { hi: 'हमारी सेवाएं', en: 'Our Services' },
    subtitle: {
      hi: 'उत्तर प्रदेश सरकार के सेवामित्र पार्टनर द्वारा प्रमाणित सेवाएं',
      en: 'Services certified by Uttar Pradesh Government SevaMitra Partner',
    },
    priceFrom: { hi: 'शुरुआत से', en: 'Starting from' },
    bookNow: { hi: 'बुक करें', en: 'Book Now' },
    priceRange: { hi: 'मूल्य सीमा', en: 'Price Range' },
    acRepair: { hi: 'AC रिपेयर', en: 'AC Repair' },
    washingMachineRepair: { hi: 'वाशिंग मशीन रिपेयर', en: 'Washing Machine Repair' },
    refrigeratorRepair: { hi: 'फ्रिज रिपेयर', en: 'Refrigerator Repair' },
    microwaveRepair: { hi: 'माइक्रोवेव रिपेयर', en: 'Microwave Repair' },
    geyserRepair: { hi: 'गीजर रिपेयर', en: 'Geyser Repair' },
    lcdLedTvRepair: { hi: 'LCD/LED TV रिपेयर', en: 'LCD/LED TV Repair' },
    waterPurifier: { hi: 'वाटर प्यूरीफायर', en: 'Water Purifier' },
  },
  booking: {
    title: { hi: 'सेवा बुक करें', en: 'Book a Service' },
    subtitle: { hi: 'अपनी समस्या बताएं, हम समाधान लाएंगे।', en: 'Tell us your problem, we will bring the solution.' },
    name: { hi: 'पूरा नाम *', en: 'Full Name *' },
    phone: { hi: 'मोबाइल नंबर *', en: 'Mobile Number *' },
    state: { hi: 'राज्य *', en: 'State *' },
    district: { hi: 'जिला *', en: 'District *' },
    selectDistrict: { hi: 'जिला चुनें', en: 'Select District' },
    location: { hi: 'पता / मोहल्ला *', en: 'Address / Locality *' },
    serviceType: { hi: 'सेवा का प्रकार *', en: 'Service Type *' },
    selectService: { hi: 'सेवा चुनें', en: 'Select Service' },
    preferredDate: { hi: 'पसंदीदा तारीख *', en: 'Preferred Date *' },
    timeSlot: { hi: 'समय स्लॉट *', en: 'Time Slot *' },
    selectTime: { hi: 'समय चुनें', en: 'Select Time' },
    problemDescription: { hi: 'समस्या का विवरण', en: 'Problem Description' },
    submit: { hi: 'बुकिंग करें', en: 'Book Now' },
    submitting: { hi: 'बुकिंग हो रही है...', en: 'Booking...' },
    fillAllFields: { hi: 'कृपया सभी फ़ील्ड भरें।', en: 'Please fill all fields.' },
    systemInitializing: { hi: 'सिस्टम तैयार हो रहा है। कृपया कुछ सेकंड प्रतीक्षा करें।', en: 'System is initializing. Please wait a few seconds.' },
    systemInitializingShort: { hi: 'सिस्टम तैयार हो रहा है...', en: 'System initializing...' },
    newBooking: { hi: 'नई बुकिंग करें', en: 'New Booking' },
    bookingId: { hi: 'बुकिंग ID:', en: 'Booking ID:' },
    contactSoon: { hi: 'हम जल्द ही आपसे संपर्क करेंगे।', en: 'We will contact you shortly.' },
    tryAgain: { hi: 'पुनः प्रयास करें', en: 'Try again' },
    bookingSuccess: {
      hi: 'बुकिंग सफलतापूर्वक हो गई! हम जल्द ही आपसे संपर्क करेंगे।',
      en: 'Booking successful! We will contact you shortly.',
    },
    bookingSuccessTitle: {
      hi: 'बुकिंग सफल!',
      en: 'Booking Successful!',
    },
    bookingError: {
      hi: 'बुकिंग में त्रुटि हुई। कृपया पुनः प्रयास करें।',
      en: 'Booking failed. Please try again.',
    },
    bookingNetworkError: {
      hi: 'नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।',
      en: 'Network error. Please check your internet connection and try again.',
    },
    bookingActorError: {
      hi: 'सिस्टम तैयार हो रहा है। कृपया कुछ सेकंड प्रतीक्षा करें और पुनः प्रयास करें।',
      en: 'System is initializing. Please wait a few seconds and try again.',
    },
    bookingValidationError: {
      hi: 'कृपया सभी आवश्यक जानकारी सही से भरें।',
      en: 'Please fill in all required information correctly.',
    },
  },
  testimonials: {
    title: { hi: 'ग्राहकों की राय', en: 'Customer Reviews' },
    subtitle: {
      hi: 'हमारे संतुष्ट ग्राहकों की समीक्षाएं',
      en: 'Reviews from our satisfied customers',
    },
  },
  contact: {
    title: { hi: 'संपर्क करें', en: 'Contact Us' },
    subtitle: { hi: 'हम आपकी सहायता के लिए यहाँ हैं', en: 'We are here to help you' },
    phone: { hi: 'फोन', en: 'Phone' },
    whatsapp: { hi: 'व्हाट्सएप', en: 'WhatsApp' },
    address: { hi: 'पता', en: 'Address' },
    addressValue: { hi: 'कानपुर, उत्तर प्रदेश', en: 'Kanpur, Uttar Pradesh' },
    hours: { hi: 'समय', en: 'Hours' },
    hoursValue: { hi: 'सोम-शनि: सुबह 9 बजे - शाम 7 बजे', en: 'Mon-Sat: 9am - 7pm' },
    email: { hi: 'ईमेल', en: 'Email' },
    upGovPartner: { hi: 'उत्तर प्रदेश सरकार का अधिकृत सेवामित्र पार्टनर', en: 'Authorized SevaMitra Partner of UP Government' },
    mapTitle: { hi: 'हमारा स्थान', en: 'Our Location' },
  },
  whatsapp: {
    chat: { hi: 'व्हाट्सएप पर चैट करें', en: 'Chat on WhatsApp' },
    label: { hi: 'व्हाट्सएप', en: 'WhatsApp' },
  },
  sevamitra: {
    badge: { hi: 'सेवामित्र पार्टनर', en: 'SevaMitra Partner' },
    tagline: { hi: 'उत्तर प्रदेश सरकार द्वारा प्रमाणित', en: 'Certified by UP Government' },
    downloadApp: { hi: 'ऐप डाउनलोड करें', en: 'Download App' },
  },
  footer: {
    tagline: { hi: 'घर बैठे पाएं विश्वसनीय होम अप्लायंस रिपेयर सेवा', en: 'Get reliable home appliance repair service at your doorstep' },
    quickLinks: { hi: 'त्वरित लिंक', en: 'Quick Links' },
    contactInfo: { hi: 'संपर्क जानकारी', en: 'Contact Info' },
    rights: { hi: 'सर्वाधिकार सुरक्षित', en: 'All rights reserved' },
    builtWith: { hi: 'प्यार से बनाया गया', en: 'Built with love' },
    upGovPartner: { hi: 'उत्तर प्रदेश सरकार का अधिकृत सेवामित्र पार्टनर', en: 'Authorized SevaMitra Partner of Uttar Pradesh Government' },
  },
  admin: {
    title: { hi: 'एडमिन डैशबोर्ड', en: 'Admin Dashboard' },
    bookings: { hi: 'बुकिंग', en: 'Bookings' },
    services: { hi: 'सेवाएं', en: 'Services' },
    settings: { hi: 'सेटिंग्स', en: 'Settings' },
    logout: { hi: 'लॉगआउट', en: 'Logout' },
    noBookings: { hi: 'कोई बुकिंग नहीं', en: 'No bookings found' },
    loading: { hi: 'लोड हो रहा है...', en: 'Loading...' },
    error: { hi: 'त्रुटि', en: 'Error' },
    status: {
      pending: { hi: 'लंबित', en: 'Pending' },
      confirmed: { hi: 'पुष्टि', en: 'Confirmed' },
      inProgress: { hi: 'प्रगति में', en: 'In Progress' },
      completed: { hi: 'पूर्ण', en: 'Completed' },
      cancelled: { hi: 'रद्द', en: 'Cancelled' },
    },
  },
};

export type TranslationKey = keyof typeof translations;

/**
 * Translate a key. Accepts either:
 *  - a dot-notation string path (e.g. "booking.title")
 *  - a TranslationEntry object ({ hi: string; en: string }) directly
 */
export function t(key: string | TranslationEntry, lang: 'hi' | 'en'): string {
  // If the caller passes a { hi, en } object directly, resolve it immediately
  if (typeof key === 'object' && key !== null) {
    return key[lang] ?? '';
  }

  // Otherwise walk the dot-notation path
  const keys = (key as string).split('.');
  let current: unknown = translations;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in (current as object)) {
      current = (current as Record<string, unknown>)[k];
    } else {
      return key as string;
    }
  }
  if (current && typeof current === 'object' && lang in (current as object)) {
    return (current as Record<string, string>)[lang];
  }
  return key as string;
}
