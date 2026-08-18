import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import api from "@/lib/api";
import ApartmentCard from "@/components/housing/ApartmentCard";

const APT_TYPES = ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom", "Penthouse"];
const STAY_PATHS = [
  { value: "", label: "All stays" },
  { value: "corporate", label: "Corporate" },
  { value: "medical", label: "Medical" },
  { value: "family", label: "Families & Relocation" },
];

export default function ApartmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [apartments, setApartments] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);

  const filters = useMemo(() => ({
    neighborhood: searchParams.get("neighborhood") || "",
    apt_type: searchParams.get("apt_type") || "",
    stay_path: searchParams.get("stay_path") || "",
    guests: searchParams.get("guests") || "",
    search: searchParams.get("search") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    sort: searchParams.get("sort") || "",
  }), [searchParams]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  useEffect(() => {
    api.get("/neighborhoods").then((r) => setNeighborhoods(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    api
      .get("/apartments", { params })
      .then((r) => setApartments(r.data))
      .finally(() => setLoading(false));
  }, [filters]);

  const activeCount = [filters.neighborhood, filters.apt_type, filters.stay_path, filters.guests, filters.min_price, filters.max_price].filter(Boolean).length;

  const clearAll = () => setSearchParams(new URLSearchParams());

  const filterPanel = (
    <div className="space-y-8">
      {/* Stay path */}
      <div>
        <p className="label-eh !mb-3">Stay Path</p>
        <div className="space-y-2">
          {STAY_PATHS.map((p) => (
            <label key={p.value} className="flex items-center gap-2.5 text-sm cursor-pointer text-gray-600 hover:text-[#212529]">
              <input
                type="radio"
                name="stay_path"
                checked={filters.stay_path === p.value}
                onChange={() => setFilter("stay_path", p.value)}
                className="accent-[#bd744c]"
              />
              {p.label}
            </label>
          ))}
        </div>
      </div>

      {/* Type */}
      <div>
        <p className="label-eh !mb-3">Apartment Type</p>
        <div className="space-y-2">
          {APT_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2.5 text-sm cursor-pointer text-gray-600 hover:text-[#212529]">
              <input
                type="checkbox"
                checked={filters.apt_type === t}
                onChange={() => setFilter("apt_type", filters.apt_type === t ? "" : t)}
                className="accent-[#bd744c]"
                data-testid={`filter-type-${t}`}
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      {/* Neighborhood */}
      <div>
        <p className="label-eh !mb-3">Neighborhood</p>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
          {neighborhoods.map((n) => (
            <label key={n.name} className="flex items-center justify-between text-sm cursor-pointer text-gray-600 hover:text-[#212529]">
              <span className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={filters.neighborhood === n.name}
                  onChange={() => setFilter("neighborhood", filters.neighborhood === n.name ? "" : n.name)}
                  className="accent-[#bd744c]"
                />
                {n.name}
              </span>
              <span className="text-gray-300 text-xs">{n.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Guests */}
      <div>
        <p className="label-eh !mb-3">Guests</p>
        <select className="input-eh" value={filters.guests} onChange={(e) => setFilter("guests", e.target.value)} data-testid="filter-guests">
          <option value="">Any</option>
          {[1, 2, 3, 4, 5, 6].map((g) => <option key={g} value={g}>{g}+ guests</option>)}
        </select>
      </div>

      {/* Price */}
      <div>
        <p className="label-eh !mb-3">Nightly Rate</p>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" className="input-eh" value={filters.min_price} onChange={(e) => setFilter("min_price", e.target.value)} data-testid="filter-min-price" />
          <span className="text-gray-300">—</span>
          <input type="number" placeholder="Max" className="input-eh" value={filters.max_price} onChange={(e) => setFilter("max_price", e.target.value)} data-testid="filter-max-price" />
        </div>
      </div>

      {activeCount > 0 && (
        <button onClick={clearAll} className="text-xs font-bold uppercase tracking-wider text-[#bd744c] hover:underline" data-testid="clear-filters-btn">
          Clear all filters ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Page banner */}
      <div className="bg-[#faf7f4] border-b border-gray-100">
        <div className="eh-container py-10 text-center">
          <p className="eyebrow mb-2">Philadelphia, PA</p>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">Furnished Apartments</h1>
          <p className="text-gray-500 text-sm mt-2">Flexible stays in the city’s best buildings — rented through our apartment community partners.</p>
        </div>
      </div>

      <div className="eh-container mt-10 flex gap-10">
        {/* Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0" data-testid="filters-sidebar">
          {filterPanel}
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500" data-testid="results-count">
              {loading ? "Loading..." : `${apartments.length} ${apartments.length === 1 ? "home" : "homes"} available`}
              {filters.search && <span> for “{filters.search}”</span>}
            </p>
            <div className="flex items-center gap-3">
              <button className="lg:hidden flex items-center gap-2 text-xs font-bold uppercase tracking-wider border border-gray-200 px-4 py-2.5" onClick={() => setMobileFilters(true)} data-testid="mobile-filters-btn">
                <SlidersHorizontal size={14} /> Filters{activeCount > 0 && ` (${activeCount})`}
              </button>
              <select className="input-eh !w-auto text-xs" value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)} data-testid="sort-select">
                <option value="">Sort: Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-[#bd744c] border-t-transparent rounded-full mx-auto" />
            </div>
          ) : apartments.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-bold text-lg mb-2">No homes match those filters</p>
              <p className="text-gray-500 text-sm mb-6">Try widening your dates, budget, or neighborhood.</p>
              <button onClick={() => setSearchParams(new URLSearchParams())} className="btn-eh-outline">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-10" data-testid="apartments-grid">
              {apartments.map((apt) => (
                <ApartmentCard key={apt.id} apartment={apt} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilters(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="font-bold uppercase tracking-wider text-sm">Filters</p>
              <button onClick={() => setMobileFilters(false)} aria-label="Close"><X size={20} /></button>
            </div>
            {filterPanel}
            <button className="btn-eh w-full mt-8" onClick={() => setMobileFilters(false)}>Show Results</button>
          </div>
        </div>
      )}
    </div>
  );
}
