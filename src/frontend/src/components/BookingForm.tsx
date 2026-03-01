import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import type React from "react";
import { useState } from "react";
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
  "Uttar Pradesh",
  "Gujarat",
  "Maharashtra",
  "Madhya Pradesh",
  "Rajasthan",
  "Bihar",
  "West Bengal",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Andhra Pradesh",
  "Kerala",
  "Odisha",
  "Jharkhand",
  "Chhattisgarh",
  "Haryana",
  "Punjab",
  "Delhi",
  "Other",
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

  // Actor/initialization errors
  if (
    msg.includes("Actor not initialized") ||
    msg.includes("still initializing") ||
    msg.includes("Actor not available")
  ) {
    return t("booking.bookingActorError", lang);
  }

  // Network/fetch errors
  if (
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("timeout") ||
    msg.includes("Failed to fetch")
  ) {
    return t("booking.bookingNetworkError", lang);
  }

  // Validation errors from backend (empty field messages)
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

  // Generic booking error with the actual message
  return lang === "hi"
    ? `${t("booking.bookingError", lang)} (${msg})`
    : `${t("booking.bookingError", lang)} (${msg})`;
}

export default function BookingForm() {
  const { lang } = useLanguage();
  const { actor, isFetching: actorFetching } = useActor();
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

  const isActorReady = !!actor && !actorFetching;

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!isActorReady) {
      setSubmitError(t("booking.systemInitializing", lang));
      return;
    }

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

    createBooking(input, {
      onSuccess: (id) => {
        setBookingId(id);
        setSubmitError(null);
        setForm(initialForm);
        queryClient.invalidateQueries({ queryKey: ["allBookings"] });
      },
      onError: (error) => {
        setSubmitError(getErrorMessage(error, lang));
      },
    });
  };

  const handleRetry = () => {
    setSubmitError(null);
    reset();
  };

  if (isSuccess) {
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

        {!isActorReady && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 border border-border rounded-xl px-4 py-3">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            {t("booking.systemInitializingShort", lang)}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-navy-lg space-y-5"
        >
          {/* Name */}
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

          {/* Phone */}
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

          {/* State */}
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

          {/* District */}
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

          {/* Location */}
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

          {/* Service Type */}
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

          {/* Preferred Date */}
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

          {/* Time Slot */}
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

          {/* Problem Description */}
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

          {/* Error Message */}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !isActorReady}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("booking.submitting", lang)}
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
