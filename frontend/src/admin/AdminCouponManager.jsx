import React, { useState, useEffect } from 'react';
import { 
  Ticket, Plus, Trash2, Calendar, Search, 
  CheckCircle, XCircle, Loader2, Package, Copy, ArrowRight, X, Eye 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { adminApi } from '../services/admin';
import { productsApi } from '../services/products';

const AdminCouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCoupon, setCreatedCoupon] = useState(null);
  const [viewingCoupon, setViewingCoupon] = useState(null);

  const initialFormState = {
    code: '',
    discountPercentage: '',
    scope: 'all',
    applicableProducts: [],
    minOrderValue: 0,
    expirationDate: ''
  };

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [couponRes, productRes] = await Promise.all([
  adminApi.getCoupons(),
  productsApi.getProducts()
]);


setCoupons(couponRes?.coupons || couponRes || []);
setProducts(productRes?.products || productRes || []);

    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!form.code || !form.discountPercentage || !form.expirationDate) {
      toast.error('Please fill all required fields');
      return;
    }

    if (form.scope === 'specific' && form.applicableProducts.length === 0) {
      toast.error('Please select at least one product for specific scope');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await adminApi.createCoupon(form);
      await fetchData(); 
      setCreatedCoupon(response.coupon || form);
      toast.success('Coupon Created Successfully!');
    } catch (error) {
      console.error('Create error:', error);
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, code) => {
    if(!window.confirm(`Delete coupon "${code}" permanently? This action cannot be undone.`)) return;
    
    try {
      await adminApi.deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c._id !== id));
      toast.success(`Coupon "${code}" deleted successfully`);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setCreatedCoupon(null);
      setForm(initialFormState);
    }, 300);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Code copied to clipboard!');
  };

  const toggleProductSelection = (id) => {
    setForm(prev => {
      const exists = prev.applicableProducts.includes(id);
      if (exists) {
        return { ...prev, applicableProducts: prev.applicableProducts.filter(p => p !== id) };
      }
      return { ...prev, applicableProducts: [...prev.applicableProducts, id] };
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getProductNames = (productIds) => {
    if (!productIds || productIds.length === 0) return [];
    return productIds.map(id => {
      const product = products.find(p => p._id === id);
      return product ? product.name : 'Unknown Product';
    });
  };

  // --- Helper: Date Logic Corrected ---
  // Returns TRUE if the coupon is strictly expired (Yesterday or before)
  const checkIsExpired = (dateString) => {
    const expiry = new Date(dateString);
    // Set expiry to the very end of that day (23:59:59)
    expiry.setHours(23, 59, 59, 999);
    return expiry < new Date(); 
  };

  // --- Filter & Sort Logic ---
  const filteredCoupons = coupons
    .filter(coupon => 
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort: Active first, then Expired
      const aExpired = checkIsExpired(a.expirationDate);
      const bExpired = checkIsExpired(b.expirationDate);
      if (aExpired === bExpired) {
        // If status is same, sort by newest creation (assuming _id is time-sortable or use logic)
        return new Date(b.expirationDate) - new Date(a.expirationDate);
      }
      return aExpired ? 1 : -1; 
    });

  // Calculate stats based on corrected logic
  const activeCount = coupons.filter(c => !checkIsExpired(c.expirationDate)).length;
  const expiredCount = coupons.filter(c => checkIsExpired(c.expirationDate)).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
              <Ticket className="text-rose-600" /> Coupon Manager
            </h1>
            <p className="text-slate-500 mt-1">Manage discount codes and promotional offers</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-900/20 active:scale-95"
          >
            <Plus size={20} /> Create New Coupon
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search coupons by code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Coupon List Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-rose-600">
              <Loader2 className="animate-spin w-8 h-8 mb-4" />
              <p className="text-slate-500">Loading coupons...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Coupon Code</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Discount</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Scope</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Min Order</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Valid Until</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCoupons.length > 0 ? filteredCoupons.map(coupon => {
                    const isExpired = checkIsExpired(coupon.expirationDate);
                    
                    // Logic to calculate days remaining (inclusive of today)
                    const expiryDate = new Date(coupon.expirationDate);
                    expiryDate.setHours(23, 59, 59, 999);
                    const now = new Date();
                    const diffTime = expiryDate - now;
                    const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    return (
                      <tr key={coupon._id} className={`transition-colors group ${isExpired ? 'bg-slate-50/30' : 'hover:bg-slate-50/50'}`}>
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className={`font-mono font-bold px-3 py-1.5 rounded-md inline-block border transition-colors ${
                                isExpired 
                                ? 'text-slate-500 bg-slate-100 border-slate-200' 
                                : 'text-slate-800 bg-white border-slate-200 group-hover:border-slate-300 shadow-sm'
                              }`}>
                              {coupon.code}
                            </div>
                            <button 
                              onClick={() => copyToClipboard(coupon.code)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Copy code"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="p-5">
                          <span className={`font-bold text-lg ${isExpired ? 'text-slate-500' : 'text-rose-600'}`}>
                            {coupon.discountPercentage}%
                          </span>
                          <span className="text-slate-400 text-sm ml-1">OFF</span>
                        </td>
                        <td className="p-5">
                          {coupon.scope === 'all' 
                            ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                                <Package size={12} /> All Products
                              </span>
                            : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-100">
                                <Ticket size={12} /> {coupon.applicableProducts?.length || 0} Product{coupon.applicableProducts?.length !== 1 ? 's' : ''}
                              </span>
                          }
                        </td>
                        <td className="p-5 text-sm text-slate-600">
                          {coupon.minOrderValue > 0 ? formatPrice(coupon.minOrderValue) : 'None'}
                        </td>
                        <td className="p-5">
                          <div className={`text-sm font-medium ${isExpired ? 'text-slate-400' : 'text-slate-900'}`}>
                            {new Date(coupon.expirationDate).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </div>
                          {!isExpired && daysUntilExpiry <= 7 && daysUntilExpiry >= 0 && (
                            <div className="text-xs text-amber-600 mt-0.5 font-semibold">
                              {daysUntilExpiry === 0 ? 'Expires Today' : `${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} left`}
                            </div>
                          )}
                        </td>
                        <td className="p-5">
                          {isExpired
                            ? <span className="inline-flex items-center gap-1.5 text-slate-500 text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                                <XCircle size={14}/> Expired
                              </span>
                            : <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                <CheckCircle size={14}/> Active
                              </span>
                          }
                        </td>
                        <td className="p-5">
                          <div className="flex items-center justify-end gap-2">
                            {coupon.scope === 'specific' && coupon.applicableProducts?.length > 0 && (
                              <button 
                                onClick={() => setViewingCoupon(coupon)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="View Products"
                              >
                                <Eye size={18} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(coupon._id, coupon.code)} 
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Coupon"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan="7" className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <Ticket className="w-12 h-12 mb-4 opacity-20" />
                          <p className="text-lg font-medium text-slate-600">
                            {searchTerm ? 'No coupons found' : 'No coupons found'}
                          </p>
                          <p className="text-sm">
                            {searchTerm ? 'Try a different search term' : 'Create your first discount code to get started'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Coupon Stats */}
        {!loading && coupons.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-sm text-slate-500 mb-1">Total Coupons</div>
              <div className="text-2xl font-bold text-slate-900">{coupons.length}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-200">
              <div className="text-sm text-emerald-600 mb-1">Active Coupons</div>
              <div className="text-2xl font-bold text-emerald-700">
                {activeCount}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-sm text-slate-500 mb-1">Expired Coupons</div>
              <div className="text-2xl font-bold text-slate-400">
                {expiredCount}
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                  <h2 className="text-xl font-bold text-slate-900">
                    {createdCoupon ? 'Coupon Activated' : 'Create New Coupon'}
                  </h2>
                  <button onClick={handleCloseModal} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {createdCoupon ? (
                      <motion.div 
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-8 flex flex-col items-center text-center"
                      >
                        <motion.div 
                          initial={{ scale: 0 }} animate={{ scale: 1 }} 
                          className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6"
                        >
                          <CheckCircle size={40} strokeWidth={3} />
                        </motion.div>
                        
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Success!</h3>
                        <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                          The coupon has been created and is now active for customers.
                        </p>

                        <div className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 mb-8 relative group">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Coupon Code</p>
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-3xl font-mono font-bold text-slate-900 tracking-wider">
                              {createdCoupon.code}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(createdCoupon.code)}
                              className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm"
                              title="Copy Code"
                            >
                              <Copy size={18} />
                            </button>
                          </div>
                          <div className="mt-4 flex justify-center gap-4 text-sm font-medium flex-wrap">
                            <span className="text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                              {createdCoupon.discountPercentage}% OFF
                            </span>
                            <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full capitalize">
                              {createdCoupon.scope === 'all' ? 'All Products' : `${createdCoupon.applicableProducts?.length || 0} Product(s)`}
                            </span>
                          </div>
                        </div>

                        <button 
                          onClick={handleCloseModal}
                          className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                          Done <ArrowRight size={18} />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-6 space-y-5"
                      >
                        <form id="couponForm" onSubmit={handleCreate} className="space-y-5">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                              Coupon Code <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input 
                                required
                                autoFocus
                                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono text-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:normal-case placeholder:text-slate-400"
                                placeholder="e.g. SUMMER25"
                                value={form.code}
                                onChange={e => setForm({...form, code: e.target.value.toUpperCase()})}
                              />
                              <div className="absolute right-4 top-3.5 text-slate-400">
                                <Ticket size={20} />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-5">
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Discount % <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <input 
                                  type="number" required min="1" max="100"
                                  className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                                  placeholder="0"
                                  value={form.discountPercentage}
                                  onChange={e => setForm({...form, discountPercentage: e.target.value})}
                                />
                                <span className="absolute right-3 top-2.5 text-slate-400 text-sm font-bold">%</span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Min Order (₹)</label>
                              <input 
                                type="number" min="0"
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                                placeholder="0"
                                value={form.minOrderValue}
                                onChange={e => setForm({...form, minOrderValue: e.target.value})}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                              Expiration Date <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="date" required
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all text-slate-600"
                              value={form.expirationDate}
                              onChange={e => setForm({...form, expirationDate: e.target.value})}
                            />
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Applicable To</label>
                            <div className="flex gap-4">
                              <label className={`flex-1 flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form.scope === 'all' ? 'bg-white border-rose-500 shadow-sm' : 'border-transparent hover:bg-white'}`}>
                                <input 
                                  type="radio" name="scope" 
                                  className="w-4 h-4 text-rose-600 border-slate-300 focus:ring-rose-500"
                                  checked={form.scope === 'all'} 
                                  onChange={() => setForm({...form, scope: 'all', applicableProducts: []})}
                                />
                                <span className="text-sm font-medium text-slate-700">All Products</span>
                              </label>
                              <label className={`flex-1 flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form.scope === 'specific' ? 'bg-white border-rose-500 shadow-sm' : 'border-transparent hover:bg-white'}`}>
                                <input 
                                  type="radio" name="scope" 
                                  className="w-4 h-4 text-rose-600 border-slate-300 focus:ring-rose-500"
                                  checked={form.scope === 'specific'} 
                                  onChange={() => setForm({...form, scope: 'specific'})}
                                />
                                <span className="text-sm font-medium text-slate-700">Specific Items</span>
                              </label>
                            </div>

                            <AnimatePresence>
                              {form.scope === 'specific' && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-3 bg-white border border-slate-200 rounded-lg max-h-40 overflow-y-auto p-2 custom-scrollbar">
                                    <p className="text-xs text-slate-400 mb-2 px-2">
                                      Select eligible products ({form.applicableProducts.length} selected):
                                    </p>
                                    {products.length > 0 ? products.map(p => (
                                      <label key={p._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md cursor-pointer group">
                                        <input 
                                          type="checkbox" 
                                          className="rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                                          checked={form.applicableProducts.includes(p._id)}
                                          onChange={() => toggleProductSelection(p._id)}
                                        />
                                        <span className="text-sm text-slate-600 group-hover:text-slate-900 truncate flex-1">{p.name}</span>
                                      </label>
                                    )) : (
                                      <p className="text-xs text-slate-400 p-2 text-center">No products available</p>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!createdCoupon && (
                  <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
                    <button 
                      onClick={handleCloseModal}
                      className="flex-1 py-3 text-slate-600 font-medium hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-200"
                      type="button"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" form="couponForm"
                      disabled={isSubmitting}
                      className="flex-[2] py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <Plus size={18} />}
                      Create Coupon
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* View Products Modal */}
        <AnimatePresence>
          {viewingCoupon && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Applicable Products
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Coupon:{" "}
                      <span className="font-mono font-bold text-slate-700">
                        {viewingCoupon.code}
                      </span>
                    </p>
                  </div>
                  <button 
                    onClick={() => setViewingCoupon(null)} 
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 max-h-80 overflow-y-auto custom-scrollbar">
                  {viewingCoupon.applicableProducts?.length > 0 ? (
                    <ul className="space-y-2">
                      {getProductNames(viewingCoupon.applicableProducts).map((name, index) => (
                        <li 
                          key={index}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700"
                        >
                          <Package size={16} className="text-slate-400" />
                          <span className="truncate">{name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-sm text-slate-500 py-8">
                      No products linked to this coupon
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50">
                  <button
                    onClick={() => setViewingCoupon(null)}
                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div> 
  );
};

export default AdminCouponManager;