import { apiSlice } from './apiSlice';

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createRazorpayOrder: builder.mutation({
      query: (body) => ({
        url: '/payments/create-order',
        method: 'POST',
        body,
      }),
    }),

    verifyPayment: builder.mutation({
      query: (body) => ({
        url: '/payments/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),

    recordPaymentFailure: builder.mutation({
      query: (body) => ({
        url: '/payments/failure',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useCreateRazorpayOrderMutation,
  useVerifyPaymentMutation,
  useRecordPaymentFailureMutation,
} = paymentApi;
