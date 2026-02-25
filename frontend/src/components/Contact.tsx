import { Phone, MapPin, Clock, Mail } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { translations, t } from '../translations';
import { useGetSettings } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

export default function Contact() {
  const { lang } = useLanguage();
  const { data: settings, isLoading } = useGetSettings();

  const phone = settings?.contactPhone ?? '+91 8009675645';
  const address = settings?.businessAddress ?? t(translations.contact.addressValue, lang);
  const hours = settings?.businessHours ?? t(translations.contact.hoursValue, lang);
  const whatsapp = settings?.whatsappNumber ?? '+91 8009675645';
  const whatsappClean = whatsapp.replace(/\D/g, '');

  const contactItems = [
    {
      icon: Phone,
      label: t(translations.contact.phone, lang),
      value: phone,
      href: `tel:${phone.replace(/\s/g, '')}`,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      icon: MapPin,
      label: t(translations.contact.address, lang),
      value: address,
      href: 'https://maps.google.com/?q=Kanpur,Uttar+Pradesh',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Clock,
      label: t(translations.contact.hours, lang),
      value: hours,
      href: null,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      icon: Mail,
      label: t(translations.contact.email, lang),
      value: 'dkanenterprises@gmail.com',
      href: 'mailto:dkanenterprises@gmail.com',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-navy/5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-electric-green/10 border border-electric-green/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-electric-green text-sm font-semibold">
              🏛️ {t(translations.contact.upGovPartner, lang)}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
            {t(translations.contact.title, lang)}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(translations.contact.subtitle, lang)}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Contact Details */}
          <div className="space-y-4">
            {contactItems.map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4 card-hover">
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide mb-1">
                    {item.label}
                  </div>
                  {isLoading && (i === 0 || i === 1 || i === 2) ? (
                    <Skeleton className="h-5 w-48" />
                  ) : item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="font-semibold text-foreground hover:text-electric-green transition-colors duration-200"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="font-semibold text-foreground">{item.value}</span>
                  )}
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${whatsappClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold px-6 py-4 rounded-2xl transition-all duration-200 w-full justify-center text-base"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t(translations.contact.whatsapp, lang)}
            </a>
          </div>

          {/* Google Maps */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-navy-lg">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-electric-green" />
                {t(translations.contact.mapTitle, lang)}
              </h3>
            </div>
            <div className="aspect-video">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d228131.26498590842!2d79.97305!3d26.44953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399c4770b127c46f%3A0x1778302a9fbe7b41!2sKanpur%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t(translations.contact.mapTitle, lang)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
