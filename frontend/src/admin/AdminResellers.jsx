import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, CheckCircle, XCircle, 
  Building2, Mail, Phone, Calendar, 
  ShieldAlert, Loader2, UserCheck, RefreshCw, X, Copy, MapPin, Globe, FileText,
  ShoppingBag, ChevronRight, Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../services/admin';
import { Link } from 'react-router-dom';

const AdminResellers = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [resellers, setResellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedReseller, setSelectedReseller] = useState(null);
  const [modalTab, setModalTab] = useState('profile'); // 'profile' | 'orders'
  const [resellerOrders, setResellerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Fetch Data
  const fetchResellers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getResellers(); 
      const data = Array.isArray(response) ? response : (response.resellers || []);
      setResellers(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch resellers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResellers();
  }, []);

  // Fetch Orders when Tab Changes to 'Orders'
  useEffect(() => {
    if (selectedReseller && modalTab === 'orders') {
      const fetchResellerOrders = async () => {
        setOrdersLoading(true);
        try {
          const data = await adminApi.getUserDetails(selectedReseller._id);
          setResellerOrders(data.recentOrders || []);
        } catch (error) {
          console.error(error);
          toast.error("Could not load reseller orders");
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchResellerOrders();
    }
  }, [selectedReseller, modalTab]);

  // Action Handlers
  const handleStatusUpdate = async (userId, newStatus, userName) => {
    const toastId = toast.loading(`Updating ${userName}...`);
    try {
      await adminApi.updateResellerStatus(userId, newStatus);
      setResellers(prev => prev.map(r => 
        r._id === userId ? { ...r, resellerStatus: newStatus } : r
      ));
      toast.success(`${userName} marked as ${newStatus}`, { id: toastId });
      
      // Update selected state if modal is open
      if (selectedReseller?._id === userId) {
        setSelectedReseller(prev => ({ ...prev, resellerStatus: newStatus }));
      }
    } catch (error) {
      toast.error('Update failed', { id: toastId });
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  // Filter Logic
  const filteredResellers = resellers.filter(reseller => {
    const matchesTab = 
      activeTab === 'all' ? true : 
      activeTab === 'approved' ? reseller.resellerStatus === 'approved' :
      activeTab === 'pending' ? reseller.resellerStatus === 'pending' || reseller.resellerStatus === 'new' :
      ['rejected', 'suspended'].includes(reseller.resellerStatus);

    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      reseller.name?.toLowerCase().includes(q) ||
      reseller.email?.toLowerCase().includes(q) ||
      reseller.businessDetails?.businessName?.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  const pendingCount = resellers.filter(r => r.resellerStatus === 'pending').length;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900">Reseller Management</h1>
          <p className="text-slate-500 text-sm mt-1">Verify business partners and manage wholesale access.</p>
        </div>
        <button 
          onClick={fetchResellers}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Active Partners" value={resellers.filter(r => r.resellerStatus === 'approved').length} icon={<UserCheck className="text-emerald-500" size={24} />} bg="bg-emerald-50" border="border-emerald-100"/>
        <StatCard title="Pending Reviews" value={pendingCount} icon={<ShieldAlert className="text-amber-500" size={24} />} bg="bg-amber-50" border="border-amber-100"/>
        <StatCard title="Rejected / Inactive" value={resellers.filter(r => ['rejected', 'suspended'].includes(r.resellerStatus)).length} icon={<XCircle className="text-rose-500" size={24} />} bg="bg-rose-50" border="border-rose-100"/>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="flex p-1 bg-slate-200/50 rounded-xl w-full sm:w-auto">
            {['pending', 'approved', 'rejected'].map(tab => (
              <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} count={tab === 'pending' ? pendingCount : 0}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </TabButton>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search resellers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Business</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Applied On</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="5" className="p-12 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2"/> Loading...</td></tr>
              ) : filteredResellers.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-slate-400">No resellers found.</td></tr>
              ) : (
                filteredResellers.map((reseller) => (
                  <tr 
                    key={reseller._id}
                    onClick={() => { setSelectedReseller(reseller); setModalTab('profile'); }}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0"><Building2 size={20} /></div>
                        <div>
                          <p className="font-bold text-slate-900">{reseller.businessDetails?.businessName || 'N/A'}</p>
                          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">
                            GST: {reseller.businessDetails?.gstNumber || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="font-medium text-slate-900">{reseller.name}</div>
                      <div className="text-xs">{reseller.email}</div>
                      <div className="text-xs">{reseller.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(reseller.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={reseller.resellerStatus} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                        {reseller.resellerStatus === 'pending' ? (
                          <>
                            <ActionButton onClick={() => handleStatusUpdate(reseller._id, 'approved', reseller.name)} icon={CheckCircle} color="text-emerald-600 bg-emerald-50 hover:bg-emerald-100" />
                            <ActionButton onClick={() => handleStatusUpdate(reseller._id, 'rejected', reseller.name)} icon={XCircle} color="text-rose-600 bg-rose-50 hover:bg-rose-100" />
                          </>
                        ) : (
                          <button 
                            onClick={() => { setSelectedReseller(reseller); setModalTab('profile'); }} 
                            className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                          >
                            Details
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Details Modal --- */}
      <AnimatePresence>
        {selectedReseller && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedReseller(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              
              {/* Modal Header */}
              <div className="bg-slate-900 px-6 py-5 flex justify-between items-start shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                    {selectedReseller.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-serif font-bold text-lg">{selectedReseller.name}</h3>
                    <div className="flex items-center gap-2 text-rose-200 text-sm">
                      <Mail size={14} /> {selectedReseller.email}
                      <button onClick={() => copyToClipboard(selectedReseller.email, 'Email')} className="hover:text-white"><Copy size={12}/></button>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedReseller(null)} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"><X size={20} /></button>
              </div>

              {/* Navigation Tabs (THE NEW NAV) */}
              <div className="flex border-b border-slate-100 bg-slate-50 px-6 pt-2">
                <button 
                  onClick={() => setModalTab('profile')}
                  className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                    modalTab === 'profile' 
                      ? 'border-rose-500 text-rose-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Business Profile
                </button>
                <button 
                  onClick={() => setModalTab('orders')}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                    modalTab === 'orders' 
                      ? 'border-rose-500 text-rose-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Order History 
                  {resellerOrders.length > 0 && (
                    <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full">{resellerOrders.length}</span>
                  )}
                </button>
              </div>

              {/* Modal Body Content */}
              <div className="p-6 overflow-y-auto min-h-[350px]">
                {modalTab === 'profile' ? (
                  // Profile View
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Business Details</h4>
                      <InfoItem label="Shop Name" value={selectedReseller.businessDetails?.businessName} icon={Building2} />
                      <InfoItem label="GST Number" value={selectedReseller.businessDetails?.gstNumber} icon={FileText} copyable />
                      <InfoItem label="PAN Number" value={selectedReseller.businessDetails?.panNumber} icon={FileText} copyable />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">Contact & Status</h4>
                      <InfoItem label="Phone" value={selectedReseller.phone} icon={Phone} copyable />
                      <InfoItem label="Address" value={selectedReseller.addresses?.[0]?.address || 'N/A'} icon={MapPin} />
                      <InfoItem label="Social" value={selectedReseller.businessDetails?.socialLink} icon={Globe} isLink />
                      <div className="pt-2">
                        <span className="text-xs text-slate-400 block mb-1">Current Status</span>
                        <StatusBadge status={selectedReseller.resellerStatus} />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Orders View (The New Feature)
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {ordersLoading ? (
                      <div className="text-center py-12 flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-rose-600" size={24}/> 
                        <span className="text-slate-500 text-sm">Fetching orders...</span>
                      </div>
                    ) : resellerOrders.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                        <ShoppingBag className="mx-auto text-slate-300 mb-2" size={32}/>
                        <p className="text-slate-500 text-sm font-medium">No orders found for this reseller.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3 text-xs uppercase tracking-wide">Order ID</th>
                              <th className="px-4 py-3 text-xs uppercase tracking-wide">Date</th>
                              <th className="px-4 py-3 text-xs uppercase tracking-wide">Amount</th>
                              <th className="px-4 py-3 text-xs uppercase tracking-wide">Status</th>
                              <th className="px-4 py-3 text-right"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {resellerOrders.map(order => (
                              <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 font-mono text-slate-700 font-medium">
                                  #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                                </td>
                                <td className="px-4 py-3 text-slate-500">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 font-bold text-slate-800">
                                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits:0 }).format(order.totalAmount)}
                                </td>
                                <td className="px-4 py-3">
                                  <StatusBadge status={order.status} className="scale-90 origin-left"/>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <Link 
                                    to={`/admin/orders/${order._id}`} 
                                    target="_blank"
                                    className="text-indigo-600 hover:text-indigo-800 hover:underline flex items-center justify-end gap-1 text-xs font-medium"
                                  >
                                    View <ChevronRight size={14}/>
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                {selectedReseller.resellerStatus === 'pending' && (
                  <>
                    <button onClick={() => handleStatusUpdate(selectedReseller._id, 'rejected', selectedReseller.name)} className="px-4 py-2 bg-white border border-rose-200 text-rose-600 font-bold rounded-lg hover:bg-rose-50 transition-colors">Reject</button>
                    <button onClick={() => handleStatusUpdate(selectedReseller._id, 'approved', selectedReseller.name)} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">Approve</button>
                  </>
                )}
                <button onClick={() => setSelectedReseller(null)} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub Components ---
const InfoItem = ({ label, value, icon: Icon, copyable, isLink }) => {
  if (!value) return null;
  const handleCopy = () => { navigator.clipboard.writeText(value); toast.success(`${label} copied!`); };
  return (
    <div className="group">
      <p className="text-xs text-slate-400 mb-0.5 ml-7">{label}</p>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-slate-400"><Icon size={16} /></div>
        <div className="flex-1 break-words">
          {isLink ? (
            <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium text-sm">{value}</a>
          ) : (
            <span className="text-slate-900 font-medium text-sm">{value}</span>
          )}
        </div>
        {copyable && <button onClick={handleCopy} className="md:opacity-0 md:group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 p-1"><Copy size={14} /></button>}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, bg, border }) => (
  <div className={`p-5 rounded-xl border ${bg} ${border} flex items-center justify-between`}>
    <div><p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p><p className="text-2xl font-bold text-slate-900 mt-1">{value}</p></div>
    <div className="p-3 bg-white rounded-xl shadow-sm">{icon}</div>
  </div>
);

const TabButton = ({ active, onClick, children, count }) => (
  <button onClick={onClick} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all relative ${active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
    {children} {count > 0 && <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-rose-100 text-rose-600' : 'bg-slate-300 text-white'}`}>{count}</span>}
  </button>
);

const StatusBadge = ({ status, className = '' }) => {
  const styles = { pending: 'bg-amber-100 text-amber-700 border-amber-200', approved: 'bg-emerald-100 text-emerald-700 border-emerald-200', rejected: 'bg-red-50 text-red-600 border-red-100', suspended: 'bg-slate-100 text-slate-600 border-slate-200' };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${styles[status] || styles.pending} ${className}`}>{status}</span>;
};

const ActionButton = ({ onClick, icon: Icon, color }) => (
  <button onClick={(e) => { e.stopPropagation(); onClick(); }} className={`p-2 rounded-lg border transition-all active:scale-95 ${color}`}><Icon size={18} /></button>
);

export default AdminResellers;