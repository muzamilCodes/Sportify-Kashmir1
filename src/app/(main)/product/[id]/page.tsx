"use client";
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
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
  Bell,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import { resolveProductImage } from "@/lib/imageHelper";

const ProductCard = dynamic(() => import("@/components/ProductCard"), {
  loading: () => <div className="h-80 rounded-xl bg-gray-100 animate-pulse" />,
});

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

interface Review { _id: string; rating: number; title?: string; comment: string; createdAt: string; user?: { username?: string } }

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState({ average: 0, count: 0 });
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [reviewing, setReviewing] = useState(false);
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifying, setNotifying] = useState(false);
  const relatedSectionRef = useRef<HTMLDivElement>(null);
  const relatedRequestedRef = useRef(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      const recent = JSON.parse(localStorage.getItem("recentlyViewed") || "[]") as string[];
      localStorage.setItem("recentlyViewed", JSON.stringify([productId, ...recent.filter((id) => id !== productId)].slice(0, 10)));
    }
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, [productId]);

  useEffect(() => {
    if (productId && activeTab === "reviews") fetchReviews();
  }, [activeTab, productId]);

  useEffect(() => {
    const section = relatedSectionRef.current;
    if (!section || relatedRequestedRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || relatedRequestedRef.current) return;
      relatedRequestedRef.current = true;
      fetchRelatedProducts();
      observer.disconnect();
    }, { rootMargin: "500px 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const result = await (await fetch(`${API_URL}/reviews/${productId}`)).json();
      if (result.success) { setReviews(result.data || []); setReviewSummary(result.summary || { average: 0, count: 0 }); }
    } catch (error) { console.error("Error fetching reviews:", error); }
  };

  const checkDelivery = () => {
    if (!/^\d{6}$/.test(pincode)) { setDeliveryMessage("Enter a valid 6-digit pincode"); return; }
    const remote = ![19, 18, 17].includes(Number(pincode.slice(0, 2)));
    const date = new Date(); date.setDate(date.getDate() + (remote ? 5 : 3));
    setDeliveryMessage(`${remote ? "Delivery available" : "Fast delivery available"} · Expected by ${date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`);
  };

  const submitReview = async () => {
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Please login to write a review"); router.push("/login"); return; }
    if (!reviewForm.comment.trim()) { toast.error("Please write a review"); return; }
    setReviewing(true);
    try {
      const response = await fetch(`${API_URL}/reviews/${productId}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(reviewForm) });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      toast.success("Review saved"); setReviewForm({ rating: 5, title: "", comment: "" }); await fetchReviews();
    } catch (error: any) { toast.error(error.message || "Unable to save review"); } finally { setReviewing(false); }
  };

  const subscribeBackInStock = async () => {
    if (!notifyEmail) { toast.error("Enter your email address"); return; }
    setNotifying(true);
    try {
      const response = await fetch(`${API_URL}/stock-notifications/${productId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: notifyEmail }) });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      toast.success(result.message); setNotifyEmail("");
    } catch (error: any) { toast.error(error.message || "Unable to subscribe"); } finally { setNotifying(false); }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http")) return url;
    return `${API_URL}/uploads/${url}`;
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
      const response = await fetch(`${API_URL}/product/get/${productId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      const response = await fetch(`${API_URL}/product/getAll?limit=8&available=true&inStock=true&includeTotal=false`, {
        cache: "force-cache",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const products = Array.isArray(result.data) ? result.data : result.data?.items || [];
      if (result.success && products.length) {
        // Get products from same category, excluding current product
        const related = products
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
                  <Image
                    src={resolveProductImage(product.productImgUrls[selectedImage])}
                    alt={product.name}
                    fill
                    unoptimized
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain"
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
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index
                          ? "border-orange-500 shadow-md"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <Image
                        src={resolveProductImage(image)}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        unoptimized
                        loading="lazy"
                        sizes="80px"
                        className="object-contain"
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
                    {typeof product.category === 'object' ? product.category.name : product.category}
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
                <span className="text-sm text-gray-500">({reviewSummary.average || "New"} · {reviewSummary.count} reviews)</span>
                <button onClick={() => setActiveTab("reviews")} className="text-sm text-blue-600 hover:text-blue-700">Write a review</button>
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
              {product.stock === 0 && (
                <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-orange-700"><Bell className="h-4 w-4" /> Get notified when back in stock</div>
                  <div className="mt-2 flex gap-2"><input value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} type="email" placeholder="your@email.com" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" /><button onClick={subscribeBackInStock} disabled={notifying} className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Notify me</button></div>
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
                  onClick={handleBuyNow}
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
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600"><MapPin className="w-5 h-5 text-orange-600" /><span>Check delivery:</span><input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Pincode" className="w-24 rounded border px-2 py-1" /><button onClick={checkDelivery} className="rounded bg-gray-900 px-3 py-1 text-xs font-semibold text-white">Check</button></div>
                {deliveryMessage && <p className="ml-8 text-xs font-medium text-green-700">{deliveryMessage}</p>}
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span>Free delivery on orders above ₹999</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>7-Day Return / Easy Returns</span>
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-6 px-6">
              <button
                onClick={() => setActiveTab("description")}
                className={`py-3.5 text-[14px] sm:text-[15px] font-semibold transition ${
                  activeTab === "description"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={`py-3.5 text-[14px] sm:text-[15px] font-semibold transition ${
                  activeTab === "details"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-3.5 text-[14px] sm:text-[15px] font-semibold transition ${
                  activeTab === "reviews"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Reviews ({reviewSummary.count})
              </button>
            </div>
          </div>
          <div className="p-6">
            {activeTab === "description" && (
              <div className="prose max-w-none text-[14px] sm:text-[15px]">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {product.description || "No description available for this product."}
                </p>
              </div>
            )}
            {activeTab === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px] sm:text-[14px]">
                <div className="space-y-3">
                  <div className="flex py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="w-32 text-gray-500 dark:text-gray-400">Product Name</span>
                    <span className="text-gray-900 dark:text-white font-medium">{product.name}</span>
                  </div>
                  <div className="flex py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="w-32 text-gray-500 dark:text-gray-400">Price</span>
                    <span className="text-gray-900 dark:text-white font-medium">₹{product.price}</span>
                  </div>
                  {hasDiscount && (
                    <div className="flex py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="w-32 text-gray-500 dark:text-gray-400">Discount</span>
                      <span className="text-green-600 font-semibold">{product.discount}% OFF</span>
                    </div>
                  )}
                  <div className="flex py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="w-32 text-gray-500 dark:text-gray-400">Stock Status</span>
                    <span className={product.stock > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {product.stock > 0 ? `${product.stock} items` : "Out of Stock"}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="w-32 text-gray-500 dark:text-gray-400">Category</span>
                    <span className="text-gray-900 dark:text-white font-medium">{getCategoryName(product.category)}</span>
                  </div>
                  {product.brand && (
                    <div className="flex py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="w-32 text-gray-500 dark:text-gray-400">Brand</span>
                      <span className="text-gray-900 dark:text-white font-medium">{typeof product.brand === 'object' ? product.brand.name : product.brand}</span>
                    </div>
                  )}
                  <div className="flex py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="w-32 text-gray-500 dark:text-gray-400">Colors</span>
                    <span className="text-gray-900 dark:text-white font-medium">{product.colors?.join(", ") || "N/A"}</span>
                  </div>
                  <div className="flex py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="w-32 text-gray-500 dark:text-gray-400">Sizes</span>
                    <span className="text-gray-900 dark:text-white font-medium">{product.sizes?.join(", ") || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                  <div className="rounded-xl bg-orange-50 p-4 text-center"><div className="text-3xl font-bold text-orange-600">{reviewSummary.average || "—"}</div><div className="mt-1 text-amber-500">★★★★★</div><div className="text-xs text-gray-500">{reviewSummary.count} verified reviews</div></div>
                  <div className="rounded-xl border p-4"><h3 className="mb-3 font-semibold">Write a review</h3><div className="mb-2 flex gap-1">{[1, 2, 3, 4, 5].map((star) => <button key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })} aria-label={`${star} stars`}><Star className={`h-5 w-5 ${star <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} /></button>)}</div><input value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} placeholder="Review title (optional)" className="mb-2 w-full rounded border px-3 py-2 text-sm" /><textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Share your experience" rows={3} className="mb-2 w-full rounded border px-3 py-2 text-sm" /><button onClick={submitReview} disabled={reviewing} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{reviewing ? "Saving…" : "Submit review"}</button></div>
                </div>
                {reviews.length === 0 ? <div className="py-6 text-center text-sm text-gray-500">No reviews yet. Be the first to review this product.</div> : reviews.map((review) => <article key={review._id} className="border-b pb-4"><div className="flex items-center gap-2"><span className="font-semibold">{review.user?.username || "Customer"}</span><span className="text-amber-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span></div>{review.title && <h4 className="mt-1 font-medium">{review.title}</h4>}<p className="mt-1 text-sm text-gray-600">{review.comment}</p><time className="mt-2 block text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("en-IN")}</time></article>)}
              </div>
            )}
          </div>
        </div>

        <div ref={relatedSectionRef} aria-hidden="true" className="h-px" />
        {/* Related Products: Section Heading 24–28px */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[22px] sm:text-[25px] md:text-[28px] font-bold text-gray-900 dark:text-white">You May Also Like</h2>
              <Link href="/products" className="text-orange-600 hover:text-orange-700 dark:text-orange-400 text-[13px] sm:text-[14px] font-semibold flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4.5">
              {relatedProducts.map((relatedProduct) => {
                const relatedDiscountedPrice = relatedProduct.discount
                  ? relatedProduct.price - (relatedProduct.price * relatedProduct.discount) / 100
                  : relatedProduct.price;
                const hasRelatedDiscount = !!(relatedProduct.discount && relatedProduct.discount > 0);

                return (
                  <ProductCard
                    key={relatedProduct._id}
                    product={relatedProduct as any}
                    discountedPrice={relatedDiscountedPrice}
                    hasDiscount={hasRelatedDiscount}
                    wishlist={wishlist}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
