import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Download, RefreshCw, Calendar, CreditCard,
  CheckCircle, Clock, Truck, AlertTriangle,
  Building2, User, Package, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { adminApi } from '../services/admin';

// --- Configuration ---
const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' }
];

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

const OrderManagement = () => {
  // --- State ---
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pendingAction: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Auto-polling ref to track interval
  const pollingRef = useRef(null);
  const isInitialLoad = useRef(true);

  // Filters
  const [orderType, setOrderType] = useState('retail'); // 'retail' | 'wholesale'
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ MODAL STATE
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    orderId: null,
    newStatus: '',
    currentStatus: ''
  });

  // ✅ TRACKING INFO STATE
  const [trackingData, setTrackingData] = useState({
    courierName: '',
    trackingId: ''
  });

  // --- Debounce Search ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // --- Data Fetching ---
  const fetchData = useCallback(async (silent = false) => {
    try {
      // Only show skeleton on initial load, not on polls/refreshes
      if (!silent && isInitialLoad.current) {
        setLoading(true);
      }

      const params = {
        page,
        limit: 10,
        search: debouncedSearch,
        status: activeTab === 'all' ? undefined : activeTab,
        role: orderType === 'wholesale' ? 'reseller' : 'user'
      };

      const data = await adminApi.getOrders(params);
      const allOrders = data.orders || [];

      setOrders(allOrders);
      setTotalPages(Math.ceil((data.total || 0) / 10));

      const completedRevenue = allOrders
        .filter(o => o.status === 'delivered')
        .reduce((acc, curr) => acc + curr.totalAmount, 0);

      const pendingCount = allOrders
        .filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
        .length;

      setStats({
        total: data.total || 0,
        pendingAction: pendingCount,
        revenue: completedRevenue
      });

    } catch (error) {
      console.error('Fetch Error:', error);
      // Only show toast on non-silent fetches to avoid spamming
      if (!silent) {
        toast.error('Failed to load orders');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      isInitialLoad.current = false;
    }
  }, [page, debouncedSearch, activeTab, orderType]);

  // Initial fetch + re-fetch when filters change
  useEffect(() => {
    isInitialLoad.current = true;
    fetchData();
  }, [fetchData]);

  // Auto-polling: silently refetch every 30 seconds
  useEffect(() => {
    // Clear any existing interval
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(() => {
      fetchData(true); // silent = true → no skeleton, no error toast
    }, 30000);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(false); // explicit refresh — not silent, but won't show skeleton
  };

  // --- Status Update Actions ---
  const requestStatusUpdate = (orderId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;

    // Reset tracking data when opening modal
    setTrackingData({ courierName: '', trackingId: '' });

    setConfirmModal({
      isOpen: true,
      orderId,
      currentStatus,
      newStatus
    });
  };

  const executeStatusUpdate = async () => {
    const { orderId, newStatus } = confirmModal;
    if (!orderId) return;

    // Validate if status is 'shipped' - Works for BOTH Retail and Wholesale
    if (newStatus === 'shipped') {
      if (!trackingData.courierName.trim()) {
        toast.error('Please enter Courier Name');
        return;
      }
      if (!trackingData.trackingId.trim()) {
        toast.error('Please enter Tracking ID');
        return;
      }
    }

    const toastId = toast.loading('Updating status...');
    try {
      const payload = {
        status: newStatus,
        // Only send tracking info if status is shipped
        ...(newStatus === 'shipped' && {
          courierName: trackingData.courierName,
          trackingId: trackingData.trackingId
        })
      };

      await adminApi.updateOrderStatus(orderId, payload);

      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      fetchData(true); // silent refetch — don't flash skeleton after status update
      toast.success(`Order marked as ${newStatus}`, { id: toastId });
      setConfirmModal({ isOpen: false, orderId: null, newStatus: '', currentStatus: '' });
    } catch (error) {
      toast.error('Update failed', { id: toastId });
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">Order Management</h1>
            <p className="text-slate-500 text-sm mt-1">Track and manage customer orders efficiently.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm hover:shadow-md"
              title="Refresh Data"
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* --- Market View Toggle --- */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex">
            <button
              onClick={() => { setOrderType('retail'); setPage(1); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${orderType === 'retail'
                ? 'bg-rose-50 text-rose-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <User size={18} /> Retail Orders
            </button>
            <button
              onClick={() => { setOrderType('wholesale'); setPage(1); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${orderType === 'wholesale'
                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <Building2 size={18} /> Wholesale Orders
            </button>
          </div>
        </div>

        {/* --- Stats Overview --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Orders" value={stats.total} icon={<CheckCircle size={22} />} color={orderType === 'wholesale' ? 'indigo' : 'blue'} />
          <StatCard label="Pending Action" value={stats.pendingAction} icon={<Clock size={22} />} color="amber" />
          <StatCard label="Completed Revenue" value={formatPrice(stats.revenue)} icon={<CreditCard size={22} />} color="emerald" />
        </div>

        {/* --- Controls Section --- */}
        <div className="bg-white rounded-t-2xl border border-slate-200 border-b-0 flex flex-col lg:flex-row items-center justify-between gap-4 p-4">

          {/* Status Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-slate-100 text-slate-900 font-semibold ring-1 ring-slate-200'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder={orderType === 'wholesale' ? "Search business, GST, order ID..." : "Search customer, email, order ID..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all text-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* --- Orders Table --- */}
        <div className="bg-white rounded-b-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <TableSkeleton />
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <div className="bg-slate-50 p-4 rounded-full mb-4">
                <Filter size={32} className="opacity-50" />
              </div>
              <p className="text-lg font-medium text-slate-600">No {orderType} orders found</p>
              <p className="text-sm">Try changing filters or search terms</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Order ID</th>
                    <th className="px-6 py-4 whitespace-nowrap">Date</th>

                    {/* DYNAMIC HEADER BASED ON VIEW */}
                    {orderType === 'wholesale' ? (
                      <th className="px-6 py-4 whitespace-nowrap">Business Profile</th>
                    ) : (
                      <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                    )}

                    <th className="px-6 py-4 whitespace-nowrap">Total</th>
                    <th className="px-6 py-4 whitespace-nowrap">Payment</th>
                    <th className="px-8 py-4 whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 whitespace-nowrap text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {orders.map((order) => (
                      <OrderRow
                        key={order._id}
                        order={order}
                        type={orderType}
                        formatDate={formatDate}
                        formatPrice={formatPrice}
                        onRequestUpdate={requestStatusUpdate}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && orders.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-sm text-slate-500 font-medium order-2 sm:order-1">
                Page <span className="font-bold text-slate-900">{page}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
              </span>
              <div className="order-1 sm:order-2">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ CONFIRMATION MODAL WITH COURIER INPUTS */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200"
          >
            <div className="p-6">

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${confirmModal.newStatus === 'shipped' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                    {confirmModal.newStatus === 'shipped' ? <Truck size={24} /> : <AlertTriangle size={24} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {confirmModal.newStatus === 'shipped' ? 'Shipment Details' : 'Confirm Update?'}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Changing status to <span className="font-semibold text-rose-600 uppercase">{confirmModal.newStatus}</span>
                    </p>
                  </div>
                </div>
                <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>

              {/* ✅ COURIER INPUTS (Visible for ALL orders if status is 'shipped') */}
              {confirmModal.newStatus === 'shipped' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Tracking Information</p>
                  <div>
                    <input
                      type="text"
                      placeholder="Courier Name (e.g. DTDC, BlueDart)"
                      value={trackingData.courierName}
                      onChange={(e) => setTrackingData(prev => ({ ...prev, courierName: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Tracking ID / AWB Number"
                      value={trackingData.trackingId}
                      onChange={(e) => setTrackingData(prev => ({ ...prev, trackingId: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Package size={10} /> This info will be emailed to the customer.
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="px-4 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors text-sm">Cancel</button>
                <button
                  onClick={executeStatusUpdate}
                  className={`px-5 py-2.5 text-white font-medium rounded-lg shadow-lg flex items-center gap-2 text-sm transition-all
                    ${confirmModal.newStatus === 'shipped'
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                      : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'}`}
                >
                  Confirm Update
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// --- Sub Components ---

const StatCard = ({ label, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3.5 rounded-xl border ${colors[color] || colors.blue}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
      </div>
    </div>
  );
};

const OrderRow = ({ order, type, formatDate, formatPrice, onRequestUpdate }) => {
  const statusStyles = {
    pending: 'bg-amber-100 text-amber-700 circle-1 ring-amber-200',
    confirmed: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
    processing: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200',
    shipped: 'bg-purple-100 text-purple-700 round-1 round-purple-200',
    delivered: 'bg-emerald-100 text-emerald-700 ring-0 ring-emerald-200',
    cancelled: 'bg-red-50 text-red-600 ring-1 ring-red-100'
  };

  const paymentStyles = {
    completed: 'text-emerald-600 bg-emerald-50 ring-1 ring-emerald-100',
    failed: 'text-red-600 bg-red-50 ring-1 ring-red-100'
  };

  const getPaymentLabel = (status) => {
    if (status === 'completed' || status === 'paid') return 'Success';
    return 'Failed';
  };

  const getPaymentStyle = (status) => {
    if (status === 'completed' || status === 'paid') return paymentStyles.completed;
    return paymentStyles.failed;
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="hover:bg-slate-50 transition-colors group"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-mono font-medium text-slate-700 text-xs bg-slate-100 px-2 py-1 rounded w-fit">
            #{order.orderNumber || order._id.slice(-6).toUpperCase()}
          </span>
          {type === 'wholesale' && (
            <span className="text-[10px] text-indigo-600 font-bold mt-1 uppercase tracking-wide">Wholesale</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          {formatDate(order.createdAt)}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        {type === 'wholesale' ? (
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
              <Building2 size={14} className="text-indigo-500" />
              {order.user?.businessDetails?.businessName || order.user?.name || 'N/A'}
            </span>
            {order.user?.businessDetails?.gstNumber && (
              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1 rounded w-fit border border-slate-200 mt-0.5">
                GST: {order.user.businessDetails.gstNumber}
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-700 text-sm">{order.user?.name || order.shippingAddress?.name || 'Guest'}</span>
            <span className="text-xs text-slate-400">{order.customerEmail}</span>
          </div>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
        {formatPrice(order.totalAmount)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${getPaymentStyle(order.paymentStatus)}`}>
          {getPaymentLabel(order.paymentStatus)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${statusStyles[order.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          {order.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <Link
          to={`/admin/orders/${order._id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:shadow-sm transition-all text-xs font-semibold"
        >
          <Eye size={14} /> View
        </Link>
      </td>
    </motion.tr>
  );
};

const TableSkeleton = () => (
  <div className="w-full">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center px-6 py-5 border-b border-slate-50 gap-4 animate-pulse">
        <div className="h-5 bg-slate-100 rounded w-20" />
        <div className="flex -space-x-2">
          {[...Array(2)].map((_, j) => <div key={j} className="w-9 h-11 bg-slate-100 rounded-lg border-2 border-white" />)}
        </div>
        <div className="h-5 bg-slate-100 rounded w-28" />
        <div className="h-5 bg-slate-100 rounded w-40" />
        <div className="h-5 bg-slate-100 rounded w-20" />
        <div className="h-5 bg-slate-100 rounded w-24" />
        <div className="h-5 bg-slate-100 rounded w-28 ml-auto" />
      </div>
    ))}
  </div>
);

// Smart paginator — shows numbered buttons with first/last jumps
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const btnBase = 'min-w-[36px] h-9 px-2 flex items-center justify-center rounded-lg text-sm font-medium transition-all border';
  const activeBtn = `${btnBase} bg-slate-900 text-white border-slate-900`;
  const normalBtn = `${btnBase} bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200`;
  const disabledBtn = `${btnBase} bg-white text-slate-300 border-slate-100 cursor-not-allowed`;

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('…');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className={currentPage === 1 ? disabledBtn : normalBtn} title="First page">
        <ChevronsLeft size={15} />
      </button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={currentPage === 1 ? disabledBtn : normalBtn} title="Previous">
        <ChevronLeft size={15} />
      </button>

      {getPageNumbers().map((p, idx) =>
        p === '…' ? (
          <span key={`e${idx}`} className="min-w-[36px] h-9 flex items-center justify-center text-slate-400 text-sm select-none">…</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p)} className={p === currentPage ? activeBtn : normalBtn}>
            {p}
          </button>
        )
      )}

      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={currentPage === totalPages ? disabledBtn : normalBtn} title="Next">
        <ChevronRight size={15} />
      </button>
      <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={currentPage === totalPages ? disabledBtn : normalBtn} title="Last page">
        <ChevronsRight size={15} />
      </button>
    </div>
  );
};

export default OrderManagement;