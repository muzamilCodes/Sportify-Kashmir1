import React, { useEffect, useState } from 'react';
import { axiosInstance } from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get('/order/fetchAllOrders');  // backend api routes 
        setOrders(res.data.payload);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center animate-fade-in" style={{ minHeight: "40vh" }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

 return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold">📦All Orders</h2>
      {orders.map(order => (
        <div className="card mb-4 shadow-sm" key={order._id}>
          <div className="card-body">
            <h5 className="card-title">Order ID: <span className="text-primary">{order._id}</span></h5>
            <p className="card-text"><strong>User ID:</strong> {order.userId}</p>
            <p className="card-text"><strong>Address ID:</strong> {order.addressId}</p>
            <p className="card-text"><strong>Order Value:</strong> ₹{order.orderValue}</p>
            <p className="card-text"><strong>Order Status:</strong> 
              <span className={`badge ms-2 ${order.orderStatus === 'pending' ? 'bg-warning' : 'bg-success'}`}>
                {order.orderStatus}
              </span>
            </p>
            <p className="card-text"><strong>Payment Status:</strong> 
              <span className={`badge ms-2 ${order.paymentStatus === 'pending' ? 'bg-danger' : 'bg-success'}`}>
                {order.paymentStatus}
              </span>
            </p>
            <p className="card-text"><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p className="card-text"><strong>Updated At:</strong> {new Date(order.updatedAt).toLocaleString()}</p>

            <div className="mt-3">
              <h6>🛒 Products</h6>
              <table className="table table-sm table-bordered mt-2">
                <thead className="table-light">
                  <tr>
                    <th>Product ID</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products.map(product => (
                    <tr key={product._id}>
                      <td>{product.productId}</td>
                      <td>{product.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}

     
    </div>
  );
};

export default Orders;
