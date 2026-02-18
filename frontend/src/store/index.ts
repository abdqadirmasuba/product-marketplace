import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'],
  blacklist: [],
  transforms: [
    {
      in: (state: any) => {
        if (state?.auth) {
          return {
            ...state,
            auth: {
              ...state.auth,
              isLoading: true, // Always start with loading true
            }
          };
        }
        return state;
      },
      out: (state: any) => state,
    }
  ]
};

const rootReducer = combineReducers({
  auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
