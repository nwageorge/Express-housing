import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

// SVG icons as components
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
  return (
    <div className="min-h-screen w-full antialiased text-white relative">
      <header className="absolute inset-x-0 top-0 p-6 md:p-8 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold drop-shadow-lg">{logoText}</Link>
          <nav className="hidden md:flex items-center space-x-2 bg-black/40 backdrop-blur-md rounded-full px-6 py-3">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                to={link.href} 
                className="px-4 py-2 text-white font-semibold text-sm hover:bg-white/20 rounded-full transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-md rounded-full px-4 py-2">
            <button type="button" aria-label="Search" className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <SearchIcon />
            </button>
            {user ? (
              <>
                <Link to="/dashboard" className="px-4 py-2 text-white font-semibold text-sm hover:bg-white/20 rounded-full transition-colors">
                  Dashboard
                </Link>
                <button 
                  onClick={onLogout}
                  className="bg-white text-stone-800 rounded-full px-5 py-2 text-sm font-bold hover:bg-stone-100 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-white font-semibold text-sm hover:bg-white/20 rounded-full transition-colors">
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="bg-white text-stone-800 rounded-full px-5 py-2 text-sm font-bold hover:bg-stone-100 transition-colors"
                >
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main
        className="w-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="container mx-auto h-screen flex items-center px-6 md:px-8">
          <div className="w-full md:w-1/2 lg:w-2/5">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">{title}</h1>
            <p className="text-md text-gray-300 max-w-md mb-8">{subtitle}</p>
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
