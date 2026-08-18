import React, { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";
import api from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/contact", form);
      toast.success(res.data.message);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Could not send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="eh-container py-16">
      <div className="text-center mb-12">
        <p className="eyebrow mb-2">Ask Express Housing</p>
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">Talk It Through With Our Team</h1>
        <p className="text-gray-500 text-sm mt-3 max-w-lg mx-auto">
          Dates, stay length, corporate rates, or a unit you don’t see listed — send us the details and a real person replies within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-4xl mx-auto">
        <div className="space-y-6">
          {[
            { icon: MapPin, title: "Office", text: "Philadelphia, PA" },
            { icon: Mail, title: "Email", text: "stay@expresshousing.com" },
            { icon: Phone, title: "Phone", text: "(215) 555-0142" },
          ].map((c) => (
            <div key={c.title} className="flex gap-4">
              <div className="w-10 h-10 bg-[#bd744c]/10 text-[#bd744c] flex items-center justify-center shrink-0">
                <c.icon size={17} />
              </div>
              <div>
                <p className="font-bold text-sm uppercase tracking-wide">{c.title}</p>
                <p className="text-gray-500 text-sm">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="lg:col-span-2 border border-gray-200 p-6 md:p-8 space-y-4" data-testid="contact-form">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-eh">Name</label>
              <input required className="input-eh" value={form.name} onChange={set("name")} data-testid="contact-name" />
            </div>
            <div>
              <label className="label-eh">Email</label>
              <input type="email" required className="input-eh" value={form.email} onChange={set("email")} data-testid="contact-email" />
            </div>
          </div>
          <div>
            <label className="label-eh">Subject</label>
            <input required className="input-eh" value={form.subject} onChange={set("subject")} data-testid="contact-subject" />
          </div>
          <div>
            <label className="label-eh">Message</label>
            <textarea required rows={5} className="input-eh" value={form.message} onChange={set("message")} data-testid="contact-message" />
          </div>
          <button type="submit" className="btn-eh" disabled={loading} data-testid="contact-submit">
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
