import { Quote, Star } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import { t, translations } from "../translations";

const testimonials = [
  {
    name: "Rajesh Kumar",
    location: "Govind Nagar, Kanpur",
    rating: 5,
    text: "बहुत अच्छी सर्विस! मेरा AC 2 घंटे में ठीक हो गया। टेक्नीशियन बहुत प्रोफेशनल थे और काम भी साफ-सुथरा किया।",
    service: "AC Repair",
    avatar: "RK",
  },
  {
    name: "Priya Sharma",
    location: "Kakadeo, Kanpur",
    rating: 5,
    text: "My laptop motherboard was completely dead. DKAN Enterprises did chip-level repair and saved all my data. Excellent service!",
    service: "Laptop Repair",
    avatar: "PS",
  },
  {
    name: "Amit Verma",
    location: "Civil Lines, Kanpur",
    rating: 5,
    text: "फ्रिज की कूलिंग बंद हो गई थी। इन्होंने घर आकर देखा और उसी दिन ठीक कर दिया। बहुत किफायती दाम में बढ़िया काम।",
    service: "Refrigerator Repair",
    avatar: "AV",
  },
  {
    name: "Sunita Gupta",
    location: "Arya Nagar, Kanpur",
    rating: 4,
    text: "मोबाइल की स्क्रीन टूट गई थी। DKAN ने 1 घंटे में नई स्क्रीन लगा दी। 90 दिन की वारंटी भी मिली। बहुत खुश हूं!",
    service: "Mobile Repair",
    avatar: "SG",
  },
  {
    name: "Deepak Singh",
    location: "Kalyanpur, Kanpur",
    rating: 5,
    text: "Washing machine was not draining water. They came on time, diagnosed the issue quickly and fixed it. Very professional team!",
    service: "Washing Machine Repair",
    avatar: "DS",
  },
  {
    name: "Meena Agarwal",
    location: "Kidwai Nagar, Kanpur",
    rating: 5,
    text: "LED TV की बैकलाइट खराब हो गई थी। बहुत कम पैसों में ठीक हो गई। SevaMitra ऐप से बुकिंग करना बहुत आसान था।",
    service: "TV Repair",
    avatar: "MA",
  },
];

const avatarColors = [
  "bg-blue-600",
  "bg-purple-600",
  "bg-teal-600",
  "bg-green-600",
  "bg-orange-600",
  "bg-pink-600",
];

export default function Testimonials() {
  const { lang } = useLanguage();

  return (
    <section
      id="testimonials"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-background"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-4">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-primary text-sm font-semibold">
              {t(translations.testimonials.title, lang)}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
            {t(translations.testimonials.title, lang)}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t(translations.testimonials.subtitle, lang)}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <div
              key={`testimonial-${item.name}`}
              className="bg-card border border-border rounded-2xl p-6 card-hover relative"
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {([1, 2, 3, 4, 5] as const).map((starNum) => (
                  <Star
                    key={starNum}
                    className={`w-4 h-4 ${starNum <= item.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="text-foreground text-sm leading-relaxed mb-5 font-hindi">
                "{item.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 ${avatarColors[i]} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
                >
                  {item.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">
                    {item.name}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {item.location}
                  </div>
                </div>
                <div className="ml-auto">
                  <span className="text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 font-medium">
                    {item.service}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
