"use client";

import { useState, useEffect } from "react";
import { 
  Mail, 
  Eye, 
  Trash2, 
  Search, 
  RefreshCw,
  CheckCircle,
  Clock,
  MessageSquare,
  Users,
  Archive,
  Reply,
  X,
  Loader2,
  Phone,
  User,
  Calendar,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  createdAt: string;
  replyMessage?: string;
  repliedAt?: string;
}

interface Stats {
  total: number;
  unread: number;
  read: number;
  replied: number;
  archived: number;
  last7Days: number;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
    archived: 0,
    last7Days: 0,
  });

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, []);

  useEffect(() => {
    let filtered = [...contacts];
    
    if (searchTerm) {
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((contact) => contact.status === statusFilter);
    }
    
    setFilteredContacts(filtered);
  }, [searchTerm, statusFilter, contacts]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setContacts(result.data);
        setFilteredContacts(result.data);
      }
    } catch (error) {
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const viewContact = async (contact: Contact) => {
    setSelectedContact(contact);
    setShowDetailModal(true);
    
    if (contact.status === "unread") {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/${contact._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "read" }),
        });
        fetchContacts();
        fetchStats();
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    setReplyLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/${selectedContact?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: "replied", 
          replyMessage: replyMessage 
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Reply sent and marked as replied");
        setShowReplyModal(false);
        setReplyMessage("");
        fetchContacts();
        fetchStats();
        setSelectedContact(null);
        setShowDetailModal(false);
      }
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setReplyLoading(false);
    }
  };

  const deleteContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/${contactId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Contact deleted successfully");
        fetchContacts();
        fetchStats();
      }
    } catch (error) {
      toast.error("Failed to delete contact");
    }
  };

  const archiveContact = async (contactId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/${contactId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "archived" }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Contact archived");
        fetchContacts();
        fetchStats();
      }
    } catch (error) {
      toast.error("Failed to archive contact");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 flex items-center gap-1"><Clock className="w-3 h-3" /> Unread</span>;
      case "read":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"><Eye className="w-3 h-3" /> Read</span>;
      case "replied":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Replied</span>;
      case "archived":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 flex items-center gap-1"><Archive className="w-3 h-3" /> Archived</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100">{status}</span>;
    }
  };

  const statCards = [
    { label: "Total", value: stats.total, icon: <MessageSquare className="w-5 h-5" />, color: "bg-blue-500" },
    { label: "Unread", value: stats.unread, icon: <Mail className="w-5 h-5" />, color: "bg-red-500" },
    { label: "Replied", value: stats.replied, icon: <CheckCircle className="w-5 h-5" />, color: "bg-green-500" },
    { label: "Last 7 Days", value: stats.last7Days, icon: <Calendar className="w-5 h-5" />, color: "bg-purple-500" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mt-1">Manage customer inquiries and support requests</p>
        </div>
        <button
          onClick={() => { fetchContacts(); fetchStats(); }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No messages found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-500">
                  <th className="p-4">Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact._id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {contact.phone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{contact.phone}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No phone</span>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-900 max-w-[200px] truncate">{contact.subject}</p>
                    </td>
                    <td className="p-4">{getStatusBadge(contact.status)}</td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(contact.createdAt).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewContact(contact)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowReplyModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Reply"
                        >
                          <Reply size={18} />
                        </button>
                        <button
                          onClick={() => archiveContact(contact._id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                          title="Archive"
                        >
                          <Archive size={18} />
                        </button>
                        <button
                          onClick={() => deleteContact(contact._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contact Detail Modal */}
      {showDetailModal && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Message Details</h2>
                <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">From</p>
                    <p className="font-medium text-gray-900">{selectedContact.name}</p>
                    <p className="text-sm text-gray-600">{selectedContact.email}</p>
                    {selectedContact.phone && <p className="text-sm text-gray-600">{selectedContact.phone}</p>}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Received</p>
                    <p className="text-gray-900">{new Date(selectedContact.createdAt).toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-2">Status: {getStatusBadge(selectedContact.status)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="font-medium text-gray-900">{selectedContact.subject}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Message</p>
                  <div className="bg-gray-50 rounded-xl p-4 mt-1">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>
                
                {selectedContact.replyMessage && (
                  <div>
                    <p className="text-sm text-gray-500">Your Reply</p>
                    <div className="bg-green-50 rounded-xl p-4 mt-1">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.replyMessage}</p>
                      {selectedContact.repliedAt && (
                        <p className="text-xs text-gray-500 mt-2">Sent: {new Date(selectedContact.repliedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowReplyModal(true);
                  }}
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600"
                >
                  Reply to Customer
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Reply to {selectedContact.name}</h2>
                <button onClick={() => setShowReplyModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Original Message:</p>
                <p className="text-sm text-gray-700 mt-1 line-clamp-2">{selectedContact.message}</p>
              </div>
              
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={5}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500"
                placeholder="Type your reply here..."
              />
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleReply}
                  disabled={replyLoading}
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {replyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Reply className="w-4 h-4" />}
                  Send Reply
                </button>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}