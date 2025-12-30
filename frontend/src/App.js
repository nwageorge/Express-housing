import { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Heart, Star, MapPin, Clock, Shield, Phone, Mail, ChevronLeft, ChevronRight, Menu, X, Search, Calendar, User, LogOut, Users, CheckCircle, Award, Sparkles, Building2, Image, MessageSquare, BadgeCheck, Camera, Activity, Download } from "lucide-react";
import React from "react";
import { HeroSection as NewHeroSection } from "@/components/ui/hero-section";
import { TestimonialsSplit } from "@/components/ui/split-testimonial";
import { CareSearchSpotlight } from "@/components/ui/apple-spotlight";
import { AuthComponent } from "@/components/ui/sign-up";
import { OfferCarousel } from "@/components/ui/offer-carousel";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Wishlist Context
const WishlistContext = createContext(null);
export const useWishlist = () => useContext(WishlistContext);

const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  const toggleWishlist = (agencyId) => {
    setWishlist(prev => {
      const newList = prev.includes(agencyId)
        ? prev.filter(id => id !== agencyId)
        : [...prev, agencyId];
      localStorage.setItem("wishlist", JSON.stringify(newList));
      return newList;
    });
  };

  const isWishlisted = (agencyId) => wishlist.includes(agencyId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};

// Radial Gradient Background Component (warm brown/nature theme)
const PageBackground = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen w-full relative ${className}`}>
      {/* Radial Gradient Background - Warm Stone/Nature Theme */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #faf8f5 40%, #a8998a 100%)",
        }}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Navigation Component - Airbnb Style
const Navigation = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-sm border-b border-gray-100" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-stone-700 rounded-xl flex items-center justify-center">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-semibold text-stone-800">Adltrack</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/agencies" className="text-sm text-stone-600 hover:text-stone-900 transition font-medium" data-testid="nav-agencies">
              Find Care
            </Link>
            <Link to="/faq" className="text-sm text-stone-600 hover:text-stone-900 transition font-medium" data-testid="nav-faq">
              How It Works
            </Link>
            <Link to="/contact" className="text-sm text-stone-600 hover:text-stone-900 transition font-medium" data-testid="nav-contact">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm text-stone-600 hover:text-stone-900 transition font-medium" data-testid="nav-dashboard">
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-stone-600 hover:text-red-600 transition"
                  data-testid="logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-stone-600 hover:text-stone-900 transition font-medium" data-testid="nav-login">
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-all"
                  data-testid="nav-signup"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 hover:bg-stone-100 rounded-full transition" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-5 h-5 text-stone-700" /> : <Menu className="w-5 h-5 text-stone-700" />}
          </button>
        </div>

        {/* Mobile Menu - Full Screen Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden fixed inset-x-0 top-[56px] bg-white border-t border-gray-100 shadow-lg z-50"
            >
              <div className="flex flex-col py-2">
                <Link to="/agencies" onClick={() => setIsMenuOpen(false)} className="px-6 py-3 text-base text-stone-700 hover:bg-stone-50 transition font-medium">Find Care</Link>
                <Link to="/faq" onClick={() => setIsMenuOpen(false)} className="px-6 py-3 text-base text-stone-700 hover:bg-stone-50 transition font-medium">How It Works</Link>
                <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="px-6 py-3 text-base text-stone-700 hover:bg-stone-50 transition font-medium">Contact</Link>
                <div className="border-t border-gray-100 my-2"></div>
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="px-6 py-3 text-base text-stone-700 hover:bg-stone-50 transition font-medium">Dashboard</Link>
                    <button onClick={() => { logout(); setIsMenuOpen(false); }} className="px-6 py-3 text-base text-left text-red-600 hover:bg-red-50 transition font-medium">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="px-6 py-3 text-base text-stone-700 hover:bg-stone-50 transition font-medium">Sign In</Link>
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="mx-4 my-2 px-4 py-2.5 bg-stone-800 text-white rounded-lg text-base text-center font-medium hover:bg-stone-700 transition">Get Started</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

// Agency Card Component - Exact Airbnb Style
import { GlareCard } from "@/components/ui/glare-card";

const AgencyCard = ({ agency, index }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="group cursor-pointer"
      onClick={() => navigate(`/agencies/${agency.id}`)}
      data-testid={`agency-card-${agency.id}`}
    >
      {/* Image Container - Airbnb 4:3 aspect ratio with rounded corners */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2">
        <img
          src={agency.image_url}
          alt={agency.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        
        {/* Guest Favorite Badge - Top Left (Airbnb style) */}
        {agency.is_verified && (
          <div className="absolute top-2 left-2 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-stone-800 shadow-sm flex items-center gap-1">
            <Award className="w-3 h-3" />
            Guest favorite
          </div>
        )}
        
        {/* Wishlist Heart - Top Right (Airbnb style) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(agency.id);
          }}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center z-10 hover:scale-110 transition-transform"
          data-testid={`wishlist-btn-${agency.id}`}
        >
          <Heart
            className={`w-6 h-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-colors ${
              isWishlisted(agency.id) 
                ? "fill-red-500 text-red-500" 
                : "fill-black/40 text-white stroke-[1.5]"
            }`}
          />
        </button>

        {/* Image carousel dots indicator (Airbnb style) */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {[0,1,2,3,4].map((dot, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}`} />
          ))}
        </div>
      </div>
      
      {/* Content - Exact Airbnb typography */}
      <div className="space-y-0.5 px-0.5">
        {/* Title Row with Rating */}
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-medium text-[15px] text-stone-900 leading-tight line-clamp-1">
            {agency.name}
          </h3>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Star className="w-3 h-3 fill-stone-900 text-stone-900" />
            <span className="text-[13px] text-stone-900">{agency.rating}</span>
          </div>
        </div>
        
        {/* Location - Gray text */}
        <p className="text-[14px] text-stone-500 leading-tight">{agency.city}</p>
        
        {/* Specialty - Gray text */}
        <p className="text-[14px] text-stone-500 leading-tight">
          {agency.specialties?.[0]}
        </p>
        
        {/* Price - Bold with unit */}
        <p className="text-[15px] text-stone-900 pt-0.5">
          <span className="font-semibold">${agency.price_per_hour}</span>
          <span className="font-normal text-stone-600"> /hour</span>
        </p>
      </div>
    </motion.div>
  );
};

// Agency Carousel Component - Airbnb Style
const AgencyCarousel = ({ title, agencies, viewAllLink }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = React.useRef(null);

  const scroll = (direction) => {
    const container = containerRef.current;
    if (container) {
      const scrollAmount = 250;
      const newPosition = direction === "left"
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: "smooth" });
      setScrollPosition(newPosition);
    }
  };

  return (
    <section className="py-4 sm:py-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-[22px] font-semibold text-stone-900">{title}</h2>
        <div className="flex items-center gap-2">
          <Link
            to={viewAllLink}
            className="hidden sm:block text-sm font-medium text-stone-900 hover:underline"
          >
            Show all
          </Link>
          <button
            onClick={() => scroll("left")}
            className="w-7 h-7 bg-white border border-stone-300 rounded-full flex items-center justify-center hover:border-stone-400 hover:shadow-sm transition disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 text-stone-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-7 h-7 bg-white border border-stone-300 rounded-full flex items-center justify-center hover:border-stone-400 hover:shadow-sm transition disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4 text-stone-600" />
          </button>
        </div>
      </div>

      {/* Card container - 5 cards on desktop, 2 on mobile */}
      <div
        ref={containerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollSnapType: "x mandatory", scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {agencies.map((agency, index) => (
          <div 
            key={agency.id} 
            className="flex-shrink-0 w-[calc((100%-12px)/2)] sm:w-[calc((100%-48px)/5)] lg:w-[calc((100%-64px)/5)]" 
            style={{ scrollSnapAlign: "start" }}
          >
            <AgencyCard agency={agency} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
};

// Testimonials Section - Using Split Testimonial Component
const TestimonialsSection = () => {
  return (
    <section className="py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <p className="text-stone-500 text-center max-w-2xl mx-auto mb-12">
          Join thousands of families and Agencies who trust Adltrack for their in-home care services
        </p>
      </div>
      <TestimonialsSplit />
    </section>
  );
};

// Hero Section - Warm Nature Theme
const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/agencies?search=${searchQuery}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Trusted by 10,000+ families
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-stone-800 leading-tight mb-6">
              Compassionate
              <span className="text-stone-500"> Home Care </span>
              For Your Loved Ones
            </h1>
            
            <p className="text-xl text-stone-600 mb-8 leading-relaxed">
              Connect with verified, professional in-home caregivers for elderly care, 
              pediatric support, and specialized health services.
            </p>

            <form onSubmit={handleSearch} className="flex gap-3 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by city or care type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-stone-200 focus:border-stone-400 focus:ring-4 focus:ring-stone-200 outline-none transition shadow-sm"
                  data-testid="hero-search-input"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-stone-800 text-white rounded-2xl font-semibold hover:bg-stone-700 transition-all"
                data-testid="hero-search-btn"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop"
                ].map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-stone-500">4.9 average from 2,000+ reviews</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div whileHover={{ y: -8 }} className="rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=500&fit=crop" alt="Caregiver" className="w-full h-72 object-cover" />
              </motion.div>
              <motion.div whileHover={{ y: -8 }} className="rounded-3xl overflow-hidden shadow-2xl mt-8">
                <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=500&fit=crop" alt="Nurse" className="w-full h-72 object-cover" />
              </motion.div>
              <motion.div whileHover={{ y: -8 }} className="rounded-3xl overflow-hidden shadow-2xl -mt-8">
                <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=500&fit=crop" alt="Healthcare worker" className="w-full h-72 object-cover" />
              </motion.div>
              <motion.div whileHover={{ y: -8 }} className="rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=500&fit=crop" alt="Medical professional" className="w-full h-72 object-cover" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Features Section - Black & White Theme
// Home Page
const HomePage = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        await axios.post(`${API}/seed`);
        const response = await axios.get(`${API}/agencies`);
        setAgencies(response.data);
      } catch (error) {
        console.error("Error fetching agencies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgencies();
  }, []);

  const cities = ["Philadelphia, PA", "Washington, D.C.", "Pittsburgh, PA"];

  // Rewards/Cashback Offers - Fun images for elderly (cruises, travel, family activities)
  const rewardsOffers = [
    {
      id: 1,
      imageSrc: "https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=2064&auto=format&fit=crop",
      imageAlt: "Cruise ship at sunset",
      tag: "Cashback",
      title: "5% Cashback",
      description: "Earn 5% back on your first month of care payments.",
      href: "#rewards",
    },
    {
      id: 2,
      imageSrc: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop",
      imageAlt: "Airplane flying in sky",
      tag: "Points",
      title: "2X Points Week",
      description: "Earn double points on all care bookings this week.",
      href: "#points",
    },
    {
      id: 3,
      imageSrc: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
      imageAlt: "Beautiful tropical beach",
      tag: "Credit Builder",
      title: "Build Your Credit",
      description: "On-time care payments reported to all 3 credit bureaus.",
      href: "#credit",
    },
    {
      id: 4,
      imageSrc: "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop",
      imageAlt: "Happy family at airport",
      tag: "Family Plan",
      title: "Up to $200 OFF",
      description: "Save on multi-family member care packages.",
      href: "#family",
    },
    {
      id: 5,
      imageSrc: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop",
      imageAlt: "Road trip adventure",
      tag: "Referral",
      title: "$100 Referral Bonus",
      description: "Refer a friend and both get $100 care credit.",
      href: "#referral",
    },
    {
      id: 6,
      imageSrc: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop",
      imageAlt: "Mountain lake paradise",
      tag: "Loyalty",
      title: "Free Month Reward",
      description: "12 months on-time? Get your 13th month free!",
      href: "#loyalty",
    },
  ];

  return (
    <PageBackground>
      {/* New Hero Section with integrated header */}
      <NewHeroSection />
      
      {/* Search Spotlight Section - positioned on the dividing line */}
      <div className="relative -mt-20 z-20 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <CareSearchSpotlight />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-stone-700 border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-stone-500">Loading care agencies...</p>
          </div>
        ) : (
          cities.map((city) => {
            const cityAgencies = agencies.filter((a) => a.city === city);
            if (cityAgencies.length === 0) return null;
            return (
              <AgencyCarousel
                key={city}
                title={city}
                agencies={cityAgencies}
                viewAllLink={`/agencies?city=${encodeURIComponent(city)}`}
              />
            );
          })
        )}

        {/* Rewards Section - Airbnb style */}
        <section className="py-6 sm:py-8">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-[22px] sm:text-2xl font-semibold text-stone-900">Deals of the Day</h2>
          </div>
          <p className="text-sm text-stone-500 mb-4">Earn cashback, points & build credit when you pay for care on time</p>
          <OfferCarousel offers={rewardsOffers} />
        </section>
      </div>

      <TestimonialsSection />

      {/* Footer - Airbnb style */}
      <footer className="bg-stone-100 border-t border-stone-200 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-stone-700 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-semibold text-stone-900">Adltrack</span>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed">
                Connecting families with compassionate, professional in-home caregivers.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-900 mb-3">Services</h4>
              <ul className="space-y-2">
                <li><Link to="/agencies" className="text-sm text-stone-500 hover:text-stone-900 hover:underline transition">Elderly Care</Link></li>
                <li><Link to="/agencies" className="text-sm text-stone-500 hover:text-stone-900 hover:underline transition">Pediatric Care</Link></li>
                <li><Link to="/agencies" className="text-sm text-stone-500 hover:text-stone-900 hover:underline transition">Post-Surgery Care</Link></li>
                <li><Link to="/agencies" className="text-sm text-stone-500 hover:text-stone-900 hover:underline transition">24-Hour Care</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-900 mb-3">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/faq" className="text-sm text-stone-500 hover:text-stone-900 hover:underline transition">How It Works</Link></li>
                <li><Link to="/contact" className="text-sm text-stone-500 hover:text-stone-900 hover:underline transition">Contact Us</Link></li>
                <li><Link to="/agencies" className="text-sm text-stone-500 hover:text-stone-900 hover:underline transition">Find Care</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-900 mb-3">Contact</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-stone-500"><Phone className="w-4 h-4" /> 1-800-ADL-TRACK</li>
                <li className="flex items-center gap-2 text-sm text-stone-500"><Mail className="w-4 h-4" /> support@adltrack.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-200 pt-6 text-center">
            <p className="text-xs text-stone-500">© 2025 Adltrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </PageBackground>
  );
};

// Login Page - Using New Auth Component
const LoginPage = () => {
  return <AuthComponent mode="login" />;
};

// Signup Page - Using New Auth Component
const SignupPage = () => {
  return <AuthComponent mode="signup" />;
};

// Agencies Page - Warm Nature Theme
const AgenciesPage = () => {
  const [agencies, setAgencies] = useState([]);
  const [allAgencies, setAllAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const cities = ["Philadelphia, PA", "Washington, D.C.", "Pittsburgh, PA"];
  const specialties = ["Elderly Care", "Pediatric Care", "Post-Surgery Recovery", "24-Hour Care", "Dementia Care", "Skilled Nursing"];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityParam = params.get("city");
    const specialtyParam = params.get("specialty");
    const searchParam = params.get("search");
    if (cityParam) setSelectedCity(cityParam);
    if (specialtyParam) setSelectedSpecialty(specialtyParam);
    if (searchParam) setSearchQuery(searchParam);
  }, [location]);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await axios.get(`${API}/agencies`);
        setAllAgencies(response.data);
      } catch (error) {
        console.error("Error fetching agencies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgencies();
  }, []);

  // Filter agencies based on city, specialty, and search query
  useEffect(() => {
    let filtered = [...allAgencies];
    
    if (selectedCity) {
      filtered = filtered.filter(a => a.city === selectedCity);
    }
    
    if (selectedSpecialty) {
      filtered = filtered.filter(a => a.specialties?.includes(selectedSpecialty));
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.name?.toLowerCase().includes(query) ||
        a.city?.toLowerCase().includes(query) ||
        a.location?.toLowerCase().includes(query) ||
        a.bio?.toLowerCase().includes(query) ||
        a.specialties?.some(s => s.toLowerCase().includes(query))
      );
    }
    
    setAgencies(filtered);
  }, [allAgencies, selectedCity, selectedSpecialty, searchQuery]);

  return (
    <PageBackground>
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Find In-Home Care</h1>
            <p className="text-stone-500">Browse verified care agencies in your area</p>
          </div>

          {/* Search Input */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search by city, zip code, or care type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-4 focus:ring-stone-100 outline-none transition shadow-sm"
                data-testid="search-input"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="px-4 py-3 bg-white rounded-xl border border-stone-200 focus:border-stone-400 outline-none shadow-sm" data-testid="filter-city">
              <option value="">All Cities</option>
              {cities.map((city) => (<option key={city} value={city}>{city}</option>))}
            </select>
            <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)} className="px-4 py-3 bg-white rounded-xl border border-stone-200 focus:border-stone-400 outline-none shadow-sm" data-testid="filter-specialty">
              <option value="">All Specialties</option>
              {specialties.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
            {(selectedCity || selectedSpecialty || searchQuery) && (
              <button 
                onClick={() => { setSelectedCity(""); setSelectedSpecialty(""); setSearchQuery(""); }}
                className="px-4 py-3 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-600 font-medium transition"
              >
                Clear Filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center"><div className="animate-spin w-12 h-12 border-4 border-stone-700 border-t-transparent rounded-full mx-auto" /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {agencies.map((agency, index) => (<AgencyCard key={agency.id} agency={agency} index={index} />))}
            </div>
          )}
          {!loading && agencies.length === 0 && <div className="text-center py-20"><p className="text-stone-500">No agencies found matching your criteria.</p></div>}
        </div>
      </div>
    </PageBackground>
  );
};

// Agency Detail Page - Warm Nature Theme
const AgencyDetailPage = () => {
  const { id } = useParams();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [bookingData, setBookingData] = useState({ service_type: "", date: "", time_slot: "", patient_name: "", patient_age: "", care_needs: "", notes: "" });
  const [bookingLoading, setBookingLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgency = async () => {
      try {
        const response = await axios.get(`${API}/agencies/${id}`);
        setAgency(response.data);
      } catch (error) {
        console.error("Error fetching agency:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgency();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setBookingLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/bookings`, { ...bookingData, agency_id: id, patient_age: bookingData.patient_age ? parseInt(bookingData.patient_age) : null }, { headers: { Authorization: `Bearer ${token}` } });
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      navigate("/booking-success");
    } catch (error) {
      alert(error.response?.data?.detail || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <PageBackground className="flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-stone-700 border-t-transparent rounded-full" /></PageBackground>;
  if (!agency) return <PageBackground className="flex items-center justify-center"><p className="text-stone-500">Agency not found</p></PageBackground>;

  const allImages = [agency.image_url, ...(agency.gallery_images || [])];
  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

  return (
    <PageBackground>
      <Navigation />
      
      {/* Full-screen Image Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setShowGallery(false)}
          >
            <button 
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
              onClick={() => setShowGallery(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => prev > 0 ? prev - 1 : allImages.length - 1); }}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
              onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => prev < allImages.length - 1 ? prev + 1 : 0); }}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
            <img 
              src={allImages[selectedImage]} 
              alt="Gallery" 
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-2 h-2 rounded-full transition ${idx === selectedImage ? 'bg-white' : 'bg-white/40'}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedImage(idx); }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Image Gallery Section - Booking.com Style */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="grid grid-cols-4 gap-2 h-[400px] rounded-2xl overflow-hidden cursor-pointer" onClick={() => setShowGallery(true)}>
              <div className="col-span-2 row-span-2 relative group">
                <img src={allImages[0]} alt={agency.name} className="w-full h-full object-cover transition group-hover:brightness-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              {allImages.slice(1, 5).map((img, idx) => (
                <div key={idx} className="relative group overflow-hidden">
                  <img src={img} alt={`${agency.name} ${idx + 2}`} className="w-full h-full object-cover transition group-hover:brightness-90" />
                  {idx === 3 && allImages.length > 5 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold">
                      <Camera className="w-5 h-5 mr-2" />
                      +{allImages.length - 5} photos
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowGallery(true)}
              className="mt-3 flex items-center gap-2 text-stone-600 hover:text-stone-800 transition text-sm"
            >
              <Image className="w-4 h-4" />
              View all {allImages.length} photos
            </button>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Header Info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {agency.is_verified && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                          <BadgeCheck className="w-3 h-3" />Verified Agency
                        </span>
                      )}
                      {agency.is_new && (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />New
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-stone-800 mb-2">{agency.name}</h1>
                    <div className="flex items-center gap-2 text-stone-500">
                      <MapPin className="w-4 h-4" />
                      <span>{agency.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 bg-stone-800 text-white px-3 py-1.5 rounded-lg">
                      <Star className="w-4 h-4 fill-white" />
                      <span className="font-bold">{agency.rating}</span>
                    </div>
                    <p className="text-sm text-stone-500 mt-1">{agency.review_count} reviews</p>
                  </div>
                </div>

                {/* Quick Stats - TripAdvisor Style */}
                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-stone-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-stone-800">{agency.years_in_business || agency.experience_years}</div>
                    <div className="text-xs text-stone-500">Years in Business</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-stone-800">{agency.total_caregivers || 20}+</div>
                    <div className="text-xs text-stone-500">Caregivers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-stone-800">{agency.families_served || 500}+</div>
                    <div className="text-xs text-stone-500">Families Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">${agency.price_per_hour}</div>
                    <div className="text-xs text-stone-500">Per Hour</div>
                  </div>
                </div>
              </motion.div>

              {/* About Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
              >
                <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  About {agency.name}
                </h2>
                <p className="text-stone-600 leading-relaxed mb-4">{agency.bio}</p>
                {agency.description && <p className="text-stone-600 leading-relaxed">{agency.description}</p>}
              </motion.div>

              {/* Services & Certifications */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                  <h2 className="text-lg font-bold text-stone-800 mb-4">Care Services</h2>
                  <div className="flex flex-wrap gap-2">
                    {agency.specialties?.map((s, i) => (
                      <span key={i} className="px-3 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                  <h2 className="text-lg font-bold text-stone-800 mb-4">Certifications</h2>
                  <div className="space-y-2">
                    {agency.certifications?.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-stone-700">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Reviews Section - TripAdvisor Style */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Family Reviews
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.round(agency.rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                      ))}
                    </div>
                    <span className="font-bold text-stone-800">{agency.rating}</span>
                    <span className="text-stone-500">({agency.review_count} reviews)</span>
                  </div>
                </div>

                {agency.reviews && agency.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {agency.reviews.map((review, idx) => (
                      <motion.div 
                        key={review.id || idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-4 bg-stone-50 rounded-xl border border-stone-100"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center">
                              <span className="text-stone-600 font-semibold">{review.user_name?.charAt(0) || 'U'}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-stone-800">{review.user_name}</p>
                              <p className="text-xs text-stone-500">{review.relationship} • {review.care_type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-stone-600 text-sm leading-relaxed">"{review.comment}"</p>
                        <p className="text-xs text-stone-400 mt-2">{review.date}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-500 text-center py-8">No reviews yet. Be the first to share your experience!</p>
                )}
              </motion.div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }} 
                className="bg-white rounded-2xl shadow-lg p-6 sticky top-28 border border-stone-100"
              >
                <div className="text-center mb-6 pb-6 border-b border-stone-100">
                  <div className="text-4xl font-bold text-stone-800">
                    ${agency.price_per_hour}
                    <span className="text-lg font-normal text-stone-500">/hour</span>
                  </div>
                  <p className="text-sm text-stone-500 mt-1">Per caregiver</p>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Care Service Needed</label>
                    <select 
                      value={bookingData.service_type} 
                      onChange={(e) => setBookingData({ ...bookingData, service_type: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 outline-none bg-white" 
                      required 
                      data-testid="booking-service"
                    >
                      <option value="">Select service type</option>
                      {agency.specialties?.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Consultation Date</label>
                    <input 
                      type="date" 
                      value={bookingData.date} 
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 outline-none" 
                      required 
                      min={new Date().toISOString().split("T")[0]} 
                      data-testid="booking-date" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Preferred Time</label>
                    <select 
                      value={bookingData.time_slot} 
                      onChange={(e) => setBookingData({ ...bookingData, time_slot: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 outline-none bg-white" 
                      required 
                      data-testid="booking-time"
                    >
                      <option value="">Select time slot</option>
                      {timeSlots.map((slot) => (<option key={slot} value={slot}>{slot}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Who Needs Care?</label>
                    <input 
                      type="text" 
                      value={bookingData.patient_name} 
                      onChange={(e) => setBookingData({ ...bookingData, patient_name: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 outline-none" 
                      placeholder="Patient's name" 
                      required 
                      data-testid="booking-patient" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Care Needs (Optional)</label>
                    <textarea 
                      value={bookingData.care_needs} 
                      onChange={(e) => setBookingData({ ...bookingData, care_needs: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-2 focus:ring-stone-100 outline-none resize-none" 
                      rows={3} 
                      placeholder="Describe any specific care requirements..." 
                      data-testid="booking-needs" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={bookingLoading} 
                    className="w-full py-4 bg-stone-800 text-white rounded-xl font-semibold hover:bg-stone-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2" 
                    data-testid="booking-submit"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5" />
                        Book Free Consultation
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-stone-100 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Free consultation - no commitment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Cancel anytime before confirmation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Personalized care matching</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

// Dashboard Page - Warm Nature Theme
const DashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API}/bookings`, { headers: { Authorization: `Bearer ${token}` } });
        setBookings(response.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user, navigate]);

  const statusColors = { pending: "bg-amber-100 text-amber-700", confirmed: "bg-green-100 text-green-700", completed: "bg-stone-100 text-stone-700", cancelled: "bg-red-100 text-red-700" };

  return (
    <PageBackground>
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8"><h1 className="text-3xl font-bold text-stone-800 mb-2">Welcome back, {user?.name}!</h1><p className="text-stone-500">Manage your care bookings and account</p></div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center"><Calendar className="w-6 h-6 text-stone-800" /></div><div><p className="text-sm text-stone-500">Total Bookings</p><p className="text-2xl font-bold text-stone-800">{bookings.length}</p></div></div></div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-green-600" /></div><div><p className="text-sm text-stone-500">Confirmed</p><p className="text-2xl font-bold text-stone-800">{bookings.filter(b => b.status === "confirmed").length}</p></div></div></div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center"><Clock className="w-6 h-6 text-amber-600" /></div><div><p className="text-sm text-stone-500">Pending</p><p className="text-2xl font-bold text-stone-800">{bookings.filter(b => b.status === "pending").length}</p></div></div></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100">
            <div className="p-6 border-b border-stone-100"><h2 className="text-xl font-bold text-stone-800">Your Bookings</h2></div>
            {loading ? (<div className="p-12 text-center"><div className="animate-spin w-8 h-8 border-4 border-stone-700 border-t-transparent rounded-full mx-auto" /></div>) : bookings.length === 0 ? (
              <div className="p-12 text-center"><p className="text-stone-500 mb-4">You haven't made any bookings yet.</p><Link to="/agencies" className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition">Find Care<ChevronRight className="w-4 h-4" /></Link></div>
            ) : (
              <div className="divide-y divide-stone-100">{bookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-stone-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">{booking.agency && <img src={booking.agency.image_url} alt={booking.agency.name} className="w-16 h-16 rounded-xl object-cover" />}<div><h3 className="font-semibold text-stone-800">{booking.agency?.name || "Care Agency"}</h3><p className="text-sm text-stone-500">{booking.service_type}</p><div className="flex items-center gap-4 mt-2 text-sm text-stone-500"><span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{booking.date}</span><span className="flex items-center gap-1"><Clock className="w-4 h-4" />{booking.time_slot}</span></div></div></div>
                    <div className="text-right"><span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[booking.status]}`}>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span><p className="mt-2 font-semibold text-stone-800">${booking.total_price}/hr</p></div>
                  </div>
                </div>
              ))}</div>
            )}
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

// Booking Success Page
const BookingSuccessPage = () => {
  useEffect(() => { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); }, []);
  return (
    <PageBackground className="flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md border border-stone-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-500" /></div>
        <h1 className="text-3xl font-bold text-stone-800 mb-4">Booking Confirmed!</h1>
        <p className="text-stone-500 mb-8">Your care consultation has been successfully booked. The agency will contact you shortly to confirm details.</p>
        <div className="flex flex-col gap-3">
          <Link to="/dashboard" className="px-6 py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition">View My Bookings</Link>
          <Link to="/" className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl font-medium hover:bg-stone-200 transition">Back to Home</Link>
        </div>
      </motion.div>
    </PageBackground>
  );
};

// Contact Page - Warm Nature Theme
const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, formData);
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageBackground>
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12"><h1 className="text-4xl font-bold text-stone-800 mb-4">Contact Us</h1><p className="text-stone-500">Have questions? We're here to help!</p></div>
          {success ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-lg p-12 text-center border border-stone-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-500" /></div>
              <h2 className="text-2xl font-bold text-stone-800 mb-2">Message Sent!</h2>
              <p className="text-stone-500 mb-6">We'll get back to you within 24 hours.</p>
              <button onClick={() => setSuccess(false)} className="px-6 py-3 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-700 transition">Send Another Message</button>
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-stone-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium text-stone-700 mb-2">Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-4 focus:ring-stone-100 outline-none transition" required data-testid="contact-name" /></div>
                  <div><label className="block text-sm font-medium text-stone-700 mb-2">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-4 focus:ring-stone-100 outline-none transition" required data-testid="contact-email" /></div>
                </div>
                <div><label className="block text-sm font-medium text-stone-700 mb-2">Subject</label><input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-4 focus:ring-stone-100 outline-none transition" required data-testid="contact-subject" /></div>
                <div><label className="block text-sm font-medium text-stone-700 mb-2">Message</label><textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:ring-4 focus:ring-stone-100 outline-none transition resize-none" rows={6} required data-testid="contact-message" /></div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-stone-800 text-white rounded-xl font-semibold hover:bg-stone-700 transition-all disabled:opacity-50" data-testid="contact-submit">{loading ? "Sending..." : "Send Message"}</button>
              </form>
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-stone-100"><div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4"><Phone className="w-6 h-6 text-stone-800" /></div><h3 className="font-semibold text-stone-800 mb-1">Phone</h3><p className="text-stone-500">1-800-ADL-TRACK</p></div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-stone-100"><div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4"><Mail className="w-6 h-6 text-stone-800" /></div><h3 className="font-semibold text-stone-800 mb-1">Email</h3><p className="text-stone-500">support@adltrack.com</p></div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-stone-100"><div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4"><Clock className="w-6 h-6 text-stone-800" /></div><h3 className="font-semibold text-stone-800 mb-1">Hours</h3><p className="text-stone-500">24/7 Support</p></div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

// FAQ Page - Warm Nature Theme
const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const faqs = [
    { question: "What types of in-home care services do you offer?", answer: "We connect families with caregivers offering a wide range of services including elderly care, pediatric care, post-surgery recovery, chronic disease management, dementia/Alzheimer's care, 24-hour care, respite care, and skilled nursing services." },
    { question: "How are caregivers vetted?", answer: "All caregivers on our platform undergo comprehensive background checks, credential verification, and reference checks. We verify licenses, certifications, and work history to ensure only qualified professionals are listed." },
    { question: "How much does in-home care cost?", answer: "Costs vary based on the type of care needed, location, and caregiver experience. Our rates typically range from $15-18 per hour. You can see exact pricing on each agency's profile." },
    { question: "Can I meet the caregiver before booking?", answer: "Yes! We encourage families to schedule an initial consultation to meet the caregiver, discuss care needs, and ensure a good match before committing to ongoing care." },
    { question: "What if I need to cancel or reschedule?", answer: "We understand plans change. You can cancel or reschedule up to 24 hours before your appointment without any fees. Last-minute changes may incur a small cancellation fee." },
    { question: "Is care covered by insurance?", answer: "Many insurance plans, including Medicare and Medicaid, may cover certain home healthcare services. We recommend checking with your insurance provider. Many of our agencies also assist with insurance coordination." },
    { question: "What areas do you serve?", answer: "We currently serve Philadelphia, PA; Washington, D.C.; Pittsburgh, PA; and Newark, NJ. We're actively expanding to new areas." },
    { question: "How do I pay for services?", answer: "Payment is processed securely through our platform. We accept all major credit cards and can work with insurance providers for covered services." },
  ];

  return (
    <PageBackground>
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12"><h1 className="text-4xl font-bold text-stone-800 mb-4">Frequently Asked Questions</h1><p className="text-stone-500">Everything you need to know about our services</p></div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-stone-100">
                <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-stone-50 transition" data-testid={`faq-${index}`}>
                  <span className="font-semibold text-stone-800 pr-4">{faq.question}</span>
                  <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronRight className="w-5 h-5 text-stone-500 rotate-90" /></motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <div className="px-6 pb-5 text-stone-600 leading-relaxed">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 bg-stone-800 rounded-3xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-stone-300 mb-6">Our team is here to help you find the perfect care solution.</p>
            <Link to="/contact" className="inline-block px-8 py-3 bg-white text-stone-800 rounded-xl font-semibold hover:bg-stone-100 transition">Contact Us</Link>
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/agencies" element={<AgenciesPage />} />
            <Route path="/agencies/:id" element={<AgencyDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/booking-success" element={<BookingSuccessPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
          </Routes>
        </BrowserRouter>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
