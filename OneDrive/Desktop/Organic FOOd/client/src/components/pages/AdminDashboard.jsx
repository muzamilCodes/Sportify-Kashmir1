import React, { useState, useEffect } from "react";
import UploadPost from "../molecules/UploadPost";
import UploadProduct from "../molecules/UploadProduct";
import ProductList from "../molecules/ProductList";
import { axiosInstance } from "../../utils/axiosInstance";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("catalog");
  const [productCount, setProductCount] = useState(0);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => {
    // Fetch count metrics
    const fetchMetrics = async () => {
      try {
        const prodRes = await axiosInstance.get("/product/getAll");
        if (prodRes.status === 200) {
          setProductCount(prodRes.data.payload?.length || 0);
        }
      } catch (err) {
        console.error(err);
      }
      try {
        const postRes = await axiosInstance.get("/post/getAll"); // standard endpoint for blog posts
        if (postRes.status === 200) {
          setPostCount(postRes.data.payload?.length || 0);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetrics();
  }, [activeTab]);

  return (
    <div style={{ background: "#fcfcfc", padding: "40px 0", minHeight: "80vh" }}>
      <div className="container">
        {/* Header Block */}
        <div className="d-flex justify-content-between align-items-center mb-5 p-4 bg-white shadow-sm border-0" style={{ borderRadius: "16px" }}>
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#252525" }}>Secure Admin Portal</h2>
            <p className="text-muted mb-0">Manage your digital organic market catalog, products, and articles</p>
          </div>
          <div>
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-bold">
              System Online
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100 text-center" style={{ borderRadius: "16px", background: "#fff" }}>
              <div className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle" style={{ width: "50px", height: "50px" }}>
                <i className="fa fa-shopping-bag" style={{ fontSize: "20px" }}></i>
              </div>
              <h5 className="text-muted fw-semibold mb-1" style={{ fontSize: "14px" }}>Total Catalog Products</h5>
              <h2 className="fw-bold m-0" style={{ color: "#7fad39" }}>{productCount}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100 text-center" style={{ borderRadius: "16px", background: "#fff" }}>
              <div className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle" style={{ width: "50px", height: "50px" }}>
                <i className="fa fa-pencil-square-o" style={{ fontSize: "20px" }}></i>
              </div>
              <h5 className="text-muted fw-semibold mb-1" style={{ fontSize: "14px" }}>Blog Articles</h5>
              <h2 className="fw-bold m-0" style={{ color: "#7fad39" }}>{postCount}</h2>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100 text-center" style={{ borderRadius: "16px", background: "#fff" }}>
              <div className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle" style={{ width: "50px", height: "50px" }}>
                <i className="fa fa-users" style={{ fontSize: "20px" }}></i>
              </div>
              <h5 className="text-muted fw-semibold mb-1" style={{ fontSize: "14px" }}>Active Customers</h5>
              <h2 className="fw-bold m-0" style={{ color: "#7fad39" }}>18</h2>
            </div>
          </div>
        </div>

        {/* Tab Controls Card */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "16px", background: "#fff" }}>
          <ul className="nav nav-pills border-bottom pb-3 mb-4 gap-2">
            <li className="nav-item">
              <button 
                className={`nav-link fw-bold px-4 py-2 border-0 ${activeTab === "catalog" ? "active bg-success text-white" : "text-muted bg-light"}`}
                style={{ borderRadius: "8px", background: activeTab === "catalog" ? "#7fad39" : undefined }}
                onClick={() => setActiveTab("catalog")}
              >
                📦 Products Catalog
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link fw-bold px-4 py-2 border-0 ${activeTab === "addProduct" ? "active bg-success text-white" : "text-muted bg-light"}`}
                style={{ borderRadius: "8px", background: activeTab === "addProduct" ? "#7fad39" : undefined }}
                onClick={() => setActiveTab("addProduct")}
              >
                ➕ Add New Product
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link fw-bold px-4 py-2 border-0 ${activeTab === "addPost" ? "active bg-success text-white" : "text-muted bg-light"}`}
                style={{ borderRadius: "8px", background: activeTab === "addPost" ? "#7fad39" : undefined }}
                onClick={() => setActiveTab("addPost")}
              >
                ✍️ Publish Article
              </button>
            </li>
          </ul>

          <div className="tab-content py-2">
            {activeTab === "catalog" && (
              <div className="animate-fade-in">
                <ProductList />
              </div>
            )}
            {activeTab === "addProduct" && (
              <div className="animate-fade-in bg-light p-4 rounded-3">
                <h4 className="fw-bold mb-4">Create Catalog Listing</h4>
                <UploadProduct />
              </div>
            )}
            {activeTab === "addPost" && (
              <div className="animate-fade-in bg-light p-4 rounded-3">
                <h4 className="fw-bold mb-4">Draft New Blog Article</h4>
                <UploadPost />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;