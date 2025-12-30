'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronRight,
  MapPin,
  Search
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotlightPlaceholder = ({ text, className }) => {
  return (
    <motion.div
      layout
      className={cn('absolute text-gray-500 flex items-center pointer-events-none z-10', className)}
    >
      <AnimatePresence mode="popLayout">
        <motion.p
          layoutId={`placeholder-${text}`}
          key={`placeholder-${text}`}
          initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
};

const SpotlightInput = ({
  placeholder,
  hidePlaceholder,
  value,
  onChange,
  placeholderClassName,
  onSubmit
}) => {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="flex items-center w-full justify-start gap-3 px-6 h-14">
      <Search className="w-5 h-5 text-stone-500" />
      <div className="flex-1 relative text-lg">
        {!hidePlaceholder && (
          <SpotlightPlaceholder text={placeholder} className={placeholderClassName} />
        )}

        <motion.input
          ref={inputRef}
          layout="position"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent outline-none ring-none text-stone-800"
        />
      </div>
    </div>
  );
};

const SearchResultCard = ({ icon, label, description, onClick, isLast }) => {
  return (
    <div onClick={onClick} className="overflow-hidden w-full group/card cursor-pointer">
      <div
        className={cn(
          'flex items-center text-stone-800 justify-start hover:bg-white gap-3 py-2.5 px-3 rounded-xl hover:shadow-md w-full transition-all',
          isLast && 'rounded-b-2xl'
        )}
      >
        <div className="w-8 h-8 flex items-center justify-center text-stone-500">
          {icon}
        </div>
        <div className="flex flex-col">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-stone-500">{description}</p>
        </div>
        <div className="flex-1 flex items-center justify-end opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
          <ChevronRight className="w-5 h-5 text-stone-400" />
        </div>
      </div>
    </div>
  );
};

const SearchResultsContainer = ({ searchResults, onHover, onSelect }) => {
  return (
    <motion.div
      layout
      onMouseLeave={() => onHover(null)}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="px-2 border-t border-stone-200 flex flex-col bg-stone-50 max-h-72 overflow-y-auto w-full py-2"
    >
      {searchResults.map((result, index) => {
        return (
          <motion.div
            key={`search-result-${index}`}
            onMouseEnter={() => onHover(index)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              delay: index * 0.05,
              duration: 0.2,
              ease: 'easeOut'
            }}
          >
            <SearchResultCard
              icon={result.icon}
              label={result.label}
              description={result.description}
              onClick={() => onSelect(result)}
              isLast={index === searchResults.length - 1}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
};

const CareSearchSpotlight = ({ className }) => {
  const navigate = useNavigate();
  const [hoveredSearchResult, setHoveredSearchResult] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchValueChange = (value) => {
    setSearchValue(value);
    setIsOpen(true);
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/agencies?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate('/agencies');
    }
    setIsOpen(false);
  };

  // Location-based search results
  const locationResults = [
    {
      icon: <MapPin />,
      label: 'Philadelphia, PA',
      description: '14 care agencies available',
      city: 'Philadelphia, PA'
    },
    {
      icon: <MapPin />,
      label: 'Washington, D.C.',
      description: '12 care agencies available',
      city: 'Washington, D.C.'
    },
    {
      icon: <MapPin />,
      label: 'Pittsburgh, PA',
      description: '10 care agencies available',
      city: 'Pittsburgh, PA'
    },
    {
      icon: <MapPin />,
      label: 'Newark, NJ',
      description: '8 care agencies available',
      city: 'Newark, NJ'
    }
  ];

  // Filter results based on search value
  const filteredResults = searchValue
    ? locationResults.filter(
        (r) =>
          r.label.toLowerCase().includes(searchValue.toLowerCase()) ||
          r.description.toLowerCase().includes(searchValue.toLowerCase())
      )
    : locationResults;

  const handleSelectResult = (result) => {
    navigate(`/agencies?city=${encodeURIComponent(result.city)}`);
    setIsOpen(false);
  };

  return (
    <div 
      className={cn("w-full max-w-2xl mx-auto", className)}
      onFocus={() => setIsOpen(true)}
      onBlur={(e) => {
        // Don't close if clicking inside the component
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setTimeout(() => setIsOpen(false), 200);
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ borderRadius: '24px' }}
        className="w-full flex flex-col items-center justify-start z-10 relative shadow-2xl overflow-hidden border border-stone-200 bg-white/95 backdrop-blur-xl"
      >
        <SpotlightInput
          placeholder={
            hoveredSearchResult !== null
              ? filteredResults[hoveredSearchResult]?.label || 'Search by city or zip code...'
              : 'Search by city or zip code...'
          }
          placeholderClassName={
            hoveredSearchResult !== null ? 'text-stone-800' : 'text-stone-400'
          }
          hidePlaceholder={searchValue.length > 0}
          value={searchValue}
          onChange={handleSearchValueChange}
          onSubmit={handleSearch}
        />

        <AnimatePresence>
          {isOpen && filteredResults.length > 0 && (
            <SearchResultsContainer
              searchResults={filteredResults}
              onHover={setHoveredSearchResult}
              onSelect={handleSelectResult}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export { CareSearchSpotlight };
export default CareSearchSpotlight;
