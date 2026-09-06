import { createSlice } from '@reduxjs/toolkit'

interface UiState {
  isMenuOpen: boolean
  count: number
}

const initialState: UiState = {
  isMenuOpen: false,
  count: 0,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openMenu: (state) => {
      state.isMenuOpen = true
    },
    closeMenu: (state) => {
      state.isMenuOpen = false
    },
    incrementCount: (state) => {
      state.count += 1
    },
  },
})

export const { openMenu, closeMenu, incrementCount } = uiSlice.actions
export const selectIsMenuOpen = (state: { ui: UiState }) => state.ui.isMenuOpen
export default uiSlice.reducer
