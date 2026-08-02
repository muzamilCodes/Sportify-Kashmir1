import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, removeFromCart } from '../../redux/slices/cartSlice';
import { MdDelete } from "react-icons/md";
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Cart = () => {
    const dispatch = useDispatch();
    const { cart, loading } = useSelector(state => state.cart);

    const getTotalWithDiscount = () => {
        return cart?.products?.reduce((acc, item) => {
            const price = item?.productId?.price || 0;
            const discount = item?.productId?.discount || 0;
            const discountedPrice = price * (1 - discount / 100);
            return acc + discountedPrice * item.quantity;
        }, 0).toFixed(2);
    };

    const getSubtotal = () => {
        return cart?.products?.reduce((acc, item) => {
            const price = item?.productId?.price || 0;
            return acc + price * item.quantity;
        }, 0).toFixed(2);
    };

    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    return (
        <section className="shoping-cart spad" style={{ padding: "60px 0", background: "#fcfcfc" }}>
            <div className="container">
                <div className="text-center mb-5">
                    <h3 className="fw-bold">Your Shopping Cart</h3>
                    <p className="text-muted">Manage your organic choices and proceed to checkout</p>
                </div>

                {loading && (
                    <div className="text-center my-4">
                        <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                <div className="row mb-5">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: "16px" }}>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0" style={{ minWidth: "800px" }}>
                                    <thead style={{ background: "#7fad39", color: "#fff" }}>
                                        <tr>
                                            <th className="py-3 px-4" style={{ width: "30%" }}>Product</th>
                                            <th className="py-3 text-center">Price</th>
                                            <th className="py-3 text-center">Discount</th>
                                            <th className="py-3 text-center" style={{ width: "12%" }}>Quantity</th>
                                            <th className="py-3 text-center">Total</th>
                                            <th className="py-3 text-center">Discounted Total</th>
                                            <th className="py-3 text-center" style={{ width: "8%" }}>Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart && cart.products && cart.products.filter(product => product?.productId).length > 0 ? (
                                            cart.products.filter(product => product?.productId).map((product) => (
                                                <tr key={product?.productId?._id}>
                                                    <td className="py-3 px-4">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div 
                                                                className="rounded shadow-sm" 
                                                                style={{ 
                                                                    width: "55px", 
                                                                    height: "55px", 
                                                                    backgroundImage: product.productId.productImgUrls && product.productId.productImgUrls.length > 0 
                                                                        ? `url(${product.productId.productImgUrls[0]})` 
                                                                        : "none",
                                                                    backgroundSize: "cover",
                                                                    backgroundPosition: "center"
                                                                }}
                                                            />
                                                            <span className="fw-bold text-dark" style={{ fontSize: "16px" }}>
                                                                {product.productId.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 text-center fw-semibold text-muted">
                                                        Rs {product.productId.price}
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        {product.productId.discount ? (
                                                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded">
                                                                {product.productId.discount}% Off
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted" style={{ fontSize: "14px" }}>-</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <input
                                                            type="text"
                                                            value={product.quantity}
                                                            readOnly
                                                            className="form-control text-center mx-auto fw-bold"
                                                            style={{ width: "50px", height: "35px", background: "#f9f9f9" }}
                                                        />
                                                    </td>
                                                    <td className="py-3 text-center fw-bold text-muted">
                                                        Rs {(product.quantity * product.productId.price).toFixed(2)}
                                                    </td>
                                                    <td className="py-3 text-center fw-bold" style={{ color: "#7fad39" }}>
                                                        Rs {(
                                                            (product.productId.price - (product.productId.price * (product.productId.discount || 0) / 100))
                                                            * product.quantity
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-link p-0 border-0 bg-transparent"
                                                            onClick={() => {
                                                                dispatch(removeFromCart(product.productId._id));
                                                                // trigger navbar update
                                                                setTimeout(() => window.dispatchEvent(new Event("cartUpdated")), 500);
                                                            }}
                                                        >
                                                            <MdDelete style={{ color: "#dc3545", fontSize: "22px" }} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center py-5 text-muted">
                                                    <i className="fa fa-shopping-basket mb-3 text-muted" style={{ fontSize: "40px" }} />
                                                    <h5 className="fw-bold">Your cart is currently empty!</h5>
                                                    <p className="mb-0">Browse our Shop to add fresh organic products.</p>
                                                    <Link to="/shop" className="btn text-white mt-3" style={{ backgroundColor: "#7fad39" }}>Go To Shop</Link>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* Discount Coupons */}
                    <div className="col-lg-6 mb-4">
                        <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "16px", background: "#fff" }}>
                            <h5 className="fw-bold mb-3" style={{ color: "#252525" }}>Apply Coupon Code</h5>
                            <p className="text-muted" style={{ fontSize: "14px" }}>Enter your promotional code if you have one to claim a discount.</p>
                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                    toast.info("Coupons functionality is currently locked.");
                                }}
                                className="d-flex gap-2 mt-2"
                            >
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="e.g. ORGANICKASHMIR" 
                                    style={{ borderRadius: "8px" }}
                                />
                                <button 
                                    className="btn text-white px-4 fw-bold" 
                                    type="submit" 
                                    style={{ backgroundColor: "#7fad39", borderRadius: "8px" }}
                                >
                                    APPLY
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Checkout Totals Summary */}
                    <div className="col-lg-6 mb-4">
                        <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "16px", background: "#fff" }}>
                            <h5 className="fw-bold mb-4" style={{ color: "#252525" }}>Cart Totals</h5>
                            <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                <span className="text-muted">Subtotal</span>
                                <span className="fw-bold text-dark">Rs {getSubtotal()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="fw-bold text-dark fs-5">Estimated Total</span>
                                <span className="fw-bold fs-5" style={{ color: "#7fad39" }}>Rs {getTotalWithDiscount()}</span>
                            </div>

                            {cart && cart.products && cart.products.filter(p => p?.productId).length > 0 ? (
                                <Link 
                                    to="/user/add/address" 
                                    className="btn text-white py-3 fw-bold text-center d-block shadow-sm"
                                    style={{ backgroundColor: "#7fad39", borderRadius: "8px", textDecoration: "none" }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = "#6b9230"}
                                    onMouseOut={(e) => e.target.style.backgroundColor = "#7fad39"}
                                >
                                    PROCEED TO CHECKOUT
                                </Link>
                            ) : (
                                <button 
                                    className="btn btn-secondary py-3 fw-bold w-100" 
                                    disabled 
                                    style={{ borderRadius: "8px" }}
                                >
                                    PROCEED TO CHECKOUT
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Cart;
