import { apiSlice } from './apiSlice';

export const payoutApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // SELLER ENDPOINTS
    // ==========================================
    getSellerEarnings: builder.query({
      query: () => '/payouts/seller/earnings',
      providesTags: ['Payout', 'Order'],
    }),

    getSellerPayouts: builder.query({
      query: (params) => ({
        url: '/payouts/seller/history',
        params,
      }),
      providesTags: ['Payout'],
    }),

    getSellerPayoutDetails: builder.query({
      query: (id) => `/payouts/seller/${id}`,
      providesTags: (result, error, id) => [{ type: 'Payout', id }],
    }),

    // ==========================================
    // ADMIN ENDPOINTS - PAYOUTS
    // ==========================================
    getAdminPayoutOverview: builder.query({
      query: () => '/payouts/admin/overview',
      providesTags: ['Payout', 'Order'],
    }),

    getAdminPayouts: builder.query({
      query: (params) => ({
        url: '/payouts/admin/all',
        params,
      }),
      providesTags: ['Payout'],
    }),

    getAdminPayoutDetails: builder.query({
      query: (id) => `/payouts/admin/${id}`,
      providesTags: (result, error, id) => [{ type: 'Payout', id }],
    }),

    getAdminEligibleOrders: builder.query({
      query: () => '/payouts/admin/eligible-orders',
      providesTags: ['Payout', 'Order'],
    }),

    generateAdminPayout: builder.mutation({
      query: (body) => ({
        url: '/payouts/admin/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payout', 'Order'],
    }),

    updateAdminPayoutStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/payouts/admin/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Payout', 'Order'],
    }),

    // ==========================================
    // ADMIN ENDPOINTS - COMMISSIONS
    // ==========================================
    getAdminCommissionConfig: builder.query({
      query: () => '/commissions/config',
      providesTags: ['Commission'],
    }),

    updateAdminCommissionConfig: builder.mutation({
      query: (body) => ({
        url: '/commissions/config',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Commission'],
    }),

    getAdminSellerCommissions: builder.query({
      query: (params) => ({
        url: '/commissions/sellers',
        params,
      }),
      providesTags: ['Commission', 'Seller'],
    }),

    updateAdminSellerCommission: builder.mutation({
      query: ({ sellerId, ...body }) => ({
        url: `/commissions/sellers/${sellerId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Commission', 'Seller'],
    }),
  }),
});

export const {
  // Seller
  useGetSellerEarningsQuery,
  useGetSellerPayoutsQuery,
  useGetSellerPayoutDetailsQuery,
  // Admin Payouts
  useGetAdminPayoutOverviewQuery,
  useGetAdminPayoutsQuery,
  useGetAdminPayoutDetailsQuery,
  useGetAdminEligibleOrdersQuery,
  useGenerateAdminPayoutMutation,
  useUpdateAdminPayoutStatusMutation,
  // Admin Commission
  useGetAdminCommissionConfigQuery,
  useUpdateAdminCommissionConfigMutation,
  useGetAdminSellerCommissionsQuery,
  useUpdateAdminSellerCommissionMutation,
} = payoutApi;
