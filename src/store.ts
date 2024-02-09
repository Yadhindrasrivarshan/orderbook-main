import { configureStore } from '@reduxjs/toolkit';
import orderbookReducer from './components/OrderBook/orderbookSlice';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, orderbookReducer);

export const store = configureStore({
  reducer: {
    orderbook: persistedReducer,
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const persistor = persistStore(store)
