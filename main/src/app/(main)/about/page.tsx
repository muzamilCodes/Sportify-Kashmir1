"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Trophy,
  Star,
  Users,
  Package,
  Award,
  Heart,
  Truck,
  Shield,
  Clock,
  Quote,
  ChevronRight,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  TrendingUp,
  Target,
  Eye,
  Lightbulb,
  Leaf,
  Handshake,
  Sparkles,
  Zap,
  Globe,
  Coffee,
  Smile,
  ThumbsUp,
  Crown,
  Diamond,
  Rocket,
  Headphones,
  CreditCard,
  RefreshCw,
} from "lucide-react";

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState("hero");
  const [countersStarted, setCountersStarted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const statsRef = useRef<HTMLElement>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const stats = [
    { value: 15000, label: "Happy Customers", icon: <Smile className="w-8 h-8" />, suffix: "+", color: "from-green-500 to-emerald-600" },
    { value: 800, label: "Products", icon: <Package className="w-8 h-8" />, suffix: "+", color: "from-blue-500 to-indigo-600" },
    { value: 70, label: "Brands", icon: <Crown className="w-8 h-8" />, suffix: "+", color: "from-purple-500 to-pink-600" },
    { value: 6, label: "Years", icon: <Diamond className="w-8 h-8" />, suffix: "+", color: "from-orange-500 to-red-600" },
    { value: 99, label: "Satisfaction", icon: <ThumbsUp className="w-8 h-8" />, suffix: "%", color: "from-teal-500 to-cyan-600" },
    { value: 24, label: "Support", icon: <Clock className="w-8 h-8" />, suffix: "/7", color: "from-rose-500 to-pink-600" },
  ];

  const [countedValues, setCountedValues] = useState(stats.map(() => 0));

  const testimonials = [
    {
      name: "Mubashir nabi war",
      role: "Adventure Enthusiast",
      content: "Sportify Kashmir has transformed my outdoor adventures. The quality of their equipment is unmatched, and their customer service is exceptional!",
      rating: 5,
      image: "", 
      location: "Handwara",
    },
    {
      name: "Mudasir Nabi war",
      role: "Cricket Coach",
      content: "As a cricket coach, I need reliable equipment for my team. Sportify Kashmir has never disappointed. Their expert advice is invaluable.",
      rating: 5, 
      image: "",
      location: "Handwara Qalamabad",
    },
    {
      name: "Aamir nabi war",
      role: "Yoga Instructor",
      content: "The yoga equipment from Sportify Kashmir is simply the best. Premium quality, affordable prices, and fast delivery. Highly recommended!",
      rating: 5,
      image: "",
      location: "Handwara Qalamabad",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "story", "mission", "values", "whyus", "stats"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countersStarted) {
            setCountersStarted(true);
            stats.forEach((stat, index) => {
              let start = 0;
              const end = stat.value;
              const duration = 2000;
              const increment = end / (duration / 16);
              
              const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                  setCountedValues(prev => {
                    const newValues = [...prev];
                    newValues[index] = end;
                    return newValues;
                  });
                  clearInterval(timer);
                } else {
                  setCountedValues(prev => {
                    const newValues = [...prev];
                    newValues[index] = Math.floor(start);
                    return newValues;
                  });
                }
              }, 16);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [stats, countersStarted]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const whyChooseUs = [
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Fast & Free Delivery",
      description: "Free shipping on orders above ₹999 with 2-3 days delivery across Kashmir",
      color: "from-blue-500 to-cyan-500",
      stat: "2-3 Days",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "100% Authentic Products",
      description: "Every product is genuine with manufacturer warranty and quality guarantee",
      color: "from-green-500 to-emerald-500",
      stat: "100% Genuine",
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "24/7 Customer Support",
      description: "Our team is always ready to help you with any questions or concerns",
      color: "from-purple-500 to-pink-500",
      stat: "24/7 Available",
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: "7-Day Easy Returns",
      description: "Hassle-free return policy on all products within 7 days",
      color: "from-orange-500 to-red-500",
      stat: "7 Days",
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Secure Payments",
      description: "Multiple payment options with secure encrypted transactions",
      color: "from-teal-500 to-cyan-500",
      stat: "100% Secure",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Expert Advice",
      description: "Get personalized recommendations from our sports specialists",
      color: "from-rose-500 to-pink-500",
      stat: "Expert Team",
    },
  ];

  const values = [
    { icon: <Diamond className="w-8 h-8" />, title: "Quality First", description: "We never compromise on quality. Every product meets rigorous standards.", color: "from-blue-500 to-cyan-500" },
    { icon: <Handshake className="w-8 h-8" />, title: "Customer Trust", description: "Building lasting relationships through transparency and reliability.", color: "from-green-500 to-emerald-500" },
    { icon: <Heart className="w-8 h-8" />, title: "Community Focus", description: "Supporting local sports communities across Kashmir.", color: "from-rose-500 to-pink-500" },
    { icon: <Leaf className="w-8 h-8" />, title: "Sustainability", description: "Minimizing environmental impact through responsible practices.", color: "from-emerald-500 to-teal-500" },
    { icon: <Rocket className="w-8 h-8" />, title: "Innovation", description: "Continuously improving products and customer experience.", color: "from-purple-500 to-indigo-500" },
    { icon: <Zap className="w-8 h-8" />, title: "Passion", description: "Our love for sports drives everything we do.", color: "from-orange-500 to-red-500" },
  ];

  const milestones = [
    { year: "2020", title: "Founded", description: "Started as a small local store", icon: <Coffee className="w-6 h-6" /> },
    { year: "2021", title: "First Milestone", description: "Reached 1,000 customers", icon: <Smile className="w-6 h-6" /> },
    { year: "2022", title: "Expansion", description: "Launched online store", icon: <Globe className="w-6 h-6" /> },
    { year: "2023", title: "Growth", description: "Added 50+ brands", icon: <Crown className="w-6 h-6" /> },
    { year: "2024", title: "Community", description: "15,000+ happy customers", icon: <Heart className="w-6 h-6" /> },
  ];

  const navItems = [
    { id: "story", label: "Story", icon: <BookOpen className="w-4 h-4" /> },
    { id: "mission", label: "Mission", icon: <Target className="w-4 h-4" /> },
    { id: "values", label: "Values", icon: <Heart className="w-4 h-4" /> },
    { id: "whyus", label: "Why Us", icon: <ThumbsUp className="w-4 h-4" /> },
    { id: "stats", label: "Impact", icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-red-50"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        
        <div className="absolute top-1/4 left-[10%] w-4 h-4 bg-orange-500 rounded-full animate-float"></div>
        <div className="absolute top-2/3 right-[15%] w-6 h-6 bg-red-500 rounded-full animate-float delay-1000"></div>
        <div className="absolute bottom-1/4 left-[20%] w-3 h-3 bg-yellow-500 rounded-full animate-float delay-2000"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-4 py-2 mb-6 shadow-lg animate-fade-in-up">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Welcome to Sportify Kashmir</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up animation-delay-200">
              We're on a mission to{" "}
              <span className="bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 bg-clip-text text-transparent">
                transform sports
              </span>
              <br />in Kashmir
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-400">
              Bringing world-class sports equipment and a community of passionate athletes together. 
              Quality, authenticity, and speed - that's our promise to you.
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-600">
              <Link href="/products" className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105">
                Explore Products
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:border-orange-500 hover:text-orange-500 transition-all duration-300">
                Get in Touch
              </Link>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 mt-16 animate-fade-in-up animation-delay-800">
              <div className="flex items-center gap-2 text-gray-500">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm">100% Authentic</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Truck className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-sm">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <RefreshCw className="w-5 h-5 text-purple-500" />
                <span className="text-sm">7-Day Returns</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-gray-400 rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Sticky Navigation */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-1 md:gap-2 py-3 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeSection === item.id
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                    : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <section id="story" className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-100 rounded-full blur-2xl"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800"
                  alt="Our Story"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <Quote className="w-10 h-10 text-white mb-3 opacity-80" />
                  <p className="text-white font-semibold text-xl">"Sports is not just business, it's our passion"</p>
                  <p className="text-white/80 text-sm mt-1">- War Muzamil, Founder</p>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 rounded-full px-4 py-1.5 mb-6">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Our Journey</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                From a Dream to
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> Kashmir's Premier</span>
                Sports Store
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="leading-relaxed">
                  Founded in 2020, Sportify Kashmir began as a small local store in Handwara, Qalamabad. 
                  We recognized the growing need for quality sports equipment in our beautiful region 
                  and set out to bridge that gap.
                </p>
                <p className="leading-relaxed">
                  What started as a passion project has grown into Kashmir's premier destination 
                  for sports enthusiasts. We've expanded our online presence and built a community 
                  of over 15,000 satisfied customers who trust us for their sporting needs.
                </p>
                <p className="leading-relaxed">
                  Our journey has been about more than just selling products. It's about fostering 
                  a culture of health, fitness, and community spirit across Kashmir.
                </p>
              </div>
              
              <div className="mt-8">
                <h3 className="font-semibold text-gray-900 mb-4">Our Journey Timeline</h3>
                <div className="flex flex-wrap gap-4">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="flex-1 min-w-[100px] text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-2 text-orange-600">
                        {m.icon}
                      </div>
                      <div className="text-sm font-bold text-orange-600">{m.year}</div>
                      <div className="text-xs font-medium text-gray-900">{m.title}</div>
                      <div className="text-xs text-gray-500 mt-1 hidden md:block">{m.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-1.5 mb-4">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">Our Direction</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Mission & Vision</h2>
            <p className="text-xl text-gray-600">Guiding our journey forward</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-5 transition duration-500"></div>
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Target className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide Kashmir with the highest quality sports equipment and apparel,
                making professional-grade gear accessible to athletes at every level. We strive
                to support local sports communities and promote active, healthy lifestyles
                throughout our region.
              </p>
              <div className="mt-6 flex items-center gap-2 text-green-600">
                <span className="text-sm font-medium">Read more</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition duration-500"></div>
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Eye className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become Kashmir's leading sports destination, recognized for our commitment
                to quality, customer service, and community development. We envision a future
                where every Kashmiri has access to the tools they need to pursue their athletic
                passions.
              </p>
              <div className="mt-6 flex items-center gap-2 text-purple-600">
                <span className="text-sm font-medium">Read more</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="values" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 rounded-full px-4 py-1.5 mb-4">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Our Principles</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What We Stand For</h2>
            <p className="text-xl text-gray-600">The values that drive everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition duration-300`}>
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="whyus" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 rounded-full px-4 py-1.5 mb-4">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-medium">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Makes Us
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> Different</span>
            </h2>
            <p className="text-xl text-gray-600">Experience the Sportify Kashmir advantage</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-5 text-white group-hover:scale-110 transition duration-300 shadow-lg`}>
                  {item.icon}
                </div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                  <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">{item.stat}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-orange-500 text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    <span>Guaranteed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 text-center">
            <div className="flex flex-wrap justify-center gap-8 items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-700 font-medium">100% Money Back Guarantee</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-700 font-medium">Free Replacement on Damages</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-700 font-medium">7-Day Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" ref={statsRef} className="py-24 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Impact in Numbers</h2>
            <p className="text-xl text-orange-100">Creating a sporting revolution across Kashmir</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition duration-300 shadow-lg`}>
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold">
                  {countedValues[index]}{stat.suffix}
                </div>
                <p className="text-sm text-orange-100 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 rounded-full px-4 py-1.5 mb-4">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Real stories from our satisfied community</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white rounded-2xl shadow-xl p-8 md:p-10">
              <Quote className="absolute top-6 right-6 w-12 h-12 text-orange-100" />
              <div className="flex items-center gap-4 mb-6">
                {testimonials[currentTestimonial].image ? (
                  <img src={testimonials[currentTestimonial].image} alt="" className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{testimonials[currentTestimonial].name}</h4>
                  <p className="text-sm text-gray-500">{testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].location}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed italic">
                "{testimonials[currentTestimonial].content}"
              </p>
              
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentTestimonial(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentTestimonial === idx ? "w-6 bg-orange-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Elevate Your Game?</h2>
            <p className="text-xl text-gray-300 mb-10">
              Join thousands of satisfied customers who trust Sportify Kashmir for their sports equipment needs. 
              Experience the difference quality makes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/products" className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105">
                Shop Now
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300">
                Contact Us
              </Link>
            </div>
            <p className="text-sm text-gray-400 mt-8">
              🔒 Secure checkout • 🚚 Free shipping on orders ₹999+ • 💯 Authentic products • 🔄 7-Day Returns
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(15px); opacity: 0; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-scroll { animation: scroll 1.5s ease-in-out infinite; }
        .delay-1000 { animation-delay: 1s; }
        .delay-1500 { animation-delay: 1.5s; }
        .delay-2000 { animation-delay: 2s; }
      `}</style>
    </div>
  );
}

const BookOpen = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);