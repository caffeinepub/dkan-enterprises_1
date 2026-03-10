import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import React, { useState } from "react";
import { ServiceType, TimeSlot } from "../backend";
import type { BookingInput } from "../backend";
import { useActor } from "../hooks/useActor";
import { useLanguage } from "../hooks/useLanguage";
import { useCreateBooking } from "../hooks/useQueries";
import { t } from "../translations";

const UP_DISTRICTS = [
  "Agra",
  "Aligarh",
  "Ambedkar Nagar",
  "Amethi",
  "Amroha",
  "Auraiya",
  "Ayodhya",
  "Azamgarh",
  "Baghpat",
  "Bahraich",
  "Ballia",
  "Balrampur",
  "Banda",
  "Barabanki",
  "Bareilly",
  "Basti",
  "Bhadohi",
  "Bijnor",
  "Budaun",
  "Bulandshahr",
  "Chandauli",
  "Chitrakoot",
  "Deoria",
  "Etah",
  "Etawah",
  "Farrukhabad",
  "Fatehpur",
  "Firozabad",
  "Gautam Buddha Nagar",
  "Ghaziabad",
  "Ghazipur",
  "Gonda",
  "Gorakhpur",
  "Hamirpur",
  "Hapur",
  "Hardoi",
  "Hathras",
  "Jalaun",
  "Jaunpur",
  "Jhansi",
  "Kannauj",
  "Kanpur Dehat",
  "Kanpur Nagar",
  "Kasganj",
  "Kaushambi",
  "Kheri",
  "Kushinagar",
  "Lalitpur",
  "Lucknow",
  "Maharajganj",
  "Mahoba",
  "Mainpuri",
  "Mathura",
  "Mau",
  "Meerut",
  "Mirzapur",
  "Moradabad",
  "Muzaffarnagar",
  "Pilibhit",
  "Pratapgarh",
  "Prayagraj",
  "Raebareli",
  "Rampur",
  "Saharanpur",
  "Sambhal",
  "Sant Kabir Nagar",
  "Shahjahanpur",
  "Shamli",
  "Shravasti",
  "Siddharthnagar",
  "Sitapur",
  "Sonbhadra",
  "Sultanpur",
  "Unnao",
  "Varanasi",
];

const STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const serviceOptions = [
  { value: ServiceType.acRepair, labelHi: "एसी मरम्मत", labelEn: "AC Repair" },
  {
    value: ServiceType.washingMachineRepair,
    labelHi: "वाशिंग मशीन मरम्मत",
    labelEn: "Washing Machine Repair",
  },
  {
    value: ServiceType.refrigeratorRepair,
    labelHi: "रेफ्रिजरेटर मरम्मत",
    labelEn: "Refrigerator Repair",
  },
  {
    value: ServiceType.microwaveRepair,
    labelHi: "माइक्रोवेव मरम्मत",
    labelEn: "Microwave Repair",
  },
  {
    value: ServiceType.geyserRepair,
    labelHi: "गीज़र मरम्मत",
    labelEn: "Geyser Repair",
  },
  {
    value: ServiceType.lcdLedTvRepair,
    labelHi: "LCD/LED TV मरम्मत",
    labelEn: "LCD/LED TV Repair",
  },
  {
    value: ServiceType.waterPurifier,
    labelHi: "वाटर प्यूरीफायर",
    labelEn: "Water Purifier",
  },
];

const timeSlotOptions = [
  {
    value: TimeSlot.morning_9_12,
    labelHi: "सुबह 9 - 12 बजे",
    labelEn: "Morning 9 AM – 12 PM",
  },
  {
    value: TimeSlot.afternoon_12_4,
    labelHi: "दोपहर 12 - 4 बजे",
    labelEn: "Afternoon 12 PM – 4 PM",
  },
  {
    value: TimeSlot.evening_4_7,
    labelHi: "शाम 4 - 7 बजे",
    labelEn: "Evening 4 PM – 7 PM",
  },
];

interface FormData {
  customerName: string;
  phoneNumber: string;
  state: string;
  district: string;
  location: string;
  serviceType: ServiceType | "";
  preferredDate: string;
  timeSlot: TimeSlot | "";
  problemDescription: string;
}

const initialForm: FormData = {
  customerName: "",
  phoneNumber: "",
  state: "Uttar Pradesh",
  district: "",
  location: "",
  serviceType: "",
  preferredDate: "",
  timeSlot: "",
  problemDescription: "",
};

function getErrorMessage(error: unknown, lang: "hi" | "en"): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (
    msg.includes("Actor not initialized") ||
    msg.includes("still initializing") ||
    msg.includes("Actor not available")
  ) {
    return t("booking.bookingActorError", lang);
  }
  if (
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("timeout") ||
    msg.includes("Failed to fetch")
  ) {
    return t("booking.bookingNetworkError", lang);
  }
  if (
    msg.includes("cannot be empty") ||
    msg.includes("Customer name") ||
    msg.includes("Phone number") ||
    msg.includes("State") ||
    msg.includes("District") ||
    msg.includes("Location")
  ) {
    return lang === "hi"
      ? `जानकारी अधूरी है: ${msg}`
      : `Validation error: ${msg}`;
  }
  return lang === "hi"
    ? `${t("booking.bookingError", lang)} (${msg})`
    : `${t("booking.bookingError", lang)} (${msg})`;
}

export default function BookingForm() {
  const { lang } = useLanguage();
  const { actor, isFetching: actorFetching } = useActor();
  const actorError = false;
  const refetchActor = () => {
    window.location.reload();
  };
  const {
    mutate: createBooking,
    isPending,
    isSuccess,
    reset,
  } = useCreateBooking();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormData>(initialForm);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<bigint | null>(null);
  const [isWaitingForActor, setIsWaitingForActor] = useState(false);

  const actorRef = React.useRef(actor);
  actorRef.current = actor;
  const actorFetchingRef = React.useRef(actorFetching);
  actorFetchingRef.current = actorFetching;

  const isActorReady = !!actor && !actorFetching;

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (submitError) setSubmitError(null);
  };

  const doSubmit = React.useCallback(
    (input: BookingInput) => {
      createBooking(input, {
        onSuccess: (id) => {
          setBookingId(id);
          setSubmitError(null);
          setIsWaitingForActor(false);
          setForm(initialForm);
          queryClient.invalidateQueries({ queryKey: ["allBookings"] });
        },
        onError: (error) => {
          setIsWaitingForActor(false);
          setSubmitError(getErrorMessage(error, lang));
        },
      });
    },
    [createBooking, lang, queryClient],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!form.serviceType || !form.timeSlot) {
      setSubmitError(t("booking.fillAllFields", lang));
      return;
    }

    const input: BookingInput = {
      customerName: form.customerName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      state: form.state,
      district: form.district,
      location: form.location.trim(),
      serviceType: form.serviceType as ServiceType,
      preferredDate: form.preferredDate,
      timeSlot: form.timeSlot as TimeSlot,
      problemDescription: form.problemDescription.trim(),
    };

    if (actorRef.current && !actorFetchingRef.current) {
      doSubmit(input);
      return;
    }

    setIsWaitingForActor(true);
    // Trigger a fresh refetch if actor is not loading
    if (!actorFetchingRef.current) {
      refetchActor();
    }

    const maxWait = 30000;
    const interval = 500;
    let waited = 0;
    let extraRefetchDone = false;

    const waitAndSubmit = setInterval(() => {
      waited += interval;
      if (actorRef.current && !actorFetchingRef.current) {
        clearInterval(waitAndSubmit);
        doSubmit(input);
      } else if (
        !actorFetchingRef.current &&
        !actorRef.current &&
        !extraRefetchDone &&
        waited > 5000
      ) {
        extraRefetchDone = true;
        refetchActor();
      } else if (waited >= maxWait) {
        clearInterval(waitAndSubmit);
        setIsWaitingForActor(false);
        setSubmitError(
          lang === "hi"
            ? "सर्वर से कनेक्ट नहीं हो पाया। कृपया पेज रिफ्रेश करके दोबारा कोशिश करें।"
            : "Could not connect to server. Please refresh the page and try again.",
        );
      }
    }, interval);
  };

  const handleRetry = () => {
    setSubmitError(null);
    reset();
    if (!actor) refetchActor();
  };

  if (isSuccess) {
    // Build WhatsApp message with booking details
    const serviceLabels: Record<string, string> = {
      acRepair: "AC Repair",
      washingMachineRepair: "Washing Machine",
      refrigeratorRepair: "Refrigerator",
      microwaveRepair: "Microwave",
      geyserRepair: "Geyser",
      lcdLedTvRepair: "LCD/LED TV",
      waterPurifier: "Water Purifier",
    };
    const whatsappText = encodeURIComponent(
      `🔔 नई बुकिंग - DKAN Enterprises\n━━━━━━━━━━━━━━━━\n📋 बुकिंग ID: #${bookingId !== null ? String(bookingId) : "N/A"}\n👤 नाम: ${form.customerName}\n📞 फोन: ${form.phoneNumber}\n🔧 सेवा: ${serviceLabels[form.serviceType] || form.serviceType}\n📍 स्थान: ${form.location}, ${form.district}, ${form.state}\n📅 तारीख: ${form.preferredDate}\n⏰ समय: ${form.timeSlot}\n📝 समस्या: ${form.problemDescription}\n━━━━━━━━━━━━━━━━\nकृपया जल्द सम्पर्क करें।`,
    );
    const whatsappUrl = `https://wa.me/918009675645?text=${whatsappText}`;

    return (
      <section id="booking" className="py-16 bg-background">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-card border border-border rounded-2xl p-10 text-center shadow-navy-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {t("booking.bookingSuccessTitle", lang)}
            </h2>
            {bookingId !== null && (
              <p className="text-muted-foreground mb-1">
                {t("booking.bookingId", lang)}{" "}
                <span className="font-mono font-semibold text-primary">
                  #{String(bookingId)}
                </span>
              </p>
            )}
            <p className="text-muted-foreground mb-6">
              {t("booking.contactSoon", lang)}
            </p>

            {/* WhatsApp Notification Button */}
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-800 font-medium mb-3">
                {lang === "hi"
                  ? "📱 व्हाट्सएप पर बुकिंग भेजें (एडमिन को सूचित करें)"
                  : "📱 Send booking on WhatsApp (Notify Admin)"}
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="booking.whatsapp_button"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors text-sm"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-current"
                  aria-label="WhatsApp"
                  role="img"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {lang === "hi" ? "व्हाट्सएप पर भेजें" : "Send on WhatsApp"}
              </a>
            </div>

            <button
              type="button"
              onClick={() => {
                reset();
                setBookingId(null);
                setSubmitError(null);
              }}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              {t("booking.newBooking", lang)}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const inputClass =
    "w-full px-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm";
  const labelClass = "block text-sm font-semibold text-foreground mb-1.5";

  return (
    <section id="booking" className="py-16 bg-muted/30">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {t("booking.title", lang)}
          </h2>
          <p className="text-muted-foreground">{t("booking.subtitle", lang)}</p>
        </div>

        {actorError && !actor && (
          <div className="mb-4 flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span className="flex-1">
              {lang === "hi" ? "कनेक्शन में समस्या है" : "Connection issue"}
            </span>
            <button
              type="button"
              onClick={() => refetchActor()}
              className="text-xs underline hover:no-underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              {lang === "hi" ? "फिर कोशिश करें" : "Retry"}
            </button>
          </div>
        )}

        {!isActorReady && !actorError && (
          <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded-lg px-3 py-2">
            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
            {lang === "hi" ? "कनेक्ट हो रहा है..." : "Connecting..."}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-navy-lg space-y-5"
        >
          <div>
            <label htmlFor="booking-name" className={labelClass}>
              {t("booking.name", lang)}
            </label>
            <input
              id="booking-name"
              type="text"
              required
              value={form.customerName}
              onChange={(e) => handleChange("customerName", e.target.value)}
              placeholder={lang === "hi" ? "आपका नाम" : "Your name"}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="booking-phone" className={labelClass}>
              {t("booking.phone", lang)}
            </label>
            <input
              id="booking-phone"
              type="tel"
              required
              value={form.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="booking-state" className={labelClass}>
              {t("booking.state", lang)}
            </label>
            <select
              id="booking-state"
              required
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
              className={inputClass}
            >
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="booking-district" className={labelClass}>
              {t("booking.district", lang)}
            </label>
            {form.state === "Uttar Pradesh" ? (
              <select
                id="booking-district"
                required
                value={form.district}
                onChange={(e) => handleChange("district", e.target.value)}
                className={inputClass}
              >
                <option value="">{t("booking.selectDistrict", lang)}</option>
                {UP_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="booking-district"
                type="text"
                required
                value={form.district}
                onChange={(e) => handleChange("district", e.target.value)}
                placeholder={lang === "hi" ? "जिला का नाम" : "District name"}
                className={inputClass}
              />
            )}
          </div>

          <div>
            <label htmlFor="booking-location" className={labelClass}>
              {t("booking.location", lang)}
            </label>
            <input
              id="booking-location"
              type="text"
              required
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder={
                lang === "hi" ? "गली, मोहल्ला, शहर" : "Street, locality, city"
              }
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="booking-service-type" className={labelClass}>
              {t("booking.serviceType", lang)}
            </label>
            <select
              id="booking-service-type"
              required
              value={form.serviceType}
              onChange={(e) => handleChange("serviceType", e.target.value)}
              className={inputClass}
            >
              <option value="">{t("booking.selectService", lang)}</option>
              {serviceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {lang === "hi" ? opt.labelHi : opt.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="booking-preferred-date" className={labelClass}>
              {t("booking.preferredDate", lang)}
            </label>
            <input
              id="booking-preferred-date"
              type="date"
              required
              value={form.preferredDate}
              onChange={(e) => handleChange("preferredDate", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="booking-time-slot" className={labelClass}>
              {t("booking.timeSlot", lang)}
            </label>
            <select
              id="booking-time-slot"
              required
              value={form.timeSlot}
              onChange={(e) => handleChange("timeSlot", e.target.value)}
              className={inputClass}
            >
              <option value="">{t("booking.selectTime", lang)}</option>
              {timeSlotOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {lang === "hi" ? opt.labelHi : opt.labelEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="booking-problem-description" className={labelClass}>
              {t("booking.problemDescription", lang)}
            </label>
            <textarea
              id="booking-problem-description"
              value={form.problemDescription}
              onChange={(e) =>
                handleChange("problemDescription", e.target.value)
              }
              placeholder={
                lang === "hi"
                  ? "अपनी समस्या विस्तार से बताएं..."
                  : "Describe your problem in detail..."
              }
              rows={3}
              className={inputClass}
            />
          </div>

          {submitError && (
            <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  {lang === "hi" ? "त्रुटि" : "Error"}
                </p>
                <p className="text-sm text-destructive/90 mt-0.5">
                  {submitError}
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-2 text-xs text-destructive underline flex items-center gap-1 hover:no-underline"
                >
                  <RefreshCw className="w-3 h-3" />
                  {t("booking.tryAgain", lang)}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || isWaitingForActor}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending || isWaitingForActor ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isWaitingForActor
                  ? lang === "hi"
                    ? "कनेक्ट हो रहा है..."
                    : "Connecting..."
                  : t("booking.submitting", lang)}
              </>
            ) : (
              t("booking.submit", lang)
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
