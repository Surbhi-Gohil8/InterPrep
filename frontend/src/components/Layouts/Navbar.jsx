import React from 'react'
import ProfileInfoCard from '../Cards/ProfileInfoCard'
import { Link } from 'react-router-dom'
import interprep from '../../assets/logo.svg'

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6 h-16">
        
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center">
          <img
            src={interprep}
            alt="InterPrep Logo"
            className="h-20 md:h-20 w-auto hover:scale-105 transition-transform duration-200"
          />
        </Link>

        {/* Right Section */}
      

          {/* Profile Info */}
          <ProfileInfoCard />
      </div>
    </nav>
  )
}

export default Navbar
