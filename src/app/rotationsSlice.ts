import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MapState {
  value: number[][];
}

const initialState: MapState = {
  value: [[]],
};

export const rotationsSlice = createSlice({
  name: "rotations",
  initialState,
  reducers: {
    rotate: (
      state,
      action: PayloadAction<{ lineIndex: number; segmentIndex: number }>,
    ) => {
      const { lineIndex, segmentIndex } = action.payload;
      state.value[lineIndex][segmentIndex]++;
    },
    newMap: (state, action: PayloadAction<number>) => {
      state.value = Array.from({ length: action.payload }, () =>
        Array(action.payload).fill(0),
      );
    },
  },
});

export const { rotate, newMap } = rotationsSlice.actions;

export default rotationsSlice.reducer;
