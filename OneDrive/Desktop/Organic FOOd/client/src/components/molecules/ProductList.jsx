import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ProductList = () => {

  const [updateData, setUpdateData] = useState(false)
  const [products, setProducts] = useState([]);
    const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get("/product/getAll");

      if (res.status === 200) {
        setProducts(res.data.payload);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleArchive = async (productId) => {
    try {
      const res = await axiosInstance.put(`/product/archive/${productId}`);
      if (res.status === 200) {
        toast.success(res.data.message);
        setUpdateData(!updateData)

      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [updateData]);

  return (
    <div className="mt-3">
      <h4>List of the Products</h4>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th> Product Cost</th>
            <th> Discount</th>
            <th> Available Sizes</th>
            <th> Available Colors</th>
            <th> Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr>
              <td> {product.name}</td>
              <td> {product.price}</td>
              <td> {product.discount}</td>
              <td>{product.sizes}</td>
              <td> {product.colors} </td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => navigate(`/product/edit/${product._id}`)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => {
                    handleArchive(product._id);
                  }}
                >
                  {product.isArchived ? "UnArchive" : "Archive"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;