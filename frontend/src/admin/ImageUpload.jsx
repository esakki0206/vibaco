import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, FileImage } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ImageUpload = ({ 
  onChange, 
  maxImages = 5, 
  maxSizeMB = 5, 
  initialImages = [] // If you want to show existing images (URLs)
}) => {
  const [images, setImages] = useState(initialImages);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // --- Cleanup Memory Leaks ---
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        if (image.preview && image.file) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [images]);

  // --- Handlers ---
  const processFiles = useCallback((newFiles) => {
    const validFiles = [];
    const errors = [];

    if (images.length + newFiles.length > maxImages) {
      toast.error(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    newFiles.forEach((file) => {
      // Validate Type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not an image.`);
        return;
      }

      // Validate Size
      if (file.size > maxSizeMB * 1024 * 1024) {
        errors.push(`${file.name} exceeds ${maxSizeMB}MB.`);
        return;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9)
      });
    });

    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
    }

    if (validFiles.length > 0) {
      const updatedImages = [...images, ...validFiles];
      setImages(updatedImages);
      // Return just the File objects to the parent, or the mixed array if needed
      onChange(updatedImages.map(img => img.file || img)); 
    }
  }, [images, maxImages, maxSizeMB, onChange]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    // Reset input so same file can be selected again if deleted
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemove = (indexToRemove) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    setImages(updatedImages);
    onChange(updatedImages.map(img => img.file || img));
  };

  // --- Drag & Drop Handlers ---
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  return (
    <div className="w-full space-y-4">
      
      {/* --- Main Drop Area --- */}
      {images.length < maxImages && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative group cursor-pointer flex flex-col items-center justify-center w-full h-32 md:h-40 
            rounded-xl border-2 border-dashed transition-all duration-200 ease-in-out
            ${isDragging 
              ? 'border-rose-500 bg-rose-50' 
              : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png, image/jpeg, image/webp, image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <div className={`p-3 rounded-full mb-3 transition-colors ${isDragging ? 'bg-rose-100 text-rose-600' : 'bg-white text-slate-400 shadow-sm group-hover:text-slate-600'}`}>
              <Upload size={24} />
            </div>
            <p className="text-sm font-medium text-slate-700">
              <span className="font-semibold text-rose-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500 mt-1">
              SVG, PNG, JPG or WebP (max {maxSizeMB}MB)
            </p>
          </div>
        </div>
      )}

      {/* --- Image Preview Grid --- */}
      <AnimatePresence>
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={image.id || index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                layout
                className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm"
              >
                {/* Image Source (Handles File Preview or URL string) */}
                <img
                  src={image.preview || image}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlay & Remove Button */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering parent clicks if nested
                    handleRemove(index);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 text-rose-600 rounded-full shadow-sm hover:bg-rose-600 hover:text-white transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                  title="Remove Image"
                >
                  <X size={16} />
                </button>

                {/* File Info Badge (Optional) */}
                {image.file && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white truncate px-1">
                      {(image.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
            
            {/* --- Mini Upload Button (Appears in grid when images exist but not full) --- */}
            {images.length < maxImages && images.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 cursor-pointer flex flex-col items-center justify-center transition-colors"
              >
                 <FileImage size={24} className="text-slate-400 mb-2" />
                 <span className="text-xs font-medium text-slate-500">Add More</span>
                 <span className="text-[10px] text-slate-400">{images.length}/{maxImages}</span>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
      
      {/* --- Footer / Validation Message --- */}
      {images.length === 0 && (
        <div className="flex items-start gap-2 text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100">
           <AlertCircle size={16} className="mt-0.5 shrink-0" />
           <p className="text-xs">
             Upload up to {maxImages} images. High-quality images (1080x1080) are recommended for best product visibility.
           </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;