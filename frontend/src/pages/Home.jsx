import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Truck, ShieldCheck, RefreshCw, CreditCard, ArrowRight,
  Video, AlertCircle, Clock, Package
} from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productsApi } from '../services/products'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const categories = [
    { id: 'Sarees', name: 'Sarees', image: '/homepage.png', desc: 'All Saree Collections' },
    { id: 'Pure silk Sarees', name: 'Pure silk Sarees', image: '/silk.png', desc: 'Premium Pure Silk' },
    { id: 'Salwar’s', name: "Salwar’s", image: '/salwar.png', desc: 'Elegant Salwar Sets' },
    { id: 'Kurtis/Readymade', name: 'Kurtis/Readymade', image: '/kurti.png', desc: 'Stylish Ready-to-Wear' },
    { id: 'Jewels', name: 'Jewels', image: '/jewels.png', desc: 'Statement Jewellery' }
  ]

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true)
        const data = await productsApi.getFeaturedProducts(8)
        setFeaturedProducts(data.products || [])
      } catch (error) {
        console.error('Error fetching featured products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <div className="min-h-screen bg-stone-50 overflow-x-hidden selection:bg-rose-100 selection:text-rose-900">

      {/* --- HERO SECTION --- */}
      <section className="relative w-full min-h-[90dvh] grid grid-cols-1 md:grid-cols-2">
        {/* LEFT: CONTENT */}
        <div className="relative flex items-center justify-center bg-white px-6 sm:px-12 md:px-16 py-12 md:py-0 order-2 md:order-1">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-xl space-y-6 text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block py-1.5 px-4 rounded-full bg-rose-50 text-rose-700 font-semibold tracking-widest uppercase text-xs sm:text-sm border border-rose-100 mb-2"
            >
              Saree Collection
            </motion.span>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-slate-900 leading-[1.1]">
              Drape Yourself in <br className="hidden md:block" />
              <span className="italic text-rose-700 font-light">Pure Elegance</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg mx-auto">
              Discover our handpicked collection of authentic Indian sarees,
              blending centuries of tradition with modern aesthetics for the contemporary woman.
            </p>

            <div className="pt-8 flex justify-center">
              <Link
                to="/products"
                className="group relative inline-flex items-center justify-center px-10 py-4 bg-slate-900 text-white rounded-full overflow-hidden transition-all duration-300 hover:bg-rose-700 hover:shadow-xl hover:shadow-rose-900/20 hover:-translate-y-1 active:scale-95"
              >
                <span className="relative z-10 font-medium tracking-wide flex items-center">
                  Shop Collection
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* RIGHT: IMAGE */}
        <div className="relative h-[55vh] md:h-auto order-1 md:order-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent z-10 md:hidden pointer-events-none" />
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2 }}
            src="/homepage.png"
            alt="Beautiful Saree Collection"
            className="w-full h-full object-cover object-top"
            loading="eager"
          />
        </div>
      </section>

      {/* --- CATEGORIES SECTION --- */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-[1600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif text-slate-900 mb-4">Curated by Category</h2>
          <div className="w-24 h-1 bg-rose-600 mx-auto rounded-full" />
        </motion.div>

        {/* The "One-Line" Container */}
        <div className="flex flex-row gap-3 md:gap-4 overflow-x-auto no-scrollbar">
          {categories.map((category) => (
            <Link
              to={`/products?category=${category.id}`}
              key={category.id}
              className="relative flex-none w-[calc(50%-6px)] md:w-[calc(20%-13px)] group overflow-hidden rounded-2xl h-72 md:h-[450px] shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/20 transition-colors z-10" />
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                loading="lazy"
              />
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 md:p-6 bg-gradient-to-t from-black/80 via-black/10 to-transparent">
                <h3 className="text-lg md:text-xl font-serif text-white mb-1">
                  {category.name}
                </h3>
                <p className="text-slate-200 text-[10px] md:text-xs opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  {category.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- FEATURED PRODUCTS --- */}
      <section className="py-16 md:py-24 bg-white px-4 md:px-12 rounded-t-[3rem] shadow-inner border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="text-center md:text-left w-full md:w-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-slate-900">Trending Now</h2>
              <p className="text-slate-500 mt-2">Our most loved selections this season</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center text-rose-600 hover:text-rose-800 font-medium transition-colors group">
              View All <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="bg-slate-200 aspect-[3/4] rounded-xl w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {featuredProducts.map(product => (
                <motion.div key={product._id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="mt-12 text-center md:hidden">
            <Link to="/products" className="inline-flex w-full justify-center items-center px-6 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* --- IMPORTANT INFORMATION (RETURNS & TRACKING) --- */}
      <section className="py-16 px-4 bg-stone-100/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-serif text-slate-900">Good to Know</h2>
            <p className="text-slate-500 mt-1">Our policies designed for your peace of mind</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {/* Returns & Replacement Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-rose-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <RefreshCw className="w-24 h-24 text-rose-500" />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-rose-50 rounded-full text-rose-600">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Returns & Replacements</h3>
              </div>

              <ul className="space-y-4 text-slate-600 text-sm md:text-base leading-relaxed">
                <li className="flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Quality Checked:</strong> We inspect every product 100% before packing. Returns are available only for damage or incorrect products.
                  </span>
                </li>
                <li className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Mandatory Unboxing Video:</strong> A full parcel opening video (unboxing the saree clearly) is <span className="underline decoration-rose-300 decoration-2 font-medium">required</span> for any claims.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 flex items-center justify-center font-bold text-rose-400 shrink-0">•</span>
                  <span>
                    <strong>Exceptions:</strong> Returns are not accepted for personal dislike, slight color variations, or common thread pulls in woven products.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 flex items-center justify-center font-bold text-rose-400 shrink-0">•</span>
                  <span>
                    <strong>Process:</strong> Customers must ship the product to our address for a replacement.
                  </span>
                </li>
              </ul>
            </div>

            {/* Tracking & Shipping Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Truck className="w-24 h-24 text-slate-500" />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-slate-100 rounded-full text-slate-700">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Shipping & Tracking</h3>
              </div>

              <ul className="space-y-4 text-slate-600 text-sm md:text-base leading-relaxed">
                <li className="flex gap-3">
                  <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dispatch Time:</strong> Orders are dispatched within 48 hours on working days.
                  </span>
                </li>
                <li className="flex gap-3">
                  <Truck className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Delivery:</strong> Expected delivery is 3-10 working days across India. Pre-booking timelines will be communicated during booking.
                  </span>
                </li>
                <li className="flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Tracking Safety:</strong> Tracking updates may vary by supplier, but your money is always safe with us even if tracking details are delayed.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- TRUST SIGNALS (Compact) --- */}
      <section className="py-12 px-4 bg-white border-t border-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <FeatureCard
              icon={<Truck className="w-6 h-6 md:w-8 md:h-8 text-rose-600" />}
              title="Fast Shipping"
              desc="Door Delivery"
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-rose-600" />}
              title="Quality First"
              desc="Hand-checked"
            />
            <FeatureCard
              icon={<RefreshCw className="w-6 h-6 md:w-8 md:h-8 text-rose-600" />}
              title="Exciting Offers"
              desc="Regular Discounts"
            />
            <FeatureCard
              icon={<CreditCard className="w-6 h-6 md:w-8 md:h-8 text-rose-600" />}
              title="Secure Pay"
              desc="100% Safe"
            />
          </div>
        </div>
      </section>

    </div>
  )
}

// Compact Feature Card
const FeatureCard = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center p-4 bg-stone-50 rounded-xl border border-stone-100/50">
    <div className="p-2 md:p-3 bg-white shadow-sm rounded-full mb-2 md:mb-3">
      {icon}
    </div>
    <h3 className="text-sm md:text-base font-semibold text-slate-900 leading-tight">{title}</h3>
    <p className="text-slate-500 text-[10px] md:text-xs mt-1">{desc}</p>
  </div>
)

export default Home