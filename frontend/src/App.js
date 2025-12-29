import { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Heart, Star, MapPin, Clock, Shield, Phone, Mail, ChevronLeft, ChevronRight, Menu, X, Search, Calendar, User, LogOut, Users, CheckCircle, Award, Sparkles } from "lucide-react";
import React from "react";

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

// Grid + Purple Gradient Background Component (from background-snippets)
const PageBackground = ({ children, className = "" }) => {
  return (
    <div className={`relative min-h-screen w-full ${className}`}>
      {/* Grid pattern with purple accent - exact copy from background-snippets.tsx */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)]"></div>
      </div>
      {/* Content */}
      {children}
    </div>
  );
};

// Navigation Component
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
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">NurseNow</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/agencies" className="text-gray-600 hover:text-violet-600 transition font-medium" data-testid="nav-agencies">
              Find Care
            </Link>
            <Link to="/faq" className="text-gray-600 hover:text-violet-600 transition font-medium" data-testid="nav-faq">
              FAQ
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-violet-600 transition font-medium" data-testid="nav-contact">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-violet-600 transition font-medium" data-testid="nav-dashboard">
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition"
                  data-testid="logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-violet-600 transition font-medium" data-testid="nav-login">
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-purple-300/50 transition-all"
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
                <Link to="/agencies" className="text-gray-600 hover:text-violet-600 transition">Find Care</Link>
                <Link to="/faq" className="text-gray-600 hover:text-violet-600 transition">FAQ</Link>
                <Link to="/contact" className="text-gray-600 hover:text-violet-600 transition">Contact</Link>
                {user ? (
                  <>
                    <Link to="/dashboard" className="text-gray-600 hover:text-violet-600 transition">Dashboard</Link>
                    <button onClick={logout} className="text-left text-red-600">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-600 hover:text-violet-600 transition">Sign In</Link>
                    <Link to="/signup" className="text-violet-600 font-medium">Get Started</Link>
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

// Agency Card Component
const AgencyCard = ({ agency, index }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -12, scale: 1.02 }}
      className="group cursor-pointer"
      onClick={() => navigate(`/agencies/${agency.id}`)}
      data-testid={`agency-card-${agency.id}`}
    >
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <motion.img
            src={agency.image_url}
            alt={agency.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6 }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {agency.is_verified && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg"
              >
                <Shield className="w-3 h-3" />
                Verified
              </motion.div>
            )}
            {agency.is_new && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg"
              >
                <Sparkles className="w-3 h-3" />
                New
              </motion.div>
            )}
          </div>

          {/* Wishlist Button */}
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(agency.id);
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition"
            data-testid={`wishlist-btn-${agency.id}`}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isWishlisted(agency.id) ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
          </motion.button>

          {/* Price Tag */}
          <div className="absolute bottom-4 right-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg">
            <span className="text-lg font-bold text-gray-900">${agency.price_per_hour}</span>
            <span className="text-sm text-gray-500">/hr</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-violet-500 text-violet-500" />
              <span className="font-semibold text-gray-900">{agency.rating}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">{agency.review_count} reviews</span>
          </div>
          
          <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-violet-600 transition-colors">
            {agency.name}
          </h3>
          
          <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>{agency.city}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {agency.specialties?.slice(0, 2).map((specialty, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </div>
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
            className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-violet-50 hover:bg-violet-100 rounded-full text-violet-700 font-medium transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-violet-50 hover:border-violet-200 transition shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-violet-50 hover:border-violet-200 transition shadow-sm"
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
    { name: "Sarah M.", text: "NurseNow helped us find the perfect caregiver for my mother. The care quality is exceptional!", rating: 5, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
    { name: "James R.", text: "Professional, compassionate, and reliable. Our family couldn't be happier with the service.", rating: 5, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    { name: "Emily T.", text: "The caregivers are so patient with my father. They treat him like family. Highly recommend!", rating: 5, image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
    { name: "Michael K.", text: "After my surgery, NurseNow provided excellent recovery care. I'm back on my feet thanks to them.", rating: 5, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
    { name: "Lisa P.", text: "Finding quality infant care was stressful until we found NurseNow. Now we have peace of mind.", rating: 5, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" },
  ];

  return (
    <section className="py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">What Families Say</h2>
        <p className="text-gray-500 text-center max-w-2xl mx-auto">
          Join thousands of families who trust NurseNow for their in-home care needs
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
                      <Star key={i} className="w-4 h-4 fill-violet-500 text-violet-500" />
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

// Hero Section
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Trusted by 10,000+ families
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Compassionate
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-600"> Home Care </span>
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
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 outline-none transition shadow-sm"
                  data-testid="hero-search-input"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:shadow-purple-300/50 transition-all"
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
                    <Star key={i} className="w-4 h-4 fill-violet-500 text-violet-500" />
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

// Features Section
const FeaturesSection = () => {
  const features = [
    { icon: Shield, title: "Verified Caregivers", description: "All caregivers undergo thorough background checks and credential verification" },
    { icon: Clock, title: "24/7 Availability", description: "Find care whenever you need it - day or night, weekdays or weekends" },
    { icon: Award, title: "Quality Assured", description: "Our caregivers meet rigorous standards and receive ongoing training" },
    { icon: Users, title: "Personalized Match", description: "We match you with caregivers based on your specific needs and preferences" },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose NurseNow?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            We're committed to providing the highest quality in-home care services
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:shadow-purple-100 transition-all"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

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
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full mx-auto" />
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
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-3xl p-12 shadow-xl shadow-purple-200">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Find the Perfect Caregiver?
            </h2>
            <p className="text-violet-100 text-lg mb-8">
              Join thousands of families who trust NurseNow for quality in-home care
            </p>
            <Link
              to="/agencies"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-600 rounded-full font-semibold hover:shadow-lg transition-all"
              data-testid="cta-find-care"
            >
              Find Care Now
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">NurseNow</span>
              </div>
              <p className="text-sm leading-relaxed">
                Connecting families with compassionate, professional in-home caregivers.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/agencies" className="hover:text-violet-400 transition">Elderly Care</Link></li>
                <li><Link to="/agencies" className="hover:text-violet-400 transition">Pediatric Care</Link></li>
                <li><Link to="/agencies" className="hover:text-violet-400 transition">Post-Surgery Care</Link></li>
                <li><Link to="/agencies" className="hover:text-violet-400 transition">24-Hour Care</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/faq" className="hover:text-violet-400 transition">FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-violet-400 transition">Contact Us</Link></li>
                <li><Link to="/agencies" className="hover:text-violet-400 transition">Find Care</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 1-800-NURSE-NOW</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@nursenow.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 NurseNow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </PageBackground>
  );
};

// Login Page
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
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Sign in to your NurseNow account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 outline-none transition" placeholder="you@example.com" required data-testid="login-email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 outline-none transition" placeholder="••••••••" required data-testid="login-password" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-300/50 transition-all disabled:opacity-50" data-testid="login-submit">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="text-center mt-6 text-gray-500">Don't have an account? <Link to="/signup" className="text-violet-600 font-medium hover:underline">Sign up</Link></p>
        </div>
      </motion.div>
    </PageBackground>
  );
};

// Signup Page
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
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-2">Step {step} of 3</p>
          </div>

          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? "bg-gradient-to-r from-violet-500 to-purple-600" : "bg-gray-200"}`} />
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
                      <button type="button" onClick={() => setFormData({ ...formData, role: "client" })} className={`p-4 rounded-xl border-2 transition-all ${formData.role === "client" ? "border-violet-400 bg-violet-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <User className="w-6 h-6 mx-auto mb-2 text-violet-600" />
                        <span className="text-sm font-medium">Care Services</span>
                      </button>
                      <button type="button" onClick={() => setFormData({ ...formData, role: "agency" })} className={`p-4 rounded-xl border-2 transition-all ${formData.role === "agency" ? "border-violet-400 bg-violet-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <Users className="w-6 h-6 mx-auto mb-2 text-violet-600" />
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
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 outline-none transition" placeholder="John Doe" required data-testid="signup-name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 outline-none transition" placeholder="(555) 555-5555" data-testid="signup-phone" />
                  </div>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 outline-none transition" placeholder="you@example.com" required data-testid="signup-email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 outline-none transition" placeholder="••••••••" required minLength={6} data-testid="signup-password" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition">Back</button>}
              <button type="submit" disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-300/50 transition-all disabled:opacity-50" data-testid="signup-submit">
                {loading ? "Creating..." : step < 3 ? "Continue" : "Create Account"}
              </button>
            </div>
          </form>
          <p className="text-center mt-6 text-gray-500">Already have an account? <Link to="/login" className="text-violet-600 font-medium hover:underline">Sign in</Link></p>
        </div>
      </motion.div>
    </PageBackground>
  );
};

// Agencies Page
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
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-violet-400 outline-none shadow-sm" data-testid="filter-city">
              <option value="">All Cities</option>
              {cities.map((city) => (<option key={city} value={city}>{city}</option>))}
            </select>
            <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)} className="px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-violet-400 outline-none shadow-sm" data-testid="filter-specialty">
              <option value="">All Specialties</option>
              {specialties.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>

          {loading ? (
            <div className="py-20 text-center"><div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full mx-auto" /></div>
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

// Agency Detail Page
const AgencyDetailPage = () => {
  const { id } = useParams();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <PageBackground className="flex items-center justify-center"><div className="animate-spin w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full" /></PageBackground>;
  if (!agency) return <PageBackground className="flex items-center justify-center"><p className="text-gray-500">Agency not found</p></PageBackground>;

  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

  return (
    <PageBackground>
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                <div className="relative h-80">
                  <img src={agency.image_url} alt={agency.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      {agency.is_verified && <span className="px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-semibold rounded-full flex items-center gap-1"><Shield className="w-3 h-3" />Verified</span>}
                      {agency.is_new && <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold rounded-full">New</span>}
                    </div>
                    <h1 className="text-3xl font-bold">{agency.name}</h1>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex flex-wrap items-center gap-6 mb-6">
                    <div className="flex items-center gap-2"><Star className="w-5 h-5 fill-violet-500 text-violet-500" /><span className="font-bold text-lg">{agency.rating}</span><span className="text-gray-500">({agency.review_count} reviews)</span></div>
                    <div className="flex items-center gap-2 text-gray-500"><MapPin className="w-5 h-5" /><span>{agency.location}</span></div>
                    <div className="flex items-center gap-2 text-gray-500"><Clock className="w-5 h-5" /><span>{agency.experience_years} years experience</span></div>
                  </div>
                  <div className="mb-6"><h2 className="text-xl font-bold text-gray-900 mb-3">About</h2><p className="text-gray-600 leading-relaxed">{agency.bio}</p></div>
                  <div className="mb-6"><h2 className="text-xl font-bold text-gray-900 mb-3">Specialties</h2><div className="flex flex-wrap gap-2">{agency.specialties?.map((s, i) => (<span key={i} className="px-4 py-2 bg-violet-50 text-violet-700 rounded-full text-sm font-medium">{s}</span>))}</div></div>
                  <div className="mb-6"><h2 className="text-xl font-bold text-gray-900 mb-3">Certifications</h2><div className="flex flex-wrap gap-2">{agency.certifications?.map((c, i) => (<span key={i} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" />{c}</span>))}</div></div>
                  {agency.reviews && agency.reviews.length > 0 && (
                    <div><h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2><div className="space-y-4">{agency.reviews.map((review) => (<div key={review.id} className="p-4 bg-violet-50/50 rounded-xl"><div className="flex items-center justify-between mb-2"><span className="font-medium text-gray-900">{review.user_name}</span><div className="flex gap-0.5">{[...Array(review.rating)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-violet-500 text-violet-500" />))}</div></div><p className="text-gray-600">{review.comment}</p></div>))}</div></div>
                  )}
                </div>
              </motion.div>
            </div>
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl shadow-lg p-6 sticky top-28 border border-gray-100">
                <div className="text-center mb-6"><div className="text-3xl font-bold text-gray-900">${agency.price_per_hour}<span className="text-lg font-normal text-gray-500">/hour</span></div></div>
                <form onSubmit={handleBooking} className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label><select value={bookingData.service_type} onChange={(e) => setBookingData({ ...bookingData, service_type: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 outline-none" required data-testid="booking-service"><option value="">Select service</option>{agency.specialties?.map((s) => (<option key={s} value={s}>{s}</option>))}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Date</label><input type="date" value={bookingData.date} onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 outline-none" required min={new Date().toISOString().split("T")[0]} data-testid="booking-date" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label><select value={bookingData.time_slot} onChange={(e) => setBookingData({ ...bookingData, time_slot: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 outline-none" required data-testid="booking-time"><option value="">Select time</option>{timeSlots.map((slot) => (<option key={slot} value={slot}>{slot}</option>))}</select></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label><input type="text" value={bookingData.patient_name} onChange={(e) => setBookingData({ ...bookingData, patient_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 outline-none" placeholder="Who will receive care?" required data-testid="booking-patient" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Patient Age</label><input type="number" value={bookingData.patient_age} onChange={(e) => setBookingData({ ...bookingData, patient_age: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 outline-none" placeholder="Age" data-testid="booking-age" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Care Needs (Optional)</label><textarea value={bookingData.care_needs} onChange={(e) => setBookingData({ ...bookingData, care_needs: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 outline-none resize-none" rows={3} placeholder="Describe any specific care requirements..." data-testid="booking-needs" /></div>
                  <button type="submit" disabled={bookingLoading} className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-300/50 transition-all disabled:opacity-50" data-testid="booking-submit">{bookingLoading ? "Booking..." : "Book Consultation"}</button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-4">You won't be charged until the service is confirmed</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

// Dashboard Page
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

  const statusColors = { pending: "bg-amber-100 text-amber-700", confirmed: "bg-green-100 text-green-700", completed: "bg-blue-100 text-blue-700", cancelled: "bg-red-100 text-red-700" };

  return (
    <PageBackground>
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1><p className="text-gray-500">Manage your care bookings and account</p></div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center"><Calendar className="w-6 h-6 text-violet-600" /></div><div><p className="text-sm text-gray-500">Total Bookings</p><p className="text-2xl font-bold text-gray-900">{bookings.length}</p></div></div></div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><CheckCircle className="w-6 h-6 text-green-600" /></div><div><p className="text-sm text-gray-500">Confirmed</p><p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === "confirmed").length}</p></div></div></div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center"><Clock className="w-6 h-6 text-amber-600" /></div><div><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-gray-900">{bookings.filter(b => b.status === "pending").length}</p></div></div></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100"><h2 className="text-xl font-bold text-gray-900">Your Bookings</h2></div>
            {loading ? (<div className="p-12 text-center"><div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto" /></div>) : bookings.length === 0 ? (
              <div className="p-12 text-center"><p className="text-gray-500 mb-4">You haven't made any bookings yet.</p><Link to="/agencies" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition">Find Care<ChevronRight className="w-4 h-4" /></Link></div>
            ) : (
              <div className="divide-y divide-gray-100">{bookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-violet-50/50 transition">
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
          <Link to="/dashboard" className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition">View My Bookings</Link>
          <Link to="/" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition">Back to Home</Link>
        </div>
      </motion.div>
    </PageBackground>
  );
};

// Contact Page
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
              <button onClick={() => setSuccess(false)} className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition">Send Another Message</button>
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 outline-none transition" required data-testid="contact-name" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 outline-none transition" required data-testid="contact-email" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Subject</label><input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 outline-none transition" required data-testid="contact-subject" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Message</label><textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-400/10 outline-none transition resize-none" rows={6} required data-testid="contact-message" /></div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-300/50 transition-all disabled:opacity-50" data-testid="contact-submit">{loading ? "Sending..." : "Send Message"}</button>
              </form>
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100"><div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4"><Phone className="w-6 h-6 text-violet-600" /></div><h3 className="font-semibold text-gray-900 mb-1">Phone</h3><p className="text-gray-500">1-800-NURSE-NOW</p></div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100"><div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4"><Mail className="w-6 h-6 text-violet-600" /></div><h3 className="font-semibold text-gray-900 mb-1">Email</h3><p className="text-gray-500">support@nursenow.com</p></div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100"><div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4"><Clock className="w-6 h-6 text-violet-600" /></div><h3 className="font-semibold text-gray-900 mb-1">Hours</h3><p className="text-gray-500">24/7 Support</p></div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
};

// FAQ Page
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
                <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-violet-50/50 transition" data-testid={`faq-${index}`}>
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronRight className="w-5 h-5 text-violet-500 rotate-90" /></motion.div>
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
          <div className="mt-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-3xl p-8 text-center text-white shadow-xl shadow-purple-200">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-violet-100 mb-6">Our team is here to help you find the perfect care solution.</p>
            <Link to="/contact" className="inline-block px-8 py-3 bg-white text-violet-600 rounded-xl font-semibold hover:shadow-lg transition">Contact Us</Link>
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
