import { apiSlice } from './apiSlice';

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Customer
    createOrder: builder.mutation({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order', 'Cart', 'Product'],
    }),

    getCustomerOrders: builder.query({
      query: (params) => ({
        url: '/orders',
        params,
      }),
      providesTags: ['Order'],
    }),

    getCustomerOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    cancelCustomerOrder: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Order', 'Product'],
    }),

    // Seller
    getSellerOrders: builder.query({
      query: (params) => ({
        url: '/orders/seller/my-orders',
        params,
      }),
      providesTags: ['Order'],
    }),

    getSellerOrderById: builder.query({
      query: (id) => `/orders/seller/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    updateSellerOrderStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/orders/seller/orders/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Order'],
    }),

    // Admin
    getAdminOrders: builder.query({
      query: (params) => ({
        url: '/orders/admin/all',
        params,
      }),
      providesTags: ['Order'],
    }),

    getAdminOrderById: builder.query({
      query: (id) => `/orders/admin/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    adminUpdateOrderStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/orders/admin/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetCustomerOrdersQuery,
  useGetCustomerOrderByIdQuery,
  useCancelCustomerOrderMutation,
  useGetSellerOrdersQuery,
  useGetSellerOrderByIdQuery,
  useUpdateSellerOrderStatusMutation,
  useGetAdminOrdersQuery,
  useGetAdminOrderByIdQuery,
  useAdminUpdateOrderStatusMutation,
} = orderApi;
