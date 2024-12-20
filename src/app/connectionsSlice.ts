import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Group = {
  elements: string[],
  color: string
}

export interface MapState {
  value: Group[]
}

const initialState: MapState = {
  value: [],
}

export const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    update: (state, action: PayloadAction<Group[]>) => {
      state.value = action.payload
    },
  },
})

export const { update } = connectionsSlice.actions

export default connectionsSlice.reducer