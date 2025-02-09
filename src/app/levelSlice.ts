import { createSlice } from "@reduxjs/toolkit";

export interface LevelState {
  value: number;
}

const initialState: LevelState = {
  value: 1,
};

export const levelSlice = createSlice({
  name: "level",
  initialState,
  reducers: {
    increment: (state) => {
      state.value++;
    },
  },
});

export const { increment } = levelSlice.actions;

export default levelSlice.reducer;
