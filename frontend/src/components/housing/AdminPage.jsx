import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Users, Mail, CheckCircle2, XCircle, BadgeCheck, Clock, Building2, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/App";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-gray-50 text-gray-600 border-gray-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

const TABS = ["all", "pending", "confirmed", "completed", "cancelled"];

function TeamView() {
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    api.get("/admin/users").then((r) => setAdmins(r.data)).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const createAdmin = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/admin/users", form);
      toast.success(`Admin account created for ${form.name} — they can now sign in at /login`);
      setForm({ name: "", email: "", password: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not create admin");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-10" data-testid="admin-team">
      <div>
        <h4 className="font-bold uppercase tracking-wide text-sm mb-4 border-b border-gray-100 pb-3">Team Members ({admins.length})</h4>
        <div className="space-y-3">
          {admins.map((a) => (
            <div key={a.id} className="border border-gray-200 p-4 flex items-center gap-3" data-testid={`admin-user-${a.email}`}>
              <div className="w-10 h-10 bg-[#bd744c]/10 text-[#bd744c] font-bold flex items-center justify-center">
                {a.name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-sm">{a.name}</p>
                <p className="text-xs text-gray-400">{a.email}</p>
              </div>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-widest bg-[#212529] text-white px-2.5 py-1">Admin</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-bold uppercase tracking-wide text-sm mb-4 border-b border-gray-100 pb-3">Add New Admin</h4>
        <p className="text-xs text-gray-400 mb-4">New admins sign in through the normal Sign In page and automatically get access to this dashboard.</p>
        <form onSubmit={createAdmin} className="border border-gray-200 p-6 space-y-4" data-testid="create-admin-form">
          <div>
            <label className="label-eh">Full Name</label>
            <input required className="input-eh" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="create-admin-name" />
          </div>
          <div>
            <label className="label-eh">Email</label>
            <input type="email" required className="input-eh" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="create-admin-email" />
          </div>
          <div>
            <label className="label-eh">Password (min 6 chars)</label>
            <input type="text" required minLength={6} className="input-eh" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid="create-admin-password" />
          </div>
          <button type="submit" className="btn-eh w-full" disabled={creating} data-testid="create-admin-submit">
            {creating ? "Creating..." : "Create Admin Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

const pad = (n) => String(n).padStart(2, "0");

function CalendarView({ apartments, bookings }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() }; // m: 0-based
  });

  const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
  const days = [...Array(daysInMonth)].map((_, i) => i + 1);
  const monthLabel = new Date(month.y, month.m, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
  const active = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");

  const dayStatus = (aptId, day) => {
    const ds = `${month.y}-${pad(month.m + 1)}-${pad(day)}`;
    const bk = active.find((b) => b.apartment_id === aptId && b.check_in <= ds && ds < b.check_out);
    return bk ? bk.status : null;
  };

  const shift = (delta) => {
    setMonth(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  return (
    <div className="mt-6" data-testid="admin-calendar">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => shift(-1)} className="w-8 h-8 border border-gray-200 flex items-center justify-center hover:border-[#212529]" aria-label="Previous month" data-testid="calendar-prev">
            <ChevronLeft size={15} />
          </button>
          <p className="font-bold uppercase tracking-wider text-sm min-w-[150px] text-center" data-testid="calendar-month-label">{monthLabel}</p>
          <button onClick={() => shift(1)} className="w-8 h-8 border border-gray-200 flex items-center justify-center hover:border-[#212529]" aria-label="Next month" data-testid="calendar-next">
            <ChevronRight size={15} />
          </button>
        </div>
        <div className="flex items-center gap-4 text-[11px] uppercase tracking-wider font-semibold text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-500 inline-block" /> Confirmed</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-400 inline-block" /> Pending</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-100 border border-gray-200 inline-block" /> Open</span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto border border-gray-200">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white text-left p-2 border-b border-r border-gray-200 min-w-[180px] font-bold uppercase tracking-wider text-[10px] text-gray-500">Apartment</th>
              {days.map((d) => (
                <th key={d} className="p-1 border-b border-gray-200 text-center font-semibold text-gray-400 min-w-[26px]">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apartments.map((apt) => (
              <tr key={apt.id} data-testid={`calendar-row-${apt.id}`}>
                <td className="sticky left-0 bg-white p-2 border-b border-r border-gray-100 font-semibold text-[#212529] whitespace-nowrap max-w-[220px] overflow-hidden text-ellipsis">
                  {apt.title}
                  <span className="block text-[10px] text-gray-400 font-normal">{apt.neighborhood}</span>
                </td>
                {days.map((d) => {
                  const st = dayStatus(apt.id, d);
                  return (
                    <td
                      key={d}
                      title={st ? `${st} · ${monthLabel} ${d}` : `open · ${monthLabel} ${d}`}
                      className={`border-b border-gray-100 h-8 ${
                        st === "confirmed" ? "bg-green-500" : st === "pending" ? "bg-amber-400" : "bg-gray-50"
                      }`}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [emails, setEmails] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [tab, setTab] = useState("pending");
  const [view, setView] = useState("bookings"); // bookings | calendar | emails
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      toast.error("Admin access required");
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, b, e, a] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/bookings"),
        api.get("/admin/emails"),
        api.get("/apartments"),
      ]);
      setStats(s.data);
      setBookings(b.data);
      setEmails(e.data);
      setApartments(a.data);
    } catch {
      toast.error("Could not load admin data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") loadAll();
  }, [user, loadAll]);

  const updateStatus = async (bookingId, status) => {
    setActing(bookingId + status);
    try {
      await api.patch(`/admin/bookings/${bookingId}`, { status });
      toast.success(
        status === "confirmed"
          ? "Stay approved — confirmation email sent to guest"
          : status === "cancelled"
          ? "Request declined — guest notified by email"
          : "Stay marked completed — thank-you email sent"
      );
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Update failed");
    } finally {
      setActing(null);
    }
  };

  if (authLoading || !user || user.role !== "admin") return null;

  const filtered = tab === "all" ? bookings : bookings.filter((b) => b.status === tab);

  const statCards = stats
    ? [
        { icon: Clock, label: "Pending Requests", value: stats.pending, accent: "text-amber-600" },
        { icon: BadgeCheck, label: "Confirmed Stays", value: stats.confirmed, accent: "text-green-600" },
        { icon: DollarSign, label: "Booked Revenue", value: `$${stats.revenue.toLocaleString()}`, accent: "text-[#bd744c]" },
        { icon: Building2, label: "Active Listings", value: stats.apartments, accent: "text-gray-600" },
      ]
    : [];

  return (
    <div className="eh-container mt-10 pb-10" data-testid="admin-dashboard">
      <p className="eyebrow mb-1">Express Housing Team</p>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {statCards.map((s) => (
          <div key={s.label} className="border border-gray-200 p-5" data-testid={`stat-${s.label}`}>
            <s.icon size={18} className={s.accent} />
            <p className="text-2xl font-extrabold mt-2">{s.value}</p>
            <p className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* View switch */}
      <div className="flex gap-6 border-b border-gray-200 mt-10">
        <button
          onClick={() => setView("bookings")}
          className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 -mb-px ${view === "bookings" ? "border-[#bd744c] text-[#bd744c]" : "border-transparent text-gray-400 hover:text-[#212529]"}`}
          data-testid="admin-view-bookings"
        >
          Stay Requests ({bookings.length})
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 -mb-px ${view === "calendar" ? "border-[#bd744c] text-[#bd744c]" : "border-transparent text-gray-400 hover:text-[#212529]"}`}
          data-testid="admin-view-calendar"
        >
          Availability Calendar
        </button>
        <button
          onClick={() => setView("emails")}
          className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 -mb-px ${view === "emails" ? "border-[#bd744c] text-[#bd744c]" : "border-transparent text-gray-400 hover:text-[#212529]"}`}
          data-testid="admin-view-emails"
        >
          Sent Emails ({emails.length})
        </button>
        <button
          onClick={() => setView("team")}
          className={`pb-3 text-sm font-bold uppercase tracking-wider border-b-2 -mb-px ${view === "team" ? "border-[#bd744c] text-[#bd744c]" : "border-transparent text-gray-400 hover:text-[#212529]"}`}
          data-testid="admin-view-team"
        >
          Team
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-[#bd744c] border-t-transparent rounded-full mx-auto" />
        </div>
      ) : view === "calendar" ? (
        <CalendarView apartments={apartments} bookings={bookings} />
      ) : view === "team" ? (
        <TeamView />
      ) : view === "bookings" ? (
        <>
          {/* Status filter chips */}
          <div className="flex flex-wrap gap-2 mt-6">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-[11px] font-bold uppercase tracking-widest px-4 py-2 border transition-colors ${
                  tab === t ? "bg-[#212529] text-white border-[#212529]" : "border-gray-200 text-gray-500 hover:border-[#212529]"
                }`}
                data-testid={`admin-filter-${t}`}
              >
                {t}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="font-semibold">No {tab !== "all" ? tab : ""} requests</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4" data-testid="admin-bookings-list">
              {filtered.map((b) => (
                <div key={b.id} className="border border-gray-200 p-4 flex flex-col md:flex-row gap-4" data-testid={`admin-booking-${b.id}`}>
                  <img src={b.apartment_image} alt="" className="w-full md:w-36 h-28 object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold">{b.neighborhood}</p>
                        <p className="font-bold">{b.apartment_title}</p>
                        {(b.user_name || b.user_email) && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {b.user_name} · <span className="text-gray-400">{b.user_email}</span>
                          </p>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest border px-2.5 py-1 ${STATUS_STYLES[b.status]}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                      <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {b.check_in} → {b.check_out} · {b.nights} nights</span>
                      <span className="flex items-center gap-1.5"><Users size={14} /> {b.guests} guests · {b.purpose}</span>
                      <span className="font-bold text-[#212529]">${b.total_price.toLocaleString()}</span>
                    </div>
                    {b.notes && <p className="text-xs text-gray-400 mt-2 italic">“{b.notes}”</p>}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {b.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(b.id, "confirmed")}
                            disabled={acting === b.id + "confirmed"}
                            className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold uppercase tracking-widest px-4 py-2 disabled:opacity-50"
                            data-testid={`approve-btn-${b.id}`}
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button
                            onClick={() => updateStatus(b.id, "cancelled")}
                            disabled={acting === b.id + "cancelled"}
                            className="inline-flex items-center gap-1.5 border border-red-300 text-red-600 hover:bg-red-50 text-[11px] font-bold uppercase tracking-widest px-4 py-2 disabled:opacity-50"
                            data-testid={`decline-btn-${b.id}`}
                          >
                            <XCircle size={13} /> Decline
                          </button>
                        </>
                      )}
                      {b.status === "confirmed" && (
                        <button
                          onClick={() => updateStatus(b.id, "completed")}
                          disabled={acting === b.id + "completed"}
                          className="inline-flex items-center gap-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-[11px] font-bold uppercase tracking-widest px-4 py-2 disabled:opacity-50"
                          data-testid={`complete-btn-${b.id}`}
                        >
                          <BadgeCheck size={13} /> Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="mt-6">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 mb-4">
            Email sending is currently <strong>simulated</strong> — every email below was generated and logged, but not delivered. Connect SendGrid/Mailgun later to send for real.
          </div>
          {emails.length === 0 ? (
            <p className="py-12 text-center text-gray-400">No emails yet</p>
          ) : (
            <div className="space-y-3" data-testid="admin-emails-list">
              {emails.map((e) => (
                <div key={e.id} className="border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail size={15} className="text-[#bd744c] shrink-0" />
                      <p className="font-semibold text-sm truncate">{e.subject}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-1 shrink-0">{e.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">To: {e.to_name} &lt;{e.to_email}&gt; · {new Date(e.created_at).toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-line line-clamp-4">{e.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
