import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { setCurrentOrder, setPaymentMethod as setPaymentMethodRedux } from '../../redux/slices/orderSlice';

const Address = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [addressArr, setAddressArr] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [cart, setCart] = useState({});
  const [paymentMethodState, setPaymentMethodState] = useState("cod");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    country: "",
    email: "",
    mobile: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createAddressHandler = async (e) => {
    e.preventDefault();
    const requiredFields = ["firstName", "lastName", "street", "city", "district", "state", "pincode", "country", "email", "mobile"];
    for (let field of requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
        toast.error("All fields are required.");
        return;
      }
    }
    try {
      const res = await axiosInstance.post("/address/create", formData);
      if (res.status === 201) {
        toast.success(res.data.message);
        setFormData({
          firstName: "", lastName: "", street: "", city: "",
          district: "", state: "", pincode: "", country: "", email: "", mobile: ""
        });
        await fetchAddress();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create address");
    }
  };

  const fetchAddress = async () => {
    try {
      const res = await axiosInstance.get("/address/getAllAddresses");
      if (res.status === 200) {
        setAddressArr(res.data.payload);
        if (res.data.payload.length > 0) {
          setSelectedAddressId(res.data.payload[0]._id);
          setFormData(res.data.payload[0]);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCartData = async () => {
    try {
      const res = await axiosInstance.get("/cart/getCart");
      if (res.status === 200) setCart(res.data.payload);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAddress();
    fetchCartData();
  }, []);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId || addressArr.length === 0) {
      toast.error("Please add and select an address before placing the order.");
      return;
    }
    try {
      const res = await axiosInstance.post(
        `/order/createCartOrder?cartId=${cart._id}&addressId=${selectedAddressId}`
      );
      if (res.status === 201) {
        dispatch(setCurrentOrder({ order: res.data.order, paymentMethod: paymentMethodState }));
        dispatch(setPaymentMethodRedux(paymentMethodState));

        if (paymentMethodState === "online") {
          navigate("/payment");
        } else {
          toast.success(res.data.message);
          navigate("/order-success");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Order creation failed");
    }
  };

  return (
    <div style={{ background: "#fafafa", padding: "40px 0" }}>
      <section className="checkout spad">
        <div className="container">
          <div className="checkout__form">
            <h4 className="fw-bold mb-4" style={{ color: "#252525" }}>Billing & Checkout</h4>
            
            <form onSubmit={createAddressHandler}>
              <div className="row g-4">
                {/* Left Form Panel */}
                <div className="col-lg-8">
                  {/* Select Saved Address */}
                  {addressArr.length > 0 && (
                    <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "16px", background: "#fff" }}>
                      <h5 className="fw-bold mb-3" style={{ color: "#252525" }}>Select Saved Address</h5>
                      <div className="d-flex flex-column gap-3">
                        {addressArr.map((addr) => (
                          <label
                            key={addr._id}
                            className={`d-block p-3 rounded-3 border-2 style-address-card ${selectedAddressId === addr._id ? "active-border" : ""}`}
                            style={{ 
                              cursor: "pointer", 
                              background: "#fdfdfd", 
                              border: selectedAddressId === addr._id ? "2px solid #7fad39" : "2px solid #eee",
                              transition: "all 0.2s" 
                            }}
                          >
                            <div className="d-flex align-items-start gap-3">
                              <input
                                className="form-check-input mt-1"
                                type="radio"
                                name="selectedAddress"
                                id={addr._id}
                                checked={selectedAddressId === addr._id}
                                onChange={() => setSelectedAddressId(addr._id)}
                                style={{ accentColor: "#7fad39", transform: "scale(1.2)" }}
                              />
                              <div style={{ fontSize: "14px", color: "#6f6f6f", lineHeight: "1.6" }}>
                                <strong className="text-dark fs-6 d-block mb-1">{addr.firstName} {addr.lastName}</strong>
                                <span>{addr.street}, {addr.city}, {addr.state} - {addr.pincode}, {addr.country}</span>
                                <span className="d-block mt-1"><strong>Phone:</strong> {addr.mobile}</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Address form */}
                  <div className="card border-0 shadow-sm p-4 p-md-5" style={{ borderRadius: "16px", background: "#fff" }}>
                    <h5 className="fw-bold mb-4" style={{ color: "#252525" }}>Add New Shipping Address</h5>
                    
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "14px" }}>First Name *</label>
                        <input type="text" className="form-control px-3 py-2" value={formData.firstName} name='firstName' onChange={handleInputChange} style={{ borderRadius: "8px", border: "1px solid #ddd" }} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "14px" }}>Last Name *</label>
                        <input type="text" className="form-control px-3 py-2" value={formData.lastName} name='lastName' onChange={handleInputChange} style={{ borderRadius: "8px", border: "1px solid #ddd" }} required />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "14px" }}>Street Address *</label>
                        <input type="text" className="form-control px-3 py-2" value={formData.street} name='street' onChange={handleInputChange} style={{ borderRadius: "8px", border: "1px solid #ddd" }} placeholder="House number and street name" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "14px" }}>Town / City *</label>
                        <input type="text" className="form-control px-3 py-2" value={formData.city} name='city' onChange={handleInputChange} style={{ borderRadius: "8px", border: "1px solid #ddd" }} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "14px" }}>District *</label>
                        <input type="text" className="form-control px-3 py-2" value={formData.district} name='district' onChange={handleInputChange} style={{ borderRadius: "8px", border: "1px solid #ddd" }} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "14px" }}>State *</label>
                        <input type="text" className="form-control px-3 py-2" value={formData.state} name='state' onChange={handleInputChange} style={{ borderRadius: "8px", border: "1px solid #ddd" }} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "14px" }}>Postcode / ZIP *</label>
                        <input type="text" className="form-control px-3 py-2" value={formData.pincode} name='pincode' onChange={handleInputChange} style={{ borderRadius: "8px", border: "1px solid #ddd" }} required />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "14px" }}>Country *</label>
                        <input type="text" className="form-control px-3 py-2" value={formData.country} name='country' onChange={handleInputChange} style={{ borderRadius: "8px", border: "1px solid #ddd" }} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "14px" }}>Phone *</label>
                        <input type="text" className="form-control px-3 py-2" value={formData.mobile} name='mobile' onChange={handleInputChange} style={{ borderRadius: "8px", border: "1px solid #ddd" }} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark mb-1" style={{ fontSize: "14px" }}>Email *</label>
                        <input type="email" className="form-control px-3 py-2" value={formData.email} name='email' onChange={handleInputChange} style={{ borderRadius: "8px", border: "1px solid #ddd" }} required />
                      </div>
                    </div>

                    <div className='d-flex justify-content-end mt-4'>
                      <button 
                        type='submit' 
                        className='btn text-white px-4 py-2.5 fw-bold' 
                        style={{ backgroundColor: "#7fad39", borderRadius: "8px" }}
                        onMouseOver={(e) => e.target.style.backgroundColor = "#6b9230"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "#7fad39"}
                      >
                        SAVE ADDRESS
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Summary Panel */}
                <div className="col-lg-4 col-md-6">
                  {addressArr.length === 0 ? (
                    <div className="alert alert-warning shadow-sm" style={{ borderRadius: "12px" }}>
                      <i className="fa fa-exclamation-triangle me-2"></i>
                      Please save at least one shipping address to place your order.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-4">
                      {/* Order summary card */}
                      <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "16px", background: "#fff" }}>
                        <h5 className="fw-bold mb-4" style={{ borderBottom: "2px solid #7fad39", paddingBottom: "10px" }}>Your Order</h5>

                        <div className="d-flex justify-content-between fw-bold mb-2 pb-2 border-bottom" style={{ fontSize: "15px", color: "#252525" }}>
                          <span>Products</span>
                          <span>Total</span>
                        </div>

                        <ul className="list-unstyled mb-3" style={{ maxHeight: "250px", overflowY: "auto" }}>
                          {cart?.products
                            ?.filter(product => product.productId)
                            .map((product) => (
                              <li key={product.productId._id} className="d-flex justify-content-between py-2 border-bottom text-muted" style={{ fontSize: "14px" }}>
                                <span>{product.productId.name} <strong className="text-dark">x{product.quantity}</strong></span>
                                <span className="fw-semibold text-dark">
                                  Rs {(
                                    (product.productId.price - (product.productId.price * (product.productId.discount || 0)) / 100)
                                    * product.quantity
                                  ).toFixed(2)}
                                </span>
                              </li>
                            ))}
                        </ul>

                        <div className="d-flex justify-content-between fw-bold fs-5 mb-4 pt-2 border-top">
                          <span>Total Summary</span>
                          <span style={{ color: "#7fad39" }}>
                            Rs {cart.products
                              ?.filter(product => product.productId)
                              .reduce((acc, product) => {
                                const price = product.productId.price || 0;
                                const discount = product.productId.discount || 0;
                                const discountedPrice = price * (1 - discount / 100);
                                return acc + discountedPrice * product.quantity;
                              }, 0)
                              .toFixed(2)}
                          </span>
                        </div>

                        <button
                          className="btn text-white py-3 fw-bold w-100 shadow-sm"
                          type="button"
                          onClick={handlePlaceOrder}
                          disabled={addressArr.length === 0}
                          style={{ backgroundColor: "#7fad39", borderRadius: "8px" }}
                          onMouseOver={(e) => e.target.style.backgroundColor = "#6b9230"}
                          onMouseOut={(e) => e.target.style.backgroundColor = "#7fad39"}
                        >
                          PLACE ORDER
                        </button>
                      </div>

                      {/* Payment method selector card */}
                      <div className="card border-0 shadow-sm p-4" style={{ borderRadius: "16px", background: "#fff" }}>
                        <h5 className="fw-bold mb-4" style={{ color: "#252525" }}>Payment Method</h5>
                        
                        <div className="d-flex flex-column gap-3">
                          <label className="d-flex align-items-center gap-2 p-2 rounded" style={{ cursor: "pointer" }}>
                            <input
                              className="form-check-input m-0"
                              type="radio"
                              name="paymentMethod"
                              id="paymentCod"
                              value="cod"
                              checked={paymentMethodState === "cod"}
                              onChange={() => {
                                setPaymentMethodState("cod");
                                dispatch(setPaymentMethodRedux("cod"));
                              }}
                              style={{ accentColor: "#7fad39", transform: "scale(1.2)" }}
                            />
                            <span className="fw-semibold" style={{ fontSize: "14px", color: "#6f6f6f" }}>Cash on Delivery (COD)</span>
                          </label>

                          <label className="d-flex align-items-center gap-2 p-2 rounded" style={{ cursor: "pointer" }}>
                            <input
                              className="form-check-input m-0"
                              type="radio"
                              name="paymentMethod"
                              id="paymentOnline"
                              value="online"
                              checked={paymentMethodState === "online"}
                              onChange={() => {
                                setPaymentMethodState("online");
                                dispatch(setPaymentMethodRedux("online"));
                              }}
                              style={{ accentColor: "#7fad39", transform: "scale(1.2)" }}
                            />
                            <span className="fw-semibold" style={{ fontSize: "14px", color: "#6f6f6f" }}>Online Card/NetBanking</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Address;
