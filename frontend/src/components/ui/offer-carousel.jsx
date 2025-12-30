import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

// The individual card component - Airbnb style compact
const OfferCard = React.forwardRef(({ offer }, ref) => (
  <motion.a
    ref={ref}
    href={offer.href}
    className="relative rounded-xl overflow-hidden group snap-start block"
    whileHover={{ y: -4 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    {/* Image - 4:3 aspect ratio like agency cards */}
    <div className="aspect-[4/3] overflow-hidden rounded-xl mb-2">
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

// The main carousel component - Shows 5 on desktop, 2 on mobile
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
        className="absolute top-[80px] -translate-y-1/2 -left-3 z-10 w-8 h-8 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:shadow-md hover:border-stone-400"
        aria-label="Scroll Left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      {/* Scrollable Container - 5 cards desktop, 2 mobile */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {offers.map((offer) => (
          <div 
            key={offer.id} 
            className="flex-shrink-0 w-[calc((100%-12px)/2)] sm:w-[calc((100%-48px)/5)] lg:w-[calc((100%-64px)/5)]"
            style={{ scrollSnapAlign: "start" }}
          >
            <OfferCard offer={offer} />
          </div>
        ))}
      </div>
      
      {/* Right Scroll Button */}
      <button
        onClick={() => scroll("right")}
        className="absolute top-[80px] -translate-y-1/2 -right-3 z-10 w-8 h-8 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:shadow-md hover:border-stone-400"
        aria-label="Scroll Right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
});
OfferCarousel.displayName = "OfferCarousel";

export { OfferCarousel, OfferCard };
