import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Hero slides with micro-video style scenes and text overlays
const heroSlides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=1400&h=900&fit=crop&q=80",
    alt: "Adult daughter checking phone with relief",
    title: "See Care As It Happens.",
    subtitle: "Real-time updates on your loved one's care",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1400&h=900&fit=crop&q=80",
    alt: "Elderly woman smiling with caregiver",
    title: "Know Your Loved Ones Are Truly Cared For.",
    subtitle: "Compassionate, verified care you can trust",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&h=900&fit=crop&q=80",
    alt: "Caregiver with ID badge arriving at home",
    title: "Verified Caregivers. Real Accountability.",
    subtitle: "Background-checked professionals at your door",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1400&h=900&fit=crop&q=80",
    alt: "Family member calm with tea and phone",
    title: "No More Guessing. Just Peace of Mind.",
    subtitle: "Stay connected without constant calls",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1576765608866-5b51f5f32a0e?w=1400&h=900&fit=crop&q=80",
    alt: "Caregiver tracking tasks on phone",
    title: "Every Task Tracked. Every Moment Counted.",
    subtitle: "Medication, meals, activities — all logged",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1400&h=900&fit=crop&q=80",
    alt: "Caregiver finishing visit with phone checkout",
    title: "On-Time Care. On-Time Payments.",
    subtitle: "Seamless check-in and checkout tracking",
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1400&h=900&fit=crop&q=80",
    alt: "Family member tapping pay on phone",
    title: "Earn Cashback When You Pay for Care.",
    subtitle: "Rewards that give back to your family",
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&h=900&fit=crop&q=80",
    alt: "Phone screen glow showing progress",
    title: "Build Credit While Supporting Your Family.",
    subtitle: "On-time payments reported to bureaus",
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1400&h=900&fit=crop&q=80",
    alt: "Caregiver receiving notification and smiling",
    title: "Support Caregivers. Strengthen Care Agencies.",
    subtitle: "Better tools, better outcomes for everyone",
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1400&h=900&fit=crop&q=80",
    alt: "Family hugging elderly loved one",
    title: "Care You Can Trust — From Home to Heart.",
    subtitle: "Transparent care for your loved ones",
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000); // 5 seconds per slide
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const slide = heroSlides[currentSlide];

  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slides with Ken Burns effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Image with Ken Burns zoom effect */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: 6, ease: "linear" }}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Text overlay */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6 md:px-12">
              <div className="max-w-2xl">
                {/* Main title with fade-in animation */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-4 drop-shadow-lg"
                  style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}
                >
                  {slide.title}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-lg sm:text-xl md:text-2xl text-white/90 font-light drop-shadow-md"
                  style={{ textShadow: "0 1px 10px rgba(0,0,0,0.3)" }}
                >
                  {slide.subtitle}
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-20 opacity-0 hover:opacity-100 group-hover:opacity-100"
        style={{ opacity: 0.7 }}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-20 opacity-0 hover:opacity-100 group-hover:opacity-100"
        style={{ opacity: 0.7 }}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? "w-8 bg-white" 
                : "w-1.5 bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
        <motion.div
          key={currentSlide}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-full bg-white/60"
        />
      </div>
    </div>
  );
};

export default HeroCarousel;
