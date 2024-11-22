const initialState = {
  message: "",
  extractedData: {
    invoices: [],
    products: [],
    customers: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case "SET_MESSAGE":
      return { ...state, message: action.payload };
    case "SET_EXTRACTED_DATA":
      return { ...state, extractedData: action.payload };
    default:
      return state;
  }
}
