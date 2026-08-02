// src/redux/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";

// Login user
export const loginUser = createAsyncThunk(
  "user/login",
  async ({ email, password, navigate }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/user/login", { email, password });
      if (res.status === 200) {
        toast.success(res.data.message);

        // Redirect after login
        setTimeout(() => {
          if (res.data.payload.isAdmin) {
            navigate("/admin/dashboard");
          } else {
            navigate("/user/dashboard");
          }
        }, 2000);

        return res.data.payload; // Store user data in Redux
      }
    } catch (error) {
      if (error.response) {
        if ([400, 401, 403, 500].includes(error.response.status)) {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error("Network Error!");
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
