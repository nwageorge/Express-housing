import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Eye, BedDouble, Bath, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/App";

export default function ApartmentCard({ apartment }) {
  const navigate = useNavigate();
  const { wishlistIds, toggleWishlist, user } = useAuth();
  const [imgIdx, setImgIdx] = useState(0);
  const saved = wishlistIds.includes(apartment.id);

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.info("Sign in to save apartments");
      navigate("/login");
      return;
    }
    const res = await toggleWishlist(apartment.id);
    if (res?.saved) toast.success("Saved to your list");
  };

  const goDetail = () => navigate(`/apartments/${apartment.id}`);

  return (
    <div className="group cursor-pointer" onClick={goDetail} data-testid={`apartment-card-${apartment.id}`}>
      {/* Image */}
      <div
        className="relative aspect-[4/3] overflow-hidden bg-gray-100"
        onMouseEnter={() => apartment.images?.length > 1 && setImgIdx(1)}
        onMouseLeave={() => setImgIdx(0)}
      >
        <img
          src={apartment.images?.[imgIdx] || apartment.images?.[0]}
          alt={apartment.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {apartment.is_new && (
            <span className="bg-[#212529] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">New</span>
          )}
          {apartment.is_featured && (
            <span className="bg-[#bd744c] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">Featured</span>
          )}
        </div>
        {/* Hover actions - flatlogic ecommerce style */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 md:opacity-0 md:translate-x-2 md:group-hover:opacity-100 md:group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={handleWishlist}
            className="w-9 h-9 bg-white shadow-md flex items-center justify-center hover:bg-[#bd744c] hover:text-white transition-colors"
            aria-label="Save"
            data-testid={`wishlist-btn-${apartment.id}`}
          >
            <Heart size={15} className={saved ? "fill-[#bd744c] text-[#bd744c]" : ""} />
          </button>
          <button
            onClick={goDetail}
            className="w-9 h-9 bg-white shadow-md flex items-center justify-center hover:bg-[#bd744c] hover:text-white transition-colors"
            aria-label="View"
          >
            <Eye size={15} />
          </button>
        </div>
        {/* Bottom bar on hover */}
        <div className="absolute bottom-0 inset-x-0 bg-[#212529]/90 text-white text-center text-[11px] font-bold uppercase tracking-[0.15em] py-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
          View Stay
        </div>
      </div>

      {/* Info */}
      <div className="pt-3">
        <p className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-semibold">
          {apartment.neighborhood} · {apartment.building_name}
        </p>
        <h3 className="font-semibold text-[15px] text-[#212529] mt-1 group-hover:text-[#bd744c] transition-colors line-clamp-1">
          {apartment.title}
        </h3>
        <div className="flex items-center gap-3 text-gray-500 text-xs mt-1.5">
          <span className="flex items-center gap-1"><BedDouble size={13} /> {apartment.bedrooms === 0 ? "Studio" : `${apartment.bedrooms} bd`}</span>
          <span className="flex items-center gap-1"><Bath size={13} /> {apartment.bathrooms} ba</span>
          <span className="flex items-center gap-1"><Users size={13} /> {apartment.max_guests} guests</span>
        </div>
        <p className="mt-2 text-[15px]">
          <span className="font-bold text-[#212529]">${Math.round(apartment.nightly_rate)}</span>
          <span className="text-gray-400 text-xs"> / night</span>
          <span className="text-gray-300 mx-1.5">·</span>
          <span className="font-semibold text-[#bd744c] text-xs">${apartment.monthly_rate.toLocaleString()} / mo</span>
        </p>
      </div>
    </div>
  );
}
