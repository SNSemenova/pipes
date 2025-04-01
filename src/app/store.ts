import { configureStore } from "@reduxjs/toolkit";
import mapReducer from "./mapSlice";
import levelReducer from "./levelSlice";
import connectionsReducer from "./connectionsSlice";
import temporaryConnectionsReducer from "./temporaryConnectionsSlice";
import rotationsSliceReducer from "./rotationsSlice";
import initialMapReducer from "./initialMapSlice";

export const store = configureStore({
  reducer: {
    map: mapReducer,
    level: levelReducer,
    connections: connectionsReducer,
    temporaryConnections: temporaryConnectionsReducer,
    rotations: rotationsSliceReducer,
    initialMap: initialMapReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
