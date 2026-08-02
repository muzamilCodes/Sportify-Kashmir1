import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Card, Button } from "react-bootstrap";
import { clearOrder } from "../../redux/slices/orderSlice";

const OrderSuccess = () => {
  const dispatch = useDispatch();
  const { currentOrder, paymentMethod } = useSelector((state) => state.order);

  const handleContinueShopping = () => {
    dispatch(clearOrder()); // Clear order from Redux
  };

  return (
    <div className="container mt-5 d-flex justify-content-center align-items-center">
      <Card className="text-center p-4 shadow" style={{ width: "30rem" }}>
        <Card.Body>
          <h2 className="text-success mb-3">Order Placed!</h2>
          {currentOrder ? (
            <p className="text-muted">
              Your order has been successfully created.
              <br />
              <strong>Payment Method:</strong> {paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
            </p>
          ) : (
            <p className="text-muted">
              Your order has been successfully created.
              <br />
              <strong>Payment Method:</strong> {paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}
            </p>
          )}

          <div className="mt-4">
            <Link to="/">
              <Button variant="secondary" onClick={handleContinueShopping}>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default OrderSuccess;
