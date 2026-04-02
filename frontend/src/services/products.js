import api from './api';

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getFeaturedProducts = async (limit = 10) => {
  const response = await api.get('/products/featured', { params: { limit } });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const searchProducts = async (query, params = {}) => {
  const response = await api.get('/products/search', { params: { q: query, ...params } });
  return response.data;
};

export const getProductsByCategory = async (category, params = {}) => {
  const response = await api.get(`/products/category/${category}`, { params });
  return response.data;
};

export const getProductsByOccasion = async (occasion, params = {}) => {
  const response = await api.get(`/products/occasion/${occasion}`, { params });
  return response.data;
};

export const addReview = async (productId, reviewData) => {
  const response = await api.post(`/products/${productId}/review`, reviewData);
  return response.data;
};

export const productsApi = {
  getProducts,
  getFeaturedProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getProductsByOccasion,
  addReview
};

export default productsApi;
