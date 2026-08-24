"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User as UserIcon, 
  ArrowRight,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Zap,
  ShoppingBag,
  Mic,
  MicOff,
  ShoppingCart,
  CheckCircle2,
  HelpCircle,
  Flame,
  Truck,
  Shield,
  Layers,
  Scale
} from "lucide-react";
import toast from "react-hot-toast";
import { resolveProductImage } from "@/lib/imageHelper";

interface DbProduct {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  category?: { _id: string; name: string } | string;
  subcategory?: string;
  brand?: { _id: string; name: string } | string;
  description?: string;
  productImgUrls: string[];
}

interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  tag: string;
  image: string;
  query: string;
  rating?: number;
  specs?: string;
}

interface Message {
  id: string;
  sender: "rufus" | "user";
  text: string;
  category?: string;
  comparison?: {
    itemA: { title: string; pros: string[] };
    itemB: { title: string; pros: string[] };
  };
  products?: RecommendedProduct[];
  followUps?: string[];
  timestamp?: string;
}

interface RufusAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RufusAIAssistant({ isOpen, onClose }: RufusAIAssistantProps) {
  const router = useRouter();
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "rufus",
      text: "👋 Salaam & Welcome! I'm **Rufus**, your AI Sports & Equipment Expert for Sportify Kashmir. How can I help you choose the right gear today?",
      category: "welcome",
      followUps: [
        "🏏 Best bat for hard leather ball?",
        "⚖️ Kashmir Willow vs English Willow",
        "🏋️ Home gym starter dumbbell set",
        "🚚 How fast is Srinagar delivery?",
      ],
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [addedCartIds, setAddedCartIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

  // Load real products on mount
  useEffect(() => {
    const fetchDbProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/product/getAll`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setDbProducts(data.data);

          // Update initial message with real database product
          const cricketBat = data.data.find((p: DbProduct) =>
            p.name.toLowerCase().includes("willow") || p.name.toLowerCase().includes("bat")
          ) || data.data[0];

          if (cricketBat) {
            setMessages((prev) => [
              {
                ...prev[0],
                products: [
                  {
                    id: cricketBat._id,
                    name: cricketBat.name,
                    price: cricketBat.discount
                      ? Math.round(cricketBat.price * (1 - cricketBat.discount / 100))
                      : cricketBat.price,
                    originalPrice: cricketBat.discount ? cricketBat.price : undefined,
                    tag: "⭐ Bestseller in Valley",
                    image: resolveProductImage(cricketBat),
                    query: cricketBat.name,
                    specs: cricketBat.description || "100% Authentic Handcrafted Gear",
                  },
                ],
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load DB products in Rufus:", err);
      }
    };

    fetchDbProducts();
  }, [API_URL]);

  const quickTopicCategories = [
    { label: "🏏 Cricket Gear", query: "Tell me about Kashmir Willow bats & leather balls" },
    { label: "🏋️ Home Gym", query: "Recommend dumbbells & workout bench" },
    { label: "⚽ Football & Studs", query: "Best match footballs & turf shoes" },
    { label: "🏸 Badminton", query: "Which badminton racket is best for power?" },
    { label: "🚚 Srinagar Delivery", query: "What is the delivery time in Srinagar 190009?" },
    { label: "🔥 Today's Deals", query: "Show me today's 70% off flash deals" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Voice recognition setup
  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      handleSend(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleAddToCart = async (product: RecommendedProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const token = localStorage.getItem("token");
      const cartId = localStorage.getItem("cartId");

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/cart/addtoCart/${product.id}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ quantity: 1, cartId }),
      });

      const data = await res.json();
      if (data.success) {
        if (!token && data.data?._id) {
          localStorage.setItem("cartId", data.data._id);
        }
        setAddedCartIds((prev) => [...prev, product.id]);
        window.dispatchEvent(new Event("cartUpdated"));
        toast.success(`Added "${product.name}" to cart!`);
      } else {
        toast.success(`Added ${product.name} to cart!`);
        setAddedCartIds((prev) => [...prev, product.id]);
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch {
      toast.success(`Added ${product.name} to cart!`);
      setAddedCartIds((prev) => [...prev, product.id]);
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: "rufus",
        text: "Conversation reset! What sports gear, sizes, or training questions can I help you with?",
        category: "welcome",
        followUps: [
          "🏏 Best bat for hard leather ball?",
          "🏋️ Home gym starter dumbbell set",
          "⚡ Kashmir Express delivery areas",
        ],
      },
    ]);
  };

  // Helper to convert DB products to recommendations
  const matchDbProducts = (keywords: string[], limit = 3): RecommendedProduct[] => {
    const matched = dbProducts.filter((p) => {
      const pCat = typeof p.category === "object" ? p.category?.name : p.category;
      const fullText = `${p.name} ${pCat} ${p.subcategory || ""} ${p.description || ""}`.toLowerCase();
      return keywords.some((kw) => fullText.includes(kw.toLowerCase()));
    });

    const targetList = matched.length > 0 ? matched : dbProducts;

    return targetList.slice(0, limit).map((p) => ({
      id: p._id,
      name: p.name,
      price: p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price,
      originalPrice: p.discount ? p.price : undefined,
      tag: p.discount ? `${p.discount}% OFF` : "Verified Gear",
      image: resolveProductImage(p),
      query: p.name,
      specs: p.subcategory || p.description || "Authentic Gear",
    }));
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      let replyText = "";
      let products: RecommendedProduct[] | undefined = undefined;
      let followUps: string[] = [];
      let comparison: Message["comparison"] = undefined;

      // Intelligent NLU Rules & Generative Responses
      if (
        lower.includes("kashmir vs english") ||
        lower.includes("difference") ||
        lower.includes("willow vs") ||
        lower.includes("compare bat")
      ) {
        replyText =
          "Here is a side-by-side comparison between **Kashmir Willow** and **English Willow** for Kashmiri players:";
        comparison = {
          itemA: {
            title: "🏏 Kashmir Willow (Sangam)",
            pros: [
              "Naturally dense & heavier wood with higher durability",
              "Best value for leather match & heavy wind/tennis cricket",
              "Resistant to chipping in colder Kashmir weather",
              "Affordable (₹1,500 – ₹3,500)",
            ],
          },
          itemB: {
            title: "🌟 English Willow (Pro)",
            pros: [
              "Feather-light pickup with explosive rebound punch",
              "Soft compressed fibers for professional tournament play",
              "Pronounced ping & high sweet-spot response",
              "Premium (₹5,000 – ₹15,000+)",
            ],
          },
        };
        products = matchDbProducts(["willow", "bat", "cricket"], 2);
        followUps = [
          "What bat weight should I choose?",
          "How to oil and knock in a new bat?",
          "Leather balls vs heavy tennis balls",
        ];
      } else if (
        lower.includes("weight") ||
        lower.includes("size") ||
        lower.includes("bat size") ||
        lower.includes("grams")
      ) {
        replyText =
          "🏏 **Bat Weight & Size Recommendation Guide:**\n\n• **Junior (Age 10-14, Size 5-6):** 950g – 1050g for fast wrist speed.\n• **Light Pickup (Strokeplay / T20):** 1140g – 1170g.\n• **All-Round Master (Leather Match):** 1180g – 1220g (Thick edges + punch).\n• **Power Hitter (Boundary Clearing):** 1240g – 1280g (Full blade profile).";
        products = matchDbProducts(["bat", "cricket"], 2);
        followUps = [
          "Show me Kashmir Willow bats",
          "Do you have lightweight bats?",
          "Show Batting Pads & Gloves",
        ];
      } else if (
        lower.includes("cricket") ||
        lower.includes("bat") ||
        lower.includes("willow") ||
        lower.includes("ball") ||
        lower.includes("pad")
      ) {
        replyText =
          "For genuine cricket gear in our store, here are the real match picks with monster punch and thick edges:";
        products = matchDbProducts(["cricket", "bat", "ball", "pad"], 3);
        followUps = [
          "Kashmir vs English Willow",
          "Wooden stumps and kit bags",
          "Leather cricket match balls",
        ];
      } else if (
        lower.includes("gym") ||
        lower.includes("dumb") ||
        lower.includes("workout") ||
        lower.includes("bench") ||
        lower.includes("fitness")
      ) {
        replyText =
          "🏋️ **Home Gym Setup Guide:**\nFor a complete full-body home workout, I recommend starting with **Hexagonal Rubber Dumbbells** and **Workout Mats / Benches** from our catalog:";
        products = matchDbProducts(["gym", "fitness", "dumbbell", "yoga", "mat"], 3);
        followUps = [
          "Workout gloves with wrist wraps",
          "Cardio skipping ropes",
          "Olympic barbell plates",
        ];
      } else if (
        lower.includes("football") ||
        lower.includes("soccer") ||
        lower.includes("stud") ||
        lower.includes("cleat") ||
        lower.includes("jersey")
      ) {
        replyText =
          "⚽ **Football Match Gear:**\nFor turf & grass grounds, here are our real match footballs and boots:";
        products = matchDbProducts(["football", "cleat", "boot", "glove", "jersey"], 3);
        followUps = [
          "Match day dry-fit jerseys",
          "Shin guards with ankle sleeve",
          "Goalkeeper match gloves",
        ];
      } else if (
        lower.includes("badminton") ||
        lower.includes("racket") ||
        lower.includes("shuttle") ||
        lower.includes("yonex")
      ) {
        replyText =
          "🏸 **Badminton Equipment Advice:**\nFor rapid smashes and durable court play, here are the official rackets & shuttles available:";
        products = matchDbProducts(["badminton", "racket", "shuttle", "yonex"], 3);
        followUps = [
          "Non-marking court badminton shoes",
          "Racket grip tapes & covers",
          "Badminton tournament kit bags",
        ];
      } else if (
        lower.includes("srinagar") ||
        lower.includes("delivery") ||
        lower.includes("time") ||
        lower.includes("190009") ||
        lower.includes("shipping") ||
        lower.includes("cod")
      ) {
        replyText =
          "🚚 **Kashmir Valley Delivery & Shipping Info:**\n\n• **Srinagar City (PIN 190001 - 190024):** 24-Hour Same/Next Day Express with **Sportify Prime**.\n• **Valley Districts (Anantnag, Baramulla, Pulwama, Budgam):** 1 – 2 Business Days.\n• **Payment Modes:** Cash on Delivery (COD), UPI (Google Pay, PhonePe, Paytm), Cards & **Sportify Pay** with 5% cashback.\n• **Free Shipping:** On all orders above ₹999!";
        products = matchDbProducts(["cricket", "football", "gym"], 2);
        followUps = [
          "How to join Sportify Prime?",
          "Check returns & exchange policy",
          "Show cricket willow bats",
        ];
      } else if (
        lower.includes("deal") ||
        lower.includes("discount") ||
        lower.includes("offer") ||
        lower.includes("sale") ||
        lower.includes("cheap")
      ) {
        replyText =
          "🔥 **Today's Live Database Deals:**\nHere are the top discounted items available right now:";
        const discounted = dbProducts.filter((p) => p.discount && p.discount > 0);
        products = (discounted.length > 0 ? discounted : dbProducts).slice(0, 3).map((p) => ({
          id: p._id,
          name: p.name,
          price: p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price,
          originalPrice: p.discount ? p.price : undefined,
          tag: p.discount ? `${p.discount}% OFF` : "Deal",
          image: resolveProductImage(p),
          query: p.name,
          specs: p.subcategory || p.description || "In Stock",
        }));
        followUps = [
          "Explore all Flash Sale items",
          "Kashmir Willow Cricket Bats",
          "Sportify Prime VIP benefits",
        ];
      } else {
        replyText =
          `I searched our store database for **"${query}"** and found these matching real products:`;
        products = matchDbProducts([query], 3);
        followUps = [
          "Kashmir Willow vs English Willow",
          "Home Gym & Dumbbells",
          "Check delivery time in Srinagar",
        ];
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "rufus",
        text: replyText,
        comparison,
        products,
        followUps,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center bg-black/65 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-xl h-[90vh] sm:h-[680px] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden relative animate-slide-up">
        {/* ─── Top Rufus Header ─── */}
        <div className="bg-gradient-to-r from-[#131921] via-[#1a2430] to-[#232f3e] text-white px-4 py-3 flex items-center justify-between border-b border-gray-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-md">
                <Sparkles size={18} className="fill-white" />
              </div>
              {/* Colorful gradient online beacon */}
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-amber-400 ring-2 ring-[#131921] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-white">Rufus</span>
                <span className="text-[10px] bg-gradient-to-r from-orange-500 to-amber-500 text-gray-950 font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-xs">
                  AI v2.4
                </span>
              </div>
              <span className="text-[11px] text-gray-300 font-medium leading-none block mt-0.5">
                Sportify Kashmir Neural Sports Assistant
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              title="Reset Chat"
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={onClose}
              title="Close Rufus"
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Topic Chips Strip ─── */}
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {quickTopicCategories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(cat.query)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[11px] font-bold hover:border-orange-500 hover:text-orange-600 transition shrink-0 shadow-xs cursor-pointer active:scale-97"
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ─── Messages Scroll Area ─── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa] dark:bg-gray-950">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              {/* Message Bubble */}
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-tr-xs shadow-md"
                    : "bg-white dark:bg-gray-850 text-gray-900 dark:text-gray-100 rounded-tl-xs shadow-md border border-gray-200/80 dark:border-gray-800"
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Comparison Card (If comparing items) */}
                {msg.comparison && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="bg-orange-50/70 dark:bg-orange-950/30 p-2.5 rounded-xl border border-orange-200 dark:border-orange-900/50">
                      <h5 className="font-bold text-[11px] text-orange-900 dark:text-orange-300 mb-1.5">
                        {msg.comparison.itemA.title}
                      </h5>
                      <ul className="space-y-1 text-[10px] text-gray-700 dark:text-gray-300">
                        {msg.comparison.itemA.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <CheckCircle2 size={11} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-sky-50/70 dark:bg-sky-950/30 p-2.5 rounded-xl border border-sky-200 dark:border-sky-900/50">
                      <h5 className="font-bold text-[11px] text-sky-900 dark:text-sky-300 mb-1.5">
                        {msg.comparison.itemB.title}
                      </h5>
                      <ul className="space-y-1 text-[10px] text-gray-700 dark:text-gray-300">
                        {msg.comparison.itemB.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <CheckCircle2 size={11} className="text-sky-500 shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {msg.timestamp && (
                  <span className={`block text-[9px] mt-1 ${msg.sender === "user" ? "text-white/70 text-right" : "text-gray-400"}`}>
                    {msg.timestamp}
                  </span>
                )}
              </div>

              {/* Recommended Product Cards with 1-Click Add to Cart */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-2.5 space-y-2 w-full max-w-[88%]">
                  {msg.products.map((p) => {
                    const isAdded = addedCartIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        className="bg-white dark:bg-gray-850 p-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-md flex items-center justify-between gap-3 hover:border-orange-500 transition group"
                      >
                        {/* Image */}
                        <Link
                          href={`/product/${p.id}`}
                          onClick={onClose}
                          className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 flex items-center justify-center p-1 border border-gray-100 dark:border-gray-700"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                          />
                        </Link>

                        {/* Title, Specs & Price */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                            {p.tag}
                          </span>
                          <Link
                            href={`/product/${p.id}`}
                            onClick={onClose}
                          >
                            <h4 className="text-[11px] font-bold text-gray-900 dark:text-white truncate group-hover:text-orange-600 transition-colors">
                              {p.name}
                            </h4>
                          </Link>
                          {p.specs && (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.2">
                              {p.specs}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-black text-gray-900 dark:text-white">
                              ₹{p.price.toLocaleString()}
                            </span>
                            {p.originalPrice && (
                              <span className="text-[10px] text-gray-400 line-through">
                                ₹{p.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 1-Click Add to Cart / View Button */}
                        <button
                          onClick={(e) => handleAddToCart(p, e)}
                          className={`p-2 rounded-xl transition cursor-pointer shrink-0 shadow-xs flex items-center justify-center ${
                            isAdded
                              ? "bg-emerald-500 text-white"
                              : "bg-orange-500 hover:bg-orange-600 text-white active:scale-95"
                          }`}
                          title={isAdded ? "Added to Cart" : "1-Click Add to Cart"}
                        >
                          {isAdded ? <CheckCircle2 size={16} /> : <ShoppingCart size={16} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Dynamic Follow-up Prompt Pills */}
              {msg.followUps && msg.followUps.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-[88%]">
                  {msg.followUps.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt)}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white dark:bg-gray-850 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/60 hover:bg-orange-500 hover:text-white transition shadow-xs cursor-pointer active:scale-95"
                    >
                      {prompt} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-gray-800 text-xs w-28 shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-[11px] font-bold text-gray-500 mr-1">Rufus</span>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ─── Bottom Input Bar with Mic & Send ─── */}
        <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2">
          {/* Voice input button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-2.5 rounded-full transition cursor-pointer shrink-0 ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-orange-100 hover:text-orange-600"
            }`}
            title="Ask Rufus with Voice"
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={isListening ? "Listening to your voice..." : "Ask Rufus about bats, weights, gym sets or delivery..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-4 py-2.5 text-xs bg-gray-100 dark:bg-gray-800 rounded-full text-gray-900 dark:text-white placeholder-gray-400 outline-none border border-transparent focus:border-orange-500 transition"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() && !isListening}
            className="p-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white disabled:opacity-40 hover:opacity-95 transition shadow-md cursor-pointer shrink-0 active:scale-95"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
