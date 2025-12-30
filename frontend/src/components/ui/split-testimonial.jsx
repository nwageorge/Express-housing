"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

const testimonials = [
  {
    id: 1,
    quote: "Living in another state made it hard to know what was really happening day to day. With ADLTrack, I can see when my dad's meds are given and when his caregiver arrives. I finally feel involved again, without constantly calling.",
    name: "Jasmine T.",
    role: "Daughter",
    company: "Atlanta, GA",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
  },
  {
    id: 2,
    quote: "ADLTrack completely changed how we manage accountability. We can now see caregiver punctuality, task completion, and patterns over time. It's helped us improve quality, reduce complaints, and retain our best caregivers.",
    name: "Michael R.",
    role: "Agency Director",
    company: "Newark, NJ",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
  },
  {
    id: 3,
    quote: "Before ADLTrack, families didn't always understand how much we actually do. Now everything I complete is tracked and time-stamped. It protects caregivers like me and builds trust with families.",
    name: "Aisha K.",
    role: "Certified Caregiver",
    company: "Philadelphia, PA",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop",
  },
  {
    id: 4,
    quote: "Our son has a very structured routine, and missed steps used to cause setbacks. ADLTrack keeps everyone on the same page—therapists, caregivers, and us. The reminders and logs have been a game changer.",
    name: "Daniel & Maria S.",
    role: "Parents",
    company: "Houston, TX",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop",
  },
  {
    id: 5,
    quote: "Supervising multiple clients used to mean endless check-ins. With ADLTrack, I get clear visibility into care delivery and alerts when something needs attention. It saves time and improves outcomes.",
    name: "Linda P.",
    role: "Care Manager",
    company: "Chicago, IL",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop",
  },
  {
    id: 6,
    quote: "ADLTrack gave us peace of mind during the hardest season of our lives. Knowing my mom's care was being followed exactly as planned helped me sleep again.",
    name: "Renee M.",
    role: "Family Caregiver",
    company: "Philadelphia, PA",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop",
  },
]

export function TestimonialsSplit() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const active = testimonials[activeIndex]

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6">
      <div
        className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center cursor-pointer group"
        onClick={nextTestimonial}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Left: Quote Content */}
        <div className="space-y-8">
          {/* Company Tag */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.company}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-stone-500"
            >
              <span className="w-8 h-px bg-stone-400" />
              {active.company}
            </motion.div>
          </AnimatePresence>

          {/* Quote */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={active.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-2xl md:text-3xl lg:text-4xl font-light leading-[1.3] tracking-tight text-stone-800"
              >
                "{active.quote}"
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Author Info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <div className="w-10 h-px bg-stone-300" />
              <div>
                <p className="text-sm font-medium text-stone-800">{active.name}</p>
                <p className="text-xs text-stone-500">{active.role}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Visual Element */}
        <div className="relative w-48 h-64 mx-auto md:mx-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <div className="w-full h-full rounded-2xl overflow-hidden border border-stone-200 shadow-lg">
                <img
                  src={active.image}
                  alt={active.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Click indicator */}
          <motion.div
            animate={{
              opacity: isHovering ? 1 : 0,
              scale: isHovering ? 1 : 0.8,
            }}
            transition={{ duration: 0.2 }}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-stone-500"
          >
            <span>Next</span>
            <ArrowUpRight className="w-3 h-3" />
          </motion.div>
        </div>

        {/* Progress Dots */}
        <div className="absolute -bottom-16 left-0 md:left-0 right-0 md:right-auto flex items-center justify-center md:justify-start gap-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                setActiveIndex(index)
              }}
              className="relative p-1 group/dot"
            >
              <span
                className={`
                  block w-2 h-2 rounded-full transition-all duration-300
                  ${
                    index === activeIndex
                      ? "bg-stone-800 scale-100"
                      : "bg-stone-400/30 scale-75 hover:bg-stone-400/50 hover:scale-100"
                  }
                `}
              />
              {index === activeIndex && (
                <motion.span
                  layoutId="activeDot"
                  className="absolute inset-0 border border-stone-800/30 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestimonialsSplit
