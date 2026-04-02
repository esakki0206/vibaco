import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext' // Import Context
import { getImageUrl } from '../utils/getImageUrl'

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext) // Get User Role
  
  // Is user a verified reseller?
  const isReseller = user?.role === 'reseller' && user?.resellerStatus === 'approved';
  
  // Does this product have a valid wholesale price?
  const hasWholesalePrice = isReseller && product.wholesalePrice > 0;

  const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(price)

  // Retail customer price (match ProductDetails logic)
  const discountPercentage = product.discountPercentage || 0;
  const basePrice = Number(product.price) || 0;
  const retailCurrentPrice = discountPercentage > 0
    ? Math.round(basePrice * (1 - discountPercentage / 100))
    : basePrice;

  const imageSrc = getImageUrl(product.images?.[0]);
  return (
    <Link to={`/products/${product._id}`} className="group block bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all">
      <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
        <img src={imageSrc} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        
        {/* Reseller Badge */}
        {hasWholesalePrice && (
          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
            Wholesale
          </div>
        )}

        {/* Discount Badge for regular customers */}
        {!hasWholesalePrice && discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm z-10">
            -{discountPercentage}%
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{product.category}</p>
        <h3 className="text-sm font-medium text-slate-900 truncate mb-2">{product.name}</h3>
        
        <div className="flex flex-col">
          {hasWholesalePrice ? (
            // Reseller View
            <>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-emerald-600">{formatPrice(product.wholesalePrice)}</span>
                <span className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-medium">Your B2B Price</p>
            </>
          ) : (
            // Regular User View (match ProductDetails pricing)
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">
                {formatPrice(retailCurrentPrice)}
              </span>
              {discountPercentage > 0 && (
                <span className="text-xs text-slate-400 line-through">
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