"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  User,
  MessageSquare,
  AtSign,
  Phone as PhoneIcon,
  Loader2,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Headphones,
  Shield,
  Truck,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        toast.success("Message sent successfully!");
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        toast.error(result.message || "Failed to send message");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      details: ["Sportify Kashmir", "Handwara, Qalamabad", "Kupwara, J&K - 193302"],
      color: "from-red-500 to-orange-500",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      details: ["+91 9682645127", "+91 9906785432"],
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      details: ["sportify68@gmail.com", "support@sportifykashmir.com"],
      color: "from-blue-500 to-indigo-500",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Business Hours",
      details: ["Monday - Saturday: 10AM - 7PM", "Sunday: 11AM - 5PM"],
      color: "from-purple-500 to-pink-500",
    },
  ];

  const faqs = [
    {
      question: "How long does delivery take?",
      answer: "We deliver within 2-3 business days across Kashmir valley. For remote areas, delivery may take 4-5 days.",
    },
    {
      question: "What is your return policy?",
      answer: "We offer 7-day easy returns on all products. Items must be unused and in original packaging.",
    },
    {
      question: "Do you offer cash on delivery?",
      answer: "Yes, COD is available on orders up to ₹5000. For higher value orders, online payment is required.",
    },
    {
      question: "Are your products authentic?",
      answer: "100% authentic products directly from authorized brands and distributors.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-600 to-red-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-2 mb-6">
            <Headphones className="w-4 h-4" />
            <span className="text-sm font-medium">24/7 Customer Support</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            We'd Love to Hear
            <span className="block text-orange-200">From You</span>
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Have questions, feedback, or just want to say hello? Our team is here to help you.
          </p>
        </div>
        
        <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 64L60 69.3C120 75 240 85 360 80C480 75 600 53 720 48C840 43 960 53 1080 58.7C1200 64 1320 64 1380 64L1440 64L1440 120L1380 120C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120L0 120Z" fill="#F9FAFB"/>
        </svg>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className={`w-16 h-16 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg group-hover:scale-110 transition duration-300`}>
                {info.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
              {info.details.map((detail, i) => (
                <p key={i} className="text-gray-600 text-sm">{detail}</p>
              ))}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
              <p className="text-gray-600">Fill out the form and we'll get back to you within 24 hours</p>
            </div>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
                <p className="text-gray-600 mb-4">Thank you for reaching out. Our team will respond to you shortly.</p>
                <button onClick={() => setSubmitted(false)} className="text-orange-600 font-medium hover:text-orange-700">
                  Send Another Message →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="+91 1234567890"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Order Inquiry / Product Question / Support"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Tell us how we can help you..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By submitting, you agree to our privacy policy. We'll never share your information.
                </p>
              </form>
            )}
          </div>

          {/* FAQ & Map Section */}
          <div className="space-y-8">
            {/* FAQ */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details key={index} className="group border-b border-gray-100 pb-4">
                    <summary className="flex justify-between items-center cursor-pointer list-none">
                      <span className="font-medium text-gray-900 group-hover:text-orange-600 transition">
                        {faq.question}
                      </span>
                      <span className="text-orange-500 group-open:rotate-180 transition">▼</span>
                    </summary>
                    <p className="text-gray-600 text-sm mt-2 pl-4">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>

            {/* Quick Response Promise */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Quick Response</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Response Time</h3>
              <p className="text-gray-600">
                We typically respond within <span className="font-bold text-orange-600">2-4 hours</span> during business hours.
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <Truck className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-600">Free Shipping</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-600">Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <RefreshCw className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-600">7-Day Returns</span>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Connect With Us</h3>
              <div className="flex justify-center gap-4">
                <a href="#" className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section - Updated with Handwara Location */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="p-8 bg-gradient-to-br from-orange-50 to-red-50">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Visit Our Store</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-gray-800 font-medium">Sportify Kashmir</p>
                    <p className="text-gray-600 text-sm">Handwara, Qalamabad</p>
                    <p className="text-gray-600 text-sm">Kupwara, Jammu & Kashmir - 193302</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-orange-500" />
                  <p className="text-gray-600 text-sm">+91 9682645127</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-orange-500" />
                  <p className="text-gray-600 text-sm">sportify68@gmail.com</p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Store Hours</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Monday - Friday: 10:00 AM - 7:00 PM</p>
                  <p>Saturday: 10:00 AM - 8:00 PM</p>
                  <p>Sunday: 11:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 h-64 lg:h-auto bg-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13238.000000000004!2d74.35!3d34.45!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38e1850c00000000%3A0x0000000000000000!2sHandwara%2C%20Jammu%20and%20Kashmir!5e0!3m2!1sen!2sin!4v1698765432100!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sportify Kashmir Location - Handwara"
                className="h-full min-h-[300px]"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}