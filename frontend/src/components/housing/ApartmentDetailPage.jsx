import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, BedDouble, Bath, Users, Ruler, Heart, Check, MapPin, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/App";

const PURPOSES = [
  { value: "business", label: "Business travel" },
  { value: "medical", label: "Medical stay" },
  { value: "family", label: "Family visit" },
  { value: "relocation", label: "Relocation" },
  { value: "leisure", label: "Leisure" },
];

export default function ApartmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, wishlistIds, toggleWishlist } = useAuth();
  const [apt, setApt] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [unavailable, setUnavailable] = useState([]);
  const [mainImg, setMainImg] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [purpose, setPurpose] = useState("business");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/apartments/${id}`)
      .then((r) => setApt(r.data))
      .catch(() => setNotFound(true));
    api.get(`/apartments/${id}/unavailable`)
      .then((r) => setUnavailable(r.data))
      .catch(() => setUnavailable([]));
  }, [id]);

  const today = new Date().toISOString().split("T")[0];

  // Date blocking: does the selected range overlap a booked range?
  const conflict = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    return unavailable.find((u) => checkIn < u.check_out && checkOut > u.check_in) || null;
  }, [checkIn, checkOut, unavailable]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = (new Date(checkOut) - new Date(checkIn)) / 86400000;
    return diff > 0 ? Math.round(diff) : 0;
  }, [checkIn, checkOut]);

  const total = useMemo(() => {
    if (!apt || nights < 1) return 0;
    return nights >= 28 ? Math.round((apt.monthly_rate / 30) * nights) : Math.round(apt.nightly_rate * nights);
  }, [apt, nights]);

  const requestBooking = async () => {
    if (!user) {
      toast.info("Sign in to request a stay");
      navigate("/login", { state: { from: `/apartments/${id}` } });
      return;
    }
    if (!checkIn || !checkOut || nights < 1) {
      toast.error("Please select your check-in and check-out dates");
      return;
    }
    if (nights < apt.min_nights) {
      toast.error(`Minimum stay is ${apt.min_nights} nights`);
      return;
    }
    if (conflict) {
      toast.error("Those dates are already booked — please pick different dates");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/bookings", {
        apartment_id: apt.id,
        check_in: checkIn,
        check_out: checkOut,
        guests: Number(guests),
        purpose,
        notes: notes || null,
      });
      toast.success("Stay request sent! Confirmation email is on its way.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not send request");
    } finally {
      setSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <div className="eh-container py-32 text-center">
        <h1 className="text-2xl font-bold mb-3">Apartment not found</h1>
        <Link to="/apartments" className="btn-eh">Browse All Apartments</Link>
      </div>
    );
  }

  if (!apt) {
    return (
      <div className="py-32 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#bd744c] border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  const saved = wishlistIds.includes(apt.id);

  return (
    <div className="eh-container mt-8 pb-10" data-testid="apartment-detail">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-[#212529] mb-6">
        <ChevronLeft size={14} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Gallery + info */}
        <div className="lg:col-span-3">
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
            <img src={apt.images?.[mainImg]} alt={apt.title} className="w-full h-full object-cover" />
            {apt.photo_tour?.[mainImg]?.room && (
              <span className="absolute bottom-3 left-3 bg-[#212529]/85 text-white text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5" data-testid="photo-room-label">
                {apt.photo_tour[mainImg].room}
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {apt.images?.map((img, i) => (
              <button key={i} onClick={() => setMainImg(i)} className={`relative aspect-[4/3] overflow-hidden ${i === mainImg ? "ring-2 ring-[#bd744c]" : "opacity-70 hover:opacity-100"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
                {apt.photo_tour?.[i]?.room && (
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-bold uppercase tracking-wider py-0.5 text-center">
                    {apt.photo_tour[i].room}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="mt-10">
            <h3 className="font-bold uppercase tracking-wide text-sm mb-3 border-b border-gray-100 pb-3">About This Stay</h3>
            <p className="text-gray-600 text-[15px] leading-relaxed">{apt.description}</p>
          </div>

          {/* Amenities */}
          <div className="mt-10">
            <h3 className="font-bold uppercase tracking-wide text-sm mb-4 border-b border-gray-100 pb-3">Everything Ready on Arrival</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
              {apt.amenities?.map((a) => (
                <div key={a} className="flex items-center gap-2.5 text-sm text-gray-600">
                  <Check size={15} className="text-[#bd744c] shrink-0" /> {a}
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-10">
            <h3 className="font-bold uppercase tracking-wide text-sm mb-4 border-b border-gray-100 pb-3">
              Guest Reviews · {apt.rating} ★ ({apt.review_count})
            </h3>
            <div className="space-y-6">
              {apt.reviews?.map((r) => (
                <div key={r.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-[#bd744c]/10 text-[#bd744c] font-bold flex items-center justify-center text-sm">
                      {r.user_name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{r.user_name}</p>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider">{r.purpose} · {r.date}</p>
                    </div>
                    <div className="ml-auto flex text-[#bd744c]">
                      {[...Array(r.rating)].map((_, i) => <Star key={i} size={12} className="fill-current" />)}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">“{r.comment}”</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking panel */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-36">
            <p className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold flex items-center gap-1">
              <MapPin size={12} /> {apt.neighborhood} · {apt.building_name}
            </p>
            <div className="flex items-start justify-between gap-3 mt-1">
              <h1 className="text-xl md:text-2xl font-bold leading-snug">{apt.title}</h1>
              <button
                onClick={async () => {
                  if (!user) { toast.info("Sign in to save apartments"); navigate("/login"); return; }
                  const res = await toggleWishlist(apt.id);
                  if (res?.saved) toast.success("Saved to your list");
                }}
                className="p-2 border border-gray-200 hover:border-[#bd744c] transition-colors shrink-0"
                aria-label="Save"
                data-testid="detail-wishlist-btn"
              >
                <Heart size={17} className={saved ? "fill-[#bd744c] text-[#bd744c]" : ""} />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-sm mt-2">
              <Star size={14} className="fill-[#bd744c] text-[#bd744c]" />
              <span className="font-semibold">{apt.rating}</span>
              <span className="text-gray-400">({apt.review_count} reviews)</span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-y border-gray-100 py-4 mt-4">
              <span className="flex items-center gap-1.5"><BedDouble size={15} /> {apt.bedrooms === 0 ? "Studio" : `${apt.bedrooms} bedrooms`}</span>
              <span className="flex items-center gap-1.5"><Bath size={15} /> {apt.bathrooms} baths</span>
              <span className="flex items-center gap-1.5"><Users size={15} /> {apt.max_guests} guests</span>
              <span className="flex items-center gap-1.5"><Ruler size={15} /> {apt.sqft.toLocaleString()} sqft</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-5">
              <span className="text-2xl font-extrabold">${Math.round(apt.nightly_rate)}<span className="text-sm font-normal text-gray-400"> / night</span></span>
              <span className="text-[#bd744c] font-bold text-sm">${apt.monthly_rate.toLocaleString()} / month</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Monthly rate applies automatically to stays of 28+ nights · {apt.min_nights}-night minimum</p>

            {/* Booking form */}
            <div className="border border-gray-200 p-5 mt-5 space-y-4" data-testid="booking-panel">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-eh">Check-in</label>
                  <input type="date" min={today} className="input-eh" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} data-testid="booking-checkin" />
                </div>
                <div>
                  <label className="label-eh">Check-out</label>
                  <input type="date" min={checkIn || today} className="input-eh" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} data-testid="booking-checkout" />
                </div>
              </div>

              {conflict && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2.5" data-testid="dates-conflict-warning">
                  Those dates overlap an existing stay ({conflict.check_in} → {conflict.check_out}). Please choose different dates.
                </div>
              )}
              {unavailable.length > 0 && (
                <div className="text-[11px] text-gray-400" data-testid="unavailable-list">
                  <span className="font-bold uppercase tracking-wider text-gray-500">Already booked: </span>
                  {unavailable.map((u, i) => (
                    <span key={i}>{u.check_in} → {u.check_out}{i < unavailable.length - 1 ? " · " : ""}</span>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-eh">Guests</label>
                  <select className="input-eh" value={guests} onChange={(e) => setGuests(e.target.value)} data-testid="booking-guests">
                    {[...Array(apt.max_guests)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? "guest" : "guests"}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-eh">Purpose</label>
                  <select className="input-eh" value={purpose} onChange={(e) => setPurpose(e.target.value)} data-testid="booking-purpose">
                    {PURPOSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label-eh">Notes (optional)</label>
                <textarea className="input-eh" rows={2} placeholder="Anything we should know about your stay?" value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="booking-notes" />
              </div>

              {nights > 0 && (
                <div className="bg-[#faf7f4] p-4 text-sm space-y-1.5" data-testid="price-breakdown">
                  <div className="flex justify-between text-gray-600">
                    <span>{nights} nights {nights >= 28 && "(monthly rate)"}</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#212529] border-t border-gray-200 pt-2">
                    <span>Estimated total</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <button className="btn-eh w-full" onClick={requestBooking} disabled={submitting || !!conflict} data-testid="request-booking-btn">
                {submitting ? "Sending..." : conflict ? "Dates Unavailable" : "Request to Book"}
              </button>
              <p className="text-[11px] text-gray-400 text-center">No charge yet — our team confirms availability first. You’ll get an email confirmation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
