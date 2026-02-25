import Hero from '../components/Hero';
import Services from '../components/Services';
import BookingForm from '../components/BookingForm';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';
import WhatsAppButton from '../components/WhatsAppButton';

export default function HomePage() {
  return (
    <main className="flex-1">
      <Hero />
      <Services />
      <BookingForm />
      <Testimonials />
      <Contact />
      <WhatsAppButton />
    </main>
  );
}
