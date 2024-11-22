import { configureStore } from "@reduxjs/toolkit";
import reducer from "./reducer"; // Path to your reducer.js

const store = configureStore({
  reducer: {
    data: reducer, // Key "data" matches how you're accessing it in FileUpload.js
  },
});

export default store;
