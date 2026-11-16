import { apiSlice } from './apiSlice';

export const sellerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSellerProfile: builder.query({
      query: () => '/sellers/me',
      providesTags: ['Seller'],
    }),

    updateSellerProfile: builder.mutation({
      query: (profileData) => ({
        url: '/sellers/me',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Seller', 'User'],
    }),

    getSellerDashboardStats: builder.query({
      query: () => '/sellers/dashboard-stats',
      providesTags: ['Seller'],
    }),

    getSellerStoreBySlug: builder.query({
      query: (slug) => `/sellers/store/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Seller', id: slug }],
    }),

    getPublicSellers: builder.query({
      query: (params) => ({
        url: '/sellers',
        params,
      }),
      providesTags: ['Seller'],
    }),

    adminGetAllSellers: builder.query({
      query: (params) => ({
        url: '/sellers/admin/all',
        params,
      }),
      providesTags: ['Seller'],
    }),

    adminUpdateSellerStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/sellers/admin/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Seller'],
    }),
  }),
});

export const {
  useGetSellerProfileQuery,
  useUpdateSellerProfileMutation,
  useGetSellerDashboardStatsQuery,
  useGetSellerStoreBySlugQuery,
  useGetPublicSellersQuery,
  useAdminGetAllSellersQuery,
  useAdminUpdateSellerStatusMutation,
} = sellerApi;
