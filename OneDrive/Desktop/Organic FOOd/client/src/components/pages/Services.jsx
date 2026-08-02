import React from 'react';

const Services = () => {
  const serviceList = [
    {
      title: "Organic Certification",
      icon: "fa-certificate",
      desc: "Every product in our store undergoes rigid quality controls and laboratory testing to guarantee zero pesticide residues and 100% natural compliance."
    },
    {
      title: "Fast Valley Delivery",
      icon: "fa-rocket",
      desc: "We operate a temperature-controlled cold chain logistics system that delivers fresh harvests straight to your kitchen door within 24 hours."
    },
    {
      title: "Customer Support Helpline",
      icon: "fa-headphones",
      desc: "Our dedicated support team is available 24/7 to help resolve order issues, answer agricultural queries, or assist with customized orders."
    },
    {
      title: "Bulk & Gift Orders",
      icon: "fa-gift",
      desc: "We offer customized dry fruit packs, fresh fruit baskets, and bulk organic assortments tailored for corporate gifting, festivals, and weddings."
    },
    {
      title: "Traceable Sourcing",
      icon: "fa-search-plus",
      desc: "Transparency is key. Scan the QR code on your product box to view details about the exact partner farm where your food was cultivated."
    },
    {
      title: "Eco-Friendly Packaging",
      icon: "fa-recycle",
      desc: "We use 100% biodegradable and recyclable boxes, paper bags, and glass containers to keep our environment as clean as our organic produce."
    }
  ];

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
          <h1 className="display-4 fw-bold mb-2">Our Services</h1>
          <p className="lead mb-0">From soil analysis to doorstep deliveries, we ensure premium quality at every step.</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container py-5">
        <div className="row g-4 mt-2">
          {serviceList.map((service, index) => (
            <div className="col-lg-4 col-md-6" key={index}>
              <div 
                className="card border-0 shadow-sm p-4 h-100 service-card-hover" 
                style={{ 
                  borderRadius: "16px", 
                  background: "#fff",
                  transition: "transform 0.3s, box-shadow 0.3s"
                }}
              >
                <div 
                  className="mb-3 d-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle" 
                  style={{ width: "55px", height: "55px" }}
                >
                  <i className={`fa ${service.icon}`} style={{ fontSize: "22px" }}></i>
                </div>
                <h5 className="fw-bold mb-3 text-dark">{service.title}</h5>
                <p className="text-muted mb-0" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                  {service.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .service-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06) !important;
        }
      `}</style>
    </div>
  );
};

export default Services;