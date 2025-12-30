import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

// The individual card component - Airbnb style compact
const OfferCard = React.forwardRef(({ offer }, ref) => (
  <motion.a
    ref={ref}
    href={offer.href}
    className="relative flex-shrink-0 w-[240px] sm:w-[260px] rounded-xl overflow-hidden group snap-start"
    whileHover={{ y: -4 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    {/* Image - Square aspect ratio like Airbnb */}
    <div className="aspect-square overflow-hidden rounded-xl mb-2">
      <img
        src={offer.imageSrc}
        alt={offer.imageAlt}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    
    {/* Content - Minimal Airbnb style */}
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5 text-xs text-stone-500">
        <Tag className="w-3 h-3 text-stone-400" />
        <span>{offer.tag}</span>
      </div>
      <h3 className="text-[15px] font-medium text-stone-900">{offer.title}</h3>
      <p className="text-sm text-stone-500 line-clamp-2">{offer.description}</p>
    </div>
  </motion.a>
));
OfferCard.displayName = "OfferCard";

// The main carousel component - Airbnb style
const OfferCarousel = React.forwardRef(({ offers, className, ...props }, ref) => {
  const scrollContainerRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = 260;
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div ref={ref} className={cn("relative w-full group", className)} {...props}>
      {/* Left Scroll Button */}
      <button
        onClick={() => scroll("left")}
        className="absolute top-[120px] -translate-y-1/2 -left-3 z-10 w-8 h-8 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:shadow-md hover:border-stone-400"
        aria-label="Scroll Left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:-mx-0 sm:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
      
      {/* Right Scroll Button */}
      <button
        onClick={() => scroll("right")}
        className="absolute top-[120px] -translate-y-1/2 -right-3 z-10 w-8 h-8 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:shadow-md hover:border-stone-400"
        aria-label="Scroll Right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
});
OfferCarousel.displayName = "OfferCarousel";

export { OfferCarousel, OfferCard };
