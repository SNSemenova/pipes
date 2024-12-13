import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface MapState {
  value: Array<string>[]
}

const initialState: MapState = {
  value: [],
}

export const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    update: (state, action: PayloadAction<Array<string>[]>) => {
      state.value = action.payload
    },
  },
})

export const { update } = connectionsSlice.actions

export default connectionsSlice.reducer