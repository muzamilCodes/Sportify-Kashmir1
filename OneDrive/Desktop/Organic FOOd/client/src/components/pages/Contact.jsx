import React, { useState } from "react";
import { toast } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:4000/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsSuccess(true);
        toast.success("Thank you! Your message was sent successfully.");
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setTimeout(() => setIsSuccess(false), 4000);
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ background: "#fafafa" }}>
      {/* Hero Section */}
      <div 
        className="contact-hero text-center py-5 text-white" 
        style={{ 
          background: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('img/breadcrumb.jpg')", 
          backgroundSize: "cover", 
          backgroundPosition: "center" 
        }}
      >
        <div className="container py-4">
          <h1 className="display-4 fw-bold mb-2">Get In Touch</h1>
          <p className="lead mb-0">We would love to hear from you. Reach out for any questions, support, or feedback.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5">
        <div className="row g-4">
          {/* Contact Form */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: "16px", background: "#fff" }}>
              <h3 className="fw-bold mb-4" style={{ color: "#252525" }}>Send Us a Message</h3>
              {isSuccess && (
                <div className="alert alert-success border-0 shadow-sm mb-4" style={{ borderRadius: "8px" }} role="alert">
                  <strong>Success!</strong> Thank you for reaching out. We will get back to you shortly.
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label fw-semibold text-dark" style={{ fontSize: "14px" }}>Your Name</label>
                    <input
                      type="text"
                      className="form-control px-3 py-2"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: "8px", border: "1px solid #ddd" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label fw-semibold text-dark" style={{ fontSize: "14px" }}>Email Address</label>
                    <input
                      type="email"
                      className="form-control px-3 py-2"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: "8px", border: "1px solid #ddd" }}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="subject" className="form-label fw-semibold text-dark" style={{ fontSize: "14px" }}>Subject</label>
                  <input
                    type="text"
                    className="form-control px-3 py-2"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: "8px", border: "1px solid #ddd" }}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="message" className="form-label fw-semibold text-dark" style={{ fontSize: "14px" }}>Message</label>
                  <textarea
                    className="form-control px-3 py-2"
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: "8px", border: "1px solid #ddd" }}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn text-white px-4 py-2.5 fw-bold shadow-sm"
                  disabled={isSubmitting}
                  style={{ backgroundColor: "#7fad39", border: "none", borderRadius: "8px" }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "#6b9230"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "#7fad39"}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-paper-plane me-2"></i>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information & Widgets */}
          <div className="col-lg-5">
            <div className="d-flex flex-column gap-4">
              {/* Location Map Card */}
              <div className="card border-0 shadow-sm p-4 text-center" style={{ borderRadius: "16px", background: "#fff" }}>
                <div className="mb-3 mx-auto d-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle" style={{ width: "50px", height: "50px" }}>
                  <i className="fa fa-map-marker text-success" style={{ fontSize: "20px" }}></i>
                </div>
                <h5 className="fw-bold mb-2">Our Location</h5>
                <p className="text-muted mb-3" style={{ fontSize: "14px" }}>Srinagar, Kashmir, India</p>
                <div className="overflow-hidden" style={{ borderRadius: "12px", border: "1px solid #eee" }}>
                  <iframe
                    title="Company Location Map"
                    src="https://www.google.com/maps?q=Kashmir+Srinagar+India&output=embed"
                    width="100%"
                    height="180"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>

              {/* Email Card */}
              <div className="card border-0 shadow-sm p-4 text-center" style={{ borderRadius: "16px", background: "#fff" }}>
                <div className="mb-3 mx-auto d-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle" style={{ width: "50px", height: "50px" }}>
                  <i className="fa fa-envelope text-success" style={{ fontSize: "20px" }}></i>
                </div>
                <h5 className="fw-bold mb-2">Email Address</h5>
                <p className="mb-0" style={{ fontSize: "15px" }}>
                  <a href="mailto:info@organickashmir.com" className="text-decoration-none text-dark hover-green">
                    info@organickashmir.com
                  </a>
                </p>
                <p className="mb-0" style={{ fontSize: "15px" }}>
                  <a href="mailto:support@organickashmir.com" className="text-decoration-none text-dark hover-green">
                    support@organickashmir.com
                  </a>
                </p>
              </div>

              {/* Call Card with WhatsApp */}
              <div className="card border-0 shadow-sm p-4 text-center" style={{ borderRadius: "16px", background: "#fff" }}>
                <div className="mb-3 mx-auto d-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle" style={{ width: "50px", height: "50px" }}>
                  <i className="fa fa-phone text-success" style={{ fontSize: "20px" }}></i>
                </div>
                <h5 className="fw-bold mb-2">Call/WhatsApp Us</h5>
                <p className="mb-2 text-dark fw-semibold" style={{ fontSize: "15px" }}>
                  Support: +91 9906520959
                </p>
                <div className="mt-2">
                  <a
                    href="https://wa.me/919906520959"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-success d-inline-flex align-items-center gap-2 px-3 fw-bold"
                    style={{ borderRadius: "30px", fontSize: "14px" }}
                  >
                    <i className="fa fa-whatsapp" style={{ fontSize: "18px", color: "#25D366" }}></i>
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .hover-green:hover {
          color: #7fad39 !important;
        }
      `}</style>
    </div>
  );
};

export default Contact;