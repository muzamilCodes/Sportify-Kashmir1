import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  paymentMethod: "cod", // default
  currentOrder: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearOrder: (state) => {
      state.currentOrder = null;
      state.paymentMethod = "cod";
    },
  },
});

export const { setPaymentMethod, setCurrentOrder, clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
