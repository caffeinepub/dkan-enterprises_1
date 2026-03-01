import { Skeleton } from "@/components/ui/skeleton";
import {
  Droplets,
  Flame,
  Microwave,
  Refrigerator,
  Tv,
  WashingMachine,
  Wind,
} from "lucide-react";
import type { Service } from "../backend";
import { useLanguage } from "../hooks/useLanguage";
import { useGetAllServices } from "../hooks/useQueries";
import { t, translations } from "../translations";

// Fallback static services (shown when backend returns empty or while loading)
const staticServices = [
  {
    id: "ac",
    name: "AC Repair",
    nameHindi: "AC रिपेयर",
    description: "Gas refilling, cooling issues, PCB repair, servicing",
    descriptionHindi: "गैस रिफिलिंग, कूलिंग प्रॉब्लम, PCB रिपेयर, सर्विसिंग",
    priceRange: "From ₹399",
    category: "Appliance",
  },
  {
    id: "washing",
    name: "Washing Machine Repair",
    nameHindi: "वॉशिंग मशीन रिपेयर",
    description: "Motor repair, drainage issues, PCB, timer replacement",
    descriptionHindi: "मोटर रिपेयर, ड्रेनेज प्रॉब्लम, PCB, टाइमर रिप्लेसमेंट",
    priceRange: "From ₹299",
    category: "Appliance",
  },
  {
    id: "fridge",
    name: "Refrigerator Repair",
    nameHindi: "रेफ्रिजरेटर रिपेयर",
    description: "Cooling issues, compressor, thermostat, gas refilling",
    descriptionHindi: "कूलिंग प्रॉब्लम, कंप्रेसर, थर्मोस्टेट, गैस रिफिलिंग",
    priceRange: "From ₹349",
    category: "Appliance",
  },
  {
    id: "tv",
    name: "LCD/LED TV Repair",
    nameHindi: "LCD/LED TV रिपेयर",
    description: "Panel repair, backlight, motherboard, power supply repair",
    descriptionHindi: "पैनल रिपेयर, बैकलाइट, मदरबोर्ड, पावर सप्लाई रिपेयर",
    priceRange: "From ₹399",
    category: "Electronics",
  },
  {
    id: "geyser",
    name: "Geyser Repair",
    nameHindi: "गीजर रिपेयर",
    description: "Heating element, thermostat, leakage repair",
    descriptionHindi: "हीटिंग एलिमेंट, थर्मोस्टेट, लीकेज रिपेयर",
    priceRange: "From ₹249",
    category: "Appliance",
  },
  {
    id: "water",
    name: "Water Purifier",
    nameHindi: "वाटर प्यूरीफायर",
    description: "Filter replacement, UV lamp, membrane service",
    descriptionHindi: "फिल्टर रिप्लेसमेंट, UV लैंप, मेम्ब्रेन सर्विस",
    priceRange: "From ₹199",
    category: "Appliance",
  },
];

const serviceColors = [
  "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30",
  "from-teal-500/20 to-teal-600/10 border-teal-500/30",
  "from-green-500/20 to-green-600/10 border-green-500/30",
  "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30",
  "from-orange-500/20 to-orange-600/10 border-orange-500/30",
  "from-rose-500/20 to-rose-600/10 border-rose-500/30",
];

const iconColors = [
  "text-blue-600",
  "text-purple-600",
  "text-cyan-600",
  "text-teal-600",
  "text-green-600",
  "text-indigo-600",
  "text-orange-600",
  "text-rose-600",
];

// Pick an icon based on service name/category keywords
function getServiceIcon(name: string, category: string) {
  const lower = `${name} ${category}`.toLowerCase();
  if (lower.includes("ac") || lower.includes("air")) return Wind;
  if (lower.includes("fridge") || lower.includes("refrigerator"))
    return Refrigerator;
  if (lower.includes("washing") || lower.includes("washer"))
    return WashingMachine;
  if (lower.includes("tv") || lower.includes("lcd") || lower.includes("led"))
    return Tv;
  if (lower.includes("geyser") || lower.includes("heater")) return Flame;
  if (
    lower.includes("water") ||
    lower.includes("purifier") ||
    lower.includes("ro")
  )
    return Droplets;
  if (lower.includes("microwave") || lower.includes("oven")) return Microwave;
  return Wind; // default
}

function ServiceCardSkeleton() {
  return (
    <div className="rounded-2xl border p-6 space-y-4">
      <Skeleton className="w-14 h-14 rounded-xl" />
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

interface DisplayService {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  descriptionHindi: string;
  priceRange: string;
  category: string;
}

export default function Services() {
  const { lang } = useLanguage();
  const { data: backendServices, isLoading } = useGetAllServices();

  // Use backend services if available, otherwise fall back to static list
  const displayServices: DisplayService[] =
    backendServices && backendServices.length > 0
      ? backendServices.map((s: Service) => ({
          id: s.id.toString(),
          name: s.name,
          nameHindi: s.nameHindi,
          description: s.description,
          descriptionHindi: s.descriptionHindi,
          priceRange: s.priceRange,
          category: s.category,
        }))
      : staticServices;

  const scrollToBooking = () => {
    const el = document.getElementById("booking");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-primary text-sm font-semibold">
              {t(translations.services.title, lang)}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
            {t(translations.services.title, lang)}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(translations.services.subtitle, lang)}
          </p>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Services Grid */}
        {!isLoading &&
          (displayServices.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Wind className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-base font-medium">
                {lang === "hi"
                  ? "अभी कोई सर्विस उपलब्ध नहीं है"
                  : "No services available at the moment"}
              </p>
              <p className="text-sm mt-1">
                {lang === "hi"
                  ? "कृपया बाद में दोबारा देखें"
                  : "Please check back later"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayServices.map((service, i) => {
                const colorIdx = i % serviceColors.length;
                const Icon = getServiceIcon(service.name, service.category);
                const displayName =
                  lang === "hi" && service.nameHindi
                    ? service.nameHindi
                    : service.name;
                const displayDesc =
                  lang === "hi" && service.descriptionHindi
                    ? service.descriptionHindi
                    : service.description;

                return (
                  <button
                    key={service.id}
                    type="button"
                    className={`group relative bg-gradient-to-br ${serviceColors[colorIdx]} border rounded-2xl p-6 card-hover cursor-pointer text-left w-full`}
                    onClick={scrollToBooking}
                  >
                    {/* Icon */}
                    <div className="w-14 h-14 bg-white/60 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className={`w-7 h-7 ${iconColors[colorIdx]}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-foreground font-bold text-lg mb-2">
                      {displayName}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {displayDesc}
                    </p>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          {t(translations.services.priceFrom, lang)}
                        </span>
                        <div className="text-primary font-bold text-base">
                          {service.priceRange}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-primary border border-primary/40 rounded-lg px-3 py-1.5 hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                        {t(translations.services.bookNow, lang)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
      </div>
    </section>
  );
}
