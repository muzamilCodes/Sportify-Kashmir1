import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const UserDashboard = () => {
  const [cart, setCart] = useState({ products: [] });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");

  // Fetch Cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axiosInstance.get("/cart/getCart");
        setCart(res.data.payload || { products: [] });
      } catch (err) {
        console.error(err);
        setCart({ products: [] });
      }
    };
    fetchCart();
  }, []);

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get("/order/fetchAllOrders");
        setOrders(res.data.payload || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Calculate total spent on completed/pending orders
  const getTotalSpent = () => {
    return orders.reduce((acc, order) => acc + (order.orderValue || 0), 0).toFixed(2);
  };

  return (
    <div style={{ background: "#fcfcfc", padding: "40px 0", minHeight: "80vh" }}>
      <div className="container">
        {/* Dashboard Header */}
        <div className="d-flex justify-content-between align-items-center mb-5 p-4 bg-white shadow-sm border-0" style={{ borderRadius: "16px" }}>
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#252525" }}>My Account Dashboard</h2>
            <p className="text-muted mb-0">Monitor your orders, check your shopping cart items, and update settings.</p>
          </div>
          <div>
            <span className="badge bg-success text-white px-3 py-2 rounded-pill fw-bold" style={{ backgroundColor: "#7fad39" }}>
              Active Session
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100 text-center" style={{ borderRadius: "16px", background: "#fff" }}>
              <div className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle" style={{ width: "50px", height: "50px" }}>
                <i className="fa fa-money" style={{ fontSize: "20px" }}></i>
              </div>
              <h5 className="text-muted fw-semibold mb-1" style={{ fontSize: "14px" }}>Total Purchase Value</h5>
              <h2 className="fw-bold m-0" style={{ color: "#7fad39" }}>Rs {getTotalSpent()}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100 text-center" style={{ borderRadius: "16px", background: "#fff" }}>
              <div className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle" style={{ width: "50px", height: "50px" }}>
                <i className="fa fa-shopping-cart" style={{ fontSize: "20px" }}></i>
              </div>
              <h5 className="text-muted fw-semibold mb-1" style={{ fontSize: "14px" }}>Items in Cart</h5>
              <h2 className="fw-bold m-0" style={{ color: "#7fad39" }}>{cart.products ? cart.products.length : 0}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100 text-center" style={{ borderRadius: "16px", background: "#fff" }}>
              <div className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle" style={{ width: "50px", height: "50px" }}>
                <i className="fa fa-truck" style={{ fontSize: "20px" }}></i>
              </div>
              <h5 className="text-muted fw-semibold mb-1" style={{ fontSize: "14px" }}>Orders Placed</h5>
              <h2 className="fw-bold m-0" style={{ color: "#7fad39" }}>{orders.length}</h2>
            </div>
          </div>
        </div>

        {/* Tab Controls Card */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "16px", background: "#fff" }}>
          <ul className="nav nav-pills border-bottom pb-3 mb-4 gap-2">
            <li className="nav-item">
              <button 
                className={`nav-link fw-bold px-4 py-2 border-0 ${activeTab === "orders" ? "active bg-success text-white" : "text-muted bg-light"}`}
                style={{ borderRadius: "8px", background: activeTab === "orders" ? "#7fad39" : undefined }}
                onClick={() => setActiveTab("orders")}
              >
                📦 Recent Orders
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link fw-bold px-4 py-2 border-0 ${activeTab === "cart" ? "active bg-success text-white" : "text-muted bg-light"}`}
                style={{ borderRadius: "8px", background: activeTab === "cart" ? "#7fad39" : undefined }}
                onClick={() => setActiveTab("cart")}
              >
                🛒 Cart Summary
              </button>
            </li>
          </ul>

          <div className="tab-content py-2">
            {activeTab === "orders" && (
              <div className="animate-fade-in">
                <h5 className="fw-bold mb-4">Your Orders History</h5>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead style={{ background: "#7fad39", color: "#fff" }}>
                        <tr>
                          <th className="py-3 px-3">Order ID</th>
                          <th className="py-3 text-center">Value</th>
                          <th className="py-3 text-center">Status</th>
                          <th className="py-3 text-center">Payment</th>
                          <th className="py-3 text-center">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td className="py-3 px-3 fw-bold text-muted">{order._id}</td>
                            <td className="py-3 text-center fw-bold" style={{ color: "#7fad39" }}>Rs {order.orderValue}</td>
                            <td className="py-3 text-center">
                              <span className={`badge px-3 py-2 rounded-pill ${order.orderStatus === "pending" ? "bg-warning text-dark" : "bg-success"}`}>
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <span className={`badge px-3 py-2 rounded-pill ${order.paymentStatus === "pending" ? "bg-danger" : "bg-success"}`}>
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td className="py-3 text-center text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5 bg-light rounded-3">
                    <i className="fa fa-info-circle text-muted mb-3" style={{ fontSize: "36px" }}></i>
                    <p className="text-muted mb-0">You have not placed any orders yet.</p>
                    <Link to="/shop" className="btn text-white mt-3" style={{ backgroundColor: "#7fad39" }}>Browse Shop</Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "cart" && (
              <div className="animate-fade-in bg-light p-4 rounded-3">
                <h5 className="fw-bold mb-3">Cart Status</h5>
                {cart.products && cart.products.length > 0 ? (
                  <div>
                    <p className="text-muted">You have <strong>{cart.products.length}</strong> fresh item(s) waiting in your cart.</p>
                    <div className="d-flex gap-3 mt-4">
                      <Link to="/user/cart" className="btn btn-success text-white px-4 fw-bold" style={{ backgroundColor: "#7fad39", border: "none" }}>
                        View Cart Detail
                      </Link>
                      <Link to="/user/add/address" className="btn btn-outline-success px-4 fw-semibold">
                        Proceed to Checkout
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <i className="fa fa-shopping-basket text-muted mb-3" style={{ fontSize: "36px" }}></i>
                    <p className="text-muted mb-0">Your cart is currently empty!</p>
                    <Link to="/shop" className="btn text-white mt-3" style={{ backgroundColor: "#7fad39" }}>Go To Shop</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
