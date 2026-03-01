import BookingForm from "../components/BookingForm";
import Contact from "../components/Contact";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Testimonials from "../components/Testimonials";
import WhatsAppButton from "../components/WhatsAppButton";

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
