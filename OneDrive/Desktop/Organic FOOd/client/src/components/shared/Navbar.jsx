import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState({ products: [] });
  const [user, setUser] = useState(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, []);

  // Fetch verified user details
  const verifyUserSession = async () => {
    try {
      const res = await axiosInstance.get("/user/verify");
      if (res.status === 200) {
        setUser(res.data.payload);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    }
  };

  useEffect(() => {
    verifyUserSession();
  }, [location.pathname]);

  // Fetch cart data for dynamic cart price
  const fetchCart = async () => {
    try {
      const res = await axiosInstance.get("/cart/getCart");
      if (res.status === 200) {
        setCart(res.data.payload);
      }
    } catch (err) {
      setCart({ products: [] });
    }
  };

  useEffect(() => {
    fetchCart();

    // Listen for cart updates
    const handleCartUpdate = () => fetchCart();
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/user/logout");
      localStorage.removeItem("username");
      setUser(null);
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Calculate total cart value with discount
  const getCartTotal = () => {
    if (!cart.products || cart.products.length === 0) return 0;
    return cart.products
      .reduce((acc, item) => {
        const price = item?.productId?.price || 0;
        const discount = item?.productId?.discount || 0;
        const discountedPrice = price * (1 - discount / 100);
        return acc + discountedPrice * item.quantity;
      }, 0)
      .toFixed(2);
  };

  return (
    <>
      {loading && (
        <div id="preloder">
          <div className="loader"></div>
        </div>
      )}

      {/* Hamburger Overlay */}
      <div
        className={`humberger__menu__overlay ${menuOpen ? "active" : ""}`}
        onClick={closeMenu}
      ></div>

      {/* Hamburger Menu */}
      <div
        className={`humberger__menu__wrapper ${
          menuOpen ? "show__humberger__menu__wrapper" : ""
        }`}
      >
        <div className="humberger__menu__logo">
          <Link to="/" onClick={closeMenu}>
            <img src="img/logo.png" alt="Logo" />
          </Link>
        </div>

        <div className="humberger__menu__cart">
          <ul>
            <li>
              <Link to="/user/cart" onClick={closeMenu}>
                <i className="fa fa-shopping-bag"></i>{" "}
                <span>{cart.products ? cart.products.length : 0}</span>
              </Link>
            </li>
          </ul>
          <div className="header__cart__price">
            Total: <span>Rs {getCartTotal()}</span>
          </div>
        </div>
        
        <div className="humberger__menu__widget">
          {user ? (
            <div className="d-flex flex-column gap-2 text-start">
              <span className="fw-bold text-dark"><i className="fa fa-user-circle-o me-2"></i>Hello, {user.username}</span>
              <button onClick={() => { handleLogout(); closeMenu(); }} className="btn btn-sm btn-danger text-white text-start">Logout</button>
            </div>
          ) : (
            <Link to="/login" onClick={closeMenu} className="header__top__right__auth">
              <i className="fa fa-user"></i> Login
            </Link>
          )}
        </div>

        <nav className="humberger__menu">
          <ul>
            <li>
              <Link to="/" onClick={closeMenu}>Home</Link>
            </li>
            <li>
              <Link to="/shop" onClick={closeMenu}>Shop</Link>
            </li>
            <li>
              <Link to="/posts" onClick={closeMenu}>Blog</Link>
            </li>
            <li>
              <Link to="/contact" onClick={closeMenu}>Contact</Link>
            </li>
            {user && (
              <>
                <li>
                  <Link to={user.isAdmin ? "/admin/dashboard" : "/user/dashboard"} onClick={closeMenu}>Dashboard</Link>
                </li>
                <li>
                  <Link to="/orders" onClick={closeMenu}>My Orders</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      <header className="header">
        <div className="header__top">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 col-md-6">
                <div className="header__top__left">
                  <ul>
                    <li>
                      <i className="fa fa-envelope"></i>{" "}
                      info@organickashmir.com
                    </li>
                    <li>Free Shipping for all Order of Rs 499/=</li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-6 col-md-6">
                <div className="header__top__right d-flex align-items-center justify-content-end gap-3">
                  <div className="header__top__right__social d-flex gap-2">
                    <a href="#fb"><i className="fa fa-facebook"></i></a>
                    <a href="#tw"><i className="fa fa-twitter"></i></a>
                    <a href="#ig"><i className="fa fa-instagram"></i></a>
                    <a href="#wa"><i className="fa fa-whatsapp"></i></a>
                  </div>
                  <div className="header__top__right__auth border-start ps-3">
                    {user ? (
                      <div className="d-flex align-items-center gap-3">
                        <span className="text-dark fw-bold text-decoration-none" style={{ fontSize: "14px" }}>
                          Hello, <span style={{ color: "#7fad39" }}>{user.username}</span>
                        </span>
                        <button 
                          onClick={handleLogout} 
                          className="btn btn-sm btn-link text-danger fw-bold text-decoration-none p-0"
                          style={{ fontSize: "14px" }}
                        >
                          Logout
                        </button>
                      </div>
                    ) : (
                      <Link to="/login" className="text-dark fw-semibold text-decoration-none">
                        <i className="fa fa-user"></i> Login / Register
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-3 col-6">
              <div className="header__logo py-3">
                <Link to="/">
                  <img src="img/logo.png" alt="Organic Kashmir Logo" />
                </Link>
              </div>
            </div>

            <div className="col-lg-6 d-none d-lg-block">
              <nav className="header__menu">
                <ul className="d-flex align-items-center justify-content-center m-0 p-0 list-unstyled gap-4">
                  <li className={location.pathname === "/" ? "active" : ""}>
                    <Link to="/" className="text-decoration-none fw-bold text-dark">Home</Link>
                  </li>
                  <li className={location.pathname === "/shop" ? "active" : ""}>
                    <Link to="/shop" className="text-decoration-none fw-bold text-dark">Shop</Link>
                  </li>
                  <li className={location.pathname === "/posts" ? "active" : ""}>
                    <Link to="/posts" className="text-decoration-none fw-bold text-dark">Blog</Link>
                  </li>
                  <li className={location.pathname === "/contact" ? "active" : ""}>
                    <Link to="/contact" className="text-decoration-none fw-bold text-dark">Contact</Link>
                  </li>
                  {user && (
                    <li className={location.pathname.includes("dashboard") ? "active" : ""}>
                      <Link 
                        to={user.isAdmin ? "/admin/dashboard" : "/user/dashboard"} 
                        className="text-decoration-none fw-bold text-dark"
                      >
                        Dashboard
                      </Link>
                    </li>
                  )}
                  {user && (
                    <li className={location.pathname === "/orders" ? "active" : ""}>
                      <Link to="/orders" className="text-decoration-none fw-bold text-dark">Orders</Link>
                    </li>
                  )}
                </ul>
              </nav>
            </div>

            <div className="col-lg-3 col-6 text-end">
              <div className="header__cart d-inline-flex align-items-center gap-3">
                <Link to="/user/cart" className="position-relative text-dark text-decoration-none">
                  <i className="fa fa-shopping-bag" style={{ fontSize: "20px" }}></i>
                  <span 
                    className="position-absolute translate-middle badge rounded-circle bg-success text-white" 
                    style={{ fontSize: "10px", padding: "4px 6px", top: "-5px", right: "-12px", backgroundColor: "#7fad39" }}
                  >
                    {cart.products ? cart.products.length : 0}
                  </span>
                </Link>
                <div className="header__cart__price d-none d-sm-inline-block text-muted" style={{ fontSize: "14px" }}>
                  Cart: <strong className="text-dark">Rs {getCartTotal()}</strong>
                </div>
                {/* Hamburger Icon */}
                <div className="humberger__open d-lg-none ms-2" onClick={toggleMenu} style={{ cursor: "pointer" }}>
                  <i className="fa fa-bars" style={{ fontSize: "22px" }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
