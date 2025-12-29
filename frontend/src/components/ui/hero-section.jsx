'use client'

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/App'
import HeroSection3 from '@/components/ui/hero-section-3'

export function HeroSection() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <HeroSection3
      backgroundImage="https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=1920"
      logoText="Adltrack"
      navLinks={[
        { href: "/agencies", label: "Find Care" },
        { href: "/faq", label: "How It Works" },
        { href: "/agencies", label: "Agencies" },
        { href: "/contact", label: "Contact" },
      ]}
      versionText="In-Home Care Marketplace"
      title="Compassionate Care For Your Loved Ones"
      subtitle="Connect with verified, professional in-home care agencies for elderly care, pediatric support, and specialized health services."
      ctaText="Find Care Now"
      ctaLink="/agencies"
      user={user}
      onLogout={handleLogout}
    />
  )
}

export default HeroSection;
