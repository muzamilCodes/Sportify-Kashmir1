"use client";

import {
  ArrowLeft,
  Check,
  Edit,
  Loader,
  MapPin,
  Plus,
  Trash2,
  X,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Address {
  _id: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
  mobile: string;
  email?: string;
  isDefault?: boolean;
}

export default function AddressPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    country: "India",
    mobile: "",
    email: "",
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/addresses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();
      if (result.success) {
        setAddresses(result.data);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      street: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
      country: "India",
      mobile: "",
      email: "",
      isDefault: false,
    });
  };

  const handleAddNew = () => {
    resetForm();
    setEditingAddress(null);
    setIsAddingNew(true);
  };

  const handleEdit = (address: Address) => {
    setFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      street: address.street,
      city: address.city,
      district: address.district,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
      mobile: address.mobile,
      email: address.email || "",
      isDefault: address.isDefault || false,
    });
    setEditingAddress(address);
    setIsAddingNew(true);
  };

  const handleSave = async () => {
    try {
      if (
        !formData.firstName.trim() ||
        !formData.lastName.trim() ||
        !formData.street.trim() ||
        !formData.city.trim() ||
        !formData.state.trim() ||
        !formData.pincode.trim() ||
        !formData.mobile.trim()
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to continue");
        return;
      }

      const addressData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        street: formData.street,
        city: formData.city,
        district: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
        email: formData.email,
        mobile: formData.mobile,
      };

      let response;
      if (editingAddress) {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/addresses/update/${editingAddress._id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(addressData),
          }
        );
      } else {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/addresses/create`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(addressData),
          }
        );
      }

      const result = await response.json();
      if (result.success) {
        toast.success(
          editingAddress
            ? "Address updated successfully"
            : "Address added successfully"
        );
        fetchAddresses();
        setIsAddingNew(false);
        resetForm();
        setEditingAddress(null);
      } else {
        toast.error(result.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to continue");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/addresses/remove/${addressId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success("Address deleted successfully");
        fetchAddresses();
      } else {
        toast.error(result.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to continue");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/addresses/setDefault/${addressId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success("Default address updated");
        fetchAddresses();
      } else {
        toast.error(result.message || "Failed to set default address");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to set default address");
    }
  };

  // ✅ PROCEED TO CHECKOUT FUNCTION
  const proceedToCheckout = () => {
    if (addresses.length === 0) {
      toast.error("Please add an address first");
      return;
    }
    // Save selected address to localStorage
    const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
    localStorage.setItem("selectedAddress", JSON.stringify(defaultAddress));
    // Redirect to checkout
    router.push("/checkout");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Proceed Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
              <p className="text-gray-600">Manage your delivery addresses</p>
            </div>
          </div>

          {/* ✅ PROCEED TO CHECKOUT BUTTON */}
          <button
            onClick={proceedToCheckout}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            Proceed to Checkout
          </button>
        </div>

        {/* Add New Address Button */}
        <div className="mb-6">
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add New Address
          </button>
        </div>

        {/* Addresses List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div
              key={address._id}
              className="bg-white rounded-xl shadow-lg border p-6 relative cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => {
                // Select address and proceed
                localStorage.setItem("selectedAddress", JSON.stringify(address));
                toast.success("Address selected!");
              }}
            >
              {address.isDefault && (
                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Default
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {address.firstName} {address.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{address.mobile}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-gray-800">{address.street}</p>
                <p className="text-gray-800">
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <p className="text-gray-600">{address.country}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-2">
                  {!address.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(address._id);
                      }}
                      className="text-sm px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(address);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAddress(address._id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {addresses.length === 0 && (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No addresses found
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first delivery address to get started
            </p>
            <button
              onClick={handleAddNew}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Add Address
            </button>
          </div>
        )}

        {/* Add/Edit Address Modal */}
        {isAddingNew && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h2>
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingAddress(null);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({ ...formData, street: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter state"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter pincode"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter country"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({ ...formData, isDefault: e.target.checked })
                    }
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isDefault"
                    className="text-gray-700 font-medium"
                  >
                    Set as default address
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingAddress(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {editingAddress ? "Update Address" : "Save Address"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}