import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

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

export default function HeroSection3({
  backgroundImage,
  logoText,
  navLinks,
  versionText,
  title,
  subtitle,
  ctaText,
  ctaLink,
  onCtaClick,
  user,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-[75vh] sm:min-h-screen w-full antialiased text-white relative">
      <header className="absolute inset-x-0 top-0 p-4 sm:p-6 md:p-8 z-10">
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

      <main
        className="w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="container mx-auto h-full flex items-center px-4 sm:px-6 md:px-8">
          <div className="w-full md:w-1/2 lg:w-2/5 mt-[15vh] sm:mt-0">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-4 sm:mb-6 drop-shadow-lg">
              Transparent Care For Your Loved Ones
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-lg leading-relaxed drop-shadow-md">
              Connect with verified, professional in-home care agencies using Adltrack to support elderly care, pediatric services, and specialized health needs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

HeroSection3.propTypes = {
  backgroundImage: PropTypes.string.isRequired,
  logoText: PropTypes.string,
  navLinks: PropTypes.arrayOf(PropTypes.shape({
    href: PropTypes.string,
    label: PropTypes.string
  })),
  versionText: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  ctaText: PropTypes.string,
  ctaLink: PropTypes.string,
  onCtaClick: PropTypes.func,
  user: PropTypes.object,
  onLogout: PropTypes.func,
};

HeroSection3.defaultProps = {
  logoText: "Brand",
  navLinks: [],
  versionText: "",
  title: "",
  subtitle: "",
  ctaText: "Click",
  ctaLink: null,
  onCtaClick: null,
  user: null,
  onLogout: null,
};
