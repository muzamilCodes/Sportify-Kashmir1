import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

const UploadProduct = ({ isEdit = false }) => {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  const [formBody, setFormBody] = useState({
    name: "",
    description: "",
    price: 0,
    discount: 0,
    colors: "",
    sizes: "",
  });

  const [image, setImage] = useState(null);

  // Fetch existing product when editing
  useEffect(() => {
    if (isEdit && productId) {
      axiosInstance.get(`/product/get/${productId}`)
        .then(res => {
          if (res.status === 200) {
            const p = res.data.payload;
            setFormBody({
              name: p.name,
              description: p.description,
              price: p.price,
              discount: p.discount,
              colors: p.colors.join(","),
              sizes: p.sizes.join(","),
            });
            setImage(p.productImgUrls?.[0] || null);
          }
        })
        .catch(err => console.error(err));
    }
  }, [isEdit, productId]);

  const handleImage = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]); // File object
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormBody((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 const handleSubmit = async () => {
  try {
    if (!isEdit && !image) {
      toast.error("Please select an image.");
      return;
    }

    const formData = new FormData();

    if (image && typeof image !== "string") {
      formData.append("image", image);
    }

    Object.entries(formBody).forEach(([key, value]) => {
      formData.append(key, value);
    });

    let res;
    if (isEdit) {
      res = await axiosInstance.put(`/product/edit/${productId}`, formData);
    } else {
      res = await axiosInstance.post("/product/add", formData);
    }

    if (res.status === 200 || res.status === 201) {
      toast.success(res.data.message);
      navigate("/shop");
    }
  } catch (error) {
    console.error(error.response?.data?.message || "Error");
    toast.error(error.response?.data?.message || "Error");
  }
};


  return (
    <div className="mt-3">
      <h4>{isEdit ? "Edit Product" : "Add Product"}</h4>
      <form>
        <input name="name" value={formBody.name} onChange={handleInputChange} className="form-control mb-3" placeholder="Name" />
        <textarea name="description" value={formBody.description} onChange={handleInputChange} className="form-control mb-3" placeholder="Description" />
        <input name="colors" value={formBody.colors} onChange={handleInputChange} className="form-control mb-3" placeholder="Colors (comma separated)" />
        <input name="sizes" value={formBody.sizes} onChange={handleInputChange} className="form-control mb-3" placeholder="Sizes (comma separated)" />
        <input name="price" type="number" value={formBody.price} onChange={handleInputChange} className="form-control mb-3" placeholder="Price" />
        <input name="discount" type="number" value={formBody.discount} onChange={handleInputChange} className="form-control mb-3" placeholder="Discount" />
        <input type="file" className="form-control mb-3" onChange={handleImage} />
        {image && typeof image === "string" && <img src={image} alt="Preview" width="100" />}
        <button type="button" className="btn btn-success" onClick={handleSubmit}>
          {isEdit ? "Update Product" : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default UploadProduct;
