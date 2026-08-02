import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer spad" style={{ background: "#f3f6fa", padding: "60px 0 30px" }}>
        <div className="container">
            <div className="row g-4">
                <div className="col-lg-3 col-md-6 col-sm-6">
                    <div className="footer__about">
                        <div className="footer__about__logo mb-3">
                            <Link to="/"><img src="img/logo.png" alt="Organic Kashmir Logo"/></Link>
                        </div>
                        <ul className="list-unstyled text-muted" style={{ fontSize: "14px", lineHeight: "1.8" }}>
                            <li><strong>Address:</strong> JVC Road, near Sabzi Mandi, Srinagar, JK</li>
                            <li><strong>Phone:</strong> +91 9906520959</li>
                            <li><strong>Email:</strong> info@organickashmir.com</li>
                        </ul>
                    </div>
                </div>
                <div className="col-lg-4 col-md-6 col-sm-6 offset-lg-1">
                    <div className="footer__widget">
                        <h6 className="fw-bold mb-3" style={{ fontSize: "16px", color: "#252525" }}>Useful Links</h6>
                        <ul className="list-unstyled d-flex flex-wrap gap-2" style={{ fontSize: "14px" }}>
                            <li style={{ width: "45%" }}><Link to="/about" className="text-decoration-none text-muted hover-green">About Us</Link></li>
                            <li style={{ width: "45%" }}><Link to="/shop" className="text-decoration-none text-muted hover-green">Shop Produce</Link></li>
                            <li style={{ width: "45%" }}><Link to="/services" className="text-decoration-none text-muted hover-green">Our Services</Link></li>
                            <li style={{ width: "45%" }}><Link to="/contact" className="text-decoration-none text-muted hover-green">Contact Us</Link></li>
                            <li style={{ width: "45%" }}><Link to="/posts" className="text-decoration-none text-muted hover-green">Our Blog</Link></li>
                            <li style={{ width: "45%" }}><Link to="/login" className="text-decoration-none text-muted hover-green">Sign In</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="col-lg-4 col-md-12">
                    <div className="footer__widget">
                        <h6 className="fw-bold mb-3" style={{ fontSize: "16px", color: "#252525" }}>Join Our Newsletter Now</h6>
                        <p className="text-muted" style={{ fontSize: "14px" }}>Get E-mail updates about our latest shop and special offers.</p>
                        <form onSubmit={(e) => e.preventDefault()} className="d-flex gap-2 mb-3">
                            <input 
                              type="email" 
                              placeholder="Enter your email" 
                              className="form-control" 
                              style={{ borderRadius: "8px", border: "1px solid #ddd" }}
                            />
                            <button 
                              type="submit" 
                              className="btn text-white px-4 fw-bold" 
                              style={{ backgroundColor: "#7fad39", borderRadius: "8px" }}
                            >
                              Subscribe
                            </button>
                        </form>
                        <div className="footer__widget__social d-flex gap-3">
                            <a href="#fb" className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm hover-bg-green" style={{ width: "36px", height: "36px", color: "#252525", transition: "all 0.3s" }}><i className="fa fa-facebook"></i></a>
                            <a href="#ig" className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm hover-bg-green" style={{ width: "36px", height: "36px", color: "#252525", transition: "all 0.3s" }}><i className="fa fa-instagram"></i></a>
                            <a href="#tw" className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm hover-bg-green" style={{ width: "36px", height: "36px", color: "#252525", transition: "all 0.3s" }}><i className="fa fa-twitter"></i></a>
                            <a href="#wa" className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm hover-bg-green" style={{ width: "36px", height: "36px", color: "#252525", transition: "all 0.3s" }}><i className="fa fa-whatsapp"></i></a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row border-top mt-4 pt-3">
                <div className="col-lg-12">
                    <div className="footer__copyright text-center text-muted" style={{ fontSize: "14px" }}>
                        <p className="mb-0">
                            Copyright &copy; {currentYear} All rights reserved | Organic Kashmir
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <style>{`
          .hover-green:hover {
            color: #7fad39 !important;
          }
          .hover-bg-green:hover {
            background-color: #7fad39 !important;
            color: #fff !important;
          }
        `}</style>
    </footer>
  );
}

export default Footer;