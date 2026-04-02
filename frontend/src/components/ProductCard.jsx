import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Gift } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { getImageUrl } from '../utils/getImageUrl'

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext)

  const isReseller = user?.role === 'reseller' && user?.resellerStatus === 'approved';
  const hasWholesalePrice = isReseller && product.wholesalePrice > 0;

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(price)

  const discountPercentage = product.discountPercentage || 0;
  const basePrice = Number(product.price) || 0;
  const retailCurrentPrice = discountPercentage > 0
    ? Math.round(basePrice * (1 - discountPercentage / 100))
    : basePrice;

  const imageSrc = getImageUrl(product.images?.[0]);

  return (
    <Link to={`/products/${product._id}`} className="group block bg-white rounded-2xl border border-warmgray-100 overflow-hidden hover:shadow-xl hover:shadow-warmgray-200/50 hover:border-gold-200 transition-all duration-500 hover:-translate-y-1">
      <div className="relative aspect-[3/4] bg-warmgray-50 overflow-hidden">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-warmgray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick view hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-warmgray-800 text-xs font-medium px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 shadow-sm">
          <Gift size={12} className="text-burgundy-700" /> View Details
        </div>

        {/* Reseller Badge */}
        {hasWholesalePrice && (
          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-sm">
            Wholesale
          </div>
        )}

        {/* Discount Badge */}
        {!hasWholesalePrice && discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-burgundy-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm z-10">
            -{discountPercentage}%
          </div>
        )}
      </div>

      <div className="p-3 md:p-4">
        <p className="text-[10px] font-bold text-warmgray-400 uppercase tracking-wider truncate">{product.category}</p>
        <h3 className="text-sm font-medium text-warmgray-900 truncate mb-2 group-hover:text-burgundy-800 transition-colors">{product.name}</h3>

        <div className="flex flex-col">
          {hasWholesalePrice ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-emerald-600">{formatPrice(product.wholesalePrice)}</span>
                <span className="text-xs text-warmgray-400 line-through">{formatPrice(product.price)}</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-medium">Your B2B Price</p>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-warmgray-900">
                {formatPrice(retailCurrentPrice)}
              </span>
              {discountPercentage > 0 && (
                <span className="text-xs text-warmgray-400 line-through">
                  {formatPrice(basePrice)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
