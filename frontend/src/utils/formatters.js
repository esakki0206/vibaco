export const formatOrderNumber = (orderId) => {
  if (!orderId) return '';
  return `ORD-${orderId.substring(orderId.length - 8).toUpperCase()}`;
};

export const formatOrderDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatProductName = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const formatCategoryName = (category) => {
  if (!category) return '';
  return category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
