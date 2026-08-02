import React from 'react';

const About = () => {
  return (
    <div style={{ background: "#fafafa" }}>
      {/* Header Banner */}
      <div 
        className="text-center py-5 text-white" 
        style={{ 
          background: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('img/breadcrumb.jpg')", 
          backgroundSize: "cover", 
          backgroundPosition: "center" 
        }}
      >
        <div className="container py-4">
          <h1 className="display-4 fw-bold mb-2">About Organic Kashmir</h1>
          <p className="lead mb-0">Discover our journey towards offering pure, local, and 100% organic farm fresh products.</p>
        </div>
      </div>

      {/* Intro & Split Section */}
      <div className="container py-5">
        <div className="row align-items-center g-5 mb-5">
          <div className="col-lg-6">
            <h2 className="fw-bold mb-3" style={{ color: "#252525" }}>Sowing the Seeds of Purity</h2>
            <p className="text-muted" style={{ fontSize: "16px", lineHeight: "1.8" }}>
              Organic Kashmir was founded in the heart of the Srinagar valley with a single objective: to bring the purest, chemical-free organic produce directly from local fields to your family's table. Surrounded by natural streams and mineral-rich mountain soil, our partner farms cultivate crops using traditional sustainable methods that respect both the Earth and human health.
            </p>
            <p className="text-muted" style={{ fontSize: "16px", lineHeight: "1.8" }}>
              Every product listed on our store is carefully hand-picked, certified organic, and processed using minimal environmental footprints. We believe that good health begins with pure food, and we are dedicated to preserving the pristine agricultural heritage of Kashmir.
            </p>
          </div>
          <div className="col-lg-6">
            <div className="card border-0 shadow overflow-hidden" style={{ borderRadius: "16px" }}>
              <img 
                src="img/hero/banner.jpg" 
                alt="Organic farming in Kashmir" 
                style={{ width: "100%", height: "350px", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>

        {/* Value Cards Section */}
        <div className="row g-4 text-center mt-4">
          <div className="col-lg-12">
            <h3 className="fw-bold mb-1">Our Core Values</h3>
            <p className="text-muted mb-5">What guides our daily operations and choices</p>
          </div>
          
          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "16px", background: "#fff" }}>
              <div className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle" style={{ width: "60px", height: "60px" }}>
                <i className="fa fa-leaf" style={{ fontSize: "24px" }}></i>
              </div>
              <h5 className="fw-bold mb-3">100% Organic</h5>
              <p className="text-muted" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                Grown without any chemical pesticides, artificial fertilizers, or synthetic additives. Purely natural and healthy.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "16px", background: "#fff" }}>
              <div className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle" style={{ width: "60px", height: "60px" }}>
                <i className="fa fa-globe" style={{ fontSize: "24px" }}></i>
              </div>
              <h5 className="fw-bold mb-3">Locally Sourced</h5>
              <p className="text-muted" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                Sourced from family-owned farms across Srinagar and neighboring regions, supporting local livelihoods.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "16px", background: "#fff" }}>
              <div className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle" style={{ width: "60px", height: "60px" }}>
                <i className="fa fa-truck" style={{ fontSize: "24px" }}></i>
              </div>
              <h5 className="fw-bold mb-3">Farm to Table</h5>
              <p className="text-muted" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                Sourced fresh daily and delivered to your doorstep within 24 hours of harvest to preserve taste and nutrients.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;