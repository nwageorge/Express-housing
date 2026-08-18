import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Briefcase, HeartPulse, Home, Search, Wifi, Key, Clock, Headphones, Star } from "lucide-react";
import api from "@/lib/api";
import ApartmentCard from "@/components/housing/ApartmentCard";

const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?crop=entropy&cs=srgb&fm=jpg&q=85&w=1920",
    eyebrow: "Express Housing · Philadelphia",
    lead: "furnished stays",
    title: "Made Flexible",
    sub: "Designer apartments in Philadelphia's best buildings. Stay a week, a month, or a year — fully furnished, ready on arrival.",
  },
  {
    image: "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?crop=entropy&cs=srgb&fm=jpg&q=85&w=1920",
    eyebrow: "Corporate Housing",
    lead: "your team's",
    title: "Home Base",
    sub: "Polished apartments near business districts with dedicated workspaces, gigabit Wi-Fi, and terms your travel team will like.",
  },
  {
    image: "https://images.unsplash.com/photo-1686056040370-b5e5c06c4273?crop=entropy&cs=srgb&fm=jpg&q=85&w=1920",
    eyebrow: "Medical & Family Stays",
    lead: "close to care,",
    title: "Close to Home",
    sub: "Comfortable homes near Penn Medicine, CHOP, and Jefferson for treatment, recovery, and the families who come along.",
  },
];

const STAY_PATHS = [
  {
    icon: Briefcase,
    tag: "01",
    title: "Corporate Partners",
    text: "Preferred apartments for business travel, insurance relocation, and project teams that need a polished home base.",
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    link: "/apartments?stay_path=corporate",
  },
  {
    icon: HeartPulse,
    tag: "02",
    title: "Medical Travelers",
    text: "Furnished apartments for treatment, recovery, visiting clinicians, and families who need comfort close to care.",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    link: "/apartments?stay_path=medical",
  },
  {
    icon: Home,
    tag: "03",
    title: "Families & Relocation",
    text: "Flexible furnished homes for renovations, local transitions, and international families who need a place that works immediately.",
    image: "https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    link: "/apartments?stay_path=family",
  },
];

const BENEFITS = [
  { icon: Home, title: "Fully Furnished", text: "Every stay arrives move-in ready — furniture, kitchenware, linens, and Wi-Fi included." },
  { icon: Clock, title: "Flexible Terms", text: "From 2 nights to 12 months. Extend, shorten, or switch units as plans change." },
  { icon: Key, title: "Self Check-in", text: "Keypad entry on every door. Arrive at midnight, settle in by 12:05." },
  { icon: Headphones, title: "24/7 Guest Support", text: "A real Philadelphia-based team, one message away for your entire stay." },
];

const STEPS = [
  { n: "01", title: "Search", text: "Choose your dates, guests, and neighborhood." },
  { n: "02", title: "Compare", text: "Review furnished homes by size, budget, and stay fit." },
  { n: "03", title: "Request", text: "Send a booking request — we confirm within hours." },
  { n: "04", title: "Stay", text: "Arrive to a home that's ready, with support nearby." },
];

const REVIEWS = [
  { name: "Cree · New York", purpose: "Business stay", text: "Check-in and out was a breeze — beautiful place in a luxury building. Better than any hotel week I've had." },
  { name: "Kang · Seoul", purpose: "International relocation", text: "Moving from Korea, we needed a home that worked from day one. Express Housing handled everything before we landed." },
  { name: "Shaine · Chicago", purpose: "Medical travel", text: "Two months near CHOP during my daughter's treatment. The team's care went far beyond the apartment." },
];

function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  const next = useCallback(() => setIdx((i) => (i + 1) % HERO_SLIDES.length), []);
  const prev = () => setIdx((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  const slide = HERO_SLIDES[idx];

  return (
    <section className="relative h-[68vh] min-h-[480px] w-full overflow-hidden bg-[#212529]" data-testid="hero-carousel">
      {HERO_SLIDES.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === idx ? "opacity-100" : "opacity-0"}`}
        >
          <img src={s.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
        </div>
      ))}

      <div className="relative z-10 h-full eh-container flex items-center">
        <div key={idx} className="eh-slide-content max-w-2xl text-white">
          <p className="eyebrow !text-[#e8a87e] mb-3">{slide.eyebrow}</p>
          <h2 className="text-2xl md:text-3xl font-light lowercase tracking-wide">{slide.lead}</h2>
          <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight leading-none mt-1 mb-5">
            {slide.title}
          </h1>
          <p className="text-white/85 text-sm md:text-base max-w-lg font-light leading-relaxed mb-8">{slide.sub}</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/apartments" className="btn-eh" data-testid="hero-browse-btn">Browse Apartments</Link>
            <Link to="/contact" className="btn-eh-outline on-dark">Ask Express Housing</Link>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border border-white/40 text-white flex items-center justify-center hover:bg-white hover:text-[#212529] transition-colors" aria-label="Previous slide">
        <ChevronLeft size={18} />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 border border-white/40 text-white flex items-center justify-center hover:bg-white hover:text-[#212529] transition-colors" aria-label="Next slide">
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-24 md:bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`h-[3px] transition-all ${i === idx ? "w-8 bg-[#bd744c]" : "w-4 bg-white/40"}`} aria-label={`Slide ${i + 1}`} />
        ))}
      </div>
    </section>
  );
}

function SearchBar({ neighborhoods }) {
  const navigate = useNavigate();
  const [where, setWhere] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (where) params.set("neighborhood", where);
    if (guests) params.set("guests", guests);
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    navigate(`/apartments?${params.toString()}`);
  };

  return (
    <div className="relative z-30 eh-container -mt-14">
      <form
        onSubmit={submit}
        className="bg-white shadow-xl border border-gray-100 p-4 md:p-5 grid grid-cols-2 md:grid-cols-5 gap-3 items-end"
        data-testid="home-search-bar"
      >
        <div className="col-span-2 md:col-span-1">
          <label className="label-eh">Where</label>
          <select className="input-eh" value={where} onChange={(e) => setWhere(e.target.value)} data-testid="search-neighborhood">
            <option value="">All Philadelphia</option>
            {neighborhoods.map((n) => (
              <option key={n.name} value={n.name}>{n.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-eh">Check-in</label>
          <input type="date" className="input-eh" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} data-testid="search-checkin" />
        </div>
        <div>
          <label className="label-eh">Check-out</label>
          <input type="date" className="input-eh" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} data-testid="search-checkout" />
        </div>
        <div>
          <label className="label-eh">Guests</label>
          <select className="input-eh" value={guests} onChange={(e) => setGuests(e.target.value)} data-testid="search-guests">
            <option value="">Any</option>
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <option key={g} value={g}>{g}+ guests</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-eh w-full h-[46px]" data-testid="search-submit">
          <Search size={15} /> Search
        </button>
      </form>
    </div>
  );
}

export default function HomePage() {
  const [apartments, setApartments] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/apartments"), api.get("/neighborhoods")])
      .then(([a, n]) => {
        setApartments(a.data);
        setNeighborhoods(n.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const newListings = [...apartments].sort((a, b) => (b.is_new === true) - (a.is_new === true)).slice(0, 8);
  const featured = apartments.filter((a) => a.is_featured).slice(0, 4);

  return (
    <div>
      <HeroCarousel />
      <SearchBar neighborhoods={neighborhoods} />

      {/* New Listings */}
      <section className="eh-container mt-16 md:mt-20">
        <p className="eyebrow text-center mb-2">Philadelphia, PA</p>
        <h3 className="section-title">New Listings</h3>
        <p className="section-sub">Freshly furnished homes across the city’s best neighborhoods — ready for stays from 2 nights to 12 months.</p>
        {loading ? (
          <div className="py-16 text-center">
            <div className="animate-spin w-10 h-10 border-4 border-[#bd744c] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="new-listings-grid">
            {newListings.map((apt) => (
              <ApartmentCard key={apt.id} apartment={apt} />
            ))}
          </div>
        )}
        <div className="text-center mt-10">
          <Link to="/apartments" className="btn-eh-outline" data-testid="view-all-btn">View All Apartments</Link>
        </div>
      </section>

      {/* Stay Paths */}
      <section className="eh-container mt-20">
        <h3 className="section-title">The Right Home Base for Every Stay</h3>
        <p className="section-sub">We rent through Philadelphia’s best apartment communities so you can stay on your terms — for work, care, or family.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STAY_PATHS.map((p) => (
            <Link key={p.tag} to={p.link} className="group relative overflow-hidden block h-[380px]" data-testid={`stay-path-${p.tag}`}>
              <img src={p.image} alt={p.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
                <span className="text-[#e8a87e] font-extrabold text-sm mb-2">{p.tag}</span>
                <h4 className="text-lg font-bold uppercase tracking-wide mb-2">{p.title}</h4>
                <p className="text-white/80 text-[13px] leading-relaxed mb-4">{p.text}</p>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white group-hover:text-[#e8a87e] transition-colors">
                  View Stay Path →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-[#faf7f4] mt-20 py-16">
        <div className="eh-container">
          <h3 className="section-title">Featured Stays</h3>
          <p className="section-sub">Our most-booked apartments — guest favorites across corporate, medical, and family travel.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="featured-grid">
            {featured.map((apt) => (
              <ApartmentCard key={apt.id} apartment={apt} />
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="eh-container mt-20">
        <h3 className="section-title">Explore Philadelphia Neighborhoods</h3>
        <p className="section-sub">Every Express Housing building is hand-picked for walkability, safety, and the neighborhood around it.</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {neighborhoods.slice(0, 5).map((n) => (
            <Link
              key={n.name}
              to={`/apartments?neighborhood=${encodeURIComponent(n.name)}`}
              className="group relative h-44 overflow-hidden block"
              data-testid={`neighborhood-${n.name}`}
            >
              <img src={n.image} alt={n.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition-colors" />
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-2">
                <span className="font-bold text-sm uppercase tracking-wider">{n.name}</span>
                <span className="text-[11px] text-white/80 mt-1">{n.count} {n.count === 1 ? "home" : "homes"} · from ${Math.round(n.min_rate)}/nt</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Benefits InfoBlock */}
      <section className="border-y border-gray-100 mt-20">
        <div className="eh-container py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex gap-4">
              <div className="w-11 h-11 shrink-0 bg-[#bd744c]/10 text-[#bd744c] flex items-center justify-center">
                <b.icon size={20} />
              </div>
              <div>
                <h5 className="font-bold text-sm uppercase tracking-wide mb-1">{b.title}</h5>
                <p className="text-gray-500 text-[13px] leading-relaxed">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="eh-container mt-20">
        <p className="eyebrow text-center mb-2">How it works</p>
        <h3 className="section-title">From Search to a Stay That Fits</h3>
        <p className="section-sub">Browse first, then send us the details — our team confirms every request personally.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center">
              <span className="text-4xl font-extrabold text-[#bd744c]/20">{s.n}</span>
              <h5 className="font-bold uppercase tracking-wide text-sm mt-2 mb-2">{s.title}</h5>
              <p className="text-gray-500 text-[13px] leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-[#212529] text-white mt-20 py-16">
        <div className="eh-container">
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-1 text-[#e8a87e] mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-current" />)}
            </div>
            <h3 className="text-2xl font-bold">4.8 / 5 average guest rating</h3>
            <p className="text-white/50 text-sm mt-1">Across Google, Trustpilot & Apartments.com</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map((r) => (
              <div key={r.name} className="border border-white/10 p-6">
                <p className="text-white/85 text-sm leading-relaxed italic">“{r.text}”</p>
                <p className="mt-4 font-bold text-sm">{r.name}</p>
                <p className="text-[#e8a87e] text-xs uppercase tracking-wider mt-0.5">{r.purpose}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
