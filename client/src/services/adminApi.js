import { apiSlice } from './apiSlice';

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/admin/dashboard-stats',
      providesTags: ['Admin', 'Order', 'Product', 'Seller'],
    }),

    getCustomers: builder.query({
      query: (params) => ({
        url: '/admin/customers',
        params,
      }),
      providesTags: ['Admin', 'User'],
    }),

    getCustomerById: builder.query({
      query: (id) => `/admin/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    getPlatformSettings: builder.query({
      query: () => '/admin/settings',
      providesTags: ['Admin'],
    }),

    updatePlatformSettings: builder.mutation({
      query: (body) => ({
        url: '/admin/settings',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Admin'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
} = adminApi;
