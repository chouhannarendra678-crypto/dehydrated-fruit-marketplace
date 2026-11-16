import { apiSlice } from './apiSlice';

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublicProducts: builder.query({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: ['Product'],
    }),

    getProductBySlug: builder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Product', id: slug }],
    }),

    getSellerProducts: builder.query({
      query: (params) => ({
        url: '/products/seller/my-products',
        params,
      }),
      providesTags: ['Product'],
    }),

    createProduct: builder.mutation({
      query: (productData) => ({
        url: '/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Product'],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Product'],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    uploadProductImage: builder.mutation({
      query: (body) => ({
        url: '/products/upload-image',
        method: 'POST',
        body,
      }),
    }),

    adminGetAllProducts: builder.query({
      query: (params) => ({
        url: '/products/admin/all',
        params,
      }),
      providesTags: ['Product'],
    }),

    adminUpdateProductStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/products/admin/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetPublicProductsQuery,
  useGetProductBySlugQuery,
  useGetSellerProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
  useAdminGetAllProductsQuery,
  useAdminUpdateProductStatusMutation,
} = productApi;
