// reducer.js
import { SET_MESSAGE, SET_EXTRACTED_DATA } from './actions';

const initialState = {
  message: '',
  extractedData: null, // Holds extracted data from uploaded file
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MESSAGE:
      return {
        ...state,
        message: action.payload,
      };

    case SET_EXTRACTED_DATA:
      return {
        ...state,
        extractedData: action.payload,
      };

    default:
      return state;
  }
};

export default rootReducer;
