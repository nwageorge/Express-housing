import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, User, Menu, X, Search } from "lucide-react";
import { useAuth } from "@/App";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/apartments", label: "Apartments" },
  { to: "/apartments?stay_path=corporate", label: "Corporate Housing" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const { user, logout, wishlistIds } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const submitSearch = (e) => {
    e.preventDefault();
    setSearchOpen(false);
    navigate(`/apartments?search=${encodeURIComponent(searchValue)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Announcement bar */}
      <div className="bg-[#bd744c] text-white text-center text-[11px] font-semibold tracking-[0.15em] uppercase py-2 px-4">
        Flexible furnished stays in Philadelphia — from 2 nights to 12 months
      </div>

      {/* Main header */}
      <div className="border-b border-gray-200">
        <div className="eh-container flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 -ml-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            data-testid="mobile-menu-btn"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex flex-col items-center md:items-start leading-none" data-testid="logo">
            <span className="text-lg md:text-xl font-extrabold tracking-[0.18em] uppercase text-[#212529]">
              Express<span className="text-[#bd744c]">Housing</span>
            </span>
            <span className="hidden md:block text-[9px] tracking-[0.35em] uppercase text-gray-400 mt-1">
              Flexible Furnished Stays
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <NavLink
                key={l.label}
                to={l.to}
                className="text-[13px] font-semibold uppercase tracking-wider text-[#212529] hover:text-[#bd744c] transition-colors"
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-1 md:gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:text-[#bd744c] transition-colors"
              aria-label="Search"
              data-testid="header-search-btn"
            >
              <Search size={19} />
            </button>
            <Link
              to={user ? "/dashboard?tab=saved" : "/login"}
              className="relative p-2 hover:text-[#bd744c] transition-colors"
              aria-label="Saved apartments"
              data-testid="header-wishlist-btn"
            >
              <Heart size={19} />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#bd744c] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wider hover:text-[#bd744c]"
                  data-testid="header-dashboard-link"
                >
                  <User size={17} />
                  {user.name.split(" ")[0]}
                </Link>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 hover:text-[#212529]"
                  data-testid="header-logout-btn"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex btn-eh !py-2.5 !px-5"
                data-testid="header-login-btn"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Search drawer */}
        {searchOpen && (
          <div className="border-t border-gray-100 bg-white">
            <form onSubmit={submitSearch} className="eh-container py-3 flex gap-2">
              <input
                autoFocus
                className="input-eh"
                placeholder="Search by neighborhood, building, or apartment name..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                data-testid="header-search-input"
              />
              <button type="submit" className="btn-eh">Search</button>
            </form>
          </div>
        )}

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4" data-testid="mobile-nav">
            {navLinks.map((l) => (
              <NavLink
                key={l.label}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold uppercase tracking-wider text-[#212529]"
              >
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-semibold uppercase tracking-wider text-[#bd744c]">
                  My Stays
                </NavLink>
                <button onClick={() => { logout(); setMobileOpen(false); navigate("/"); }} className="text-left text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/login" onClick={() => setMobileOpen(false)} className="btn-eh w-full">
                Sign In
              </NavLink>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
