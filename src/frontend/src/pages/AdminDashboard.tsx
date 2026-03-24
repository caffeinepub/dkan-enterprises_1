import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  Loader2,
  MapPin,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Settings as SettingsIcon,
  Trash2,
  User,
  Wrench,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
import { BookingStatus } from "../backend";
import type { BookingRecord, Settings } from "../backend";
import {
  useCreateService,
  useDeleteBooking,
  useDeleteService,
  useGetAllBookings,
  useGetAllServices,
  useGetSettings,
  useUpdateBookingStatus,
  useUpdateSettings,
} from "../hooks/useQueries";

const serviceTypeLabels: Record<string, string> = {
  acRepair: "AC Repair / एसी मरम्मत",
  washingMachineRepair: "Washing Machine / वाशिंग मशीन",
  refrigeratorRepair: "Refrigerator / रेफ्रिजरेटर",
  microwaveRepair: "Microwave / माइक्रोवेव",
  geyserRepair: "Geyser / गीज़र",
  lcdLedTvRepair: "LCD/LED TV",
  waterPurifier: "Water Purifier / वाटर प्यूरीफायर",
};

const timeSlotLabels: Record<string, string> = {
  morning_9_12: "9 AM – 12 PM",
  afternoon_12_4: "12 PM – 4 PM",
  evening_4_7: "4 PM – 7 PM",
};

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending / लंबित",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="w-3 h-3" />,
  },
  confirmed: {
    label: "Confirmed / पुष्टि",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  inProgress: {
    label: "In Progress / प्रगति में",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: <Wrench className="w-3 h-3" />,
  },
  completed: {
    label: "Completed / पूर्ण",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelled / रद्द",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="w-3 h-3" />,
  },
};

function getStatusKey(status: BookingStatus): string {
  return String(status);
}

function BookingCard({ booking }: { booking: BookingRecord }) {
  const { mutate: updateStatus, isPending } = useUpdateBookingStatus();
  const { mutate: deleteBooking, isPending: isDeleting } = useDeleteBooking();
  const statusKey = getStatusKey(booking.status);
  const cfg = statusConfig[statusKey] ?? statusConfig.pending;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as BookingStatus;
    updateStatus({ bookingId: booking.id, status: val });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground font-mono">
              #{String(booking.id)}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}
            >
              {cfg.icon}
              {cfg.label}
            </span>
          </div>
          <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            {booking.customerName}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isPending && (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          )}
          <select
            value={statusKey}
            onChange={handleStatusChange}
            disabled={isPending || isDeleting}
            className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          >
            <option value={BookingStatus.pending}>Pending</option>
            <option value={BookingStatus.confirmed}>Confirmed</option>
            <option value={BookingStatus.inProgress}>In Progress</option>
            <option value={BookingStatus.completed}>Completed</option>
            <option value={BookingStatus.cancelled}>Cancelled</option>
          </select>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (
                !window.confirm(
                  "क्या आप यह बुकिंग डिलीट करना चाहते हैं? / Are you sure you want to delete this booking?",
                )
              )
                return;
              deleteBooking(booking.id);
            }}
            disabled={isDeleting || isPending}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
            title="Delete booking / बुकिंग डिलीट करें"
            data-ocid="bookings.delete_button"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="w-4 h-4 shrink-0" />
          <span>{booking.phoneNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wrench className="w-4 h-4 shrink-0" />
          <span>
            {serviceTypeLabels[String(booking.serviceType)] ??
              String(booking.serviceType)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>{booking.preferredDate}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            {timeSlotLabels[String(booking.preferredTimeSlot)] ??
              String(booking.preferredTimeSlot)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground col-span-full">
          <MapPin className="w-4 h-4 shrink-0" />
          <span>
            {booking.location}
            {booking.district ? `, ${booking.district}` : ""}
            {booking.state ? `, ${booking.state}` : ""}
          </span>
        </div>
      </div>

      {booking.problemDescription && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Problem: </span>
            {booking.problemDescription}
          </p>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Submitted:{" "}
          {new Date(Number(booking.timestamp) / 1_000_000).toLocaleString(
            "en-IN",
          )}
        </p>
      </div>
    </div>
  );
}

function BookingsTab() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: bookings,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetAllBookings();

  const filterTabs = [
    { key: "all", label: "All / सभी" },
    { key: BookingStatus.pending, label: "Pending / लंबित" },
    { key: BookingStatus.confirmed, label: "Confirmed / पुष्टि" },
    { key: BookingStatus.inProgress, label: "In Progress" },
    { key: BookingStatus.completed, label: "Completed / पूर्ण" },
    { key: BookingStatus.cancelled, label: "Cancelled / रद्द" },
  ];

  const filteredBookings = (bookings ?? []).filter((b) => {
    const matchesFilter =
      activeFilter === "all" || getStatusKey(b.status) === activeFilter;
    const matchesSearch =
      !searchQuery ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phoneNumber.includes(searchQuery) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const countByStatus = (key: string) => {
    if (!bookings) return 0;
    if (key === "all") return bookings.length;
    return bookings.filter((b) => getStatusKey(b.status) === key).length;
  };

  if (isLoading) {
    return (
      <div className="space-y-4" data-ocid="bookings.loading_state">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>बुकिंग लोड हो रही है... / Loading bookings...</span>
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        variant="destructive"
        className="my-4"
        data-ocid="bookings.error_state"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>बुकिंग लोड करने में त्रुटि / Error Loading Bookings</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p className="text-sm">
            बुकिंग लोड नहीं हो सकी। कृपया पुनः प्रयास करें।
            <br />
            <span className="text-xs opacity-80">
              Could not load bookings. Please try again.
            </span>
          </p>
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              data-ocid="bookings.primary_button"
              onClick={() => refetch()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              फिर कोशिश करें / Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name, phone, location... / नाम, फोन, स्थान से खोजें..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          data-ocid="bookings.search_input"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          data-ocid="bookings.secondary_button"
        >
          {isFetching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => {
          const count = countByStatus(tab.key);
          return (
            <button
              type="button"
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              data-ocid="bookings.tab"
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                activeFilter === tab.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                    activeFilter === tab.key
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bookings list */}
      {filteredBookings.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="bookings.empty_state"
        >
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">
            {(bookings ?? []).length === 0
              ? "कोई बुकिंग नहीं मिली। / No bookings found."
              : "इस फ़िल्टर में कोई बुकिंग नहीं। / No bookings in this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredBookings.length} of {(bookings ?? []).length}{" "}
            bookings
          </p>
          {filteredBookings.map((booking, idx) => (
            <div
              key={String(booking.id)}
              data-ocid={`bookings.item.${idx + 1}`}
            >
              <BookingCard booking={booking} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ServicesTab() {
  const { data: services, isLoading } = useGetAllServices();
  const { mutate: createService, isPending: isCreating } = useCreateService();
  const { mutate: deleteService, isPending: isDeleting } = useDeleteService();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    nameHindi: "",
    description: "",
    descriptionHindi: "",
    priceRange: "",
    category: "",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createService(form, {
      onSuccess: () => {
        setForm({
          name: "",
          nameHindi: "",
          description: "",
          descriptionHindi: "",
          priceRange: "",
          category: "",
        });
        setShowForm(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-foreground">
          Services / सेवाएं ({(services ?? []).length})
        </h3>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
          data-ocid="services.primary_button"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Service
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-muted/30 border border-border rounded-xl p-4 space-y-3"
          data-ocid="services.panel"
        >
          <h4 className="font-medium text-foreground">New Service / नई सेवा</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "name", placeholder: "Service Name (English)" },
              { key: "nameHindi", placeholder: "सेवा का नाम (हिंदी)" },
              { key: "description", placeholder: "Description (English)" },
              { key: "descriptionHindi", placeholder: "विवरण (हिंदी)" },
              {
                key: "priceRange",
                placeholder: "Price Range (e.g. ₹299-₹999)",
              },
              { key: "category", placeholder: "Category" },
            ].map(({ key, placeholder }) => (
              <input
                key={key}
                type="text"
                placeholder={placeholder}
                value={(form as unknown as Record<string, string>)[key]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={isCreating}
              data-ocid="services.submit_button"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Save / सहेजें
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
              data-ocid="services.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {(services ?? []).map((service, idx) => (
          <div
            key={String(service.id)}
            data-ocid={`services.item.${idx + 1}`}
            className="bg-card border border-border rounded-xl p-4 flex items-start justify-between gap-3"
          >
            <div>
              <h4 className="font-medium text-foreground">
                {service.name} / {service.nameHindi}
              </h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                {service.description}
              </p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {service.priceRange}
                </span>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  {service.category}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteService(service.id)}
              disabled={isDeleting}
              data-ocid={`services.delete_button.${idx + 1}`}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        ))}
        {(services ?? []).length === 0 && (
          <div
            className="text-center py-10 text-muted-foreground"
            data-ocid="services.empty_state"
          >
            <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No services added yet. / अभी कोई सेवा नहीं जोड़ी गई।</p>
          </div>
        )}
      </div>
    </div>
  );
}

type SettingsKey = keyof Settings;

const settingsFields: { key: SettingsKey; label: string }[] = [
  { key: "businessName", label: "Business Name / व्यवसाय का नाम" },
  { key: "contactPhone", label: "Contact Phone / संपर्क फोन" },
  { key: "whatsappNumber", label: "WhatsApp Number / व्हाट्सएप नंबर" },
  { key: "businessAddress", label: "Address / पता" },
  { key: "businessHours", label: "Business Hours / कार्य समय" },
];

function SettingsTab() {
  const { data: settings, isLoading } = useGetSettings();
  const { mutate: updateSettings, isPending, isSuccess } = useUpdateSettings();
  const [form, setForm] = useState<Settings | null>(null);

  React.useEffect(() => {
    if (settings && !form) setForm(settings);
  }, [settings, form]);

  if (isLoading || !form) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form) updateSettings(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <h3 className="font-semibold text-foreground">
        Business Settings / व्यवसाय सेटिंग्स
      </h3>
      {settingsFields.map(({ key, label }) => (
        <div key={key}>
          <label
            htmlFor={`settings-field-${key}`}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
          </label>
          <input
            id={`settings-field-${key}`}
            type="text"
            value={form[key]}
            onChange={(e) =>
              setForm((prev) =>
                prev ? { ...prev, [key]: e.target.value } : prev,
              )
            }
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      ))}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isPending}
          data-ocid="settings.submit_button"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Settings / सेटिंग्स सहेजें
        </Button>
        {isSuccess && (
          <span
            className="text-sm text-green-600 flex items-center gap-1"
            data-ocid="settings.success_state"
          >
            <CheckCircle className="w-4 h-4" /> Saved!
          </span>
        )}
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    "bookings" | "services" | "settings"
  >("bookings");

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    window.location.reload();
  };

  const tabs = [
    {
      key: "bookings",
      label: "Bookings / बुकिंग",
      icon: <ClipboardList className="w-4 h-4" />,
    },
    {
      key: "services",
      label: "Services / सेवाएं",
      icon: <Package className="w-4 h-4" />,
    },
    {
      key: "settings",
      label: "Settings / सेटिंग्स",
      icon: <SettingsIcon className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-sm sm:text-base">
                Admin Dashboard
              </h1>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            data-ocid="admin.secondary_button"
            className="text-muted-foreground hover:text-foreground"
          >
            Logout / बाहर निकलें
          </Button>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-1 pb-0">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.key}
              onClick={() =>
                setActiveTab(tab.key as "bookings" | "services" | "settings")
              }
              data-ocid="admin.tab"
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === "bookings" && <BookingsTab />}
        {activeTab === "services" && <ServicesTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}
