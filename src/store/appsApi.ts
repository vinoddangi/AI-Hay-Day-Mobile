import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseUrl = import.meta.env.VITE_APPS_SCRIPT_BASE || ''

export const appsApi = createApi({
  reducerPath: 'appsApi',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Sales', 'Purchase', 'Cash', 'Credit', 'Customers'],
  endpoints: (builder) => ({
    createSale: builder.mutation({
      query: (body) => ({ url: '/sales', method: 'POST', body }),
      invalidatesTags: ['Sales'],
    }),
    getSales: builder.query({
      query: (params) => ({ url: '/sales', params }),
      providesTags: ['Sales'],
    }),

    createPurchase: builder.mutation({
      query: (body) => ({ url: '/purchase', method: 'POST', body }),
      invalidatesTags: ['Purchase'],
    }),
    getPurchase: builder.query({
      query: (params) => ({ url: '/purchase', params }),
      providesTags: ['Purchase'],
    }),

    createCash: builder.mutation({
      query: (body) => ({ url: '/cash', method: 'POST', body }),
      invalidatesTags: ['Cash'],
    }),
    getCash: builder.query({
      query: (params) => ({ url: '/cash', params }),
      providesTags: ['Cash'],
    }),

    createCredit: builder.mutation({
      query: (body) => ({ url: '/credit', method: 'POST', body }),
      invalidatesTags: ['Credit'],
    }),
    getCredit: builder.query({
      query: (params) => ({ url: '/credit', params }),
      providesTags: ['Credit'],
    }),
    // Customers
    createCustomer: builder.mutation({
      query: (body) => ({ url: '/customers', method: 'POST', body }),
    }),
    getCustomers: builder.query({
      query: (params) => ({ url: '/customers', params }),
    }),
  }),
})

export const {
  useCreateSaleMutation,
  useGetSalesQuery,
  useCreatePurchaseMutation,
  useGetPurchaseQuery,
  useCreateCashMutation,
  useGetCashQuery,
  useCreateCreditMutation,
  useGetCreditQuery,
  useCreateCustomerMutation,
  useGetCustomersQuery,
} = appsApi

export default appsApi
