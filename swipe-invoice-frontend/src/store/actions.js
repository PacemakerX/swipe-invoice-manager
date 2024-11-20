// actions.js
export const SET_MESSAGE = 'SET_MESSAGE';
export const SET_EXTRACTED_DATA = 'SET_EXTRACTED_DATA';

export const setMessage = (message) => ({
  type: SET_MESSAGE,
  payload: message,
});

export const setExtractedData = (data) => ({
  type: SET_EXTRACTED_DATA,
  payload: data,
});
