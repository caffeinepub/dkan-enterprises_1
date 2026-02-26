import { useLanguage } from '../hooks/useLanguage';
import SevaMitraBadge from './SevaMitraBadge';

export default function Hero() {
  const { lang } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/assets/generated/hero-bg.dim_1440x600.png"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/60 to-navy/90"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-24 text-center">
        {/* Logo - DKAN only, no SevaMitra overlay */}
        <div className="flex justify-center mb-6">
          <img
            src="/assets/generated/dkan-logo.dim_400x400.png"
            alt="DKAN Enterprises"
            className="h-24 w-24 rounded-full object-cover border-4 border-electric-green shadow-lg"
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        {/* Brand */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 font-sans tracking-tight">
          DKAN ENTERPRISES
        </h1>
        <p className="text-electric-green text-lg md:text-xl font-hindi mb-6">
          {lang === 'hi' ? 'होम अप्लायंस रिपेयर सर्विस' : 'Home Appliance Repair Service'}
        </p>

        {/* UP Government Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm mb-4">
          <span>🏛️</span>
          <span className="font-hindi">
            {lang === 'hi' ? 'उत्तर प्रदेश सरकार अधिकृत' : 'Uttar Pradesh Government Authorized'}
          </span>
        </div>

        {/* SevaMitra Badge */}
        <div className="flex justify-center mb-8">
          <SevaMitraBadge variant="hero" />
        </div>

        {/* Headline */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-hindi leading-tight">
          {lang === 'hi'
            ? 'AC, फ्रिज, वाशिंग मशीन — सब ठीक करें घर बैठे!'
            : 'AC, Fridge, Washing Machine — Repair at Home!'}
        </h2>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {[
            { num: '5000+', labelHi: 'खुश ग्राहक', labelEn: 'Happy Customers' },
            { num: '10+', labelHi: 'वर्षों का अनुभव', labelEn: 'Years Experience' },
            { num: '24/7', labelHi: 'सहायता उपलब्ध', labelEn: 'Support Available' },
          ].map(stat => (
            <div key={stat.num} className="text-center">
              <p className="text-3xl font-bold text-electric-green font-sans">{stat.num}</p>
              <p className="text-gray-300 text-sm font-hindi">{lang === 'hi' ? stat.labelHi : stat.labelEn}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="#booking"
            className="bg-electric-green text-navy font-bold px-8 py-3 rounded-full hover:bg-electric-green/90 transition-all shadow-lg font-sans"
          >
            {lang === 'hi' ? 'अभी बुक करें' : 'Book Now'}
          </a>
          <a
            href="#contact"
            className="bg-white/10 backdrop-blur-sm border border-white/30 text-white font-medium px-8 py-3 rounded-full hover:bg-white/20 transition-all font-hindi"
          >
            {lang === 'hi' ? 'संपर्क करें' : 'Contact Us'}
          </a>
        </div>
      </div>
    </section>
  );
}
