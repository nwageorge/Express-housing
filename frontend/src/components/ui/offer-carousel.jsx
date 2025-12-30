import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

// The individual card component with hover animation
const OfferCard = React.forwardRef(({ offer }, ref) => (
  <motion.a
    ref={ref}
    href={offer.href}
    className="relative flex-shrink-0 w-[300px] h-[380px] rounded-2xl overflow-hidden group snap-start"
    whileHover={{ y: -8 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    style={{ perspective: "1000px" }}
  >
    {/* Background Image */}
    <img
      src={offer.imageSrc}
      alt={offer.imageAlt}
      className="absolute inset-0 w-full h-2/4 object-cover transition-transform duration-500 group-hover:scale-110"
    />
    {/* Card Content */}
    <div className="absolute bottom-0 left-0 right-0 h-2/4 bg-white p-5 flex flex-col justify-between">
      <div className="space-y-2">
        {/* Tag */}
        <div className="flex items-center text-xs text-stone-500">
          <Tag className="w-4 h-4 mr-2 text-amber-600" />
          <span>{offer.tag}</span>
        </div>
        {/* Title & Description */}
        <h3 className="text-xl font-bold text-stone-800 leading-tight">{offer.title}</h3>
        <p className="text-sm text-stone-500">{offer.description}</p>
      </div>
      
      {/* Simple Arrow Button */}
      <div className="flex items-center justify-end pt-4">
        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 transform transition-transform duration-300 group-hover:rotate-[-45deg] group-hover:bg-stone-800 group-hover:text-white">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  </motion.a>
));
OfferCard.displayName = "OfferCard";

// The main carousel component with scroll functionality
const OfferCarousel = React.forwardRef(({ offers, className, ...props }, ref) => {
  const scrollContainerRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.clientWidth * 0.8;
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
        className="absolute top-1/2 -translate-y-1/2 left-0 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200 flex items-center justify-center text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white disabled:opacity-0 shadow-lg"
        aria-label="Scroll Left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
      
      {/* Right Scroll Button */}
      <button
        onClick={() => scroll("right")}
        className="absolute top-1/2 -translate-y-1/2 right-0 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200 flex items-center justify-center text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white disabled:opacity-0 shadow-lg"
        aria-label="Scroll Right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
});
OfferCarousel.displayName = "OfferCarousel";

export { OfferCarousel, OfferCard };
