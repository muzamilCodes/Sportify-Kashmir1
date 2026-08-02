import React, { useEffect, useState } from "react";
import { featuredProductsArr } from "../../data/featuredProductsArr";
import { useParams, Link } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const ProductDetails = () => {
  const { productId } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("description");
  const [relatedProducts, setRelatedProducts] = useState([]);

  const fetchProductAndRelated = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/product/get/${productId}`);
      if (res.status === 200) {
        setProduct(res.data.payload);
      }

      // Fetch all products to pick related products
      const allRes = await axiosInstance.get("/product/getAll");
      if (allRes.status === 200 && allRes.data.payload && allRes.data.payload.length > 0) {
        // Filter out current product and take 4
        const filtered = allRes.data.payload
          .filter(p => p._id !== productId)
          .slice(0, 4);
        setRelatedProducts(filtered);
      } else {
        setRelatedProducts(featuredProductsArr.slice(0, 4));
      }
    } catch (error) {
      console.error(error);
      // Fallback if not found or server is down
      const fallback = featuredProductsArr.find(p => p.id === productId);
      if (fallback) {
        setProduct({
          name: fallback.name,
          price: fallback.price,
          description: "Premium organic farm-fresh product harvested with care.",
          productImgUrls: [fallback.image],
          isAvailable: true,
          sizes: ["500g"]
        });
      }
      setRelatedProducts(featuredProductsArr.slice(0, 4));
    } finally {
      setLoading(false);
    }
  };

  const handleCart = async (prodId) => {
    try {
      const isRealProduct = prodId && prodId.length === 24;
      if (isRealProduct) {
        const res = await axiosInstance.post(`/cart/addtoCart/${prodId}`, {
          quantity: parseInt(quantity) || 1,
        });
        if (res.status === 200) {
          toast.success(res.data.message);
          window.dispatchEvent(new Event("cartUpdated"));
        }
      } else {
        toast.success(`${product?.name || "Product"} (Demo) added to cart!`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add to cart");
    }
  };

  useEffect(() => {
    fetchProductAndRelated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container text-center py-5">
        <h4 className="text-danger fw-bold">Product not found</h4>
        <Link to="/shop" className="primary-btn mt-3">Back to Shop</Link>
      </div>
    );
  }

  const mainImgUrl = product.productImgUrls && product.productImgUrls.length > 0
    ? product.productImgUrls[0]
    : "img/product/product-placeholder.jpg";

  return (
    <div style={{ background: "#fafafa", padding: "40px 0" }}>
      <section className="product-details spad" style={{ paddingBottom: "50px" }}>
        <div className="container">
          <div className="row">
            {/* Image Box */}
            <div className="col-lg-6 col-md-6 mb-4">
              <div 
                className="card border-0 shadow-sm overflow-hidden p-3 d-flex justify-content-center align-items-center" 
                style={{ borderRadius: "16px", background: "#fff", minHeight: "400px" }}
              >
                <img
                  src={mainImgUrl}
                  alt={product.name}
                  style={{ 
                    maxWidth: "100%", 
                    maxHeight: "450px", 
                    objectFit: "contain",
                    borderRadius: "8px",
                    transition: "transform 0.3s"
                  }}
                  className="img-zoom-hover"
                />
              </div>
            </div>

            {/* Description Info */}
            <div className="col-lg-6 col-md-6">
              <div className="product__details__text p-3">
                <h3 className="fw-bold mb-3" style={{ color: "#252525" }}>{product.name}</h3>
                
                <div className="mb-3 d-flex align-items-center gap-2">
                  <div style={{ color: "#ffc107" }}>
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star"></i>
                    <i className="fa fa-star-half-o"></i>
                  </div>
                  <span className="text-muted" style={{ fontSize: "14px" }}>(18 reviews)</span>
                </div>

                <div 
                  className="fs-3 fw-bold mb-3" 
                  style={{ color: "#7fad39" }}
                >
                  Rs {product.price} /=
                </div>

                <p className="text-muted mb-4" style={{ lineHeight: "1.6" }}>
                  {product.description}
                </p>

                <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                  <div className="d-flex align-items-center border" style={{ borderRadius: "8px", height: "46px", background: "#fff" }}>
                    <button 
                      className="btn btn-link text-decoration-none px-3 text-dark fw-bold"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: "50px", border: "none", textAlign: "center", fontWeight: "bold" }}
                    />
                    <button 
                      className="btn btn-link text-decoration-none px-3 text-dark fw-bold"
                      onClick={() => setQuantity(prev => prev + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="btn btn-success text-white px-4 fw-bold shadow-sm"
                    style={{ backgroundColor: "#7fad39", border: "none", borderRadius: "8px", height: "46px" }}
                    onClick={() => handleCart(product._id || productId)}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#6b9230"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#7fad39"}
                  >
                    ADD TO CART
                  </button>
                </div>

                <ul className="list-unstyled border-top pt-4" style={{ fontSize: "14px" }}>
                  <li className="mb-2">
                    <strong className="d-inline-block" style={{ width: "120px" }}>Availability:</strong>
                    {product.isAvailable ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3">In Stock</span>
                    ) : (
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3">Unavailable</span>
                    )}
                  </li>
                  <li className="mb-2">
                    <strong className="d-inline-block" style={{ width: "120px" }}>Shipping:</strong>
                    <span className="text-muted">1 day delivery. <span className="text-success fw-bold">Free shipping today</span></span>
                  </li>
                  {product.sizes && product.sizes.length > 0 && (
                    <li className="mb-2">
                      <strong className="d-inline-block" style={{ width: "120px" }}>Weight:</strong>
                      <span className="text-muted">{product.sizes[0]}</span>
                    </li>
                  )}
                  <li className="mb-2">
                    <strong className="d-inline-block" style={{ width: "120px" }}>Share:</strong>
                    <span className="d-inline-flex gap-3 share-socials">
                      <a href="#fb" className="text-muted"><i className="fa fa-facebook"></i></a>
                      <a href="#tw" className="text-muted"><i className="fa fa-twitter"></i></a>
                      <a href="#ig" className="text-muted"><i className="fa fa-instagram"></i></a>
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Information Tabs */}
            <div className="col-12 mt-5">
              <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "16px" }}>
                <ul className="nav nav-tabs border-bottom mb-4" role="tablist">
                  <li className="nav-item">
                    <button
                      className={`nav-link border-0 fw-bold pb-3 ${activeTab === "description" ? "active text-success" : "text-muted"}`}
                      style={{ borderBottom: activeTab === "description" ? "3px solid #7fad39 !important" : "none", background: "none" }}
                      onClick={() => setActiveTab("description")}
                    >
                      Description
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link border-0 fw-bold pb-3 ${activeTab === "info" ? "active text-success" : "text-muted"}`}
                      style={{ borderBottom: activeTab === "info" ? "3px solid #7fad39 !important" : "none", background: "none" }}
                      onClick={() => setActiveTab("info")}
                    >
                      Information
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link border-0 fw-bold pb-3 ${activeTab === "reviews" ? "active text-success" : "text-muted"}`}
                      style={{ borderBottom: activeTab === "reviews" ? "3px solid #7fad39 !important" : "none", background: "none" }}
                      onClick={() => setActiveTab("reviews")}
                    >
                      Reviews (1)
                    </button>
                  </li>
                </ul>

                <div className="tab-content" style={{ fontSize: "15px", lineHeight: "1.7", color: "#6f6f6f" }}>
                  {activeTab === "description" && (
                    <div>
                      <h6 className="fw-bold text-dark mb-3">Product Description</h6>
                      <p>{product.description || "No description available for this product."}</p>
                    </div>
                  )}
                  {activeTab === "info" && (
                    <div>
                      <h6 className="fw-bold text-dark mb-3">Additional Information</h6>
                      <p>
                        Harvested directly from local organic farms in the Srinagar valley, Kashmir. Our crops are grown without synthetic fertilizers or pesticides, ensuring 100% natural, premium farm-fresh products delivered safely to your doorstep.
                      </p>
                    </div>
                  )}
                  {activeTab === "reviews" && (
                    <div>
                      <h6 className="fw-bold text-dark mb-3">Customer Reviews</h6>
                      <div className="border-bottom pb-3 mb-3">
                        <div className="d-flex justify-content-between mb-2">
                          <strong className="text-dark">Sajad Ahmad</strong>
                          <span style={{ color: "#ffc107" }}><i className="fa fa-star"></i><i className="fa fa-star"></i><i className="fa fa-star"></i><i className="fa fa-star"></i><i className="fa fa-star"></i></span>
                        </div>
                        <p className="mb-0 text-muted">Excellent organic quality. Highly recommended for farm-fresh fruits and vegetables.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="related-product border-top pt-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 text-center mb-5">
              <h3 className="fw-bold">Related Products</h3>
              <p className="text-muted mt-1">Explore other popular organic choices in our department</p>
            </div>
          </div>
          <div className="row">
            {relatedProducts.map((prod) => {
              const imgUrl = prod.productImgUrls && prod.productImgUrls.length > 0
                ? prod.productImgUrls[0]
                : prod.image;
              const linkUrl = prod._id ? `/product/${prod._id}` : `#`;

              return (
                <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={prod._id || prod.id}>
                  <div className="card border-0 shadow-sm h-100 overflow-hidden text-center product-card-hover" style={{ borderRadius: "12px", background: "#fff", transition: "transform 0.3s" }}>
                    <div
                      className="product__item__pic set-bg"
                      style={{
                        backgroundImage: `url(${imgUrl})`,
                        height: "200px",
                        position: "relative"
                      }}
                    >
                      <ul className="product__item__pic__hover list-unstyled d-flex justify-content-center gap-2 m-0 p-0" style={{ position: "absolute", bottom: "15px", width: "100%", opacity: 0, transition: "opacity 0.3s" }}>
                        <li>
                          <button type="button" className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
                            <i className="fa fa-heart text-muted"></i>
                          </button>
                        </li>
                        <li>
                          <button type="button" className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
                            <i className="fa fa-retweet text-muted"></i>
                          </button>
                        </li>
                        <li>
                          <button 
                            type="button" 
                            className="btn text-white rounded-circle shadow-sm d-flex align-items-center justify-content-center" 
                            style={{ width: "36px", height: "36px", backgroundColor: "#7fad39" }}
                            onClick={() => handleCart(prod._id || prod.id)}
                          >
                            <i className="fa fa-shopping-cart"></i>
                          </button>
                        </li>
                      </ul>
                    </div>
                    <div className="card-body p-3">
                      <h6 className="mb-2">
                        <Link to={linkUrl} className="text-dark fw-bold text-decoration-none hover-green" style={{ transition: "color 0.2s" }}>
                          {prod.name}
                        </Link>
                      </h6>
                      <h5 className="fw-bold mb-0" style={{ color: "#7fad39" }}>Rs {prod.price}</h5>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        .img-zoom-hover:hover {
          transform: scale(1.05);
        }
        .share-socials a:hover {
          color: #7fad39 !important;
        }
        .product-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.06) !important;
        }
        .product-card-hover:hover .product__item__pic__hover {
          opacity: 1 !important;
        }
        .hover-green:hover {
          color: #7fad39 !important;
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
