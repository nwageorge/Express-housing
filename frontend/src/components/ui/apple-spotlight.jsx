'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  ChevronRight,
  Files,
  Folder,
  Globe,
  Image,
  LayoutGrid,
  Mail,
  MapPin,
  MessageSquare,
  Music,
  Search,
  Settings,
  StickyNote,
  Terminal,
  Heart,
  Users,
  Clock,
  Shield
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SVGFilter = () => {
  return (
    <svg width="0" height="0">
      <filter id="blob">
        <feGaussianBlur stdDeviation="10" in="SourceGraphic" />
        <feColorMatrix
          values="
      1 0 0 0 0
      0 1 0 0 0
      0 0 1 0 0
      0 0 0 18 -9
    "
          result="blob"
        />
        <feBlend in="SourceGraphic" in2="blob" />
      </filter>
    </svg>
  );
};

const ShortcutButton = ({ icon, label, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="rounded-full cursor-pointer hover:shadow-lg opacity-30 hover:opacity-100 transition-[opacity,shadow] duration-200"
    >
      <div className="size-16 aspect-square flex items-center justify-center">{icon}</div>
    </div>
  );
};

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
    <div className="flex items-center w-full justify-start gap-2 px-6 h-16">
      <motion.div layoutId="search-icon">
        <Search className="text-stone-600" />
      </motion.div>
      <div className="flex-1 relative text-2xl">
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
          'flex items-center text-stone-800 justify-start hover:bg-white gap-3 py-2 px-2 rounded-xl hover:shadow-md w-full',
          isLast && 'rounded-b-3xl'
        )}
      >
        <div className="size-8 [&_svg]:stroke-[1.5] [&_svg]:size-6 aspect-square flex items-center justify-center text-stone-600">
          {icon}
        </div>
        <div className="flex flex-col">
          <p className="font-medium">{label}</p>
          <p className="text-xs opacity-50">{description}</p>
        </div>
        <div className="flex-1 flex items-center justify-end opacity-0 group-hover/card:opacity-100 transition-opacity duration-200">
          <ChevronRight className="size-6 text-stone-500" />
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
      className="px-2 border-t border-stone-200 flex flex-col bg-stone-100 max-h-96 overflow-y-auto w-full py-2"
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
  const [hovered, setHovered] = useState(false);
  const [hoveredSearchResult, setHoveredSearchResult] = useState(null);
  const [hoveredShortcut, setHoveredShortcut] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearchValueChange = (value) => {
    setSearchValue(value);
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/agencies?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate('/agencies');
    }
  };

  const shortcuts = [
    {
      label: 'Elderly Care',
      icon: <Heart />,
      specialty: 'Elderly Care'
    },
    {
      label: 'Pediatric',
      icon: <Users />,
      specialty: 'Pediatric Care'
    },
    {
      label: '24-Hour Care',
      icon: <Clock />,
      specialty: '24-Hour Care'
    },
    {
      label: 'Skilled Nursing',
      icon: <Shield />,
      specialty: 'Skilled Nursing'
    }
  ];

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
  };

  const handleShortcutClick = (shortcut) => {
    navigate(`/agencies?specialty=${encodeURIComponent(shortcut.specialty)}`);
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
      <SVGFilter />

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setHoveredShortcut(null);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'w-full flex items-center justify-end gap-4 z-20 group',
          '[&>div]:bg-white/90 [&>div]:backdrop-blur-xl [&>div]:text-stone-800 [&>div]:rounded-full',
          '[&_svg]:size-7 [&_svg]:stroke-[1.4]'
        )}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            layoutId="search-input-container"
            transition={{
              layout: {
                duration: 0.5,
                type: 'spring',
                bounce: 0.2
              }
            }}
            style={{
              borderRadius: '30px'
            }}
            className="h-full w-full flex flex-col items-center justify-start z-10 relative shadow-xl overflow-hidden border border-stone-200"
          >
            <SpotlightInput
              placeholder={
                hoveredShortcut !== null
                  ? shortcuts[hoveredShortcut].label
                  : hoveredSearchResult !== null
                  ? filteredResults[hoveredSearchResult]?.label || 'Search'
                  : 'Search by city or zip code...'
              }
              placeholderClassName={
                hoveredSearchResult !== null ? 'text-stone-800 bg-white' : 'text-stone-400'
              }
              hidePlaceholder={!(hoveredSearchResult !== null || !searchValue)}
              value={searchValue}
              onChange={handleSearchValueChange}
              onSubmit={handleSearch}
            />

            {(searchValue || isFocused || hovered) && filteredResults.length > 0 && (
              <SearchResultsContainer
                searchResults={filteredResults}
                onHover={setHoveredSearchResult}
                onSelect={handleSelectResult}
              />
            )}
          </motion.div>
          
          {hovered &&
            !searchValue &&
            shortcuts.map((shortcut, index) => (
              <motion.div
                key={`shortcut-${index}`}
                onMouseEnter={() => setHoveredShortcut(index)}
                layout
                initial={{ scale: 0.7, x: -1 * (64 * (index + 1)) }}
                animate={{ scale: 1, x: 0 }}
                exit={{
                  scale: 0.7,
                  x:
                    1 *
                    (16 * (shortcuts.length - index - 1) + 64 * (shortcuts.length - index - 1))
                }}
                transition={{
                  duration: 0.8,
                  type: 'spring',
                  bounce: 0.2,
                  delay: index * 0.05
                }}
                className="rounded-full cursor-pointer"
              >
                <ShortcutButton 
                  icon={shortcut.icon} 
                  label={shortcut.label}
                  onClick={() => handleShortcutClick(shortcut)}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export { CareSearchSpotlight };
export default CareSearchSpotlight;
