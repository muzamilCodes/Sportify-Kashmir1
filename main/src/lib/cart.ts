import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const cartApi = {
  // Add to cart
  addToCart: async (
    productId: string,
    quantity: number = 1,
    cartId?: string,
  ) => {
    const body: any = { quantity };
    if (cartId) body.cartId = cartId;

    const response = await api.post(`/cart/addtoCart/${productId}`, body);
    return response.data;
  },

  // Get cart for authenticated user
  getCart: async () => {
    const response = await api.get("/cart/getCart");
    return response.data;
  },

  // Get guest cart
  getGuestCart: async (cartId: string) => {
    const response = await api.get(`/cart/getGuestCart/${cartId}`);
    return response.data;
  },

  // Update quantity
  updateQuantity: async (productId: string, quantity: number) => {
    const response = await api.post(`/cart/updateQuantity/${productId}`, {
      quantity,
    });
    return response.data;
  },

  // Remove from cart
  removeFromCart: async (productId: string) => {
    const response = await api.get(`/cart/removeFromCart/${productId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await api.delete("/cart/clear");
    return response.data;
  },

  // Apply coupon
  applyCoupon: async (code: string) => {
    const response = await api.post("/cart/apply-coupon", { code });
    return response.data;
  },
};

export default cartApi;
