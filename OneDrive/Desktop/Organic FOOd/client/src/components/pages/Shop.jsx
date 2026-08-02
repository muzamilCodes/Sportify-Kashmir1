import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import { axiosInstance } from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

const Shop = () => {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "All");
  const [priceRange, setPriceRange] = useState("All");

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory("All");
    }
  }, [categoryParam]);

  const handleAddToCart = async (productId) => {
    try {
      const res = await axiosInstance.post(`/cart/addtoCart/${productId}`, {
        quantity: 1,
      });
      if (res.status === 200) {
        toast.success(res.data.message || "Product added to cart!");
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Please login to add products to cart!");
    }
  };

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Categories list for filtering
  const categories = ["All", "Vegetables", "Fruits", "Meat", "Fastfood", "Berries"];

  // Filter products based on selected Category and Price
  const filteredProducts = products.filter(product => {
    // Category match
    const categoryMatch = selectedCategory === "All" || 
      (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (product.name && product.name.toLowerCase().includes(selectedCategory.toLowerCase()));
    
    // Price match
    let priceMatch = true;
    if (priceRange === "Under50") {
      priceMatch = product.price < 50;
    } else if (priceRange === "50to200") {
      priceMatch = product.price >= 50 && product.price <= 200;
    } else if (priceRange === "Over200") {
      priceMatch = product.price > 200;
    }

    return categoryMatch && priceMatch;
  });

  return (
    <section className="product spad" style={{ padding: "60px 0", background: "#fcfcfc" }}>
      <div className="container">
        <div className="row">
          {/* Sidebar Filters */}
          <div className="col-lg-3 col-md-5 mb-4">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "12px", background: "#fff" }}>
              <h5 className="fw-bold mb-4" style={{ borderBottom: "2px solid #7fad39", paddingBottom: "10px" }}>Departments</h5>
              <ul className="list-unstyled mb-5">
                {categories.map(cat => (
                  <li key={cat} className="mb-2">
                    <button 
                      className="btn btn-link p-0 text-start w-100 fw-semibold" 
                      style={{ 
                        textDecoration: "none", 
                        color: selectedCategory === cat ? "#7fad39" : "#6f6f6f",
                        fontSize: "15px",
                        transition: "color 0.2s"
                      }}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {selectedCategory === cat && <span className="me-2">•</span>}
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>

              <h5 className="fw-bold mb-4" style={{ borderBottom: "2px solid #7fad39", paddingBottom: "10px" }}>Filter by Price</h5>
              <div className="d-flex flex-column gap-2">
                {[
                  { label: "All Prices", value: "All" },
                  { label: "Under Rs 50", value: "Under50" },
                  { label: "Rs 50 to Rs 200", value: "50to200" },
                  { label: "Over Rs 200", value: "Over200" }
                ].map(range => (
                  <label key={range.value} className="d-flex align-items-center gap-2 style-label" style={{ cursor: "pointer", color: "#6f6f6f", fontSize: "14px" }}>
                    <input 
                      type="radio" 
                      name="price-filter" 
                      checked={priceRange === range.value}
                      onChange={() => setPriceRange(range.value)}
                      style={{ accentColor: "#7fad39" }}
                    />
                    {range.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Product Listing */}
          <div className="col-lg-9 col-md-7">
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 border-0 shadow-sm bg-white" style={{ borderRadius: "12px" }}>
              <div>
                {loading ? (
                  <span className="text-muted">Loading products...</span>
                ) : error ? (
                  <span className="text-danger">{error}</span>
                ) : (
                  <span className="fw-bold text-dark">
                    Found <span style={{ color: "#7fad39" }}>{filteredProducts.length}</span> products
                  </span>
                )}
              </div>
              <div className="d-flex gap-2">
                <span className="text-muted" style={{ fontSize: "14px" }}>Category: <strong>{selectedCategory}</strong></span>
              </div>
            </div>

            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-5 shadow-sm bg-white" style={{ borderRadius: "12px" }}>
                <i className="fa fa-info-circle mb-3 text-muted" style={{ fontSize: "40px" }}></i>
                <h5 className="text-muted fw-bold">No Products Found</h5>
                <p className="text-muted px-3">We couldn't find any products matching your filters. Try checking other categories.</p>
              </div>
            ) : (
              <div className="row">
                {filteredProducts.map((product) => (
                  <div className="col-lg-4 col-sm-6 mb-4" key={product._id}>
                    <div 
                      className="card border-0 shadow-sm h-100 overflow-hidden text-center product-card-hover" 
                      style={{ 
                        borderRadius: "12px", 
                        background: "#fff",
                        transition: "transform 0.3s, box-shadow 0.3s"
                      }}
                    >
                      <div
                        className="product__item__pic set-bg"
                        style={{
                          backgroundImage: product.productImgUrls && product.productImgUrls.length > 0
                            ? `url(${product.productImgUrls[0]})`
                            : "url('img/product/product-placeholder.jpg')",
                          height: "220px",
                          position: "relative"
                        }}
                      >
                        <ul className="product__item__pic__hover list-unstyled d-flex justify-content-center gap-2 m-0 p-0" style={{ position: "absolute", bottom: "15px", width: "100%", opacity: 0, transition: "opacity 0.3s" }}>
                          <li>
                            <button type="button" className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px" }}>
                              <i className="fa fa-heart text-muted"></i>
                            </button>
                          </li>
                          <li>
                            <button type="button" className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px" }}>
                              <i className="fa fa-retweet text-muted"></i>
                            </button>
                          </li>
                          <li>
                            <button 
                              type="button" 
                              className="btn text-white rounded-circle shadow-sm d-flex align-items-center justify-content-center" 
                              style={{ width: "38px", height: "38px", backgroundColor: "#7fad39" }}
                              onClick={() => handleAddToCart(product._id)}
                            >
                              <i className="fa fa-shopping-cart"></i>
                            </button>
                          </li>
                        </ul>
                      </div>
                      <div className="card-body p-3">
                        <h6 className="mb-2">
                          <Link to={`/product/${product._id}`} className="text-dark fw-bold text-decoration-none hover-green" style={{ fontSize: "16px", transition: "color 0.2s" }}>
                            {product.name}
                          </Link>
                        </h6>
                        <h5 className="fw-bold mb-0" style={{ color: "#7fad39" }}>Rs {product.price}</h5>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .product-card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
        }
        .product-card-hover:hover .product__item__pic__hover {
          opacity: 1 !important;
        }
        .hover-green:hover {
          color: #7fad39 !important;
        }
      `}</style>
    </section>
  );
};

export default Shop;
