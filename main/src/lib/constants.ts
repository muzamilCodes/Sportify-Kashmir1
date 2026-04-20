// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// App Constants
export const APP_NAME = "Sportify Kashmir";
export const APP_DESCRIPTION =
  "Kashmir's premier destination for sports gear, equipment, and athletic apparel";

// Sports Categories
export const SPORTS_CATEGORIES = [
  {
    name: "Cricket",
    slug: "cricket",
    icon: "🏏",
    subcategories: ["Bats", "Balls", "Pads", "Gloves", "Helmets", "Shoes"],
  },
  {
    name: "Football",
    slug: "football",
    icon: "⚽",
    subcategories: [
      "Footballs",
      "Boots",
      "Jerseys",
      "Shin Guards",
      "Goal Gloves",
    ],
  },
  {
    name: "Fitness",
    slug: "fitness",
    icon: "🏋️",
    subcategories: [
      "Dumbbells",
      "Yoga Mats",
      "Gym Wear",
      "Supplements",
      "Accessories",
    ],
  },
  {
    name: "Tennis",
    slug: "tennis",
    icon: "🎾",
    subcategories: ["Rackets", "Balls", "Strings", "Grips", "Shoes"],
  },
  {
    name: "Basketball",
    slug: "basketball",
    icon: "🏀",
    subcategories: ["Basketballs", "Shoes", "Jerseys", "Accessories"],
  },
  {
    name: "Badminton",
    slug: "badminton",
    icon: "🏸",
    subcategories: ["Rackets", "Shuttles", "Strings", "Grips", "Shoes"],
  },
];

// Payment Methods
export const PAYMENT_METHODS = [
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay when you receive the order",
  },
  {
    id: "razorpay",
    name: "Credit/Debit Card",
    description: "Pay securely with your card",
  },
];

// Order Statuses
export const ORDER_STATUSES = [
  { id: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { id: "processing", label: "Processing", color: "bg-blue-100 text-blue-800" },
  { id: "shipped", label: "Shipped", color: "bg-purple-100 text-purple-800" },
  { id: "delivered", label: "Delivered", color: "bg-green-100 text-green-800" },
  { id: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  CART_ID: "cartId",
  CART: "cart",
};

// Form Validation
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/user/login",
  REGISTER: "/user/register",
  LOGOUT: "/user/logout",
  PROFILE: "/user/profile",

  // Products
  PRODUCTS: "/product/getAll",
  PRODUCT: (id: string) => `/product/get/${id}`,

  // Cart
  CART: "/cart",
  ADD_TO_CART: (id: string) => `/cart/addtoCart/${id}`,
  UPDATE_QUANTITY: (id: string) => `/cart/updateQuantity/${id}`,
  REMOVE_FROM_CART: (id: string) => `/cart/removeFromCart/${id}`,

  // Orders
  ORDERS: "/orders",
  ORDER: (id: string) => `/orders/${id}`,

  // Addresses
  ADDRESSES: "/addresses",
  ADDRESS: (id: string) => `/addresses/${id}`,

  // Admin
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_USERS: "/admin/users",
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "Please login to continue.",
  FORBIDDEN: "You don't have permission to access this resource.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  REGISTER_SUCCESS: "Account created successfully!",
  CART_ADD_SUCCESS: "Added to cart!",
  ORDER_PLACE_SUCCESS: "Order placed successfully!",
  PROFILE_UPDATE_SUCCESS: "Profile updated successfully!",
};

// Loading Messages
export const LOADING_MESSAGES = {
  LOADING: "Loading...",
  SAVING: "Saving...",
  PROCESSING: "Processing...",
  UPLOADING: "Uploading...",
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
  MAX_FILES: 5,
};

// Colors
export const COLORS = {
  PRIMARY: "#3B82F6",
  SECONDARY: "#10B981",
  ACCENT: "#8B5CF6",
  WARNING: "#F59E0B",
  ERROR: "#EF4444",
  SUCCESS: "#10B981",
};

// Breakpoints (Tailwind CSS)
export const BREAKPOINTS = {
  SM: "640px",
  MD: "768px",
  LG: "1024px",
  XL: "1280px",
  "2XL": "1536px",
};
