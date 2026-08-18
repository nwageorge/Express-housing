import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import api from "@/lib/api";
import Header from "@/components/housing/Header";
import Footer from "@/components/housing/Footer";
import HomePage from "@/components/housing/HomePage";
import ApartmentsPage from "@/components/housing/ApartmentsPage";
import ApartmentDetailPage from "@/components/housing/ApartmentDetailPage";
import { LoginPage, SignupPage } from "@/components/housing/AuthPages";
import DashboardPage from "@/components/housing/DashboardPage";
import AdminPage from "@/components/housing/AdminPage";
import ContactPage from "@/components/housing/ContactPage";
import "@/App.css";

// ===== Auth Context =====
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);

  const refreshWishlist = useCallback(async () => {
    try {
      const res = await api.get("/wishlist/ids");
      setWishlistIds(res.data);
    } catch {
      setWishlistIds([]);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("eh_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        refreshWishlist();
      })
      .catch(() => localStorage.removeItem("eh_token"))
      .finally(() => setLoading(false));
  }, [refreshWishlist]);

  const login = (token, userData) => {
    localStorage.setItem("eh_token", token);
    setUser(userData);
    refreshWishlist();
  };

  const logout = () => {
    localStorage.removeItem("eh_token");
    setUser(null);
    setWishlistIds([]);
  };

  const toggleWishlist = async (apartmentId) => {
    if (!user) return { needAuth: true };
    const res = await api.post(`/wishlist/${apartmentId}`);
    setWishlistIds((prev) =>
      res.data.saved ? [...prev, apartmentId] : prev.filter((id) => id !== apartmentId)
    );
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, wishlistIds, toggleWishlist }}>
      {children}
    </AuthContext.Provider>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-white flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/apartments" element={<ApartmentsPage />} />
              <Route path="/apartments/:id" element={<ApartmentDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
