import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MapState {
  value: string[];
}

const initialState: MapState = {
  value: [],
};

export const initialMapSlice = createSlice({
  name: "initialMap",
  initialState,
  reducers: {
    update: (state, action: PayloadAction<string[]>) => {
      console.log("initialMapSlice: update", action.payload);
      state.value = action.payload;
    },
  },
});

export const { update } = initialMapSlice.actions;

export default initialMapSlice.reducer;
