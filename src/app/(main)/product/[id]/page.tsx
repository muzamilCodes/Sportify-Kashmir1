"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  Minus,
  Plus,
  Facebook,
  Twitter,
  Linkedin,
  AlertCircle,
  Package,
  Tag,
  Zap,
  ThumbsUp,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  productImgUrls: string[];
  colors: string[];
  sizes: string[];
  isAvailable: boolean;
  stock: number;
  category?: { _id: string; name: string } | string;
  brand?: { _id: string; name: string } | string;
  tags: string[];
  onSale?: boolean;
  createdAt: string;
}

interface RelatedProduct {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  productImgUrls: string[];
  stock: number;
  isAvailable: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchRelatedProducts();
    }
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, [productId]);

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${url}`;
  };

  const getCategoryName = (category: Product['category']): string => {
    if (!category) return '';
    if (typeof category === 'object' && category !== null) {
      return category.name || '';
    }
    if (typeof category === 'string') return category;
    return '';
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/get/${productId}`);
      const result = await response.json();

      if (result.success && result.data) {
        const productData = {
          ...result.data,
          stock: result.data.stock || 10,
        };
        setProduct(productData);
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/getAll`);
      const result = await response.json();
      if (result.success && result.data) {
        // Get products from same category, excluding current product
        const related = result.data
          .filter((p: any) => p._id !== productId && p.isAvailable && !p.isArchived)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  // const handleAddToCart = async () => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const cartId = localStorage.getItem("cartId");
  //     const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  //     const headers: Record<string, string> = {
  //       "Content-Type": "application/json",
  //     };

  //     if (token) {
  //       headers["Authorization"] = `Bearer ${token}`;
  //     }

  //     const body: any = {
  //       quantity,
  //       color: selectedColor,
  //       size: selectedSize,
  //     };

  //     if (!token && cartId) {
  //       body.cartId = cartId;
  //     }

  //     const response = await fetch(`${apiUrl}/cart/addtoCart/${product?._id}`, {
  //       method: "POST",
  //       headers,
  //       body: JSON.stringify(body),
  //     });

  //     const result = await response.json();

  //     if (result.success) {
  //       if (!token && result.data && result.data._id) {
  //         localStorage.setItem("cartId", result.data._id);
  //       }
  //       toast.success("Added to cart!");
  //     } else {
  //       toast.error(result.message || "Failed to add to cart");
  //     }
  //   } catch (error) {
  //     console.error("Add to cart error:", error);
  //     toast.error("Failed to add to cart");
  //   }
  // };
  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const cartId = localStorage.getItem("cartId");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const body: any = {
        quantity,
        color: selectedColor,
        size: selectedSize,
      };
      if (!token && cartId) body.cartId = cartId;

      const response = await fetch(`${apiUrl}/cart/addtoCart/${product?._id}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (result.success) {
        if (!token && result.data && result.data._id) {
          localStorage.setItem("cartId", result.data._id);
        }
        toast.success("Added to cart!");

        // ✅ FIX: Trigger cart update event
        window.dispatchEvent(new Event("cartUpdated"));

      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    }
  };
  // const handleBuyNow = async () => {
  //   await handleAddToCart();
  //   router.push("/checkout");
  // };
const handleBuyNow = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    // ✅ First add to cart
    const response = await fetch(`${apiUrl}/cart/addtoCart/${product?._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        quantity: quantity,
        color: selectedColor,
        size: selectedSize,
      }),
    });

    const result = await response.json();

    if (result.success) {
      // ✅ Trigger cart update
      window.dispatchEvent(new Event("cartUpdated"));
      
      // ✅ Show loading toast
      toast.loading("Adding to cart...", { id: "buynow" });
      
      // ✅ Directly go to checkout
      setTimeout(() => {
        toast.dismiss("buynow");
        toast.success("Redirecting to checkout!");
        router.push("/checkout");
      }, 500);
      
    } else {
      toast.error(result.message || "Failed to add to cart");
    }
  } catch (error) {
    console.error("Buy now error:", error);
    toast.error("Failed to process");
  }
};
  const toggleWishlist = () => {
    if (!product) return;
    let newWishlist: string[];
    if (wishlist.includes(product._id)) {
      newWishlist = wishlist.filter(id => id !== product._id);
      toast.success("Removed from wishlist");
    } else {
      newWishlist = [...wishlist, product._id];
      toast.success("Added to wishlist");
    }
    setWishlist(newWishlist);
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out ${product?.name} on Sportify Kashmir!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const calculateDiscountedPrice = () => {
    if (!product) return 0;
    if (product.discount && product.discount > 0) {
      return product.price - (product.price * product.discount) / 100;
    }
    return product.price;
  };

  const discountPrice = calculateDiscountedPrice();
  const hasDiscount = product?.discount && product.discount > 0;
  const saving = product ? product.price - discountPrice : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link href="/products" className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-orange-500">Products</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Product Main Section */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square mb-4">
                {product.productImgUrls && product.productImgUrls.length > 0 ? (
                  <img
                    src={getImageUrl(product.productImgUrls[selectedImage])}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image available
                  </div>
                )}
                {hasDiscount && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {product.discount}% OFF
                  </div>
                )}
                {product.onSale && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    SALE
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.productImgUrls && product.productImgUrls.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.productImgUrls.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${selectedImage === index
                          ? "border-orange-500 shadow-md"
                          : "border-gray-200 hover:border-gray-400"
                        }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Category/Brand Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {product.category && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {getCategoryName(product.category)}
                  </span>
                )}
                {product.brand && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {typeof product.brand === 'object' ? product.brand.name : product.brand}
                  </span>
                )}
                {product.stock > 0 ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> In Stock
                  </span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <Star className="w-5 h-5 text-gray-300" />
                </div>
                <span className="text-sm text-gray-500">(128 reviews)</span>
                <button className="text-sm text-blue-600 hover:text-blue-700">Write a review</button>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-bold text-orange-600">
                    ₹{discountPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ₹{product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-green-600 font-medium">
                        Save ₹{saving.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
                {hasDiscount && (
                  <p className="text-sm text-green-600 mt-1">
                    You save {product.discount}% on this purchase
                  </p>
                )}
              </div>

              {/* Stock Info */}
              {product.stock < 10 && product.stock > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-yellow-700">
                    Only {product.stock} items left in stock! Order soon.
                  </span>
                </div>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-lg text-sm capitalize transition ${selectedColor === color
                            ? "border-orange-500 bg-orange-50 text-orange-600"
                            : "border-gray-300 hover:border-gray-400"
                          }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Sizes</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700">Size Guide</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 border rounded-lg text-sm font-medium transition ${selectedSize === size
                            ? "border-orange-500 bg-orange-50 text-orange-600"
                            : "border-gray-300 hover:border-gray-400"
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-100 transition disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 hover:bg-gray-100 transition disabled:opacity-50"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.stock} items available
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.isAvailable || product.stock === 0}
                  className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}  // ✅ Call handleBuyNow directly
                  disabled={!product.isAvailable || product.stock === 0}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Buy Now
                </button>
                <button
                  onClick={toggleWishlist}
                  className="p-3 border rounded-xl hover:bg-gray-50 transition"
                >
                  <Heart className={`w-5 h-5 ${wishlist.includes(product._id) ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                </button>
                <button
                  onClick={shareProduct}
                  className="p-3 border rounded-xl hover:bg-gray-50 transition"
                >
                  <Share2 className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Delivery Info */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span>Free delivery on orders above ₹999</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>7-day return policy</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <RotateCcw className="w-5 h-5 text-purple-600" />
                  <span>Easy returns & exchanges</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border mb-8">
          <div className="border-b">
            <div className="flex gap-6 px-6">
              <button
                onClick={() => setActiveTab("description")}
                className={`py-4 font-medium transition ${activeTab === "description"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={`py-4 font-medium transition ${activeTab === "details"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-4 font-medium transition ${activeTab === "reviews"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                Reviews (128)
              </button>
            </div>
          </div>
          <div className="p-6">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {product.description || "No description available for this product."}
                </p>
              </div>
            )}
            {activeTab === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex py-2 border-b">
                    <span className="w-32 text-gray-500">Product Name</span>
                    <span className="text-gray-900">{product.name}</span>
                  </div>
                  <div className="flex py-2 border-b">
                    <span className="w-32 text-gray-500">Price</span>
                    <span className="text-gray-900">₹{product.price}</span>
                  </div>
                  {hasDiscount && (
                    <div className="flex py-2 border-b">
                      <span className="w-32 text-gray-500">Discount</span>
                      <span className="text-green-600">{product.discount}% OFF</span>
                    </div>
                  )}
                  <div className="flex py-2 border-b">
                    <span className="w-32 text-gray-500">Stock Status</span>
                    <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
                      {product.stock > 0 ? `${product.stock} items` : "Out of Stock"}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex py-2 border-b">
                    <span className="w-32 text-gray-500">Category</span>
                    <span className="text-gray-900">{getCategoryName(product.category)}</span>
                  </div>
                  {product.brand && (
                    <div className="flex py-2 border-b">
                      <span className="w-32 text-gray-500">Brand</span>
                      <span className="text-gray-900">{typeof product.brand === 'object' ? product.brand.name : product.brand}</span>
                    </div>
                  )}
                  <div className="flex py-2 border-b">
                    <span className="w-32 text-gray-500">Colors</span>
                    <span className="text-gray-900">{product.colors?.join(", ") || "N/A"}</span>
                  </div>
                  <div className="flex py-2 border-b">
                    <span className="w-32 text-gray-500">Sizes</span>
                    <span className="text-gray-900">{product.sizes?.join(", ") || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="text-center py-8">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600 mb-4">Be the first to review this product</p>
                <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">
                  Write a Review
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
              <Link href="/products" className="text-orange-600 hover:text-orange-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => {
                const relatedDiscountedPrice = relatedProduct.discount
                  ? relatedProduct.price - (relatedProduct.price * relatedProduct.discount) / 100
                  : relatedProduct.price;
                const hasRelatedDiscount = relatedProduct.discount && relatedProduct.discount > 0;

                return (
                  <Link key={relatedProduct._id} href={`/product/${relatedProduct._id}`} className="group">
                    <div className="bg-white rounded-xl shadow-sm border hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:-translate-y-1">
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        {relatedProduct.productImgUrls?.[0] ? (
                          <img
                            src={getImageUrl(relatedProduct.productImgUrls[0])}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                        )}
                        {hasRelatedDiscount && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {relatedProduct.discount}% OFF
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 min-h-[40px] group-hover:text-orange-600 transition">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-base font-bold text-orange-600">₹{relatedDiscountedPrice.toFixed(2)}</span>
                          {hasRelatedDiscount && (
                            <span className="text-xs text-gray-400 line-through">₹{relatedProduct.price.toFixed(2)}</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart();
                          }}
                          className="w-full bg-gray-900 text-white py-1.5 text-sm rounded-lg font-medium hover:bg-orange-600 transition flex items-center justify-center gap-1"
                        >
                          <ShoppingCart size={14} />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}