import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Loader2, Image as ImageIcon, X,
  Tag, IndianRupee, Layers, Percent, Box, Ticket,
  UploadCloud, Plus, Trash2, ChevronRight, TrendingDown,
  Truck, CheckCircle, AlertCircle, Calendar, Clock, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { adminApi } from '../services/admin';
import { productsApi } from '../services/products';
import AdminCouponManager from './AdminCouponManager';

// --- INTERNAL COMPONENT: SUCCESS MODAL ---
const SuccessModal = ({ isOpen, onClose, onNavigate, message, isEdit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600 w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Success!</h2>
        <p className="text-slate-600 mb-6">{message}</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onNavigate}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            Go to Products List
          </button>
          {!isEdit && (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Add Another Product
            </button>
          )}
          {isEdit && (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Keep Editing
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- INTERNAL COMPONENT: ENHANCED IMAGE UPLOADER ---
const ImageUploadArea = ({ images, onChange, maxImages = 25, maxSizeMB = 5, error }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processFiles = useCallback((newFiles) => {
    const validFiles = [];
    if (images.length + newFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed.`);
      return;
    }
    newFiles.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`Skipped ${file.name} (not an image).`);
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Skipped ${file.name} (too large).`);
        return;
      }
      // Assign a stable preview to prevent react re-rendering issues with blob: URLs
      file._preview = URL.createObjectURL(file);
      validFiles.push(file);
    });
    if (validFiles.length > 0) onChange([...images, ...validFiles]);
  }, [images, maxImages, maxSizeMB, onChange]);

  const handleFileChange = (e) => {
    processFiles(Array.from(e.target.files));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (indexToRemove) => {
    onChange(images.filter((_, index) => index !== indexToRemove));
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const getPreview = (item) => {
    if (item?.url) return item.url;
    if (item instanceof File && item._preview) return item._preview;
    if (item instanceof File) return URL.createObjectURL(item);
    return '/placeholder.png';
  };

  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img instanceof File || img instanceof Blob) {
          URL.revokeObjectURL(img);
        }
      });
    };
  }, [images]);

  return (
    <div className="w-full space-y-5">
      {images.length < maxImages && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer flex flex-col items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed transition-all duration-300 ease-out 
            ${error ? 'border-red-400 bg-red-50' :
              isDragging
                ? 'border-rose-500 bg-rose-50 scale-[1.01]'
                : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400'
            }`}
        >
          <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
          <div className="flex flex-col items-center justify-center text-center px-4">
            <div className={`p-4 rounded-full mb-3 transition-colors duration-300 ${isDragging ? 'bg-rose-100 text-rose-600' : 'bg-white shadow-md text-slate-400 group-hover:text-rose-600 group-hover:scale-110'}`}>
              <UploadCloud size={28} />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              <span className="text-rose-600 hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP up to {maxSizeMB}MB (Max {maxImages})</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm animate-pulse">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <AnimatePresence mode='popLayout'>
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <motion.div
                layout
                key={image instanceof File ? `${image.name}-${index}` : image.url || index}
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white border border-slate-200 shadow-sm group hover:shadow-md transition-shadow"
              >
                <img src={getPreview(image)} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm text-slate-500 rounded-full shadow-sm hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 scale-90 hover:scale-100"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}

            {images.length < maxImages && (
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => fileInputRef.current?.click()} className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-200 bg-white hover:bg-slate-50 cursor-pointer flex flex-col items-center justify-center transition-all group">
                <div className="p-2 rounded-full bg-slate-50 group-hover:bg-slate-100 transition-colors">
                  <Plus size={20} className="text-slate-400 group-hover:text-slate-600" />
                </div>
                <span className="text-xs font-medium text-slate-500 mt-2">Add Image</span>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- CONSTANTS ---
const categories = [
  { value: 'Sarees', label: 'Sarees' },
  { value: 'Pure silk Sarees', label: 'Pure silk Sarees' },
  { value: 'Salwar’s', label: 'Salwar’s' },
  { value: 'Kurtis/Readymade', label: 'Kurtis/Readymade' },
  { value: 'Jewels', label: 'Jewels' },
  { value: 'other', label: 'Others (Manual Entry)' }
];

const PRESET_COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Maroon', hex: '#800000' },
];

const AdminProductForm = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === 'edit' || Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [showCouponManager, setShowCouponManager] = useState(false);
  const [removedImageIds, setRemovedImageIds] = useState([]);

  // Success Modal State
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // UI Error State
  const [formErrors, setFormErrors] = useState({});

  const colorFileInputRef = useRef(null);
  const [activeColorIndex, setActiveColorIndex] = useState(null);
  const [galleryPickerIndex, setGalleryPickerIndex] = useState(null); // null = closed
  const [sizeInput, setSizeInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    wholesalePrice: '',
    retailShippingCost: '',
    retailTaxPercentage: '',
    wholesaleShippingCost: '',
    wholesaleTaxPercentage: '',
    category: 'Sarees',
    discountPercentage: 0,
    discountStartDate: '',
    discountEndDate: '',
    colorImages: [],   // [{ color: String, image: File | { url, publicId } | null }]
    stock: '',
    sizes: [],
    tags: [],
    images: [],
    imageAlt: '',
    publishForReseller: true
  });

  const marginAmount = useMemo(() => {
    const retail = Number(form.price) || 0;
    const wholesale = Number(form.wholesalePrice) || 0;
    return retail - wholesale;
  }, [form.price, form.wholesalePrice]);

  const marginPercent = useMemo(() => {
    const retail = Number(form.price) || 0;
    if (retail === 0) return 0;
    return Math.round((marginAmount / retail) * 100);
  }, [form.price, marginAmount]);


  // Load Data
  useEffect(() => {
    const load = async () => {
      if (!isEdit || !id) { setInitialLoading(false); return; }
      try {
        setInitialLoading(true);
        const data = await productsApi.getProductById(id);
        const product = data.product;
        if (!product) throw new Error("Product not found");

        const category = product.category || 'Sarees';
        const isCustomCategory = !categories.find(c => c.value === category);

        setForm({
          name: product.name || '',
          description: product.description || '',
          price: product.price ?? '',
          wholesalePrice: product.wholesalePrice ?? '',
          retailShippingCost: product.retail?.shippingCost ?? '',
          retailTaxPercentage: product.retail?.taxPercentage ?? '',
          wholesaleShippingCost: product.wholesale?.shippingCost ?? '',
          wholesaleTaxPercentage: product.wholesale?.taxPercentage ?? '',
          category: isCustomCategory ? 'other' : category,
          discountPercentage: product.discountPercentage ?? 0,
          discountStartDate: product.discountStartDate ? new Date(product.discountStartDate).toISOString().split('T')[0] : '',
          discountEndDate: product.discountEndDate ? new Date(product.discountEndDate).toISOString().split('T')[0] : '',
          colorImages: (() => {
            // Prefer colorImages (new format) if present
            if (Array.isArray(product.colorImages) && product.colorImages.length > 0) {
              return product.colorImages.map(ci => ({ color: ci.color, image: ci.image }));
            }
            // Fallback: build colorImages from old colors array (images will be null)
            if (Array.isArray(product.colors) && product.colors.length > 0) {
              return product.colors.map(c => ({ color: c, image: null }));
            }
            return [];
          })(),
          stock: product.stock ?? '',
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          tags: Array.isArray(product.tags) ? product.tags : [],
          images: product.images || [],
          imageAlt: product.images?.[0]?.alt || '',
          publishForReseller: product.publishForReseller ?? true
        });

        if (isCustomCategory) {
          setCustomCategory(category);
        }
      } catch (e) {
        toast.error('Failed to load product details');
        navigate('/admin/products');
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
    // Clear custom category if switching away from 'other'
    if (name === 'category' && value !== 'other') {
      setCustomCategory('');
    }
  };

  // Adds a value to sizes or tags – works for both Enter key and button tap (mobile-safe)
  const addItem = (value, field, setter) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!form[field].includes(trimmed)) {
      setForm(prev => ({ ...prev, [field]: [...prev[field], trimmed] }));
    }
    setter('');
  };

  const handleAddItem = (e, field, setter) => {
    // Support both Enter key (desktop) and Go/Done on mobile (which fires as Enter)
    if (e.key === 'Enter' || e.key === 'Done' || e.keyCode === 13) {
      e.preventDefault();
      addItem(e.target.value, field, setter);
    }
  };

  const handleRemoveItem = (field, indexToRemove) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, index) => index !== indexToRemove) }));
  };

  const handleAddVariant = () => {
    if (!newVariant.colorName || !newVariant.hexCode) {
      toast.error("Please select a color name and code");
      return;
    }
    setForm(prev => ({
      ...prev,
      variants: [...prev.variants, { ...newVariant, stock: Number(newVariant.stock) }]
    }));
    setNewVariant(prev => ({ ...prev, stock: 10, variantImage: '' }));
    // Clear error if exists
    if (formErrors.variants) setFormErrors(prev => ({ ...prev, variants: null }));
  };

  const handleRemoveVariant = (index) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  // --- Color-Image Management Helpers ---
  const addColorEntry = () => {
    setForm(prev => ({
      ...prev,
      colorImages: [...prev.colorImages, { color: '', image: null }]
    }));
    if (formErrors.colorImages) setFormErrors(prev => ({ ...prev, colorImages: null }));
  };

  const updateColorEntryName = (index, colorName) => {
    setForm(prev => ({
      ...prev,
      colorImages: prev.colorImages.map((entry, i) =>
        i === index ? { ...entry, color: colorName } : entry
      )
    }));
  };

  const updateColorEntryImage = (index, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    file._preview = URL.createObjectURL(file);
    setForm(prev => ({
      ...prev,
      colorImages: prev.colorImages.map((entry, i) =>
        i === index ? { ...entry, image: file } : entry
      )
    }));
    if (formErrors.colorImages) setFormErrors(prev => ({ ...prev, colorImages: null }));
  };

  const removeColorEntry = (index) => {
    setForm(prev => ({
      ...prev,
      colorImages: prev.colorImages.filter((_, i) => i !== index)
    }));
  };

  const getColorImagePreview = (image) => {
    if (!image) return null;
    if (image?.url) return image.url;
    if (image instanceof File && image._preview) return image._preview;
    if (image instanceof File) return URL.createObjectURL(image);
    return null;
  };

  const handleColorImageUploadClick = (index) => {
    // If there are gallery images, show the picker; otherwise go straight to file input
    if (form.images.length > 0) {
      setGalleryPickerIndex(index);
    } else {
      setActiveColorIndex(index);
      colorFileInputRef.current?.click();
    }
  };

  const handleColorFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && activeColorIndex !== null) {
      updateColorEntryImage(activeColorIndex, file);
    }
    e.target.value = '';
  };

  // Link an already-uploaded gallery image to a color entry
  const linkGalleryImageToColor = (colorIndex, galleryImage) => {
    // galleryImage is either a File (new) or { url, publicId } (existing Cloudinary)
    let imageToStore;
    if (galleryImage instanceof File) {
      imageToStore = galleryImage; // keep File reference; it will upload at submit
    } else if (galleryImage?.url) {
      imageToStore = { url: galleryImage.url, publicId: galleryImage.publicId || '' };
    } else {
      return;
    }
    setForm(prev => ({
      ...prev,
      colorImages: prev.colorImages.map((entry, i) =>
        i === colorIndex ? { ...entry, image: imageToStore } : entry
      )
    }));
    if (formErrors.colorImages) setFormErrors(prev => ({ ...prev, colorImages: null }));
    setGalleryPickerIndex(null);
  };

  // Open file input from within the gallery picker
  const openFileInputFromPicker = () => {
    setActiveColorIndex(galleryPickerIndex);
    setGalleryPickerIndex(null);
    // Small delay so the picker closes before file dialog opens (avoids iOS issues)
    setTimeout(() => colorFileInputRef.current?.click(), 50);
  };

  // Preview URL for any image type (File or { url })
  const getAnyImagePreview = (img) => {
    if (!img) return '/placeholder.png';
    if (img?.url) return img.url;
    if (img instanceof File && img._preview) return img._preview;
    if (img instanceof File) return URL.createObjectURL(img);
    return '/placeholder.png';
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!res.ok) throw new Error('Cloudinary upload failed');
    const data = await res.json();

    return { url: data.secure_url, publicId: data.public_id };
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Product Name is required";
    if (!form.description.trim()) errors.description = "Description is required";
    if (!form.price || Number(form.price) <= 0) errors.price = "Valid price is required";
    if (!form.category) errors.category = "Category is required";
    if (form.category === 'other' && !customCategory.trim()) {
      errors.category = "Please enter a custom category name";
    }
    if (form.images.length === 0) errors.images = "At least 1 image is required";
    if (form.colorImages.length === 0) {
      errors.colorImages = "At least 1 color with an image is required";
    } else if (form.colorImages.some(ci => !ci.color.trim())) {
      errors.colorImages = "Every color entry must have a color name";
    } else if (form.colorImages.some(ci => !ci.image)) {
      errors.colorImages = "Every color must have an image uploaded";
    }
    if (form.stock === '' || Number(form.stock) < 0) errors.stock = "Valid stock is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors highlighting in red');
      return;
    }

    try {
      setLoading(true);

      // 🔹 Separate new files & existing images
      const newFiles = form.images.filter(img => img instanceof File);
      const existingImages = form.images.filter(img => img?.url);

      // 🔹 Start with existing Cloudinary images
      let finalImages = [...existingImages];

      // 🔹 Parallel Upload for better performance with 25 images
      if (newFiles.length > 0) {
        // Create an array of promises
        const uploadPromises = newFiles.map(file => uploadImageToCloudinary(file));

        // Wait for all uploads to complete
        const uploadedResults = await Promise.all(uploadPromises);
        finalImages = [...finalImages, ...uploadedResults];
      }

      // 🔹 Upload colorImages that are still File objects
      const finalColorImages = await Promise.all(
        form.colorImages.map(async (entry) => {
          let image = entry.image;
          if (image instanceof File) {
            image = await uploadImageToCloudinary(image);
          }
          return { color: entry.color.trim(), image };
        })
      );

      const finalCategory = form.category === 'other' && customCategory.trim()
        ? customCategory.trim().toLowerCase()
        : form.category;

      const discountPct = Number(form.discountPercentage) || 0;

      const payload = {
        name: form.name,
        description: form.description,
        category: finalCategory,
        tags: form.tags,
        sizes: form.sizes,
        colorImages: finalColorImages,
        colors: finalColorImages.map(ci => ci.color), // backward-compat string array
        price: Number(form.price),
        wholesalePrice: Number(form.wholesalePrice) || 0,
        retail: {
          shippingCost: Number(form.retailShippingCost) || 0,
          taxPercentage: Number(form.retailTaxPercentage) || 0
        },
        wholesale: {
          shippingCost: Number(form.wholesaleShippingCost) || 0,
          taxPercentage: Number(form.wholesaleTaxPercentage) || 0
        },
        stock: Number(form.stock) || 0,
        // ✅ FIX: Always sync isDiscountActive with whether a discount is set
        discountPercentage: discountPct,
        isDiscountActive: discountPct > 0,
        discountStartDate: form.discountStartDate
          ? new Date(form.discountStartDate + 'T00:00:00').toISOString()
          : null,
        discountEndDate: form.discountEndDate
          ? new Date(form.discountEndDate + 'T23:59:59').toISOString()
          : null,
        images: finalImages,
        publishForReseller: form.publishForReseller
      };

      if (isEdit) {
        await adminApi.updateProduct(id, payload);
        setSuccessMessage('Product updated successfully!');
      } else {
        await adminApi.createProduct(payload);
        setSuccessMessage('Product created successfully!');
      }

      // Trigger Success Modal instead of navigate
      setShowSuccess(true);

    } catch (error) {
      console.error(error);
      toast.error('Save failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setForm({
      name: '', description: '', price: '', wholesalePrice: '',
      retailShippingCost: '', retailTaxPercentage: '',
      wholesaleShippingCost: '', wholesaleTaxPercentage: '',
      category: 'Sarees', discountPercentage: 0,
      discountStartDate: '', discountEndDate: '',
      colorImages: [], stock: '', sizes: [], tags: [], images: [], imageAlt: '', publishForReseller: true
    });
    setCustomCategory('');
    setFormErrors({});
    setShowSuccess(false);
  };

  const inputClass = (name) => `w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 ${formErrors[name] ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' : 'border-slate-200 focus:border-rose-500 focus:ring-rose-500/10'}`;
  const labelClass = "text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block";
  const cardClass = "bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]";

  if (initialLoading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-rose-600" size={32} />
        <p className="text-sm font-medium text-slate-500">Loading details...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 relative font-sans text-slate-900">

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal
            isOpen={showSuccess}
            isEdit={isEdit}
            message={successMessage}
            onClose={() => isEdit ? setShowSuccess(false) : handleResetForm()}
            onNavigate={() => navigate('/admin/products')}
          />
        )}
      </AnimatePresence>

      {/* ── Gallery Image Picker Modal ── */}
      <AnimatePresence>
        {galleryPickerIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setGalleryPickerIndex(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="relative bg-white w-full sm:max-w-lg sm:mx-4 sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col"
              style={{ maxHeight: 'min(88vh, 680px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle — mobile only */}
              <div className="flex-none flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex-none flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-[15px] text-slate-800 leading-tight">Choose Image for Color</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Pick from gallery or upload a new one</p>
                </div>
                <button
                  type="button"
                  onClick={() => setGalleryPickerIndex(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors shrink-0 ml-3"
                >
                  <X size={16} className="text-slate-500" />
                </button>
              </div>

              {/* Upload new — fixed below header */}
              <div className="flex-none px-4 pt-3 pb-3 border-b border-slate-100">
                <button
                  type="button"
                  onClick={openFileInputFromPicker}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-rose-300 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:border-rose-400 active:scale-[0.98] transition-all touch-manipulation"
                >
                  <UploadCloud size={16} />
                  Upload New Image
                </button>
              </div>

              {/* Scrollable gallery */}
              <div
                className="flex-1 overflow-y-auto overscroll-contain px-4 py-3"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {form.images.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-10">No images in gallery yet.</p>
                ) : (
                  <>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Gallery · {form.images.length} image{form.images.length !== 1 ? 's' : ''}
                    </p>
                    <div className="grid grid-cols-3 gap-2.5">
                      {form.images.map((img, idx) => {
                        const src = getAnyImagePreview(img);
                        const currentLinked = galleryPickerIndex !== null && form.colorImages[galleryPickerIndex]?.image;
                        const isLinked = currentLinked && (
                          currentLinked === img ||
                          (currentLinked?.url && currentLinked.url === img?.url)
                        );
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => linkGalleryImageToColor(galleryPickerIndex, img)}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all active:scale-95 touch-manipulation
                              ${isLinked ? 'border-rose-500' : 'border-slate-200 hover:border-rose-400'}`}
                          >
                            <img
                              src={src}
                              alt={`Gallery ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = '/placeholder.png'; }}
                            />
                            {isLinked && (
                              <div className="absolute inset-0 bg-rose-500/25 flex items-center justify-center">
                                <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                                  <CheckCircle size={16} className="text-rose-600" />
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* iOS safe-area bottom padding */}
              <div className="flex-none sm:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)', minHeight: 12 }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCouponManager && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-2xl h-[90vh] sm:h-[80vh] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex-none px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <h2 className="font-bold text-lg flex items-center gap-2 text-slate-800"><Ticket className="text-rose-500" size={20} /> Manage Coupons</h2>
                <button onClick={() => setShowCouponManager(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-0">
                <AdminCouponManager />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin/products" className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:shadow-sm transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
              <p className="text-sm text-slate-500 mt-1">Manage details, pricing, and inventory.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/admin/products')} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-white hover:text-slate-900 rounded-xl transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl flex items-center gap-2 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {loading ? (isEdit ? 'Updating...' : 'Publishing...') : (isEdit ? 'Update Product' : 'Publish Product')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* LEFT COLUMN */}
          <div className="xl:col-span-2 space-y-8">

            {/* General Info */}
            <div className={cardClass}>
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Layers size={20} /></div>
                General Information
              </h3>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Product Name <span className="text-red-500">*</span></label>
                  <input name="name" value={form.name} onChange={handleChange} className={inputClass('name')} placeholder="e.g. Kanchipuram Silk Saree" />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className={labelClass}>Description <span className="text-red-500">*</span></label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={5} className={`${inputClass('description')} resize-y min-h-[120px]`} placeholder="Describe the fabric, weave, and occasion..." />
                  {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
                </div>
                {/* Wholesale Publish Toggle */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Publish in Wholesale Catalog</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Allow resellers to view and purchase this product.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, publishForReseller: !prev.publishForReseller }))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${form.publishForReseller ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    role="switch"
                    aria-checked={form.publishForReseller}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.publishForReseller ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Images - INCREASED CAPACITY TO 25 */}
            <div className={cardClass}>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><ImageIcon size={20} /></div>
                  Media Gallery <span className="text-red-500">*</span>
                </h3>
                <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded">Max 25 images</span>
              </div>

              <ImageUploadArea
                images={form.images}
                maxImages={25}
                error={formErrors.images}
                onChange={(imgs) => {
                  const removed = form.images.filter(
                    img => typeof img === 'string' && !imgs.includes(img)
                  );
                  if (removed.length) {
                    setRemovedImageIds(prev => [...prev, ...removed]);
                  }
                  setForm(prev => ({ ...prev, images: imgs }));
                  if (imgs.length > 0) setFormErrors(prev => ({ ...prev, images: null }));
                }}
              />

              <div className="mt-5 pt-5 border-t border-slate-100">
                <label className={labelClass}>Alt Text (SEO)</label>
                <input name="imageAlt" value={form.imageAlt} onChange={handleChange} className={inputClass('imageAlt')} placeholder="Describe images for accessibility" />
              </div>
            </div>

            {/* VARIANTS & INVENTORY */}
            <div className={cardClass}>
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Box size={20} /></div>
                Inventory & Variants
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className={labelClass}>Category <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select name="category" value={form.category} onChange={handleChange} className={`${inputClass('category')} appearance-none cursor-pointer`}>
                      {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                  </div>
                  {form.category === 'other' && (
                    <div className="mt-3">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        Custom Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customCategory}
                        onChange={(e) => {
                          setCustomCategory(e.target.value);
                          if (formErrors.category) {
                            setFormErrors(prev => ({ ...prev, category: null }));
                          }
                        }}
                        className={inputClass('category')}
                        placeholder="e.g. Designer Saree, Party Wear, etc."
                      />
                      {formErrors.category && form.category === 'other' && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Total Stock <span className="text-red-500">*</span></label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                    className={inputClass('stock')}
                    placeholder="Enter total stock count"
                  />
                  {formErrors.stock && <p className="text-red-500 text-xs mt-1">{formErrors.stock}</p>}
                </div>
              </div>

              {/* Colors Section — Color + Image Mapping */}
              <div className="mb-8 border-b border-slate-100 pb-8">
                <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                  Colors &amp; Images <span className="text-red-500">*</span>
                </h4>
                <p className="text-xs text-slate-400 mb-4">Each color must have its own image. Click the image slot to pick from the gallery above or upload a new one.</p>

                {/* Hidden shared file input */}
                <input
                  ref={colorFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleColorFileChange}
                />

                {/* Color-Image Pair Rows */}
                <div className="space-y-2.5">
                  {form.colorImages.map((entry, index) => {
                    const preview = getColorImagePreview(entry.image);
                    return (
                      <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">

                        {/* Row 1: thumbnail + color name input */}
                        <div className="flex items-center gap-3">
                          {/* Image thumbnail / pick trigger */}
                          <button
                            type="button"
                            onClick={() => handleColorImageUploadClick(index)}
                            title={form.images.length > 0 ? 'Choose or upload image' : 'Upload image'}
                            className={`w-12 h-12 shrink-0 rounded-lg overflow-hidden border-2 bg-white flex items-center justify-center transition-all active:scale-95 touch-manipulation
                              ${preview
                                ? 'border-slate-300 hover:border-rose-400'
                                : 'border-dashed border-slate-300 hover:border-rose-400 hover:bg-rose-50'
                              }`}
                          >
                            {preview ? (
                              <img src={preview} alt={entry.color || 'color'} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-0.5">
                                <ImageIcon size={14} className="text-slate-400" />
                                <span className="text-[9px] text-slate-400 leading-none">
                                  {form.images.length > 0 ? 'Pick' : 'Upload'}
                                </span>
                              </div>
                            )}
                          </button>

                          {/* Color name input — takes all remaining width */}
                          <input
                            type="text"
                            value={entry.color}
                            onChange={(e) => updateColorEntryName(index, e.target.value)}
                            placeholder="Color name (e.g. Red, Blue)"
                            className="flex-1 min-w-0 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all"
                          />
                        </div>

                        {/* Row 2: status badge + remove — aligned under the input */}
                        <div className="flex items-center justify-between mt-2 pl-[60px]">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full
                            ${entry.image
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                            {entry.image ? '✓ Image set' : '⚠ No image'}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeColorEntry(index)}
                            className="text-[11px] font-medium text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors touch-manipulation px-1 py-0.5"
                            aria-label={`Remove color ${entry.color}`}
                          >
                            <X size={11} /> Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {form.colorImages.length === 0 && (
                  <div className="mt-3 text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-400">No colors added yet. Click below to add one.</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={addColorEntry}
                  className="mt-3 w-full h-10 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-500 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50/50 transition-all"
                >
                  <Plus size={16} /> Add Color
                </button>

                {formErrors.colorImages && (
                  <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {formErrors.colorImages}
                  </p>
                )}
              </div>
            </div>

            {/* Sizes Section */}
            <div className={cardClass}>
              <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                <div className="p-2 bg-violet-50 text-violet-600 rounded-lg"><Tag size={20} /></div>
                Sizes
              </h3>
              <p className="text-xs text-slate-400 mb-5 ml-1">Add all available sizes (e.g. S, M, L, XL, Free Size)</p>

              {/* Input + Add button — works on mobile and desktop */}
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  inputMode="text"
                  enterKeyHint="done"
                  value={sizeInput}
                  placeholder="e.g. S, M, XL, Free Size"
                  className={`${inputClass('')} flex-1`}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={(e) => handleAddItem(e, 'sizes', setSizeInput)}
                />
                <button
                  type="button"
                  onClick={() => addItem(sizeInput, 'sizes', setSizeInput)}
                  className="h-[42px] px-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 flex items-center gap-1.5 text-sm font-medium transition-all active:scale-95 shrink-0"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2 ml-1">
                Tap <strong>Add</strong> or press <kbd className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-mono">Enter</kbd> to add each size.
              </p>

              {/* Chips */}
              {form.sizes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {form.sizes.map((size, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-full text-sm font-medium"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem('sizes', index)}
                        className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-violet-200 text-violet-600 hover:bg-red-100 hover:text-red-500 transition-colors"
                        aria-label={`Remove size ${size}`}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {form.sizes.length === 0 && (
                <div className="mt-4 text-center py-5 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-400">No sizes added yet. Add at least one size above.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6 h-fit xl:sticky xl:top-8">

            {/* Multi-Tier Pricing Card */}
            <div className={cardClass}>
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><IndianRupee size={20} /></div>
                Pricing Tiers
              </h3>
              <div className="space-y-5">
                {/* Retail Price */}
                <div>
                  <label className={labelClass}>Retail Price (₹) <span className="text-red-500">*</span></label>
                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    className={`${inputClass('price')} text-lg font-semibold`}
                    placeholder="0.00"
                  />
                  {formErrors.price && <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>}
                  <p className="text-xs text-slate-400 mt-1.5">Customer-facing price</p>
                </div>

                {/* Wholesale Price */}
                <div className="pt-4 border-t border-slate-100">
                  <label className={labelClass}>
                    <div className="flex items-center gap-2">
                      <TrendingDown size={14} className="text-indigo-500" />
                      Wholesale Price (₹)
                    </div>
                  </label>
                  <input
                    name="wholesalePrice"
                    type="number"
                    value={form.wholesalePrice}
                    onChange={handleChange}
                    className={inputClass('wholesalePrice')}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-slate-400 mt-1.5">B2B/Reseller pricing</p>

                  {/* Margin Display */}
                  {form.price && form.wholesalePrice && (
                    <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 font-medium">Margin</span>
                        <span className="font-bold text-indigo-700">
                          ₹{marginAmount.toLocaleString()} ({marginPercent}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Discount */}
                <div className="pt-4 border-t border-slate-100">
                  <DiscountSection form={form} handleChange={handleChange} inputClass={inputClass} labelClass={labelClass} />
                </div>
              </div>
            </div>

            {/* Shipping & Tax Card */}
            <div className={cardClass}>
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Truck size={20} />
                </div>
                Logistics & Tax
              </h3>

              <div className="space-y-6">
                {/* RETAIL */}
                <div className="border border-slate-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-slate-700 mb-3">Retail (Customers)</p>
                  <label className={labelClass}>Shipping Cost (₹)</label>
                  <input
                    name="retailShippingCost"
                    type="number"
                    min="0"
                    value={form.retailShippingCost}
                    onChange={handleChange}
                    className={inputClass('retailShippingCost')}
                  />
                  <label className={`${labelClass} mt-4`}>GST (%)</label>
                  <input
                    name="retailTaxPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={form.retailTaxPercentage}
                    onChange={handleChange}
                    className={inputClass('retailTaxPercentage')}
                  />
                </div>

                {/* WHOLESALE */}
                <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-4">
                  <p className="text-sm font-bold text-indigo-700 mb-3">Wholesale (Resellers)</p>
                  <label className={labelClass}>Shipping Cost (₹)</label>
                  <input
                    name="wholesaleShippingCost"
                    type="number"
                    min="0"
                    value={form.wholesaleShippingCost}
                    onChange={handleChange}
                    className={inputClass('wholesaleShippingCost')}
                  />
                  <label className={`${labelClass} mt-4`}>GST (%)</label>
                  <input
                    name="wholesaleTaxPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={form.wholesaleTaxPercentage}
                    onChange={handleChange}
                    className={inputClass('wholesaleTaxPercentage')}
                  />
                </div>
              </div>
            </div>

            {/* Promotions */}
            <div className={`${cardClass} bg-gradient-to-br from-indigo-50 to-white border-indigo-100`}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-indigo-600 shadow-sm mb-3">
                  <Ticket size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Coupon Codes</h3>
                <p className="text-xs text-slate-500 mb-4 px-2">Manage discounts and seasonal offers for this product.</p>
                <button
                  onClick={() => setShowCouponManager(true)}
                  className="w-full py-2.5 bg-white text-indigo-600 border border-indigo-200 rounded-xl text-sm font-semibold hover:bg-indigo-50 hover:border-indigo-300 transition-all shadow-sm"
                >
                  Manage Coupons
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div >
  );
};

// --- DISCOUNT SECTION COMPONENT ---
const DiscountSection = ({ form, handleChange, inputClass, labelClass }) => {
  const pct = Number(form.discountPercentage) || 0;
  const price = Number(form.price) || 0;
  const now = new Date();
  // Parse as local time: start = beginning of day, end = end of day
  const startDate = form.discountStartDate ? new Date(form.discountStartDate + 'T00:00:00') : null;
  const endDate = form.discountEndDate ? new Date(form.discountEndDate + 'T23:59:59') : null;

  // Determine live status
  const getStatus = () => {
    if (pct <= 0) return null;
    if (endDate && now > endDate) return 'expired';
    if (startDate && now < startDate) return 'scheduled';
    if (endDate) return 'active';
    return 'active_no_expiry';
  };
  const status = getStatus();

  // Days remaining
  const daysRemaining = endDate ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : null;

  const statusConfig = {
    active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle size={12} /> },
    active_no_expiry: { label: 'Active · No Expiry', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle size={12} /> },
    scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Clock size={12} /> },
    expired: { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-200', icon: <AlertCircle size={12} /> },
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className={labelClass}>Discount</label>
        {status && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${statusConfig[status].color}`}>
            {statusConfig[status].icon}
            {statusConfig[status].label}
          </span>
        )}
      </div>

      {/* Percentage input */}
      <div className="relative">
        <input
          name="discountPercentage"
          type="number"
          min="0"
          max="100"
          value={form.discountPercentage}
          onChange={handleChange}
          placeholder="0"
          className={`${inputClass('discountPercentage')} pr-10`}
        />
        <Percent size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      {/* Date range — only show when discount > 0 */}
      {pct > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1">
            <Timer size={14} className="text-slate-400" />
            Discount Schedule <span className="font-normal text-slate-400">(optional)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Start Date */}
            <div className="min-w-0">
              <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Calendar size={12} className="shrink-0" /> Start Date
              </label>
              <input
                name="discountStartDate"
                type="date"
                value={form.discountStartDate}
                onChange={handleChange}
                className="w-full px-3 py-2.5 min-h-[42px] bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            {/* End Date */}
            <div className="min-w-0">
              <label className="text-xs font-medium text-slate-500 mb-1.0 flex items-center gap-1.5">
                <Clock size={12} className="shrink-0" /> <span>End Date</span>
              </label>
              <input
                name="discountEndDate"
                type="date"
                value={form.discountEndDate}
                onChange={handleChange}
                min={form.discountStartDate || undefined}
                className="w-full px-3 py-2.5 min-h-[42px] bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>
          </div>

          {/* Countdown / hint */}
          {endDate && (
            <div className={`text-xs rounded-lg px-3 py-2.5 flex items-start gap-2 font-medium leading-snug ${status === 'expired'
              ? 'bg-red-50 text-red-600 border border-red-100'
              : status === 'scheduled'
                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                : daysRemaining !== null && daysRemaining <= 3
                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}>
              {status === 'expired' && <><AlertCircle size={13} className="shrink-0 mt-0.5" /> <span>Discount has expired — price will revert to ₹{price.toLocaleString()}</span></>}
              {status === 'scheduled' && <><Clock size={13} className="shrink-0 mt-0.5" /> <span>Starts in {Math.ceil((startDate - now) / (1000 * 60 * 60 * 24))} day{Math.ceil((startDate - now) / (1000 * 60 * 60 * 24)) !== 1 ? 's' : ''}</span></>}
              {(status === 'active') && daysRemaining > 3 && <><CheckCircle size={13} className="shrink-0 mt-0.5" /> <span>Expires in {daysRemaining} days</span></>}
              {(status === 'active') && daysRemaining <= 3 && daysRemaining > 0 && <><AlertCircle size={13} className="shrink-0 mt-0.5" /> <span>Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} — ending soon!</span></>}
              {(status === 'active') && daysRemaining === 0 && <><AlertCircle size={13} className="shrink-0 mt-0.5" /> <span>Expires today!</span></>}
            </div>
          )}

          <p className="text-[11px] text-slate-400 leading-relaxed">
            After the end date, the price automatically reverts to the original price. Leave dates empty for a permanent discount.
          </p>
        </div>
      )}

      {/* Price preview */}
      {price > 0 && pct > 0 && (
        <div className={`rounded-xl p-3.5 flex items-center justify-between gap-3 border ${
          status === 'expired' || status === 'scheduled'
            ? 'bg-slate-50 border-slate-200'
            : 'bg-rose-50 border-rose-100'
        }`}>
          <div className="min-w-0">
            <p className={`text-xs font-medium uppercase tracking-wide ${
              status === 'expired' || status === 'scheduled' ? 'text-slate-400' : 'text-rose-500'
            }`}>
              {status === 'expired'
                ? 'Normal Price (Discount Expired)'
                : status === 'scheduled'
                  ? 'Current Price (Discount Not Started)'
                  : 'Customer Pays'}
            </p>
            {status === 'scheduled' && (
              <p className="text-[11px] text-blue-500 mt-0.5 truncate">
                Discounted price ₹{Math.round(price * (1 - pct / 100)).toLocaleString()} starts on {form.discountStartDate}
              </p>
            )}
            {(status === 'active' || status === 'active_no_expiry') && (
              <p className="text-[11px] text-rose-300 mt-0.5 truncate">
                Save ₹{Math.round(price * pct / 100).toLocaleString()} ({pct}% off)
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className={`text-xl font-bold ${
              status === 'expired' || status === 'scheduled' ? 'text-slate-600' : 'text-rose-600'
            }`}>
              ₹{(status === 'active' || status === 'active_no_expiry')
                ? Math.round(price * (1 - pct / 100)).toLocaleString()
                : price.toLocaleString()}
            </p>
            {status === 'expired' && (
              <p className="text-xs text-slate-400 line-through">₹{Math.round(price * (1 - pct / 100)).toLocaleString()}</p>
            )}
            {status === 'scheduled' && (
              <p className="text-xs text-blue-400">₹{Math.round(price * (1 - pct / 100)).toLocaleString()} from {form.discountStartDate}</p>
            )}
          </div>
        </div>
      )}
      {price > 0 && pct <= 0 && (
        <div className="bg-slate-50 rounded-xl p-3.5 flex justify-between items-center border border-slate-100">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Customer Pays</span>
          <span className="text-lg font-bold text-emerald-600">₹{price.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

export default AdminProductForm;