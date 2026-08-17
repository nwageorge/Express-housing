import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// SVG icons as components
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Hero carousel slides - micro-video style with text overlays
const heroSlides = [
  {
    id: 0,
    image: "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=1920",
    title: "Proof of Care, Not Promises.",
    subtitle: "Transparent care for your loved ones",
  },
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=1400&h=900&fit=crop&q=80",
    title: "See Care As It Happens.",
    subtitle: "Real-time updates on your loved one's care",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1400&h=900&fit=crop&q=80",
    title: "Know Your Loved Ones Are Truly Cared For.",
    subtitle: "Compassionate, verified care you can trust",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1400&h=900&fit=crop&q=80",
    title: "Verified Caregivers. Real Accountability.",
    subtitle: "Background-checked professionals at your door",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1400&h=900&fit=crop&q=80",
    title: "No More Guessing. Just Peace of Mind.",
    subtitle: "Stay connected without constant calls",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1400&h=900&fit=crop&q=80",
    title: "Every Task Tracked. Every Moment Counted.",
    subtitle: "Medication, meals, activities — all logged",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=1400&h=900&fit=crop&q=80",
    title: "On-Time Care. On-Time Payments.",
    subtitle: "Seamless check-in and checkout tracking",
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1400&h=900&fit=crop&q=80",
    title: "Earn Cashback When You Pay for Care.",
    subtitle: "Rewards that give back to your family",
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400&h=900&fit=crop&q=80",
    title: "Build Credit While Supporting Your Family.",
    subtitle: "On-time payments reported to bureaus",
  },
  {
    id: 9,
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1400&h=900&fit=crop&q=80",
    title: "Support Caregivers. Strengthen Care Agencies.",
    subtitle: "Better tools, better outcomes for everyone",
  },
  {
    id: 10,
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1400&h=900&fit=crop&q=80",
    title: "Care You Can Trust — From Home to Heart.",
    subtitle: "Transparent care for your loved ones",
  },
];

export default function HeroSection3({
  logoText,
  navLinks,
  user,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  // Auto-play carousel every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const slide = heroSlides[currentSlide];

  return (
    <div 
      className="h-screen w-full antialiased text-white relative group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Navigation Header */}
      <header className="absolute inset-x-0 top-0 p-4 sm:p-6 md:p-8 z-30">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl sm:text-2xl md:text-3xl font-semibold drop-shadow-lg">{logoText}</Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1 bg-black/40 backdrop-blur-md rounded-full px-4 py-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href + link.label} 
                to={link.href} 
                className="px-3 py-1.5 text-white font-medium text-sm hover:bg-white/20 rounded-full transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center space-x-2 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5">
            <button type="button" aria-label="Search" className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
              <SearchIcon />
            </button>
            {user ? (
              <>
                <Link to="/dashboard" className="px-3 py-1.5 text-white font-medium text-sm hover:bg-white/20 rounded-full transition-colors">
                  Dashboard
                </Link>
                <button 
                  onClick={onLogout}
                  className="bg-white text-stone-800 rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-stone-100 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-1.5 text-white font-medium text-sm hover:bg-white/20 rounded-full transition-colors">
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="bg-white text-stone-800 rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-stone-100 transition-colors"
                >
                  Join
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="sm:hidden p-2 bg-black/40 backdrop-blur-md rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 bg-black/80 backdrop-blur-lg rounded-2xl p-4 mx-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 mb-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href + link.label} 
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-white font-medium text-base hover:bg-white/10 rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-white/20 pt-4 space-y-2">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-white font-medium text-base hover:bg-white/10 rounded-xl transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                    className="w-full px-4 py-3 text-red-400 font-medium text-base text-left hover:bg-white/10 rounded-xl transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-white font-medium text-base hover:bg-white/10 rounded-xl transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full bg-white text-stone-800 rounded-xl px-4 py-3 text-base font-semibold text-center hover:bg-stone-100 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Carousel Main Content */}
      <main className="w-full h-full relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Image with Ken Burns zoom effect */}
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1 }}
              animate={{ scale: 1.06 }}
              transition={{ duration: 5.5, ease: "linear" }}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/95" />

            {/* Text content */}
            <div className="absolute inset-0 flex items-center z-10">
              <div className="container mx-auto px-4 sm:px-6 md:px-8">
                <div className="max-w-xl mt-[5vh] sm:mt-0">
                  <motion.h1
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white leading-tight mb-3 sm:mb-4"
                    style={{ textShadow: "0 2px 15px rgba(0,0,0,0.4)" }}
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="text-sm sm:text-base md:text-lg text-white/90 font-light"
                    style={{ textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}
                  >
                    {slide.subtitle}
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows - show on hover */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-20 opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-20 opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-40 sm:bottom-32 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "w-6 bg-white" 
                  : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-36 sm:bottom-28 left-4 right-4 sm:left-8 sm:right-8 h-0.5 bg-white/20 rounded-full z-20 overflow-hidden">
          <motion.div
            key={currentSlide}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "linear" }}
            className="h-full bg-white/70 rounded-full"
          />
        </div>
      </main>
    </div>
  );
}

HeroSection3.propTypes = {
  logoText: PropTypes.string,
  navLinks: PropTypes.arrayOf(PropTypes.shape({
    href: PropTypes.string,
    label: PropTypes.string
  })),
  user: PropTypes.object,
  onLogout: PropTypes.func,
};

HeroSection3.defaultProps = {
  logoText: "Adltrack",
  navLinks: [],
  user: null,
  onLogout: null,
};
