import { configureStore } from "@reduxjs/toolkit";
import mapReducer from "./mapSlice";
import levelReducer from "./levelSlice";
import connectionsReducer from "./connectionsSlice";
import temporaryConnectionsReducer from "./temporaryConnectionsSlice";

export const store = configureStore({
  reducer: {
    map: mapReducer,
    level: levelReducer,
    connections: connectionsReducer,
    temporaryConnections: temporaryConnectionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
