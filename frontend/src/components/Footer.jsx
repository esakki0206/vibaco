import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Gift, Mail, MapPin, Phone, ArrowRight, Heart } from 'lucide-react'
import { Instagram } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

const Footer = () => {
  const year = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <footer className="relative bg-warmgray-900 text-warmgray-300">

      {/* Gold Accent Line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />

      {/* Newsletter Section */}
      <div className="border-b border-warmgray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-serif text-white mb-1">Stay in the Loop</h3>
              <p className="text-warmgray-400 text-sm">Get exclusive offers, gift ideas & new arrivals straight to your inbox.</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex w-full md:w-auto gap-2">
              <div className="relative flex-1 md:w-72">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warmgray-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-warmgray-800 border border-warmgray-700 rounded-xl text-white placeholder:text-warmgray-500 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-burgundy-800 text-white rounded-xl font-medium hover:bg-burgundy-700 transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-burgundy-900/30"
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
                {!subscribed && <ArrowRight size={16} />}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-burgundy-800 to-burgundy-900 flex items-center justify-center shadow-sm">
                <Gift className="text-gold-300" size={18} />
              </div>
              <h2 className="text-xl font-serif font-bold text-white">
                Vibaco Gifts
              </h2>
            </div>
            <p className="text-sm text-warmgray-400 leading-relaxed mb-5">
              Discover thoughtfully curated gifts for every occasion. Premium quality, beautiful wrapping, delivered with love.
            </p>
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

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/products">Shop All Gifts</FooterLink>
              <FooterLink to="/products?category=Birthday Gifts">Birthday Gifts</FooterLink>
              <FooterLink to="/products?category=Wedding Gifts">Wedding Gifts</FooterLink>
              <FooterLink to="/products?category=Anniversary Gifts">Anniversary Gifts</FooterLink>
            </ul>
          </div>

          {/* Gift Categories */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Gift Collections</h3>
            <ul className="space-y-2.5">
              <FooterLink to="/products?category=Personalized Gifts">Personalized Gifts</FooterLink>
              <FooterLink to="/products?category=Luxury Gifts">Luxury Gifts</FooterLink>
              <FooterLink to="/products?category=Gift Hampers">Gift Hampers</FooterLink>
              <FooterLink to="/products?category=Kids Gifts">Kids Gifts</FooterLink>
              <FooterLink to="/products?category=Festival Gifts">Festival Gifts</FooterLink>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Get In Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-warmgray-400">
                <Phone size={16} className="text-gold-500 shrink-0 mt-0.5" />
                <span>+91 7010141064</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-warmgray-400">
                <Mail size={16} className="text-gold-500 shrink-0 mt-0.5" />
                <span>hello@vibacogifts.in</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-warmgray-400">
                <MapPin size={16} className="text-gold-500 shrink-0 mt-0.5" />
                <span>India</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-warmgray-800">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-warmgray-500">
            <p>
              &copy; {year}{' '}
              <span className="text-warmgray-300 font-semibold">Vibaco Gifts</span>. All rights reserved.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-warmgray-500">
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
                  className="h-9 sm:h-10 w-auto hover:opacity-80 transition-opacity brightness-200"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="text-sm text-warmgray-400 hover:text-gold-400 transition-colors duration-200 flex items-center gap-1.5 group"
    >
      <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200 text-gold-500" />
      {children}
    </Link>
  </li>
)

const SocialIcon = ({ icon, href, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-10 h-10 flex items-center justify-center rounded-lg
      bg-warmgray-800 border border-warmgray-700 text-warmgray-400
      shadow-sm transition-all duration-300
      hover:bg-burgundy-800 hover:text-white hover:border-burgundy-700 hover:-translate-y-1 hover:shadow-md"
  >
    {icon}
  </a>
)

export default Footer
