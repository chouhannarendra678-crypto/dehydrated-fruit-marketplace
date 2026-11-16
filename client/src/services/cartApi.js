import { apiSlice } from './apiSlice';

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),

    addItemToCart: builder.mutation({
      query: (body) => ({
        url: '/cart/items',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),

    updateCartItemQuantity: builder.mutation({
      query: ({ itemId, quantity }) => ({
        url: `/cart/items/${itemId}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),

    removeCartItem: builder.mutation({
      query: (itemId) => ({
        url: `/cart/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    clearCart: builder.mutation({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    syncGuestCart: builder.mutation({
      query: (items) => ({
        url: '/cart/sync',
        method: 'POST',
        body: { items },
      }),
      invalidatesTags: ['Cart'],
    }),

    validateCheckout: builder.mutation({
      query: (body) => ({
        url: '/cart/validate-checkout',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddItemToCartMutation,
  useUpdateCartItemQuantityMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useSyncGuestCartMutation,
  useValidateCheckoutMutation,
} = cartApi;
