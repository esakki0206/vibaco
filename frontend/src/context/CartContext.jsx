import React, { createContext, useState, useCallback, useEffect, useContext, useRef } from 'react';
import { cartApi } from '../services/cart';
import { AuthContext } from './AuthContext';
import { getImageUrl } from '../utils/getImageUrl';
import toast from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [], totalAmount: 0, totalItems: 0, subtotal: 0, totalShipping: 0, totalTax: 0 });
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);

  // ✅ HELPER: Calculate Totals for Guest Cart
  const calculateTotals = (items) => {
    // 1. Subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // 2. Shipping
    const totalShipping = items.reduce((sum, item) => {
      // Use stored shipping cost per item
      return sum + ((item.shippingCost || 0) * item.quantity);
    }, 0);

    // 3. Tax
    const totalTax = items.reduce((sum, item) => {
      const lineTotal = item.price * item.quantity;
      const taxRate = item.taxPercentage || 0;
      return sum + ((lineTotal * taxRate) / 100);
    }, 0);
    
    // 4. Grand Total
    const totalAmount = subtotal + totalShipping + totalTax;

    return { 
      items, 
      totalItems,
      subtotal: Math.round(subtotal * 100) / 100,
      totalShipping: Math.round(totalShipping * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100
    };
  };

  const syncGuestCart = async () => {
    const saved = localStorage.getItem('guestCart');
    if (!saved) return;
    try {
      const guestData = JSON.parse(saved);
      if (guestData.items?.length > 0) {
        const guestCartItems = guestData.items.map((item) => ({
          product: item.product?._id || item.product,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        }));
        await cartApi.mergeCart(guestCartItems);
        localStorage.removeItem('guestCart');
      }
    } catch (error) {
      console.error('Failed to sync guest cart:', error);
    }
  };

  const fetchCart = useCallback(async () => {
    setLoading(true);
    if (user) {
      try {
        if (localStorage.getItem('guestCart')) {
          await syncGuestCart();
        }
        const data = await cartApi.getCart();
        setCart(data.cart || { items: [], totalAmount: 0, totalItems: 0, subtotal: 0, totalShipping: 0, totalTax: 0 });
      } catch (error) {
        console.error('Failed to fetch user cart', error);
      }
    } else {
      const saved = localStorage.getItem('guestCart');
      if (saved) {
        setCart(JSON.parse(saved));
      } else {
        setCart({ items: [], totalAmount: 0, totalItems: 0, subtotal: 0, totalShipping: 0, totalTax: 0 });
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!user && !isFirstRender.current) {
      localStorage.setItem('guestCart', JSON.stringify(cart));
    }
    isFirstRender.current = false;
  }, [cart, user]);

  const addToCart = useCallback(async (productData, quantity = 1) => {
    const productId = productData.product || productData._id;
    const size = productData.selectedSize || productData.sizes?.[0] || 'Free Size';
    const color = productData.selectedColor || productData.colors?.[0] || 'Standard';

    const isReseller = user?.role === 'reseller';
    
    // --- 1. Price Calculation ---
    let priceToUse;
    if (isReseller) {
      priceToUse = productData.wholesalePrice > 0 
        ? Number(productData.wholesalePrice) 
        : Number(productData.price);
    } else {
      const hasDiscount = productData.discountPercentage > 0;
      priceToUse = hasDiscount 
        ? productData.price * (1 - productData.discountPercentage / 100) 
        : productData.price;
    }
    priceToUse = Math.round(Number(priceToUse));

    // --- 2. Logistics Info Extraction (For Guest Calculation) ---
    let logistics;
    if (isReseller) {
       logistics = productData.wholesale || { shippingCost: 0, taxPercentage: 0 };
    } else {
       logistics = productData.retail || { shippingCost: 0, taxPercentage: 0 };
    }
    const shippingCost = Number(logistics.shippingCost || 0);
    const taxPercentage = Number(logistics.taxPercentage || 0);

    // Resolve the color-specific image (for display in cart/checkout)
    let selectedColorImage = null;
    if (productData.colorImages?.length > 0 && color) {
      const entry = productData.colorImages.find(ci => ci.color === color);
      if (entry?.image?.url) selectedColorImage = entry.image.url;
    }
    if (!selectedColorImage) {
      selectedColorImage = getImageUrl(productData.images?.[0]);
    }

    if (user) {
      try {
        const payload = {
          product: productId,
          quantity,
          selectedSize: size,
          selectedColor: color
        };
        const data = await cartApi.addToCart(payload, quantity);
        setCart(data.cart);
        toast.success(isReseller ? 'Added to wholesale order' : 'Added to cart');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to add item');
      }
    } else {
      // Guest logic: Store Price, Logistics, AND color-specific image
      setCart(prev => {
        const existingItemIndex = prev.items.findIndex(item =>
          item.product._id === productId &&
          item.selectedColor === color &&
          item.selectedSize === size
        );

        let newItems = [...prev.items];

        if (existingItemIndex > -1) {
          newItems[existingItemIndex].quantity += quantity;
          newItems[existingItemIndex].price = priceToUse;
          newItems[existingItemIndex].shippingCost = shippingCost;
          newItems[existingItemIndex].taxPercentage = taxPercentage;
          newItems[existingItemIndex].selectedColorImage = selectedColorImage;
        } else {
          newItems.push({
            _id: Date.now().toString(),
            product: { ...productData, _id: productId },
            quantity,
            price: priceToUse,
            selectedSize: size,
            selectedColor: color,
            selectedColorImage,
            shippingCost,
            taxPercentage
          });
        }
        return calculateTotals(newItems);
      });
      toast.success('Added to bag');
    }
  }, [user]);

  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    if (quantity <= 0) return;

    if (user) {
      try {
        const data = await cartApi.updateCartItem(cartItemId, quantity);
        setCart(data.cart);
      } catch (error) {
        toast.error('Failed to update quantity');
      }
    } else {
      setCart(prev => {
        const newItems = prev.items.map(item => 
          item._id === cartItemId ? { ...item, quantity } : item
        );
        return calculateTotals(newItems);
      });
    }
  }, [user]);

  const removeFromCart = useCallback(async (cartItemId) => {
    if (user) {
      try {
        const data = await cartApi.removeFromCart(cartItemId);
        setCart(data.cart);
        toast.success('Item removed');
      } catch (error) {
        toast.error('Failed to remove item');
      }
    } else {
      setCart(prev => {
        const newItems = prev.items.filter(item => item._id !== cartItemId);
        return calculateTotals(newItems);
      });
      toast.success('Item removed');
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    if (user) {
      try {
        await cartApi.clearCart();
        setCart({ items: [], totalAmount: 0, totalItems: 0, subtotal: 0, totalShipping: 0, totalTax: 0 });
      } catch (error) {
        console.error(error);
      }
    } else {
      setCart({ items: [], totalAmount: 0, totalItems: 0, subtotal: 0, totalShipping: 0, totalTax: 0 });
      localStorage.removeItem('guestCart');
    }
  }, [user]);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart, 
    itemCount: cart?.totalItems || 0,
    loading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};