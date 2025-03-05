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
    setLevel: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { increment, setLevel } = levelSlice.actions;

export default levelSlice.reducer;
