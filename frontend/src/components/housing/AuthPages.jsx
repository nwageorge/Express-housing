import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/App";

const AuthShell = ({ title, sub, children }) => (
  <div className="eh-container py-16 md:py-24">
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <p className="eyebrow mb-2">Express Housing</p>
        <h1 className="text-2xl font-bold uppercase tracking-wide">{title}</h1>
        <p className="text-gray-500 text-sm mt-2">{sub}</p>
      </div>
      <div className="border border-gray-200 p-6 md:p-8">{children}</div>
    </div>
  </div>
);

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.access_token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}!`);
      navigate(location.state?.from || "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Sign In" sub="Manage your stays and saved apartments.">
      <form onSubmit={submit} className="space-y-4" data-testid="login-form">
        <div>
          <label className="label-eh">Email</label>
          <input type="email" required className="input-eh" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-email" />
        </div>
        <div>
          <label className="label-eh">Password</label>
          <input type="password" required className="input-eh" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="login-password" />
        </div>
        <button type="submit" className="btn-eh w-full" disabled={loading} data-testid="login-submit">
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        New to Express Housing?{" "}
        <Link to="/signup" className="text-[#bd744c] font-semibold hover:underline" data-testid="goto-signup">Create an account</Link>
      </p>
    </AuthShell>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", { name, email, password, phone: phone || null, role: "guest" });
      login(res.data.access_token, res.data.user);
      toast.success(`Welcome to Express Housing, ${name.split(" ")[0]}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create Account" sub="Save apartments, request stays, and track your bookings.">
      <form onSubmit={submit} className="space-y-4" data-testid="signup-form">
        <div>
          <label className="label-eh">Full Name</label>
          <input required className="input-eh" value={name} onChange={(e) => setName(e.target.value)} data-testid="signup-name" />
        </div>
        <div>
          <label className="label-eh">Email</label>
          <input type="email" required className="input-eh" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="signup-email" />
        </div>
        <div>
          <label className="label-eh">Password</label>
          <input type="password" required className="input-eh" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="signup-password" />
        </div>
        <div>
          <label className="label-eh">Phone (optional)</label>
          <input className="input-eh" value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="signup-phone" />
        </div>
        <button type="submit" className="btn-eh w-full" disabled={loading} data-testid="signup-submit">
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-[#bd744c] font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
