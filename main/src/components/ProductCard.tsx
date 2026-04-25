"use client";

import { ShoppingBag, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { getImageUrl } from "@/lib/utils";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    discount?: number;
    productImgUrls?: string[];
    images?: string[];
    category?: string;
    isAvailable: boolean;
    stock: number;
  };
  showCategory?: boolean;
}

export default function ProductCard({
  product,
  showCategory = true,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const discountPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  // Support both productImgUrls and images
  const imageUrls = product.productImgUrls || product.images || [];
  const imageUrl = imageUrls.length > 0 ? imageUrls[0] : null;
  const finalImageUrl = getImageUrl(imageUrl);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <Link href={`/product/${product._id}`}>
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {imageUrl && !imageError ? (
            <img
              src={finalImageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Discount Badge */}
          {product.discount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
              -{product.discount}%
            </div>
          )}

          {/* Availability Overlay */}
          {!product.isAvailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg bg-black/70 px-4 py-2 rounded">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">(4.5)</span>
          </div>

          {/* Price and Category */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg font-bold text-gray-900">
                ₹{discountPrice.toFixed(2)}
              </span>
              {product.discount && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ₹{product.price.toFixed(2)}
                </span>
              )}
            </div>

            {showCategory && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                {product.category || 'N/A'}
              </span>
            )}
          </div>

          {/* Stock Info */}
          <div className="mt-2 text-xs text-gray-500">
            {product.stock > 0 ? (
              <span className="text-green-600">{product.stock} in stock</span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
