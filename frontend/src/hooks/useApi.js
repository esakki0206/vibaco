import { useState, useCallback, useEffect } from 'react';
import api from '../services/api';

export const useApi = (url, method = 'GET', initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (body = null) => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        url,
        method,
        data: body
      };
      const response = await api(config);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, method]);

  useEffect(() => {
    if (method === 'GET') {
      fetchData();
    }
  }, [fetchData, method]);

  return { data, loading, error, refetch: fetchData };
};
