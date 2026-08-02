import React, { useState } from "react";
import { toast } from "react-toastify";

const OnlinePayment = () => {
  const [paymentOption, setPaymentOption] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  const handleInputChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handlePayNow = () => {
    if (paymentOption === "card") {
      const { name, number, expiry, cvv } = cardDetails;
      if (!name || !number || !expiry || !cvv) {
        toast.error("Please fill in all card details");
        return;
      }
    }

  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4 shadow">
            <h4 className="mb-4 text-center">Complete Your Payment</h4>

            <div className="mb-3">
              <label className="form-label">Select Payment Option</label>
              <div className="form-check">
                <input
                  type="radio"
                  id="card"
                  name="paymentOption"
                  className="form-check-input"
                  value="card"
                  checked={paymentOption === "card"}
                  onChange={() => setPaymentOption("card")}
                />
                <label className="form-check-label" htmlFor="card">
                  Credit/Debit Card
                </label>
              </div>
              <div className="form-check">
                <input
                  type="radio"
                  id="paypal"
                  name="paymentOption"
                  className="form-check-input"
                  value="paypal"
                  checked={paymentOption === "paypal"}
                  onChange={() => setPaymentOption("paypal")}
                />
                <label className="form-check-label" htmlFor="paypal">
                  PayPal
                </label>
              </div>
            </div>

            {paymentOption === "card" && (
              <div>
                <div className="mb-3">
                  <label className="form-label">Name on Card</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    name="number"
                    className="form-control"
                    placeholder="1234 5678 9012 3456"
                    maxLength="16"
                    value={cardDetails.number}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="text"
                      name="expiry"
                      className="form-control"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={cardDetails.expiry}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      className="form-control"
                      placeholder="123"
                      maxLength="3"
                      value={cardDetails.cvv}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentOption === "paypal" && (
              <div className="alert alert-info mt-3">
                You’ll be redirected to PayPal to complete your payment.
              </div>
            )}

            <button className="btn btn-success w-100 mt-3" onClick={handlePayNow}>
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlinePayment;
