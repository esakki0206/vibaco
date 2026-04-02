import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return {
    cart: context.cart,
    addToCart: context.addToCart,
    removeFromCart: context.removeFromCart,
    updateQuantity: context.updateQuantity,
    clearCart: context.clearCart,
    itemCount: context.itemCount
  };
};
