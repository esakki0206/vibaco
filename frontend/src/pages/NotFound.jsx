import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ShoppingBag, FileQuestion } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-cream-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full text-center"
      >

        <div className="mx-auto w-24 h-24 bg-burgundy-50 rounded-full flex items-center justify-center mb-6 shadow-sm ring-1 ring-burgundy-100">
          <FileQuestion className="w-10 h-10 text-burgundy-700" />
        </div>

        <h1 className="text-6xl font-serif font-bold text-warmgray-900 mb-2 tracking-tight">
          404
        </h1>
        <h2 className="text-2xl font-medium text-warmgray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-warmgray-500 mb-8 leading-relaxed text-sm sm:text-base">
          Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-burgundy-800 text-white rounded-xl font-medium hover:bg-burgundy-900 transition-all shadow-lg shadow-burgundy-900/20 hover:-translate-y-0.5"
          >
            <Home size={18} />
            Go to Home
          </Link>

          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-warmgray-700 border border-warmgray-200 rounded-xl font-medium hover:bg-burgundy-50 hover:text-burgundy-800 hover:border-burgundy-100 transition-all hover:-translate-y-0.5"
          >
            <ShoppingBag size={18} />
            Browse Gifts
          </Link>
        </div>

      </motion.div>
    </div>
  )
}

export default NotFound
