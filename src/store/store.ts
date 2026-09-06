import { configureStore } from '@reduxjs/toolkit'
import { appsApi } from './appsApi'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [appsApi.reducerPath]: appsApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(appsApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
