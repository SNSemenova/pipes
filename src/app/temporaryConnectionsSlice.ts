import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Group = {
  elements: string[];
  color: string;
};

export interface MapState {
  value: Group[];
}

const initialState: MapState = {
  value: [],
};

export const temporaryConnectionsSlice = createSlice({
  name: "temporaryConnections",
  initialState,
  reducers: {
    updateConnections: (state, action: PayloadAction<Group[]>) => {
      state.value = action.payload;
    },
  },
});

export const { updateConnections } = temporaryConnectionsSlice.actions;

export default temporaryConnectionsSlice.reducer;
