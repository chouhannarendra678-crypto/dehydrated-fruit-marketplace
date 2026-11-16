import { apiSlice } from './apiSlice';

export const reviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query({
      query: ({ productId, ...params }) => ({
        url: `/reviews/products/${productId}`,
        params,
      }),
      providesTags: (result, error, { productId }) => [{ type: 'Review', id: `prod_${productId}` }],
    }),

    getSellerReviews: builder.query({
      query: ({ sellerId, ...params }) => ({
        url: `/reviews/sellers/${sellerId}`,
        params,
      }),
      providesTags: (result, error, { sellerId }) => [{ type: 'Review', id: `seller_${sellerId}` }],
    }),

    checkReviewEligibility: builder.query({
      query: (params) => ({
        url: '/reviews/eligibility',
        params,
      }),
      providesTags: ['Review'],
    }),

    createProductReview: builder.mutation({
      query: ({ productId, ...body }) => ({
        url: `/reviews/products/${productId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Review', 'Product'],
    }),

    createSellerReview: builder.mutation({
      query: ({ sellerId, ...body }) => ({
        url: `/reviews/sellers/${sellerId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Review', 'Seller'],
    }),

    getSellerDashboardReviews: builder.query({
      query: (params) => ({
        url: '/reviews/seller/my-reviews',
        params,
      }),
      providesTags: ['Review'],
    }),

    sellerReplyToReview: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/reviews/seller/${id}/reply`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Review'],
    }),

    getAdminReviews: builder.query({
      query: (params) => ({
        url: '/reviews/admin/all',
        params,
      }),
      providesTags: ['Review'],
    }),

    adminModerateReview: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/reviews/admin/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Review', 'Product', 'Seller'],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useGetSellerReviewsQuery,
  useCheckReviewEligibilityQuery,
  useCreateProductReviewMutation,
  useCreateSellerReviewMutation,
  useGetSellerDashboardReviewsQuery,
  useSellerReplyToReviewMutation,
  useGetAdminReviewsQuery,
  useAdminModerateReviewMutation,
} = reviewApi;
