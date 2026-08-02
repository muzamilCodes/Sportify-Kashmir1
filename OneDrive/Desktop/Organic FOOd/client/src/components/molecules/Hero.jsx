import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const [showDepartments, setShowDepartments] = useState(window.innerWidth > 992);

  // Handle window resize to adapt default display
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setShowDepartments(true);
      } else {
        setShowDepartments(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="hero">
      <div className="container">
        <div className="row">
          <div className="col-lg-3">
            <div className="hero__categories">
              <div 
                className="hero__categories__all" 
                onClick={() => setShowDepartments(!showDepartments)}
                style={{ cursor: 'pointer' }}
              >
                <i className="fa fa-bars"></i>
                <span>All departments</span>
                <span className="ms-3">
                  <i className="fa fa-caret-down"></i>
                </span>
              </div>
              {showDepartments && (
                <ul style={{ display: 'block', animation: 'fadeIn 0.3s ease' }}>
                  <li><Link to="/shop?category=Meat">Fresh Meat</Link></li>
                  <li><Link to="/shop?category=Vegetables">Vegetables</Link></li>
                  <li><Link to="/shop?category=Fruits">Fruits & Nuts</Link></li>
                  <li><Link to="/shop?category=Berries">Fresh Berries</Link></li>
                  <li><Link to="/shop?category=Meat">Ocean Foods</Link></li>
                  <li><Link to="/shop?category=Meat">Butter & Eggs</Link></li>
                  <li><Link to="/shop?category=Fastfood">Fastfood</Link></li>
                  <li><Link to="/shop?category=Vegetables">Fresh Onion</Link></li>
                  <li><Link to="/shop?category=Fastfood">Papayaya & Crisps</Link></li>
                  <li><Link to="/shop?category=Fastfood">Oatmeal</Link></li>
                  <li><Link to="/shop?category=Fruits">Fresh Bananas</Link></li>
                </ul>
              )}
            </div>
          </div>

          <div className="col-lg-9">
            <div className="hero__search">
              <div className="hero__search__form">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="hero__search__categories">
                    All Categories
                    <span className="ms-3">
                      <i className="fa fa-caret-down"></i>
                    </span>
                  </div>
                  <input type="text" placeholder="What do you need?" />
                  <button type="submit" className="site-btn">SEARCH</button>
                </form>
              </div>
              <div className="hero__search__phone">
                <div className="hero__search__phone__icon">
                  <i className="fa fa-phone"></i>
                </div>
                <div className="hero__search__phone__text">
                  <h5>+91 9906520959</h5>
                  <span>support 24/7 time</span>
                </div>
              </div>
            </div>
            <div className="hero__item set-bg" style={{ backgroundImage: 'url("img/hero/banner.jpg")' }}>
              <div className="hero__text">
                <span>FRUIT FRESH</span>
                <h2>Vegetable <br />100% Organic</h2>
                <p>Free Pickup and Delivery Available</p>
                <a href="#shop" className="primary-btn">SHOP NOW</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;