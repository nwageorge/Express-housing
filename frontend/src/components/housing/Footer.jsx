import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.includes("@")) return toast.error("Please enter a valid email");
    toast.success("You're subscribed! Philadelphia stay guides coming your way.");
    setEmail("");
  };

  return (
    <footer className="bg-[#212529] text-white mt-20">
      {/* Newsletter strip */}
      <div className="border-b border-white/10">
        <div className="eh-container py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="eyebrow mb-1">Stay in the loop</p>
            <h4 className="text-lg font-bold">Philadelphia stay guides & new listings, monthly.</h4>
          </div>
          <form onSubmit={subscribe} className="flex w-full md:w-auto gap-2" data-testid="newsletter-form">
            <input
              className="input-eh !bg-white/10 !border-white/20 !text-white placeholder:text-white/40 md:w-72"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="newsletter-input"
            />
            <button type="submit" className="btn-eh whitespace-nowrap">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="eh-container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <p className="text-base font-extrabold tracking-[0.18em] uppercase">
            Express<span className="text-[#bd744c]">Housing</span>
          </p>
          <p className="text-sm text-white/60 mt-3 leading-relaxed">
            Flexible furnished apartments in Philadelphia for business, medical, family, and international stays. Rented through the city’s best apartment communities, hosted by us.
          </p>
          <div className="flex gap-3 mt-4">
            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
              <span key={i} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#bd744c] transition-colors cursor-pointer">
                <Icon size={14} />
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-4">Explore</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/apartments" className="text-white/80 hover:text-[#bd744c]">All Apartments</Link></li>
            <li><Link to="/apartments?apt_type=Studio" className="text-white/80 hover:text-[#bd744c]">Studios</Link></li>
            <li><Link to="/apartments?apt_type=2%20Bedroom" className="text-white/80 hover:text-[#bd744c]">2 Bedrooms</Link></li>
            <li><Link to="/apartments?apt_type=Penthouse" className="text-white/80 hover:text-[#bd744c]">Penthouses</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-4">Stay Paths</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/apartments?stay_path=corporate" className="text-white/80 hover:text-[#bd744c]">Corporate Housing</Link></li>
            <li><Link to="/apartments?stay_path=medical" className="text-white/80 hover:text-[#bd744c]">Medical Travelers</Link></li>
            <li><Link to="/apartments?stay_path=family" className="text-white/80 hover:text-[#bd744c]">Families & Relocation</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-4">Company</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/contact" className="text-white/80 hover:text-[#bd744c]">Contact Us</Link></li>
            <li><Link to="/dashboard" className="text-white/80 hover:text-[#bd744c]">My Stays</Link></li>
            <li><Link to="/login" className="text-white/80 hover:text-[#bd744c]">Sign In</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="eh-container py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <span>© 2025 Express Housing. Philadelphia, PA. All rights reserved.</span>
          <span>Furnished stays from 2 nights to 12 months.</span>
        </div>
      </div>
    </footer>
  );
}
