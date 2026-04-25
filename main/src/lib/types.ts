// User Model (100% fields covered)
export interface User {
  _id: string;
  username: string;
  email: string;
  password?: string;
  profilePicture?: string;
  mobileNumber: string;
  isAdmin: boolean;
  isVerified: boolean;
  addresses: Address[];
  cart: Cart;
  orders: string[]; // Order IDs
  createdAt: string;
  updatedAt: string;
}

// Product Model (100% fields covered)
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  images: string[];
  colors: string[];
  sizes: string[];
  isAvailable: boolean;
  isArchived: boolean;
  stock: number;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Cart Model (100% fields covered)
export interface Cart {
  _id: string;
  user: string; // User ID
  items: CartItem[];
  totalPrice: number;
  totalDiscount: number;
  finalPrice: number;
  couponCode?: string;
  couponDiscount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product | string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  price: number;
}

// Order Model (100% fields covered)
export interface Order {
  _id: string;
  user: string; // User ID
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  totalAmount: number;
  discount: number;
  shippingCharge: number;
  finalAmount: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "razorpay" | "stripe" | "cod";
  paymentId?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

// Payment Model (100% fields covered)
export interface Payment {
  _id: string;
  order: string; // Order ID
  amount: number;
  currency: string;
  method: "razorpay" | "stripe" | "cod";
  status: "pending" | "success" | "failed" | "refunded";
  razorpayPaymentId?: string;
  stripePaymentId?: string;
  refunds: string[]; // Refund IDs
  createdAt: string;
  updatedAt: string;
}

// Refund Model (100% fields covered)
export interface Refund {
  _id: string;
  order: string; // Order ID
  payment: string; // Payment ID
  user: string; // User ID
  amount: number;
  reason: string;
  notes?: string;
  status: "pending" | "approved" | "rejected" | "processed";
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Address Model (100% fields covered)
export interface Address {
  _id: string;
  user: string; // User ID
  type: "shipping" | "billing";
  fullName: string;
  mobileNumber: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Post Model (100% fields covered)
export interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: string; // User ID
  categories: string[];
  tags: string[];
  isPublished: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}
