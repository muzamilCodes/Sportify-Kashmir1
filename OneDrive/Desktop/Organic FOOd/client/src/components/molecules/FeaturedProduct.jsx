import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { featuredProductsArr } from '../../data/featuredProductsArr';
import { axiosInstance } from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

const FeaturedProduct = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all");

    useEffect(() => {
        const getProducts = async () => {
            try {
                const res = await axiosInstance.get("/product/getAll");
                if (res.status === 200 && res.data.payload && res.data.payload.length > 0) {
                    setProducts(res.data.payload);
                } else {
                    setProducts(featuredProductsArr);
                }
            } catch (err) {
                setProducts(featuredProductsArr);
            } finally {
                setLoading(false);
            }
        };
        getProducts();
    }, []);

    const handleAddToCart = async (product) => {
        const productId = product._id || product.id;
        if (productId && productId.length === 24) {
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
        } else {
            toast.success(`${product.name} (Demo) added to cart!`);
        }
    };

    const filterOptions = [
        { label: "All", value: "all" },
        { label: "Fruits", value: "fruits" },
        { label: "Fresh Meat", value: "meat" },
        { label: "Vegetables", value: "vegetables" },
        { label: "Fastfood", value: "fastfood" }
    ];

    const filteredProducts = activeFilter === "all"
        ? products.slice(0, 8)
        : products.filter(p => p.category && p.category.toLowerCase() === activeFilter.toLowerCase()).slice(0, 8);

    return (
        <section className="featured spad" style={{ padding: "60px 0", background: "#fff" }}>
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="section-title text-center mb-4">
                            <h2 className="fw-bold">Featured Products</h2>
                            <p className="text-muted mt-2">Browse our high-quality organic selections sorted by category</p>
                        </div>
                        <div className="featured__controls d-flex justify-content-center mb-5">
                            <ul className="list-unstyled d-flex gap-3 m-0 p-0 flex-wrap">
                                {filterOptions.map(opt => (
                                    <li key={opt.value}>
                                        <button
                                            className={`btn px-4 py-2 fw-semibold rounded-pill border-0`}
                                            style={{
                                                backgroundColor: activeFilter === opt.value ? "#7fad39" : "#f5f5f5",
                                                color: activeFilter === opt.value ? "#fff" : "#6f6f6f",
                                                transition: "all 0.3s"
                                            }}
                                            onClick={() => setActiveFilter(opt.value)}
                                        >
                                            {opt.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="row featured__filter">
                    {loading ? (
                        <div className="col-12 text-center py-5">
                            <div className="spinner-border text-success" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <h5 className="text-muted">No products found in this category</h5>
                        </div>
                    ) : (
                        filteredProducts.map((product) => {
                            const imgUrl = product.productImgUrls && product.productImgUrls.length > 0
                                ? product.productImgUrls[0]
                                : product.image;
                            const linkUrl = product._id ? `/product/${product._id}` : `#`;

                            return (
                                <div key={product._id || product.id} className="col-lg-3 col-md-4 col-sm-6 mb-4 animate-fade-in">
                                    <div className="card border-0 shadow-sm h-100 overflow-hidden text-center product-card-hover" style={{ borderRadius: "12px", background: "#fff", transition: "transform 0.3s" }}>
                                        <div
                                            className="featured__item__pic set-bg"
                                            style={{ 
                                                backgroundImage: `url(${imgUrl})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                backgroundRepeat: "no-repeat",
                                                height: "240px",
                                                position: "relative"
                                            }}
                                        >
                                            <ul className="featured__item__pic__hover list-unstyled d-flex justify-content-center gap-2 m-0 p-0" style={{ position: "absolute", bottom: "15px", width: "100%", opacity: 0, transition: "opacity 0.3s" }}>
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
                                                        onClick={() => handleAddToCart(product)}
                                                    >
                                                        <i className="fa fa-shopping-cart"></i>
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="card-body p-3">
                                            <h6 className="mb-2">
                                                <Link to={linkUrl} className="text-dark fw-bold text-decoration-none hover-green" style={{ transition: "color 0.2s" }}>
                                                    {product.name}
                                                </Link>
                                            </h6>
                                            <h5 className="fw-bold mb-0" style={{ color: "#7fad39" }}>Rs {product.price}</h5>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <style>{`
                .product-card-hover:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.06) !important;
                }
                .product-card-hover:hover .featured__item__pic__hover {
                    opacity: 1 !important;
                }
                .hover-green:hover {
                    color: #7fad39 !important;
                }
            `}</style>
        </section>
    );
};

export default FeaturedProduct;