import { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Heart, Star, MapPin, Clock, Shield, Phone, Mail, ChevronLeft, ChevronRight, Menu, X, Search, Calendar, User, LogOut, Users, CheckCircle, Award, Sparkles, Building2, Image, MessageSquare, BadgeCheck, Camera, Activity, Download } from "lucide-react";
import React from "react";
import { HeroSection as NewHeroSection } from "@/components/ui/hero-section";

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

// Navigation Component - Warm Nature Theme
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
        isScrolled ? "bg-stone-50/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-stone-700 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-stone-800">Adltrack</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/agencies" className="text-stone-600 hover:text-stone-900 transition font-medium" data-testid="nav-agencies">
              Find Care
            </Link>
            <Link to="/faq" className="text-stone-600 hover:text-stone-900 transition font-medium" data-testid="nav-faq">
              FAQ
            </Link>
            <Link to="/contact" className="text-stone-600 hover:text-stone-900 transition font-medium" data-testid="nav-contact">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-stone-600 hover:text-stone-900 transition font-medium" data-testid="nav-dashboard">
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-red-600 transition"
                  data-testid="logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-black transition font-medium" data-testid="nav-login">
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all"
                  data-testid="nav-signup"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 border-t border-gray-100"
            >
              <div className="flex flex-col gap-4 pt-4">
                <Link to="/agencies" className="text-gray-600 hover:text-black transition">Find Care</Link>
                <Link to="/faq" className="text-gray-600 hover:text-black transition">FAQ</Link>
                <Link to="/contact" className="text-gray-600 hover:text-black transition">Contact</Link>
                {user ? (
                  <>
                    <Link to="/dashboard" className="text-gray-600 hover:text-black transition">Dashboard</Link>
                    <button onClick={logout} className="text-left text-red-600">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-600 hover:text-black transition">Sign In</Link>
                    <Link to="/signup" className="text-black font-medium">Get Started</Link>
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

// Agency Card Component - Black & White Theme
import { GlareCard } from "@/components/ui/glare-card";

const AgencyCard = ({ agency, index }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group cursor-pointer"
      onClick={() => navigate(`/agencies/${agency.id}`)}
      data-testid={`agency-card-${agency.id}`}
    >
      <GlareCard className="relative">
        {/* Background Image */}
        <img
          src={agency.image_url}
          alt={agency.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {agency.is_verified && (
            <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full flex items-center gap-1 border border-white/30">
              <Shield className="w-3 h-3" />
              Verified
            </div>
          )}
          {agency.is_new && (
            <div className="px-3 py-1.5 bg-indigo-500/80 backdrop-blur-md text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              New
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(agency.id);
          }}
          className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:bg-white/40 transition z-10"
          data-testid={`wishlist-btn-${agency.id}`}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isWishlisted(agency.id) ? "fill-red-500 text-red-500" : "text-white"
            }`}
          />
        </button>

        {/* Content at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-md rounded-full">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-white text-sm">{agency.rating}</span>
            </div>
            <span className="text-white/70 text-sm">({agency.review_count} reviews)</span>
          </div>
          
          {/* Agency Name */}
          <h3 className="font-bold text-white text-xl mb-1 drop-shadow-lg">
            {agency.name}
          </h3>
          
          {/* Location */}
          <div className="flex items-center gap-1 text-white/80 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>{agency.city}</span>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {agency.specialties?.slice(0, 2).map((specialty, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-white/10 backdrop-blur-md text-white/90 text-xs font-medium rounded-full border border-white/20"
              >
                {specialty}
              </span>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">${agency.price_per_hour}</span>
              <span className="text-white/70 text-sm">/hour</span>
            </div>
            <div className="px-4 py-2 bg-white text-slate-900 rounded-full text-sm font-semibold hover:bg-white/90 transition">
              View Details
            </div>
          </div>
        </div>
      </GlareCard>
    </motion.div>
  );
};

// Agency Carousel Component
const AgencyCarousel = ({ title, subtitle, agencies, viewAllLink }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = React.useRef(null);

  const scroll = (direction) => {
    const container = containerRef.current;
    if (container) {
      const scrollAmount = 320;
      const newPosition = direction === "left"
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: "smooth" });
      setScrollPosition(newPosition);
    }
  };

  return (
    <section className="py-12">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          {subtitle && <p className="text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={viewAllLink}
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 font-medium transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-2 px-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {agencies.map((agency, index) => (
          <div key={agency.id} className="flex-shrink-0 w-72" style={{ scrollSnapAlign: "start" }}>
            <AgencyCard agency={agency} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
};

// Testimonials Component
const TestimonialsSection = () => {
  const testimonials = [
    { name: "Sarah M.", text: "Adltrack helped us find the perfect caregiver for my mother. The care quality is exceptional!", rating: 5, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
    { name: "James R.", text: "Professional, compassionate, and reliable. Our family couldn't be happier with the service.", rating: 5, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    { name: "Emily T.", text: "The caregivers are so patient with my father. They treat him like family. Highly recommend!", rating: 5, image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
    { name: "Michael K.", text: "After my surgery, Adltrack provided excellent recovery care. I'm back on my feet thanks to them.", rating: 5, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
    { name: "Lisa P.", text: "Finding quality infant care was stressful until we found Adltrack. Now we have peace of mind.", rating: 5, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" },
  ];

  return (
    <section className="py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">What Families Say</h2>
        <p className="text-gray-500 text-center max-w-2xl mx-auto">
          Join thousands of families who trust Adltrack for their in-home care needs
        </p>
      </div>

      <div className="relative">
        <motion.div
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-6"
        >
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-96 bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <div className="flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gray-900 text-gray-900" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">"{testimonial.text}"</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Hero Section - Black & White Theme
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Trusted by 10,000+ families
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Compassionate
              <span className="text-gray-600"> Home Care </span>
              For Your Loved Ones
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Connect with verified, professional in-home caregivers for elderly care, 
              pediatric support, and specialized health services.
            </p>

            <form onSubmit={handleSearch} className="flex gap-3 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by city or care type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-200 outline-none transition shadow-sm"
                  data-testid="hero-search-input"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-black text-white rounded-2xl font-semibold hover:bg-gray-800 transition-all"
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
                    <Star key={i} className="w-4 h-4 fill-gray-900 text-gray-900" />
                  ))}
                </div>
                <p className="text-sm text-gray-500">4.9 average from 2,000+ reviews</p>
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

  const cities = ["Philadelphia, PA", "Washington, D.C.", "Pittsburgh, PA", "Newark, NJ"];

  return (
    <PageBackground>
      {/* New Hero Section with integrated header */}
      <NewHeroSection />
      
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-500">Loading care agencies...</p>
          </div>
        ) : (
          cities.map((city) => {
            const cityAgencies = agencies.filter((a) => a.city === city);
            if (cityAgencies.length === 0) return null;
            return (
              <AgencyCarousel
                key={city}
                title={city}
                subtitle={`${cityAgencies.length} trusted care agencies`}
                agencies={cityAgencies}
                viewAllLink={`/agencies?city=${encodeURIComponent(city)}`}
              />
            );
          })
        )}
      </div>

      <TestimonialsSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Adltrack</span>
              </div>
              <p className="text-sm leading-relaxed">
                Connecting families with compassionate, professional in-home caregivers.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/agencies" className="hover:text-white transition">Elderly Care</Link></li>
                <li><Link to="/agencies" className="hover:text-white transition">Pediatric Care</Link></li>
                <li><Link to="/agencies" className="hover:text-white transition">Post-Surgery Care</Link></li>
                <li><Link to="/agencies" className="hover:text-white transition">24-Hour Care</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
                <li><Link to="/agencies" className="hover:text-white transition">Find Care</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 1-800-ADL-TRACK</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@adltrack.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 Adltrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </PageBackground>
  );
};

// Login Page - Black & White Theme
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      login(response.data.access_token, response.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageBackground className="flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Sign in to your Adltrack account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 outline-none transition" placeholder="you@example.com" required data-testid="login-email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 outline-none transition" placeholder="••••••••" required data-testid="login-password" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50" data-testid="login-submit">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="text-center mt-6 text-gray-500">Don't have an account? <Link to="/signup" className="text-black font-medium hover:underline">Sign up</Link></p>
        </div>
      </motion.div>
    </PageBackground>
  );
};

// Signup Page - Black & White Theme
const SignupPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", role: "client" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) { setStep(step + 1); return; }
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API}/auth/signup`, formData);
      login(response.data.access_token, response.data.user);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageBackground className="flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-2">Step {step} of 3</p>
          </div>

          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? "bg-black" : "bg-gray-200"}`} />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">I am looking for...</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setFormData({ ...formData, role: "client" })} className={`p-4 rounded-xl border-2 transition-all ${formData.role === "client" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <User className="w-6 h-6 mx-auto mb-2 text-gray-900" />
                        <span className="text-sm font-medium">Care Services</span>
                      </button>
                      <button type="button" onClick={() => setFormData({ ...formData, role: "agency" })} className={`p-4 rounded-xl border-2 transition-all ${formData.role === "agency" ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <Users className="w-6 h-6 mx-auto mb-2 text-gray-900" />
                        <span className="text-sm font-medium">To Provide Care</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 outline-none transition" placeholder="John Doe" required data-testid="signup-name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 outline-none transition" placeholder="(555) 555-5555" data-testid="signup-phone" />
                  </div>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 outline-none transition" placeholder="you@example.com" required data-testid="signup-email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 outline-none transition" placeholder="••••••••" required minLength={6} data-testid="signup-password" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">Back</button>}
              <button type="submit" disabled={loading} className="flex-1 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50" data-testid="signup-submit">
                {loading ? "Creating..." : step < 3 ? "Continue" : "Create Account"}
              </button>
            </div>
          </form>
          <p className="text-center mt-6 text-gray-500">Already have an account? <Link to="/login" className="text-black font-medium hover:underline">Sign in</Link></p>
        </div>
      </motion.div>
    </PageBackground>
  );
};

// Agencies Page - Black & White Theme
const AgenciesPage = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const location = useLocation();

  const cities = ["Philadelphia, PA", "Washington, D.C.", "Pittsburgh, PA", "Newark, NJ"];
  const specialties = ["Elderly Care", "Pediatric Care", "Post-Surgery Recovery", "24-Hour Care", "Dementia Care", "Skilled Nursing"];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityParam = params.get("city");
    if (cityParam) setSelectedCity(cityParam);
  }, [location]);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        let url = `${API}/agencies`;
        const params = new URLSearchParams();
        if (selectedCity) params.append("city", selectedCity);
        if (selectedSpecialty) params.append("specialty", selectedSpecialty);
        if (params.toString()) url += `?${params.toString()}`;
        const response = await axios.get(url);
        setAgencies(response.data);
      } catch (error) {
        console.error("Error fetching agencies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgencies();
  }, [selectedCity, selectedSpecialty]);

  return (
    <PageBackground>
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find In-Home Care</h1>
            <p className="text-gray-500">Browse verified care agencies in your area</p>
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-gray-400 outline-none shadow-sm" data-testid="filter-city">
              <option value="">All Cities</option>
              {cities.map((city) => (<option key={city} value={city}>{city}</option>))}
            </select>
            <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)} className="px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-gray-400 outline-none shadow-sm" data-testid="filter-specialty">
              <option value="">All Specialties</option>
              {specialties.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>

          {loading ? (
            <div className="py-20 text-center"><div className="animate-spin w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full mx-auto" /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {agencies.map((agency, index) => (<AgencyCard key={agency.id} agency={agency} index={index} />))}
            </div>
          )}
          {!loading && agencies.length === 0 && <div className="text-center py-20"><p className="text-gray-500">No agencies found matching your criteria.</p></div>}
        </div>
      </div>
    </PageBackground>
  );
};

// Agency Detail Page - Black & White Theme
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

  if (loading) return <PageBackground className="flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full" /></PageBackground>;
  if (!agency) return <PageBackground className="flex items-center justify-center"><p className="text-gray-500">Agency not found</p></PageBackground>;

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
              className="mt-3 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition text-sm"
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
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
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
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />New
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{agency.name}</h1>
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{agency.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 bg-gray-900 text-white px-3 py-1.5 rounded-lg">
                      <Star className="w-4 h-4 fill-white" />
                      <span className="font-bold">{agency.rating}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{agency.review_count} reviews</p>
                  </div>
                </div>

                {/* Quick Stats - TripAdvisor Style */}
                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{agency.years_in_business || agency.experience_years}</div>
                    <div className="text-xs text-gray-500">Years in Business</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{agency.total_caregivers || 20}+</div>
                    <div className="text-xs text-gray-500">Caregivers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{agency.families_served || 500}+</div>
                    <div className="text-xs text-gray-500">Families Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">${agency.price_per_hour}</div>
                    <div className="text-xs text-gray-500">Per Hour</div>
                  </div>
                </div>
              </motion.div>

              {/* About Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  About {agency.name}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">{agency.bio}</p>
                {agency.description && <p className="text-gray-600 leading-relaxed">{agency.description}</p>}
              </motion.div>

              {/* Services & Certifications */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Care Services</h2>
                  <div className="flex flex-wrap gap-2">
                    {agency.specialties?.map((s, i) => (
                      <span key={i} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Certifications</h2>
                  <div className="space-y-2">
                    {agency.certifications?.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-700">
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
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Family Reviews
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.round(agency.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="font-bold text-gray-900">{agency.rating}</span>
                    <span className="text-gray-500">({agency.review_count} reviews)</span>
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
                        className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-semibold">{review.user_name?.charAt(0) || 'U'}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{review.user_name}</p>
                              <p className="text-xs text-gray-500">{review.relationship} • {review.care_type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">"{review.comment}"</p>
                        <p className="text-xs text-gray-400 mt-2">{review.date}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to share your experience!</p>
                )}
              </motion.div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }} 
                className="bg-white rounded-2xl shadow-lg p-6 sticky top-28 border border-gray-100"
              >
                <div className="text-center mb-6 pb-6 border-b border-gray-100">
                  <div className="text-4xl font-bold text-gray-900">
                    ${agency.price_per_hour}
                    <span className="text-lg font-normal text-gray-500">/hour</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Per caregiver</p>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Care Service Needed</label>
                    <select 
                      value={bookingData.service_type} 
                      onChange={(e) => setBookingData({ ...bookingData, service_type: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none bg-white" 
                      required 
                      data-testid="booking-service"
                    >
                      <option value="">Select service type</option>
                      {agency.specialties?.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Date</label>
                    <input 
                      type="date" 
                      value={bookingData.date} 
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none" 
                      required 
                      min={new Date().toISOString().split("T")[0]} 
                      data-testid="booking-date" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                    <select 
                      value={bookingData.time_slot} 
                      onChange={(e) => setBookingData({ ...bookingData, time_slot: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none bg-white" 
                      required 
                      data-testid="booking-time"
                    >
                      <option value="">Select time slot</option>
                      {timeSlots.map((slot) => (<option key={slot} value={slot}>{slot}</option>))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Who Needs Care?</label>
                    <input 
                      type="text" 
                      value={bookingData.patient_name} 
                      onChange={(e) => setBookingData({ ...bookingData, patient_name: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none" 
                      placeholder="Patient's name" 
                      required 
                      data-testid="booking-patient" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Care Needs (Optional)</label>
                    <textarea 
                      value={bookingData.care_needs} 
                      onChange={(e) => setBookingData({ ...bookingData, care_needs: e.target.value })} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none resize-none" 
                      rows={3} 
                      placeholder="Describe any specific care requirements..." 
                      data-testid="booking-needs" 
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={bookingLoading} 
                    className="w-full py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2" 
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

                <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Free consultation - no commitment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Cancel anytime before confirmation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
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

// Dashboard Page - Black & White Theme
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

  const statusColors = { pending: "bg-amber-100 text-amber-700", confirmed: "bg-green-100 text-green-700", completed: "bg-gray-100 text-gray-700", cancelled: "bg-red-100 text-red-700" };

  return (
    <PageBackground>
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1><p className="text-gray-500">Manage your care bookings and account</p></div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><Calendar className="w-6 h-6 text-gray-900" /></div><div><p className="text-sm text-gray-500">Total Bookings</p><p className="text-2xl font-bold text-gray-900">{bookings.length}</p></div></div></div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-green-600" /></div><div><p className="text-sm text-gray-500">Confirmed</p><p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === "confirmed").length}</p></div></div></div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center"><Clock className="w-6 h-6 text-amber-600" /></div><div><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === "pending").length}</p></div></div></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100"><h2 className="text-xl font-bold text-gray-900">Your Bookings</h2></div>
            {loading ? (<div className="p-12 text-center"><div className="animate-spin w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full mx-auto" /></div>) : bookings.length === 0 ? (
              <div className="p-12 text-center"><p className="text-gray-500 mb-4">You haven't made any bookings yet.</p><Link to="/agencies" className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition">Find Care<ChevronRight className="w-4 h-4" /></Link></div>
            ) : (
              <div className="divide-y divide-gray-100">{bookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">{booking.agency && <img src={booking.agency.image_url} alt={booking.agency.name} className="w-16 h-16 rounded-xl object-cover" />}<div><h3 className="font-semibold text-gray-900">{booking.agency?.name || "Care Agency"}</h3><p className="text-sm text-gray-500">{booking.service_type}</p><div className="flex items-center gap-4 mt-2 text-sm text-gray-500"><span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{booking.date}</span><span className="flex items-center gap-1"><Clock className="w-4 h-4" />{booking.time_slot}</span></div></div></div>
                    <div className="text-right"><span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[booking.status]}`}>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span><p className="mt-2 font-semibold text-gray-900">${booking.total_price}/hr</p></div>
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
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md border border-gray-100">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-500" /></div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
        <p className="text-gray-500 mb-8">Your care consultation has been successfully booked. The agency will contact you shortly to confirm details.</p>
        <div className="flex flex-col gap-3">
          <Link to="/dashboard" className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition">View My Bookings</Link>
          <Link to="/" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition">Back to Home</Link>
        </div>
      </motion.div>
    </PageBackground>
  );
};

// Contact Page - Black & White Theme
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
          <div className="text-center mb-12"><h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1><p className="text-gray-500">Have questions? We're here to help!</p></div>
          {success ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-lg p-12 text-center border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-500" /></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
              <p className="text-gray-500 mb-6">We'll get back to you within 24 hours.</p>
              <button onClick={() => setSuccess(false)} className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition">Send Another Message</button>
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 outline-none transition" required data-testid="contact-name" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 outline-none transition" required data-testid="contact-email" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Subject</label><input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 outline-none transition" required data-testid="contact-subject" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Message</label><textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 outline-none transition resize-none" rows={6} required data-testid="contact-message" /></div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50" data-testid="contact-submit">{loading ? "Sending..." : "Send Message"}</button>
              </form>
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100"><div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4"><Phone className="w-6 h-6 text-gray-900" /></div><h3 className="font-semibold text-gray-900 mb-1">Phone</h3><p className="text-gray-500">1-800-NURSE-NOW</p></div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100"><div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4"><Mail className="w-6 h-6 text-gray-900" /></div><h3 className="font-semibold text-gray-900 mb-1">Email</h3><p className="text-gray-500">support@nursenow.com</p></div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100"><div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4"><Clock className="w-6 h-6 text-gray-900" /></div><h3 className="font-semibold text-gray-900 mb-1">Hours</h3><p className="text-gray-500">24/7 Support</p></div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

// FAQ Page - Black & White Theme
const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const faqs = [
    { question: "What types of in-home care services do you offer?", answer: "We connect families with caregivers offering a wide range of services including elderly care, pediatric care, post-surgery recovery, chronic disease management, dementia/Alzheimer's care, 24-hour care, respite care, and skilled nursing services." },
    { question: "How are caregivers vetted?", answer: "All caregivers on our platform undergo comprehensive background checks, credential verification, and reference checks. We verify licenses, certifications, and work history to ensure only qualified professionals are listed." },
    { question: "How much does in-home care cost?", answer: "Costs vary based on the type of care needed, location, and caregiver experience. Our rates typically range from $24-65 per hour. You can see exact pricing on each caregiver's profile." },
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
          <div className="text-center mb-12"><h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1><p className="text-gray-500">Everything you need to know about our services</p></div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition" data-testid={`faq-${index}`}>
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronRight className="w-5 h-5 text-gray-500 rotate-90" /></motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <div className="px-6 pb-5 text-gray-600 leading-relaxed">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 bg-black rounded-3xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-gray-300 mb-6">Our team is here to help you find the perfect care solution.</p>
            <Link to="/contact" className="inline-block px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition">Contact Us</Link>
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
