import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducer'; // Your root reducer

const store = configureStore({
  reducer: rootReducer,  // Your combined reducers
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()  // Default middleware setup
});

export default store;
