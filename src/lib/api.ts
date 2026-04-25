import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Product API functions
export const productApi = {
  // Get all products
  getAllProducts: async () => {
    const response = await api.get("/product/getAll");
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async () => {
    const response = await api.get("/product/getAll");
    const data = response.data;
    if (data.success && data.data) {
      return {
        ...data,
        data: data.data.filter(
          (product: any) => product.isAvailable && !product.isArchived,
        ),
      };
    }
    return data;
  },

  // ✅ FIXED: Get products by category using backend endpoint
  getProductsByCategory: async (category: string) => {
    try {
      // Backend has dedicated endpoint: /product/category/:category
      const response = await api.get(`/product/category/${category}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return { success: false, data: [], message: "Error fetching products" };
    }
  },

  // Get products on sale
  getSaleProducts: async () => {
    try {
      const response = await api.get("/product/sale");
      return response.data;
    } catch (error) {
      console.error("Error fetching sale products:", error);
      return { success: false, data: [], message: "Error fetching sale products" };
    }
  },

  // Get single product
  getProduct: async (id: string) => {
    const response = await api.get(`/product/get/${id}`);
    return response.data;
  },
};

// Category API functions
export const categoryApi = {
  getAllCategories: async () => {
    const response = await api.get("/category/all");
    return response.data;
  },

  addCategory: async (data: { name: string; description: string }) => {
    const token = localStorage.getItem("token");
    const response = await api.post("/category/add", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  editCategory: async (categoryId: string, data: { name: string; description: string }) => {
    const token = localStorage.getItem("token");
    const response = await api.put(`/category/edit/${categoryId}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  deleteCategory: async (categoryId: string) => {
    const token = localStorage.getItem("token");
    const response = await api.delete(`/category/delete/${categoryId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

// Brand API functions
export const brandApi = {
  getAllBrands: async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brand/all`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching brands:", error);
      return { success: false, message: "Failed to fetch brands", data: [] };
    }
  },

  getBrandById: async (brandId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brand/${brandId}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching brand:", error);
      return { success: false, message: "Failed to fetch brand" };
    }
  },

  addBrand: async (data: { name: string; description: string }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brand/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error adding brand:", error);
      return { success: false, message: "Failed to add brand" };
    }
  },

  editBrand: async (brandId: string, data: { name: string; description: string }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brand/edit/${brandId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error editing brand:", error);
      return { success: false, message: "Failed to edit brand" };
    }
  },

  deleteBrand: async (brandId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brand/delete/${brandId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error deleting brand:", error);
      return { success: false, message: "Failed to delete brand" };
    }
  },
};