import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { translations, t } from '../translations';
import { useCreateBooking, useGetDistrictsByState } from '../hooks/useQueries';
import { ServiceType, TimeSlot } from '../backend';
import SevaMitraBadge from './SevaMitraBadge';

const STATES = [
  { value: 'andhra pradesh', label: 'Andhra Pradesh / आंध्र प्रदेश' },
  { value: 'arunachal pradesh', label: 'Arunachal Pradesh / अरुणाचल प्रदेश' },
  { value: 'assam', label: 'Assam / असम' },
  { value: 'bihar', label: 'Bihar / बिहार' },
  { value: 'chhattisgarh', label: 'Chhattisgarh / छत्तीसगढ़' },
  { value: 'goa', label: 'Goa / गोवा' },
  { value: 'gujarat', label: 'Gujarat / गुजरात' },
  { value: 'haryana', label: 'Haryana / हरियाणा' },
  { value: 'himachal pradesh', label: 'Himachal Pradesh / हिमाचल प्रदेश' },
  { value: 'jharkhand', label: 'Jharkhand / झारखंड' },
  { value: 'karnataka', label: 'Karnataka / कर्नाटक' },
  { value: 'kerala', label: 'Kerala / केरल' },
  { value: 'madhya pradesh', label: 'Madhya Pradesh / मध्य प्रदेश' },
  { value: 'maharashtra', label: 'Maharashtra / महाराष्ट्र' },
  { value: 'manipur', label: 'Manipur / मणिपुर' },
  { value: 'meghalaya', label: 'Meghalaya / मेघालय' },
  { value: 'mizoram', label: 'Mizoram / मिजोरम' },
  { value: 'nagaland', label: 'Nagaland / नागालैंड' },
  { value: 'odisha', label: 'Odisha / ओडिशा' },
  { value: 'punjab', label: 'Punjab / पंजाब' },
  { value: 'rajasthan', label: 'Rajasthan / राजस्थान' },
  { value: 'sikkim', label: 'Sikkim / सिक्किम' },
  { value: 'tamil nadu', label: 'Tamil Nadu / तमिल नाडु' },
  { value: 'telangana', label: 'Telangana / तेलंगाना' },
  { value: 'tripura', label: 'Tripura / त्रिपुरा' },
  { value: 'uttar pradesh', label: 'Uttar Pradesh / उत्तर प्रदेश' },
  { value: 'uttarakhand', label: 'Uttarakhand / उत्तराखंड' },
  { value: 'west bengal', label: 'West Bengal / पश्चिम बंगाल' },
  // Union Territories
  { value: 'andaman and nicobar islands', label: 'Andaman & Nicobar Islands / अंडमान और निकोबार' },
  { value: 'chandigarh', label: 'Chandigarh / चंडीगढ़' },
  { value: 'dadra and nagar haveli and daman and diu', label: 'Dadra & Nagar Haveli and Daman & Diu' },
  { value: 'delhi', label: 'Delhi / दिल्ली' },
  { value: 'jammu and kashmir', label: 'Jammu & Kashmir / जम्मू और कश्मीर' },
  { value: 'ladakh', label: 'Ladakh / लद्दाख' },
  { value: 'lakshadweep', label: 'Lakshadweep / लक्षद्वीप' },
  { value: 'puducherry', label: 'Puducherry / पुडुचेरी' },
];

export default function BookingForm() {
  const { lang } = useLanguage();
  const createBooking = useCreateBooking();

  const [form, setForm] = useState({
    customerName: '',
    phoneNumber: '',
    state: '',
    district: '',
    location: '',
    serviceType: '' as ServiceType | '',
    problemDescription: '',
    preferredDate: '',
    timeSlot: '' as TimeSlot | '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState<bigint | null>(null);

  // Fetch districts based on selected state
  const { data: districts = [], isLoading: districtsLoading } = useGetDistrictsByState(form.state);

  const handleStateChange = (value: string) => {
    setForm(prev => ({ ...prev, state: value, district: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.customerName.trim()) newErrors.customerName = lang === 'hi' ? 'नाम आवश्यक है' : 'Name is required';
    if (!form.phoneNumber.trim() || !/^\d{10}$/.test(form.phoneNumber.trim())) {
      newErrors.phoneNumber = lang === 'hi' ? 'सही 10 अंकों का फोन नंबर दर्ज करें' : 'Enter valid 10-digit phone number';
    }
    if (!form.state) newErrors.state = lang === 'hi' ? 'राज्य चुनें' : 'Select state';
    if (!form.district.trim()) newErrors.district = lang === 'hi' ? 'जिला दर्ज करें' : 'Enter district';
    if (!form.location.trim()) newErrors.location = lang === 'hi' ? 'पता आवश्यक है' : 'Address is required';
    if (!form.serviceType) newErrors.serviceType = lang === 'hi' ? 'सेवा चुनें' : 'Select service';
    if (!form.preferredDate) newErrors.preferredDate = lang === 'hi' ? 'तारीख चुनें' : 'Select date';
    if (!form.timeSlot) newErrors.timeSlot = lang === 'hi' ? 'समय चुनें' : 'Select time slot';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      const id = await createBooking.mutateAsync({
        customerName: form.customerName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        state: form.state,
        district: form.district.trim(),
        location: form.location.trim(),
        serviceType: form.serviceType as ServiceType,
        problemDescription: form.problemDescription.trim(),
        preferredDate: form.preferredDate,
        timeSlot: form.timeSlot as TimeSlot,
      });
      setBookingId(id);
      setSubmitted(true);
    } catch (err) {
      // error handled by mutation state
    }
  };

  if (submitted && bookingId !== null) {
    return (
      <section id="booking" className="py-16 bg-gradient-to-br from-navy/5 to-electric/5">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-navy mb-2 font-poppins">
              {lang === 'hi' ? 'बुकिंग सफल!' : 'Booking Successful!'}
            </h2>
            <p className="text-gray-600 mb-2 font-devanagari">
              {lang === 'hi' ? 'आपकी बुकिंग ID है:' : 'Your Booking ID is:'}
            </p>
            <p className="text-3xl font-bold text-electric mb-4">#{bookingId.toString()}</p>
            <p className="text-sm text-gray-500 font-devanagari">
              {lang === 'hi'
                ? 'हम जल्द ही आपसे संपर्क करेंगे। धन्यवाद!'
                : 'We will contact you shortly. Thank you!'}
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setBookingId(null);
                setForm({
                  customerName: '', phoneNumber: '', state: '', district: '',
                  location: '', serviceType: '', problemDescription: '',
                  preferredDate: '', timeSlot: '',
                });
              }}
              className="mt-6 bg-navy text-white px-6 py-2 rounded-full font-medium hover:bg-navy/90 transition-colors font-poppins"
            >
              {lang === 'hi' ? 'नई बुकिंग करें' : 'New Booking'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const serviceOptions = [
    { value: ServiceType.acRepair, labelEn: 'AC Repair', labelHi: 'एसी मरम्मत' },
    { value: ServiceType.washingMachineRepair, labelEn: 'Washing Machine Repair', labelHi: 'वाशिंग मशीन मरम्मत' },
    { value: ServiceType.refrigeratorRepair, labelEn: 'Refrigerator Repair', labelHi: 'फ्रिज मरम्मत' },
    { value: ServiceType.microwaveRepair, labelEn: 'Microwave Repair', labelHi: 'माइक्रोवेव मरम्मत' },
    { value: ServiceType.geyserRepair, labelEn: 'Geyser Repair', labelHi: 'गीजर मरम्मत' },
    { value: ServiceType.lcdLedTvRepair, labelEn: 'LCD/LED TV Repair', labelHi: 'एलसीडी/एलईडी टीवी मरम्मत' },
    { value: ServiceType.waterPurifier, labelEn: 'Water Purifier', labelHi: 'वाटर प्यूरीफायर' },
  ];

  const timeSlotOptions = [
    { value: TimeSlot.morning_9_12, labelEn: 'Morning (9am–12pm)', labelHi: 'सुबह (9–12 बजे)' },
    { value: TimeSlot.afternoon_12_4, labelEn: 'Afternoon (12pm–4pm)', labelHi: 'दोपहर (12–4 बजे)' },
    { value: TimeSlot.evening_4_7, labelEn: 'Evening (4pm–7pm)', labelHi: 'शाम (4–7 बजे)' },
  ];

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent transition-all font-devanagari";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1 font-devanagari";
  const errorClass = "text-red-500 text-xs mt-1 font-devanagari";

  // Whether the selected state has backend district data
  const hasDistrictData = districts.length > 0;

  return (
    <section id="booking" className="py-16 bg-gradient-to-br from-navy/5 to-electric/5">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <SevaMitraBadge variant="inline" />
          <h2 className="text-3xl font-bold text-navy mt-4 mb-2 font-poppins">
            {t(translations.booking.title, lang)}
          </h2>
          <p className="text-gray-600 font-devanagari">
            {t(translations.booking.subtitle, lang)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Customer Name */}
            <div>
              <label className={labelClass}>{t(translations.booking.name, lang)} *</label>
              <input
                type="text"
                value={form.customerName}
                onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))}
                placeholder={lang === 'hi' ? 'अपना पूरा नाम दर्ज करें' : 'Enter your full name'}
                className={inputClass}
              />
              {errors.customerName && <p className={errorClass}>{errors.customerName}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className={labelClass}>{t(translations.booking.phone, lang)} *</label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
                placeholder={lang === 'hi' ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
                maxLength={10}
                className={inputClass}
              />
              {errors.phoneNumber && <p className={errorClass}>{errors.phoneNumber}</p>}
            </div>

            {/* State */}
            <div>
              <label className={labelClass}>
                {t(translations.booking.stateLabel, lang)} *
              </label>
              <select
                value={form.state}
                onChange={e => handleStateChange(e.target.value)}
                className={inputClass}
                size={1}
              >
                <option value="">{t(translations.booking.statePlaceholder, lang)}</option>
                {STATES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {errors.state && <p className={errorClass}>{errors.state}</p>}
            </div>

            {/* District */}
            <div>
              <label className={labelClass}>
                {lang === 'hi' ? 'जिला / District' : 'जिला / District'} *
              </label>
              {form.state && !districtsLoading && hasDistrictData ? (
                // Show dropdown if backend has district data for this state
                <select
                  value={form.district}
                  onChange={e => setForm(p => ({ ...p, district: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">
                    {lang === 'hi' ? 'जिला चुनें' : 'Select District'}
                  </option>
                  {districts.map(d => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                // Show text input for states without backend district data
                <input
                  type="text"
                  value={form.district}
                  onChange={e => setForm(p => ({ ...p, district: e.target.value }))}
                  disabled={!form.state || districtsLoading}
                  placeholder={
                    districtsLoading
                      ? (lang === 'hi' ? 'लोड हो रहा है...' : 'Loading...')
                      : !form.state
                        ? (lang === 'hi' ? 'पहले राज्य चुनें' : 'Select state first')
                        : (lang === 'hi' ? 'अपना जिला दर्ज करें' : 'Enter your district')
                  }
                  className={`${inputClass} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                />
              )}
              {errors.district && <p className={errorClass}>{errors.district}</p>}
            </div>

            {/* Address */}
            <div>
              <label className={labelClass}>
                {lang === 'hi' ? 'पूरा पता' : 'Full Address'} *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                placeholder={lang === 'hi' ? 'पूरा पता दर्ज करें' : 'Enter full address'}
                className={inputClass}
              />
              {errors.location && <p className={errorClass}>{errors.location}</p>}
            </div>

            {/* Service Type */}
            <div>
              <label className={labelClass}>{t(translations.booking.serviceType, lang)} *</label>
              <select
                value={form.serviceType}
                onChange={e => setForm(p => ({ ...p, serviceType: e.target.value as ServiceType }))}
                className={inputClass}
              >
                <option value="">{t(translations.booking.serviceTypePlaceholder, lang)}</option>
                {serviceOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {lang === 'hi' ? opt.labelHi : opt.labelEn}
                  </option>
                ))}
              </select>
              {errors.serviceType && <p className={errorClass}>{errors.serviceType}</p>}
            </div>

            {/* Problem Description */}
            <div>
              <label className={labelClass}>{t(translations.booking.problem, lang)}</label>
              <textarea
                value={form.problemDescription}
                onChange={e => setForm(p => ({ ...p, problemDescription: e.target.value }))}
                placeholder={t(translations.booking.problemPlaceholder, lang)}
                rows={3}
                className={inputClass}
              />
            </div>

            {/* Preferred Date */}
            <div>
              <label className={labelClass}>{t(translations.booking.date, lang)} *</label>
              <input
                type="date"
                value={form.preferredDate}
                onChange={e => setForm(p => ({ ...p, preferredDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className={inputClass}
              />
              {errors.preferredDate && <p className={errorClass}>{errors.preferredDate}</p>}
            </div>

            {/* Time Slot */}
            <div>
              <label className={labelClass}>{t(translations.booking.timeSlot, lang)} *</label>
              <select
                value={form.timeSlot}
                onChange={e => setForm(p => ({ ...p, timeSlot: e.target.value as TimeSlot }))}
                className={inputClass}
              >
                <option value="">{t(translations.booking.timeSlotPlaceholder, lang)}</option>
                {timeSlotOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {lang === 'hi' ? opt.labelHi : opt.labelEn}
                  </option>
                ))}
              </select>
              {errors.timeSlot && <p className={errorClass}>{errors.timeSlot}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={createBooking.isPending}
              className="w-full bg-navy text-white py-3 rounded-xl font-bold text-lg hover:bg-navy/90 transition-all shadow-navy-lg disabled:opacity-50 flex items-center justify-center gap-2 font-poppins"
            >
              {createBooking.isPending ? (
                <>
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                  {t(translations.booking.submitting, lang)}
                </>
              ) : (
                t(translations.booking.submit, lang)
              )}
            </button>

            {createBooking.isError && (
              <p className="text-red-500 text-sm text-center font-devanagari">
                {t(translations.booking.errorMsg, lang)}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
