import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CalendarDays, Users, Heart } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/App";
import ApartmentCard from "@/components/housing/ApartmentCard";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-gray-50 text-gray-600 border-gray-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "saved" ? "saved" : "stays";
  const [bookings, setBookings] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([api.get("/bookings"), api.get("/wishlist")])
      .then(([b, w]) => {
        setBookings(b.data);
        setSaved(w.data);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) return null;

  return (
    <div className="eh-container mt-10 pb-10" data-testid="dashboard">
      <p className="eyebrow mb-1">My Account</p>
      <h1 className="text-2xl font-bold">Welcome back, {user.name.split(" ")[0]}</h1>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mt-8">
        {[
          { key: "stays", label: `My Stays (${bookings.length})` },
          { key: "saved", label: `Saved (${saved.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setSearchParams(t.key === "saved" ? { tab: "saved" } : {})}
            className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${
              tab === t.key ? "border-[#bd744c] text-[#bd744c]" : "border-transparent text-gray-400 hover:text-[#212529]"
            }`}
            data-testid={`dashboard-tab-${t.key}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-[#bd744c] border-t-transparent rounded-full mx-auto" />
        </div>
      ) : tab === "stays" ? (
        bookings.length === 0 ? (
          <div className="py-20 text-center">
            <CalendarDays size={36} className="mx-auto text-gray-300 mb-4" />
            <p className="font-bold mb-2">No stays yet</p>
            <p className="text-gray-500 text-sm mb-6">Find a furnished home and send your first request.</p>
            <Link to="/apartments" className="btn-eh">Browse Apartments</Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4" data-testid="bookings-list">
            {bookings.map((b) => (
              <div key={b.id} className="border border-gray-200 p-4 flex flex-col sm:flex-row gap-4" data-testid={`booking-${b.id}`}>
                <img src={b.apartment_image} alt="" className="w-full sm:w-40 h-32 object-cover shrink-0" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold">{b.neighborhood}</p>
                      <Link to={`/apartments/${b.apartment_id}`} className="font-bold hover:text-[#bd744c]">{b.apartment_title}</Link>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest border px-2.5 py-1 ${STATUS_STYLES[b.status] || STATUS_STYLES.pending}`} data-testid={`booking-status-${b.id}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
                    <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {b.check_in} → {b.check_out} · {b.nights} nights</span>
                    <span className="flex items-center gap-1.5"><Users size={14} /> {b.guests} guests</span>
                  </div>
                  <p className="mt-2 text-sm">
                    <span className="font-bold">${b.total_price.toLocaleString()}</span>
                    <span className="text-gray-400"> estimated total · {b.purpose}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      ) : saved.length === 0 ? (
        <div className="py-20 text-center">
          <Heart size={36} className="mx-auto text-gray-300 mb-4" />
          <p className="font-bold mb-2">Nothing saved yet</p>
          <p className="text-gray-500 text-sm mb-6">Tap the heart on any apartment to keep it here.</p>
          <Link to="/apartments" className="btn-eh">Browse Apartments</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="saved-grid">
          {saved.map((apt) => (
            <ApartmentCard key={apt.id} apartment={apt} />
          ))}
        </div>
      )}
    </div>
  );
}
