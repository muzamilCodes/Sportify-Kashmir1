// src/redux/cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";

// Fetch Cart
export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get("/cart/getCart");
    return res.data.payload;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// Remove Item from Cart
export const removeFromCart = createAsyncThunk("cart/removeFromCart", async (productId, { dispatch, rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/cart/removeFromCart/${productId}`);
    toast.success(res.data.message);
    // Refetch cart after removal
    dispatch(fetchCart());
    return productId;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer;
