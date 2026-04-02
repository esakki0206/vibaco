import React from 'react'
import { Instagram } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="relative bg-gray-200 border-t border-stone-200">
      
      {/* Top Gradient Accent (Gold/Rose mix for premium feel) */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-rose-400/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* --- Main Content Row --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Brand Section */}
          <div className="text-center md:text-left">
            <h2 className="text-xl font-serif font-bold text-stone-800 tracking-tight">
              Shri Sai Collections
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto md:mx-0 leading-relaxed">
              Discover the finest collection of authentic Kanchipuram & Bridal Silks, crafted for elegance.
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <SocialIcon
              icon={<Instagram size={18} />}
              href="https://www.instagram.com/shri_sai_collections_"
              label="Instagram"
            />
            <SocialIcon
              icon={<FaWhatsapp size={18} />}
              href="https://wa.me/917010141064"
              label="WhatsApp"
            />
          </div>

        </div>

        {/* --- Divider --- */}
        <div className="my-6 h-px bg-stone-200" />

        {/* --- Bottom Row --- */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-stone-500 font-medium">
          
          {/* Copyright */}
          <p>
            &copy; {year}{' '}
            <span className="text-stone-700 font-semibold">
              Shri Sai Collections
            </span>. All rights reserved.
          </p>

          {/* Developer Credit */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-stone-500">
  <span>Designed & Developed by</span>

  <a
    href="https://frontierwox.in"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center"
  >
    <img
      src="/logo.png"
      alt="FrontierWox Tech"
      className="h-9 sm:h-10 w-auto hover:opacity-80 transition-opacity"
    />
  </a>
</div>

        </div>

      </div>
    </footer>
  )
}

// Helper Component for Social Icons
const SocialIcon = ({ icon, href, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-10 h-10 flex items-center justify-center rounded-lg
      bg-white border border-stone-200 text-stone-500
      shadow-sm transition-all duration-300
      hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 hover:-translate-y-1 hover:shadow-md"
  >
    {icon}
  </a>
)

export default Footer
