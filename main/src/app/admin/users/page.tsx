"use client";

import { Edit, Filter, Search, Trash2, UserCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isActive?: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

  // Fetch all users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/getAll`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
        setFilteredUsers(result.data);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(
        (user) => (user.isAdmin ? "admin" : "user") === roleFilter,
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const result = await response.json();
      if (result.success) {
        toast.success("User deleted successfully");
        fetchUsers(); // Refresh list
        setShowDeleteConfirm(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userId: string, active: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: active }),
        },
      );

      const result = await response.json();
      if (result.success) {
        toast.success(
          `User ${active ? "activated" : "deactivated"} successfully`,
        );
        fetchUsers(); // Refresh list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const roles = ["all", ...new Set(users.map((u) => (u.isAdmin ? "admin" : "user")))];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage your users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredUsers.length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="all">All Roles</option>
              {roles
                .filter((role) => role !== "all")
                .map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-t hover:bg-gray-50">
                    {/* User Info */}
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          (user.isAdmin ? "admin" : "user") === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.isAdmin ? "admin" : "user"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            user.isActive ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                        <span className="text-sm">
                          {(user.isActive ?? true) ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="p-4">
                      <span className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {/* Toggle Status */}
                        <button
                          onClick={() =>
                            handleToggleStatus(user._id, !(user.isActive ?? true))
                          }
                          className={`p-2 rounded-lg ${
                            (user.isActive ?? true)
                              ? "text-yellow-600 hover:bg-yellow-50"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={(user.isActive ?? true) ? "Deactivate" : "Activate"}
                        >
                          {(user.isActive ?? true) ? (
                            <UserX size={18} />
                          ) : (
                            <UserCheck size={18} />
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setShowDeleteConfirm(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Delete Confirmation Modal */}
                      {showDeleteConfirm === user._id && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                          <div className="bg-white rounded-xl p-6 max-w-md mx-4">
                            <h3 className="text-lg font-bold mb-2">
                              Confirm Delete
                            </h3>
                            <p className="text-gray-600 mb-6">
                              Are you sure you want to delete "{user.username}"?
                              This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
