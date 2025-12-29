"use client"

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export const ShuffleHero = () => {
  return (
    <section className="w-full px-8 py-12 grid grid-cols-1 md:grid-cols-2 items-center gap-8 max-w-6xl mx-auto">
      <div>
        <span className="block mb-4 text-xs md:text-sm text-indigo-600 font-medium">
          Trusted In-Home Care Marketplace
        </span>
        <h3 className="text-4xl md:text-6xl font-semibold text-gray-900">
          Find Quality Care For Your Loved Ones
        </h3>
        <p className="text-base md:text-lg text-gray-600 my-4 md:my-6">
          Connect with verified, professional in-home care agencies for elderly care, pediatric support, and specialized health services. Book a free consultation today.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link 
            to="/agencies"
            className={cn(
              "bg-black text-white font-medium py-3 px-6 rounded-full inline-flex items-center justify-center",
              "transition-all hover:bg-gray-800 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            Find Care Now
            <ChevronRight className="ml-1 w-5 h-5" />
          </Link>
          <Link 
            to="/contact"
            className={cn(
              "bg-transparent text-gray-700 font-medium py-3 px-6 rounded-full inline-flex items-center justify-center",
              "transition-all hover:bg-gray-100 active:scale-95 border border-gray-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          >
            Contact Us
          </Link>
        </div>
      </div>
      <ShuffleGrid />
    </section>
  );
};

const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

// In-home care related images - 4 images for 2x2 grid
const squareData = [
  {
    id: 1,
    src: "https://images.pexels.com/photos/7551667/pexels-photo-7551667.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: 2,
    src: "https://images.pexels.com/photos/7551617/pexels-photo-7551617.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: 3,
    src: "https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: 4,
    src: "https://images.pexels.com/photos/8460059/pexels-photo-8460059.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

const generateSquares = () => {
  return shuffle([...squareData]).map((sq) => (
    <motion.div
      key={sq.id}
      layout
      transition={{ duration: 1.5, type: "spring" }}
      className="w-full h-full rounded-lg overflow-hidden bg-gray-200"
      style={{
        backgroundImage: `url(${sq.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    ></motion.div>
  ));
};

const ShuffleGrid = () => {
  const timeoutRef = useRef(null);
  const [squares, setSquares] = useState(generateSquares());

  useEffect(() => {
    shuffleSquares();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const shuffleSquares = () => {
    setSquares(generateSquares());

    timeoutRef.current = setTimeout(shuffleSquares, 3000);
  };

  return (
    <div className="grid grid-cols-3 grid-rows-3 h-[500px] gap-2">
      {squares.map((sq) => sq)}
    </div>
  );
};

export default ShuffleHero;
