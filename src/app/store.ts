import { configureStore } from '@reduxjs/toolkit'
import mapReducer from "../components/mapSlice";
import levelReducer from "../components/levelSlice"

export const store = configureStore({
  reducer: {
    map: mapReducer,
    level: levelReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch