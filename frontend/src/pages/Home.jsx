import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Truck, ShieldCheck, RefreshCw, CreditCard, ArrowRight,
  Gift, Heart, Star, Sparkles, Package, Clock, Award,
  PartyPopper, Cake, GemIcon, Baby, TreePine, Mail
} from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { productsApi } from '../services/products'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const categories = [
    { id: 'Birthday Gifts', name: 'Birthday Gifts', icon: Cake, color: 'from-pink-500 to-rose-600', desc: 'Make their day special' },
    { id: 'Anniversary Gifts', name: 'Anniversary Gifts', icon: Heart, color: 'from-burgundy-700 to-burgundy-900', desc: 'Celebrate your love' },
    { id: 'Wedding Gifts', name: 'Wedding Gifts', icon: GemIcon, color: 'from-gold-500 to-gold-700', desc: 'Bless the couple' },
    { id: 'Personalized Gifts', name: 'Personalized', icon: Sparkles, color: 'from-purple-500 to-purple-700', desc: 'One of a kind' },
    { id: 'Kids Gifts', name: 'Kids Gifts', icon: Baby, color: 'from-sky-400 to-blue-500', desc: 'Joy for little ones' },
    { id: 'Luxury Gifts', name: 'Luxury Gifts', icon: Award, color: 'from-amber-500 to-amber-700', desc: 'Premium selections' },
    { id: 'Gift Hampers', name: 'Gift Hampers', icon: Package, color: 'from-emerald-500 to-emerald-700', desc: 'Curated collections' },
    { id: 'Festival Gifts', name: 'Festival Gifts', icon: TreePine, color: 'from-teal-500 to-teal-700', desc: 'Seasonal celebrations' },
  ]

  const occasions = [
    { name: 'Birthday', icon: Cake, image: '/homepage.png', color: 'bg-pink-50 text-pink-600 border-pink-100' },
    { name: 'Anniversary', icon: Heart, image: '/silk.png', color: 'bg-burgundy-50 text-burgundy-800 border-burgundy-100' },
    { name: 'Wedding', icon: GemIcon, image: '/salwar.png', color: 'bg-gold-50 text-gold-700 border-gold-200' },
    { name: 'Festivals', icon: PartyPopper, image: '/kurti.png', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  ]

  const testimonials = [
    { name: 'Priya S.', text: 'The gift hamper I ordered for my mom was beautifully curated. The packaging was luxurious and it arrived right on time!', rating: 5, location: 'Chennai' },
    { name: 'Rahul M.', text: 'Found the perfect anniversary gift here. The personalized touch made it extra special. My wife loved it!', rating: 5, location: 'Mumbai' },
    { name: 'Ananya K.', text: 'Best gift shop online! The quality is premium, the wrapping is gorgeous, and their customer service is outstanding.', rating: 5, location: 'Bangalore' },
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

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <div className="min-h-screen bg-cream-50 overflow-x-hidden selection:bg-gold-200 selection:text-burgundy-900">

      {/* ============================================ */}
      {/* 1. HERO SECTION                             */}
      {/* ============================================ */}
      <section className="relative w-full min-h-[90dvh] grid grid-cols-1 md:grid-cols-2">
        {/* Left Content */}
        <div className="relative flex items-center justify-center bg-white px-6 sm:px-12 md:px-16 py-12 md:py-0 order-2 md:order-1">
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-gold-200 rounded-full opacity-30 animate-float" />
          <div className="absolute bottom-20 right-10 w-12 h-12 bg-burgundy-50 rounded-full opacity-40" />

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
              className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-cream-100 text-burgundy-800 font-semibold tracking-widest uppercase text-xs sm:text-sm border border-gold-200 mb-2"
            >
              <Gift className="w-4 h-4 text-gold-500" />
              Premium Gift Store
            </motion.span>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-warmgray-900 leading-[1.1]">
              Find the Perfect <br className="hidden md:block" />
              <span className="italic text-burgundy-800 font-light">Gift for Everyone</span>
            </h1>

            <p className="text-base sm:text-lg text-warmgray-500 leading-relaxed max-w-lg mx-auto">
              Discover our hand-curated collection of premium gifts for every occasion.
              From personalized treasures to luxury hampers, make every moment memorable.
            </p>

            <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/products"
                className="group relative inline-flex items-center justify-center px-10 py-4 bg-burgundy-800 text-white rounded-full overflow-hidden transition-all duration-300 hover:bg-burgundy-900 hover:shadow-xl hover:shadow-burgundy-900/20 hover:-translate-y-1 active:scale-95"
              >
                <span className="relative z-10 font-medium tracking-wide flex items-center">
                  Shop Gifts
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
              <Link
                to="/products?category=Gift Hampers"
                className="group inline-flex items-center justify-center px-10 py-4 bg-transparent text-warmgray-700 rounded-full border-2 border-warmgray-200 hover:border-gold-400 hover:text-burgundy-800 transition-all duration-300"
              >
                <Package className="mr-2 w-5 h-5 text-gold-500" />
                Gift Hampers
              </Link>
            </div>

            {/* Trust badges */}
            <div className="pt-6 flex items-center justify-center gap-6 text-warmgray-400 text-xs">
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> Premium Quality</span>
              <span className="flex items-center gap-1.5"><Gift size={14} className="text-gold-500" /> Gift Wrapping</span>
              <span className="flex items-center gap-1.5"><Truck size={14} className="text-blue-500" /> Fast Delivery</span>
            </div>
          </motion.div>
        </div>

        {/* Right Image */}
        <div className="relative h-[55vh] md:h-auto order-1 md:order-2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent z-10 md:hidden pointer-events-none" />
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2 }}
            src="/homepage.png"
            alt="Premium Gift Collection"
            className="w-full h-full object-cover object-top"
            loading="eager"
          />
          {/* Overlay gradient for elegance */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-burgundy-900/5 pointer-events-none" />
        </div>
      </section>

      {/* ============================================ */}
      {/* 2. FEATURED GIFT CATEGORIES                 */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-gold-600 text-sm font-semibold uppercase tracking-widest">Explore</span>
          <h2 className="text-3xl md:text-4xl font-serif text-warmgray-900 mt-2 mb-4">Gift Categories</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto rounded-full" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <motion.div key={category.id} variants={itemVariants}>
                <Link
                  to={`/products?category=${category.id}`}
                  className="group flex flex-col items-center text-center p-6 md:p-8 bg-white rounded-2xl border border-warmgray-100 hover:border-gold-200 hover:shadow-xl hover:shadow-gold-100/50 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-warmgray-900 mb-1">{category.name}</h3>
                  <p className="text-xs text-warmgray-400 hidden md:block">{category.desc}</p>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* 3. BEST SELLING GIFTS                       */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 bg-white px-4 md:px-12 rounded-t-[3rem] shadow-inner border-t border-warmgray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="text-center md:text-left w-full md:w-auto">
              <span className="text-gold-600 text-sm font-semibold uppercase tracking-widest">Bestsellers</span>
              <h2 className="text-3xl md:text-4xl font-serif text-warmgray-900 mt-1">Trending Gifts</h2>
              <p className="text-warmgray-500 mt-2">Our most loved gift selections this season</p>
            </div>
            <Link to="/products" className="hidden md:flex items-center text-burgundy-800 hover:text-burgundy-900 font-medium transition-colors group">
              View All <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="bg-warmgray-100 aspect-[3/4] rounded-xl w-full"></div>
                  <div className="h-4 bg-warmgray-100 rounded w-3/4"></div>
                  <div className="h-4 bg-warmgray-100 rounded w-1/2"></div>
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
            <Link to="/products" className="inline-flex w-full justify-center items-center px-6 py-3 border border-warmgray-300 rounded-lg text-warmgray-700 font-medium hover:bg-warmgray-50 transition-colors">
              View All Gifts
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 4. SPECIAL OCCASION GIFTS                   */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-cream-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-widest">Occasions</span>
            <h2 className="text-3xl md:text-4xl font-serif text-warmgray-900 mt-2 mb-4">Gifts for Every Occasion</h2>
            <p className="text-warmgray-500 max-w-lg mx-auto">Find the perfect gift tailored to celebrate life's most meaningful moments.</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {occasions.map((occasion, idx) => {
              const Icon = occasion.icon
              return (
                <motion.div
                  key={occasion.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link
                    to={`/products?category=${occasion.name} Gifts`}
                    className="group relative block h-64 md:h-80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                  >
                    <img
                      src={occasion.image}
                      alt={occasion.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end p-5 text-center">
                      <div className={`w-12 h-12 rounded-full ${occasion.color} border flex items-center justify-center mb-3 backdrop-blur-sm bg-opacity-80`}>
                        <Icon size={20} />
                      </div>
                      <h3 className="text-lg md:text-xl font-serif text-white font-semibold">{occasion.name}</h3>
                      <span className="text-white/70 text-xs mt-1 group-hover:text-white transition-colors">
                        Explore Collection
                      </span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 5. GIFT HAMPERS SECTION                     */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 bg-warmgray-900 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-burgundy-800/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center md:text-left"
            >
              <span className="inline-flex items-center gap-2 text-gold-400 text-sm font-semibold uppercase tracking-widest mb-4">
                <Package size={16} /> Curated Collections
              </span>
              <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight mb-6">
                Premium Gift <br />
                <span className="text-gradient-gold">Hampers</span>
              </h2>
              <p className="text-warmgray-400 text-base md:text-lg leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                Beautifully curated gift hampers packed with premium products,
                wrapped elegantly and ready to delight your loved ones.
              </p>
              <Link
                to="/products?category=Gift Hampers"
                className="inline-flex items-center px-8 py-4 bg-gold-500 text-warmgray-900 rounded-full font-semibold hover:bg-gold-400 transition-all duration-300 hover:shadow-xl hover:shadow-gold-500/20 hover:-translate-y-1 active:scale-95"
              >
                Explore Hampers <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
                <img
                  src="/jewels.png"
                  alt="Premium Gift Hampers"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-warmgray-900/30 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 md:-left-8 bg-white rounded-xl p-4 shadow-xl border border-warmgray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold-50 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-gold-600" />
                  </div>
                  <div>
                    <p className="text-xs text-warmgray-500">Starting from</p>
                    <p className="text-lg font-bold text-warmgray-900">$999</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 6. PERSONALIZED GIFTS                       */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-gradient-to-br from-cream-50 via-white to-gold-50/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-white rounded-3xl p-8 md:p-16 border border-gold-100 shadow-lg shadow-gold-100/20 relative overflow-hidden"
          >
            {/* Decorative corners */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-gold-300 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-gold-300 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-gold-300 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-gold-300 rounded-br-lg" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-burgundy-700 to-burgundy-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="w-8 h-8 text-gold-300" />
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-warmgray-900 mb-4">Personalized Gifts</h2>
              <p className="text-warmgray-500 text-base md:text-lg max-w-xl mx-auto mb-8">
                Add a personal touch to make your gift truly one of a kind.
                Custom engravings, photos, names, and messages that create lasting memories.
              </p>
              <Link
                to="/products?category=Personalized Gifts"
                className="inline-flex items-center px-8 py-4 bg-burgundy-800 text-white rounded-full font-medium hover:bg-burgundy-900 transition-all duration-300 hover:shadow-xl hover:shadow-burgundy-900/20 hover:-translate-y-1"
              >
                <Sparkles className="mr-2 w-5 h-5 text-gold-300" /> Explore Personalized Gifts
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 7. CUSTOMER REVIEWS / TESTIMONIALS          */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-serif text-warmgray-900 mt-2 mb-4">What Our Customers Say</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="bg-cream-50 rounded-2xl p-6 md:p-8 border border-warmgray-100 hover:border-gold-200 hover:shadow-lg transition-all duration-300 relative"
              >
                {/* Quote mark */}
                <div className="absolute top-4 right-6 text-6xl font-serif text-gold-200 leading-none select-none">"</div>

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gold-500 fill-gold-500" />
                  ))}
                </div>

                <p className="text-warmgray-600 text-sm md:text-base leading-relaxed mb-6 relative z-10">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-burgundy-200 to-burgundy-300 flex items-center justify-center text-burgundy-800 font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-warmgray-900">{testimonial.name}</p>
                    <p className="text-xs text-warmgray-400">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 8. WHY CHOOSE US                            */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-warmgray-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-widest">Why Us</span>
            <h2 className="text-3xl md:text-4xl font-serif text-warmgray-900 mt-2">Why Choose Vibaco Gifts</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <FeatureCard
              icon={<Truck className="w-6 h-6 md:w-8 md:h-8 text-burgundy-800" />}
              title="Fast Delivery"
              desc="Swift & Reliable Shipping"
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-burgundy-800" />}
              title="Premium Quality"
              desc="Hand-picked & Inspected"
            />
            <FeatureCard
              icon={<Gift className="w-6 h-6 md:w-8 md:h-8 text-burgundy-800" />}
              title="Gift Wrapping"
              desc="Beautiful Presentation"
            />
            <FeatureCard
              icon={<RefreshCw className="w-6 h-6 md:w-8 md:h-8 text-burgundy-800" />}
              title="Easy Returns"
              desc="Hassle-free Policy"
            />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 9. NEWSLETTER SUBSCRIPTION                  */}
      {/* ============================================ */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-r from-burgundy-800 via-burgundy-900 to-warmgray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border border-gold-400 rounded-full" />
          <div className="absolute bottom-10 right-20 w-48 h-48 border border-gold-400 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-gold-400 rounded-full" />
        </div>

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <Mail className="w-10 h-10 text-gold-400 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Stay Inspired</h2>
          <p className="text-burgundy-200 mb-8">
            Subscribe for exclusive gift ideas, early access to new collections, and special offers.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/15 focus:border-gold-400 transition-all backdrop-blur-sm"
            />
            <button
              type="submit"
              className="px-8 py-3.5 bg-gold-500 text-warmgray-900 rounded-full font-semibold hover:bg-gold-400 transition-all shadow-lg whitespace-nowrap"
            >
              {subscribed ? 'Subscribed!' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>

      {/* ============================================ */}
      {/* 10. INSTAGRAM / SOCIAL GALLERY              */}
      {/* ============================================ */}
      <section className="py-16 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-widest">Follow Us</span>
            <h2 className="text-3xl md:text-4xl font-serif text-warmgray-900 mt-2 mb-2">@vibacogifts</h2>
            <p className="text-warmgray-500 text-sm">Follow us for daily gift inspiration</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            {['/homepage.png', '/silk.png', '/salwar.png', '/kurti.png', '/jewels.png'].map((img, idx) => (
              <motion.a
                key={idx}
                href="https://www.instagram.com/shri_sai_collections_"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className={`group relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${idx === 4 ? 'hidden md:block' : ''}`}
              >
                <img src={img} alt="Gift Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-burgundy-900/0 group-hover:bg-burgundy-900/40 transition-colors duration-300 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 11. TRUST SIGNALS (Compact)                 */}
      {/* ============================================ */}
      <section className="py-12 px-4 bg-cream-50 border-t border-warmgray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <FeatureCardCompact
              icon={<CreditCard className="w-6 h-6 md:w-8 md:h-8 text-burgundy-800" />}
              title="Secure Payment"
              desc="100% Safe & Encrypted"
            />
            <FeatureCardCompact
              icon={<Clock className="w-6 h-6 md:w-8 md:h-8 text-burgundy-800" />}
              title="24/7 Support"
              desc="Always Here for You"
            />
            <FeatureCardCompact
              icon={<Award className="w-6 h-6 md:w-8 md:h-8 text-burgundy-800" />}
              title="Best Prices"
              desc="Value for Money"
            />
            <FeatureCardCompact
              icon={<Package className="w-6 h-6 md:w-8 md:h-8 text-burgundy-800" />}
              title="Tracked Shipping"
              desc="Real-time Updates"
            />
          </div>
        </div>
      </section>

    </div>
  )
}

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="flex flex-col items-center text-center p-6 md:p-8 bg-white rounded-2xl border border-warmgray-100 hover:border-gold-200 hover:shadow-lg transition-all duration-300 group"
  >
    <div className="p-3 md:p-4 bg-cream-50 shadow-sm rounded-2xl mb-3 md:mb-4 group-hover:bg-burgundy-50 transition-colors">
      {icon}
    </div>
    <h3 className="text-sm md:text-base font-semibold text-warmgray-900 leading-tight">{title}</h3>
    <p className="text-warmgray-400 text-[10px] md:text-xs mt-1">{desc}</p>
  </motion.div>
)

const FeatureCardCompact = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-warmgray-100/50 shadow-sm">
    <div className="p-2 md:p-3 bg-cream-50 shadow-sm rounded-full mb-2 md:mb-3">
      {icon}
    </div>
    <h3 className="text-sm md:text-base font-semibold text-warmgray-900 leading-tight">{title}</h3>
    <p className="text-warmgray-400 text-[10px] md:text-xs mt-1">{desc}</p>
  </div>
)

export default Home
