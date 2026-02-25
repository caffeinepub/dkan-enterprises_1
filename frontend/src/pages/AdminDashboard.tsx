import { useState } from 'react';
import { useGetAllBookings, useUpdateBookingStatus, useGetAllServices, useCreateService, useDeleteService, useGetSettings, useUpdateSettings } from '../hooks/useQueries';
import { useLanguage } from '../hooks/useLanguage';
import { t } from '../translations';
import { BookingStatus, BookingRecord, ServiceType, TimeSlot } from '../backend';

type AdminTab = 'bookings' | 'services' | 'settings';
type BookingStatusFilter = 'all' | 'pending' | 'confirmed' | 'inProgress' | 'completed' | 'cancelled';

function getServiceTypeLabel(st: ServiceType, lang: string): string {
  const map: Record<ServiceType, { en: string; hi: string }> = {
    [ServiceType.acRepair]: { en: 'AC Repair', hi: 'एसी मरम्मत' },
    [ServiceType.washingMachineRepair]: { en: 'Washing Machine Repair', hi: 'वाशिंग मशीन मरम्मत' },
    [ServiceType.refrigeratorRepair]: { en: 'Refrigerator Repair', hi: 'फ्रिज मरम्मत' },
    [ServiceType.microwaveRepair]: { en: 'Microwave Repair', hi: 'माइक्रोवेव मरम्मत' },
    [ServiceType.geyserRepair]: { en: 'Geyser Repair', hi: 'गीजर मरम्मत' },
    [ServiceType.lcdLedTvRepair]: { en: 'LCD/LED TV Repair', hi: 'एलसीडी/एलईडी टीवी मरम्मत' },
    [ServiceType.waterPurifier]: { en: 'Water Purifier', hi: 'वाटर प्यूरीफायर' },
  };
  return lang === 'hi' ? map[st]?.hi : map[st]?.en;
}

function getTimeSlotLabel(ts: TimeSlot, lang: string): string {
  const map: Record<TimeSlot, { en: string; hi: string }> = {
    [TimeSlot.morning_9_12]: { en: '9am–12pm', hi: 'सुबह 9–12' },
    [TimeSlot.afternoon_12_4]: { en: '12pm–4pm', hi: 'दोपहर 12–4' },
    [TimeSlot.evening_4_7]: { en: '4pm–7pm', hi: 'शाम 4–7' },
  };
  return lang === 'hi' ? map[ts]?.hi : map[ts]?.en;
}

function getStatusLabel(status: BookingStatus, lang: string): string {
  const map: Record<BookingStatus, { en: string; hi: string }> = {
    [BookingStatus.pending]: { en: 'Pending', hi: 'लंबित' },
    [BookingStatus.confirmed]: { en: 'Confirmed', hi: 'पुष्टि' },
    [BookingStatus.inProgress]: { en: 'In Progress', hi: 'प्रगति में' },
    [BookingStatus.completed]: { en: 'Completed', hi: 'पूर्ण' },
    [BookingStatus.cancelled]: { en: 'Cancelled', hi: 'रद्द' },
  };
  return lang === 'hi' ? map[status]?.hi : map[status]?.en;
}

function getStatusColor(status: BookingStatus): string {
  switch (status) {
    case BookingStatus.pending: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case BookingStatus.confirmed: return 'bg-blue-100 text-blue-800 border-blue-200';
    case BookingStatus.inProgress: return 'bg-purple-100 text-purple-800 border-purple-200';
    case BookingStatus.completed: return 'bg-green-100 text-green-800 border-green-200';
    case BookingStatus.cancelled: return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export default function AdminDashboard() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<bigint | null>(null);

  // Services form state
  const [newService, setNewService] = useState({
    name: '', nameHindi: '', description: '', descriptionHindi: '', priceRange: '', category: ''
  });

  // Settings state
  const [settingsForm, setSettingsForm] = useState({
    businessName: '', contactPhone: '', whatsappNumber: '', businessAddress: '', businessHours: ''
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const { data: bookings = [], isLoading: bookingsLoading } = useGetAllBookings();
  const { data: services = [], isLoading: servicesLoading } = useGetAllServices();
  const { data: settings } = useGetSettings();
  const updateBookingStatus = useUpdateBookingStatus();
  const createService = useCreateService();
  const deleteService = useDeleteService();
  const updateSettings = useUpdateSettings();

  // Load settings into form when available
  if (settings && !settingsLoaded) {
    setSettingsForm({
      businessName: settings.businessName,
      contactPhone: settings.contactPhone,
      whatsappNumber: settings.whatsappNumber,
      businessAddress: settings.businessAddress,
      businessHours: settings.businessHours,
    });
    setSettingsLoaded(true);
  }

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch = searchQuery === '' ||
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phoneNumber.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  // Count by status
  const countByStatus = (status: BookingStatus) => bookings.filter(b => b.status === status).length;

  const handleStatusUpdate = async (bookingId: bigint, newStatus: BookingStatus) => {
    setUpdatingId(bookingId);
    try {
      await updateBookingStatus.mutateAsync({ bookingId, newStatus });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    await createService.mutateAsync(newService);
    setNewService({ name: '', nameHindi: '', description: '', descriptionHindi: '', priceRange: '', category: '' });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      await updateSettings.mutateAsync(settingsForm);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } finally {
      setSettingsSaving(false);
    }
  };

  const statusTabs: { key: BookingStatusFilter; labelEn: string; labelHi: string; status?: BookingStatus }[] = [
    { key: 'all', labelEn: 'All', labelHi: 'सभी' },
    { key: 'pending', labelEn: 'Pending', labelHi: 'लंबित', status: BookingStatus.pending },
    { key: 'confirmed', labelEn: 'Confirmed', labelHi: 'पुष्टि', status: BookingStatus.confirmed },
    { key: 'inProgress', labelEn: 'In Progress', labelHi: 'प्रगति में', status: BookingStatus.inProgress },
    { key: 'completed', labelEn: 'Completed', labelHi: 'पूर्ण', status: BookingStatus.completed },
    { key: 'cancelled', labelEn: 'Cancelled', labelHi: 'रद्द', status: BookingStatus.cancelled },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy text-white shadow-navy-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <img src="/assets/generated/dkan-logo.dim_400x400.png" alt="DKAN Logo" className="h-12 w-12 rounded-full object-cover border-2 border-electric" />
          <div>
            <h1 className="text-xl font-bold font-poppins">
              {lang === 'hi' ? 'एडमिन डैशबोर्ड' : 'Admin Dashboard'}
            </h1>
            <p className="text-sm text-electric font-devanagari">
              {lang === 'hi' ? 'DKAN ENTERPRISES — प्रबंधन पैनल' : 'DKAN ENTERPRISES — Management Panel'}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <img src="/assets/generated/sevamitr-logo.dim_256x256.png" alt="SevaMitra" className="h-10 w-10 rounded-lg object-cover" />
            <span className="text-xs text-gray-300 font-devanagari">SevaMitra Partner</span>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { key: 'bookings', labelEn: 'Bookings', labelHi: 'बुकिंग' },
            { key: 'services', labelEn: 'Manage Services', labelHi: 'सेवाएं प्रबंधित करें' },
            { key: 'settings', labelEn: 'Settings', labelHi: 'सेटिंग्स' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as AdminTab)}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors font-poppins ${
                activeTab === tab.key
                  ? 'bg-navy text-white border-b-2 border-electric'
                  : 'text-gray-600 hover:text-navy hover:bg-gray-100'
              }`}
            >
              {lang === 'hi' ? tab.labelHi : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder={lang === 'hi' ? 'नाम या फोन से खोजें...' : 'Search by name or phone...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-electric font-devanagari"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {statusTabs.map(tab => {
                const count = tab.status ? countByStatus(tab.status) : bookings.length;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      statusFilter === tab.key
                        ? 'bg-navy text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-navy hover:text-navy'
                    }`}
                  >
                    <span className="font-devanagari">{lang === 'hi' ? tab.labelHi : tab.labelEn}</span>
                    <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
                      statusFilter === tab.key
                        ? 'bg-electric text-navy'
                        : tab.key === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : tab.key === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : tab.key === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bookings List */}
            {bookingsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2 w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-devanagari">
                {lang === 'hi' ? 'कोई बुकिंग नहीं मिली' : 'No bookings found'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookings.map(booking => (
                  <BookingCard
                    key={booking.id.toString()}
                    booking={booking}
                    lang={lang}
                    isUpdating={updatingId === booking.id}
                    onStatusUpdate={handleStatusUpdate}
                    getServiceTypeLabel={getServiceTypeLabel}
                    getTimeSlotLabel={getTimeSlotLabel}
                    getStatusLabel={getStatusLabel}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Service Form */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-bold text-navy mb-4 font-poppins">
                {lang === 'hi' ? 'नई सेवा जोड़ें' : 'Add New Service'}
              </h2>
              <form onSubmit={handleCreateService} className="space-y-3">
                <input
                  type="text"
                  placeholder={lang === 'hi' ? 'सेवा का नाम (English)' : 'Service Name (English)'}
                  value={newService.name}
                  onChange={e => setNewService(p => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric"
                />
                <input
                  type="text"
                  placeholder="सेवा का नाम (हिंदी)"
                  value={newService.nameHindi}
                  onChange={e => setNewService(p => ({ ...p, nameHindi: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric font-devanagari"
                />
                <input
                  type="text"
                  placeholder={lang === 'hi' ? 'विवरण (English)' : 'Description (English)'}
                  value={newService.description}
                  onChange={e => setNewService(p => ({ ...p, description: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric"
                />
                <input
                  type="text"
                  placeholder="विवरण (हिंदी)"
                  value={newService.descriptionHindi}
                  onChange={e => setNewService(p => ({ ...p, descriptionHindi: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric font-devanagari"
                />
                <input
                  type="text"
                  placeholder={lang === 'hi' ? 'मूल्य सीमा (जैसे ₹299–₹999)' : 'Price Range (e.g. ₹299–₹999)'}
                  value={newService.priceRange}
                  onChange={e => setNewService(p => ({ ...p, priceRange: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric"
                />
                <input
                  type="text"
                  placeholder={lang === 'hi' ? 'श्रेणी (जैसे appliance)' : 'Category (e.g. appliance)'}
                  value={newService.category}
                  onChange={e => setNewService(p => ({ ...p, category: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric"
                />
                <button
                  type="submit"
                  disabled={createService.isPending}
                  className="w-full bg-navy text-white py-2 rounded-lg font-medium hover:bg-navy/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-poppins"
                >
                  {createService.isPending ? (
                    <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> {lang === 'hi' ? 'जोड़ रहे हैं...' : 'Adding...'}</>
                  ) : (lang === 'hi' ? 'सेवा जोड़ें' : 'Add Service')}
                </button>
              </form>
            </div>

            {/* Services List */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-bold text-navy mb-4 font-poppins">
                {lang === 'hi' ? 'सेवाओं की सूची' : 'Services List'}
              </h2>
              {servicesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>)}
                </div>
              ) : services.length === 0 ? (
                <p className="text-gray-500 text-sm font-devanagari">
                  {lang === 'hi' ? 'कोई सेवा नहीं जोड़ी गई' : 'No services added yet'}
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {services.map(service => (
                    <div key={service.id.toString()} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm text-navy">{lang === 'hi' ? service.nameHindi : service.name}</p>
                        <p className="text-xs text-gray-500">{service.priceRange}</p>
                      </div>
                      <button
                        onClick={() => deleteService.mutate(service.id)}
                        disabled={deleteService.isPending}
                        className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                      >
                        {lang === 'hi' ? 'हटाएं' : 'Delete'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-bold text-navy mb-4 font-poppins">
                {lang === 'hi' ? 'व्यवसाय सेटिंग्स' : 'Business Settings'}
              </h2>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                {[
                  { key: 'businessName', labelEn: 'Business Name', labelHi: 'व्यवसाय का नाम' },
                  { key: 'contactPhone', labelEn: 'Contact Phone', labelHi: 'संपर्क फोन' },
                  { key: 'whatsappNumber', labelEn: 'WhatsApp Number', labelHi: 'व्हाट्सएप नंबर' },
                  { key: 'businessAddress', labelEn: 'Business Address', labelHi: 'व्यवसाय का पता' },
                  { key: 'businessHours', labelEn: 'Business Hours', labelHi: 'व्यवसाय के घंटे' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-devanagari">
                      {lang === 'hi' ? field.labelHi : field.labelEn}
                    </label>
                    <input
                      type="text"
                      value={settingsForm[field.key as keyof typeof settingsForm]}
                      onChange={e => setSettingsForm(p => ({ ...p, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="w-full bg-navy text-white py-2 rounded-lg font-medium hover:bg-navy/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-poppins"
                >
                  {settingsSaving ? (
                    <><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> {lang === 'hi' ? 'सहेज रहे हैं...' : 'Saving...'}</>
                  ) : settingsSaved ? (
                    lang === 'hi' ? '✓ सहेजा गया!' : '✓ Saved!'
                  ) : (
                    lang === 'hi' ? 'सेटिंग्स सहेजें' : 'Save Settings'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface BookingCardProps {
  booking: BookingRecord;
  lang: string;
  isUpdating: boolean;
  onStatusUpdate: (id: bigint, status: BookingStatus) => void;
  getServiceTypeLabel: (st: ServiceType, lang: string) => string;
  getTimeSlotLabel: (ts: TimeSlot, lang: string) => string;
  getStatusLabel: (status: BookingStatus, lang: string) => string;
  getStatusColor: (status: BookingStatus) => string;
}

function BookingCard({ booking, lang, isUpdating, onStatusUpdate, getServiceTypeLabel, getTimeSlotLabel, getStatusLabel, getStatusColor }: BookingCardProps) {
  const nextStatuses: Partial<Record<BookingStatus, BookingStatus[]>> = {
    [BookingStatus.pending]: [BookingStatus.confirmed, BookingStatus.cancelled],
    [BookingStatus.confirmed]: [BookingStatus.inProgress, BookingStatus.cancelled],
    [BookingStatus.inProgress]: [BookingStatus.completed, BookingStatus.cancelled],
  };

  const available = nextStatuses[booking.status] || [];

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-md transition-shadow p-4 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-navy font-poppins">{booking.customerName}</p>
          <p className="text-sm text-gray-500">{booking.phoneNumber}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border font-medium font-devanagari ${getStatusColor(booking.status)}`}>
          {getStatusLabel(booking.status, lang)}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-600 mb-3">
        <p><span className="font-medium">{lang === 'hi' ? 'सेवा:' : 'Service:'}</span> {getServiceTypeLabel(booking.serviceType, lang)}</p>
        <p><span className="font-medium">{lang === 'hi' ? 'राज्य:' : 'State:'}</span> {booking.state}</p>
        <p><span className="font-medium">{lang === 'hi' ? 'जिला:' : 'District:'}</span> {booking.district}</p>
        <p><span className="font-medium">{lang === 'hi' ? 'पता:' : 'Address:'}</span> {booking.location}</p>
        <p><span className="font-medium">{lang === 'hi' ? 'तारीख:' : 'Date:'}</span> {booking.preferredDate}</p>
        <p><span className="font-medium">{lang === 'hi' ? 'समय:' : 'Time:'}</span> {getTimeSlotLabel(booking.preferredTimeSlot, lang)}</p>
        {booking.problemDescription && (
          <p className="text-xs text-gray-500 italic">"{booking.problemDescription}"</p>
        )}
      </div>

      {available.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {available.map(status => (
            <button
              key={status}
              onClick={() => onStatusUpdate(booking.id, status)}
              disabled={isUpdating}
              className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 ${
                status === BookingStatus.cancelled
                  ? 'border-red-300 text-red-600 hover:bg-red-50'
                  : 'border-navy text-navy hover:bg-navy hover:text-white'
              }`}
            >
              {isUpdating ? (
                <span className="animate-spin inline-block h-3 w-3 border border-current border-t-transparent rounded-full"></span>
              ) : getStatusLabel(status, lang)}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">
        #{booking.id.toString()} · {new Date(Number(booking.timestamp) / 1_000_000).toLocaleDateString('hi-IN')}
      </p>
    </div>
  );
}
