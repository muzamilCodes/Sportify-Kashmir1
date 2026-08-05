"use client";

import {
  Clock,
  Heart,
  ShoppingCart,
  Tag,
  Sparkles,
  Filter,
  ChevronDown,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProductCard from "@/components/ProductCard";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  productImgUrls: string[];
  category?: { _id: string; name: string } | string;
  isAvailable: boolean;
  stock: number;
  onSale: boolean;
}

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    fetchNewProducts();
    // Load wishlist
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Error parsing wishlist:", e);
      }
    }
  }, []);

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${url}`;
  };

  const fetchNewProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/getAll`);
      const result = await response.json();
      
      if (result.success && result.data) {
        // Filter out unavailable products and sort by _id descending (newest first)
        const availableProducts = result.data.filter((p: any) => p.isAvailable === true);
        const sortedProducts = availableProducts.sort((a: any, b: any) => {
            // MongoDB ObjectIds can be compared as strings for timestamp ordering
            return b._id.localeCompare(a._id);
        });
        setProducts(sortedProducts.slice(0, 20)); // show latest 20
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load new arrivals");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price - (price * discount) / 100;
  };

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    if (!token) {
      toast.error("Please login to add items to cart");
      return;
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/add-to-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success("Added to cart");
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("An error occurred");
    }
  };

  const toggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    let newWishlist;
    if (wishlist.includes(productId)) {
      newWishlist = wishlist.filter(id => id !== productId);
      toast.success("Removed from wishlist", { icon: "💔" });
    } else {
      newWishlist = [...wishlist, productId];
      toast.success("Added to wishlist", { icon: "❤️" });
    }
    
    setWishlist(newWishlist);
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 py-20 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl backdrop-blur-md mb-6 border border-white/20 shadow-xl">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            New <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Arrivals</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto font-medium">
            Discover the latest sports gear, fresh off the production line. Elevate your game with our newest premium equipment.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Fresh Drops</h2>
            <p className="text-gray-500 mt-1">Showing the latest {products.length} products</p>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading new arrivals...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => {
              const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
              const hasDiscount = !!(product.discount && product.discount > 0);
              
              return (
                <ProductCard
                  key={product._id}
                  product={product as any}
                  discountedPrice={discountedPrice}
                  hasDiscount={hasDiscount}
                  wishlist={wishlist}
                  getImageUrl={getImageUrl}
                  handleAddToCart={handleAddToCart}
                  toggleWishlist={toggleWishlist}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No New Arrivals Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
              Check back soon for the latest sports equipment and apparel.
            </p>
            <Link href="/products" className="inline-flex bg-gray-900 text-white px-8 py-3.5 rounded-full font-bold hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/25 hover:-translate-y-1">
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
