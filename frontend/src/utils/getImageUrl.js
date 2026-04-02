export const getImageUrl = (image) => {
  if (!image) return '/placeholder.png';

  // ✅ Cloudinary object format: { url: '...', publicId: '...' }
  if (image.url) return image.url;

  // ✅ Plain string URL (e.g. variant images stored as direct URLs)
  if (typeof image === 'string' && image.startsWith('http')) return image;

  // ❌ Unrecognized format → fallback
  return '/placeholder.png';
};
