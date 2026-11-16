import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Product', 'Seller', 'Order', 'Review', 'Category', 'Admin', 'Cart', 'Address', 'Payout', 'Commission'],
  endpoints: (builder) => ({
    getApiHealth: builder.query({
      query: () => '/health',
    }),
  }),
});

export const { useGetApiHealthQuery } = apiSlice;

