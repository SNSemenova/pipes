import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface MapState {
  value: string[]
}

const initialState: MapState = {
  value: [],
}

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    update: (state, action: PayloadAction<string[]>) => {
      state.value = action.payload
    },
  },
})

export const { update } = mapSlice.actions

export default mapSlice.reducer