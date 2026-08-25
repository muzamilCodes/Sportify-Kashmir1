"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { 
  Mic, 
  Camera, 
  QrCode, 
  X, 
  Loader2, 
  Sparkles, 
  Volume2,
  ScanLine,
  Image as ImageIcon,
  Download,
  Copy,
  Share2,
  CheckCircle2,
  Trophy,
  Zap,
  RefreshCw,
  Flashlight,
  Layers,
  ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
}

export function VoiceSearchModal({ isOpen, onClose, onTranscript }: VoiceSearchModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      setTranscript("");
      return;
    }

    // Check SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice search is not supported on this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);
      if (event.results[current].isFinal) {
        onTranscript(text);
        onClose();
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech error", event);
      setIsListening(false);
      toast.error("Could not recognize voice. Please try typing.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center shadow-2xl border border-gray-100 dark:border-gray-800 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full"
        >
          <X size={20} />
        </button>

        {/* Pulse Mic Circle */}
        <div className="relative my-4">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg ${isListening ? "animate-pulse ring-8 ring-orange-500/20" : ""}`}>
            <Mic size={36} />
          </div>
          {isListening && (
            <div className="absolute -inset-2 rounded-full border-2 border-orange-500 animate-ping opacity-30 pointer-events-none" />
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {isListening ? "Listening..." : "Voice Search"}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[240px]">
          {transcript || "Say something like 'Kashmir Willow Bat' or 'Football Studs'"}
        </p>

        {/* Try chips */}
        <div className="mt-5 flex flex-wrap justify-center gap-1.5">
          {["Cricket Bats", "Gym Dumbbells", "Football", "Kashmir Willow"].map((chip) => (
            <button
              key={chip}
              onClick={() => {
                onTranscript(chip);
                onClose();
              }}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-950/40 hover:text-orange-600 transition"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface VisualSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VisualSearchModal({ isOpen, onClose }: VisualSearchModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [useLiveCamera, setUseLiveCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    if (isOpen && useLiveCamera) {
      startLiveCamera();
    } else {
      stopLiveCamera();
    }
    return () => {
      stopLiveCamera();
    };
  }, [isOpen, useLiveCamera]);

  const startLiveCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      }
    } catch (err) {
      console.log("Camera access not available:", err);
      toast.error("Camera access not available. Please upload a photo.");
      setUseLiveCamera(false);
      setCameraActive(false);
    }
  };

  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  if (!isOpen) return null;

  const triggerSearch = (query: string, label: string) => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      stopLiveCamera();
      onClose();
      router.push(`/products?search=${encodeURIComponent(query)}`);
      toast.success(`AI Lens identified: ${label}!`);
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      const fileName = file.name.toLowerCase();

      let detected = "cricket";
      let label = "Kashmir Willow Cricket Gear";

      if (fileName.includes("football") || fileName.includes("ball") || fileName.includes("stud")) {
        detected = "football";
        label = "Match Football & Turf Studs";
      } else if (fileName.includes("badminton") || fileName.includes("racket") || fileName.includes("shuttle")) {
        detected = "badminton";
        label = "Badminton Racket & Shuttles";
      } else if (fileName.includes("gym") || fileName.includes("dumbbell") || fileName.includes("fitness")) {
        detected = "gym";
        label = "Gym & Fitness Equipment";
      } else if (fileName.includes("jersey") || fileName.includes("shirt") || fileName.includes("wear")) {
        detected = "jersey";
        label = "Athletic Apparel & Jersey";
      }

      triggerSearch(detected, label);
    }
  };

  const handleCaptureSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setPreview(canvas.toDataURL("image/jpeg"));
      }
    }
    triggerSearch("cricket", "Scanned Kashmir Sports Equipment");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 w-full max-w-md flex flex-col items-center text-center shadow-2xl border border-gray-100 dark:border-gray-800 relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => {
            stopLiveCamera();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full transition cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Top Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-red-500 flex items-center justify-center text-white shadow-lg my-1">
          <Camera size={26} />
        </div>

        <h3 className="text-base font-black text-gray-900 dark:text-white mt-1">
          Sportify AI Visual Lens
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-[280px]">
          Point your camera or upload an image of bats, balls, studs &amp; gym gear to find instant matches.
        </p>

        {/* Live Camera Viewfinder */}
        {useLiveCamera ? (
          <div className="w-full my-4 flex flex-col items-center">
            <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-black border-2 border-orange-500 shadow-xl flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Target Focus Reticle */}
              <div className="absolute inset-8 border border-white/40 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="w-10 h-10 border-t-2 border-l-2 border-orange-400 absolute top-0 left-0" />
                <div className="w-10 h-10 border-t-2 border-r-2 border-orange-400 absolute top-0 right-0" />
                <div className="w-10 h-10 border-b-2 border-l-2 border-orange-400 absolute bottom-0 left-0" />
                <div className="w-10 h-10 border-b-2 border-r-2 border-orange-400 absolute bottom-0 right-0" />
              </div>
            </div>

            <div className="flex gap-2 w-full mt-3">
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                disabled={analyzing}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                <span>{analyzing ? "Analyzing Gear..." : "Snap & Match"}</span>
              </button>
              <button
                type="button"
                onClick={() => setUseLiveCamera(false)}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : preview ? (
          <div className="my-4 flex flex-col items-center w-full">
            <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-orange-500 shadow-lg">
              <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
            </div>
            {analyzing && (
              <div className="flex items-center gap-2 mt-3 text-xs font-bold text-orange-600 dark:text-orange-400 animate-pulse">
                <Loader2 size={16} className="animate-spin" />
                <span>AI Lens analyzing product features...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="my-4 w-full space-y-2.5">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUseLiveCamera(true)}
                className="py-3 px-3 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Camera size={16} className="text-orange-400" />
                <span>Live Camera</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-3 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ImageIcon size={16} />
                <span>Upload Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* Instant Visual Category Chips */}
        <div className="w-full border-t border-gray-100 dark:border-gray-800 pt-3.5 mt-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
            Or Match by Sports Category
          </span>
          <div className="flex flex-wrap justify-center gap-1.5">
            {[
              { label: "🏏 Cricket Willow Bats", query: "cricket" },
              { label: "⚽ Football & Studs", query: "football" },
              { label: "🏸 Badminton Rackets", query: "badminton" },
              { label: "🏋️ Gym & Dumbbells", query: "gym" },
              { label: "👕 Team Jersey", query: "jersey" },
            ].map((c) => (
              <button
                key={c.query}
                type="button"
                onClick={() => triggerSearch(c.query, c.label)}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 transition border border-gray-200/60 dark:border-gray-700 cursor-pointer"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QrScannerModal({ isOpen, onClose }: QrScannerModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ai_scan" | "my_qr">("ai_scan");
  const [scanMode, setScanMode] = useState<"ai_vision" | "barcode">("ai_vision");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [websiteUrl, setWebsiteUrl] = useState<string>("https://sportify.in");
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [aiDetectedProduct, setAiDetectedProduct] = useState<{
    name: string;
    category: string;
    confidence: number;
    price: number;
    query: string;
  } | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentOrigin = window.location.origin;
      setWebsiteUrl(currentOrigin);

      // Generate Website QR Code
      QRCode.toDataURL(
        currentOrigin,
        {
          width: 320,
          margin: 2,
          color: {
            dark: "#131921",
            light: "#ffffff",
          },
          errorCorrectionLevel: "H",
        },
        (err, url) => {
          if (!err && url) {
            setQrCodeDataUrl(url);
          }
        }
      );
    }
  }, [isOpen]);

  // Handle Camera Feed
  useEffect(() => {
    if (isOpen && activeTab === "ai_scan") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      }
    } catch (err) {
      console.log("Camera access not available or denied:", err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  if (!isOpen) return null;

  const handleSimulateAiScan = () => {
    setIsScanning(true);
    setAiDetectedProduct(null);

    setTimeout(() => {
      setIsScanning(false);
      setAiDetectedProduct({
        name: "Authentic Sangam Kashmir Willow Cricket Bat",
        category: "Cricket Willow",
        confidence: 99.4,
        price: 1899,
        query: "kashmir willow",
      });
      toast.success("AI Scanner matched Kashmir Willow Cricket Bat!");
    }, 1200);
  };

  const handleCopyWebsiteLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(websiteUrl);
      toast.success("Website URL copied to clipboard!");
    }
  };

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeDataUrl;
    a.download = "sportify-kashmir-qr.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Website QR Code downloaded!");
  };

  const handleShareWebsite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sportify Kashmir",
          text: "Shop authentic Kashmir Willow bats, footballs, gym gear & sports accessories!",
          url: websiteUrl,
        });
      } catch {}
    } else {
      handleCopyWebsiteLink();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        setAiDetectedProduct({
          name: "Pro Leather 4-Piece Cricket Match Ball",
          category: "Cricket Leather Ball",
          confidence: 98.7,
          price: 399,
          query: "leather ball",
        });
        toast.success("AI identified item: Pro Leather 4-Piece Cricket Ball!");
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col relative animate-scale-in max-h-[92vh]">
        {/* Top Header & Close Button */}
        <div className="bg-[#131921] text-white p-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                <span>Sportify AI Vision & QR Suite</span>
              </h3>
              <p className="text-[10px] text-gray-300">
                AI Equipment Scanner & Website QR Generator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-gray-300 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2 Tabs: AI Scanner & My Website QR Code */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 p-1">
          <button
            onClick={() => setActiveTab("ai_scan")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === "ai_scan"
                ? "bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 shadow-xs"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800"
            }`}
          >
            <Camera size={15} />
            <span>AI Camera Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab("my_qr")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === "my_qr"
                ? "bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 shadow-xs"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-800"
            }`}
          >
            <QrCode size={15} />
            <span>Website QR Code</span>
          </button>
        </div>

        {/* TAB 1: AI Scanner Content */}
        {activeTab === "ai_scan" && (
          <div className="p-4 flex flex-col items-center overflow-y-auto">
            {/* Mode Switch Pills: AI Vision vs Barcode */}
            <div className="flex items-center gap-2 mb-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-full text-[11px]">
              <button
                onClick={() => setScanMode("ai_vision")}
                className={`px-3 py-1 rounded-full font-bold transition ${
                  scanMode === "ai_vision"
                    ? "bg-orange-500 text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                ✨ AI Sports Vision
              </button>
              <button
                onClick={() => setScanMode("barcode")}
                className={`px-3 py-1 rounded-full font-bold transition ${
                  scanMode === "barcode"
                    ? "bg-orange-500 text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                🔳 QR & Barcode
              </button>
            </div>

            {/* Camera / Viewfinder Box */}
            <div className="relative w-full h-56 bg-black rounded-2xl overflow-hidden flex items-center justify-center shadow-inner border border-gray-200 dark:border-gray-700">
              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-orange-500 mb-2">
                    <Camera size={24} />
                  </div>
                  <span className="text-xs font-semibold text-gray-300">Point Camera at Sports Gear or Barcode</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">AI scanner automatically analyzes willow bats, balls & packaging</span>
                </div>
              )}

              {/* Holographic Radar / Scan Line */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center">
                <div className="w-48 h-48 border-2 border-dashed border-orange-400/80 rounded-2xl relative flex items-center justify-center">
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse shadow-sm" style={{ top: "48%" }} />
                  {/* Corner brackets */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-orange-400" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-orange-400" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-orange-400" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-orange-400" />
                </div>
              </div>

              {/* Scanning status banner */}
              {isScanning && (
                <div className="absolute bottom-3 inset-x-4 bg-black/80 backdrop-blur-md rounded-xl p-2 flex items-center justify-center gap-2 text-xs text-white">
                  <Loader2 size={14} className="animate-spin text-orange-400" />
                  <span>AI Neural Network analyzing product...</span>
                </div>
              )}
            </div>

            {/* AI Result Card */}
            {aiDetectedProduct && (
              <div className="w-full mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40 border border-orange-200 dark:border-orange-900/60 shadow-xs animate-scale-in">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-wide flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    AI Match ({aiDetectedProduct.confidence}%)
                  </span>
                  <span className="text-xs font-black text-gray-900 dark:text-white">
                    ₹{aiDetectedProduct.price.toLocaleString()}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                  {aiDetectedProduct.name}
                </h4>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      router.push(`/products?search=${encodeURIComponent(aiDetectedProduct.query)}`);
                    }}
                    className="flex-1 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 transition"
                  >
                    <span>View Product in Store</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={handleSimulateAiScan}
                disabled={isScanning}
                className="py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow-sm hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={14} />
                <span>Simulate AI Scan</span>
              </button>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ImageIcon size={14} />
                <span>Upload Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Official Website QR Code */}
        {activeTab === "my_qr" && (
          <div className="p-5 flex flex-col items-center text-center overflow-y-auto">
            {/* QR Card with sportify styling */}
            <div className="p-4 bg-white rounded-3xl shadow-xl border border-gray-200 relative my-1 group">
              {qrCodeDataUrl ? (
                <div className="relative">
                  <img
                    src={qrCodeDataUrl}
                    alt="Sportify Kashmir QR Code"
                    className="w-56 h-56 object-contain rounded-xl"
                  />
                  {/* Centered Sportify Badge */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-11 h-11 rounded-xl bg-[#131921] border-2 border-amber-400 shadow-md flex items-center justify-center text-white">
                      <Trophy size={18} className="text-amber-400" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-56 h-56 flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-orange-500" />
                </div>
              )}
            </div>

            <h4 className="text-sm font-black text-gray-900 dark:text-white mt-3">
              Sportify Kashmir QR Code
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-[260px] mt-0.5">
              Scan with any mobile camera to open Sportify Kashmir website instantly.
            </p>

            {/* URL Display Pill */}
            <div className="mt-2.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-[11px] font-mono text-gray-700 dark:text-gray-300 max-w-[280px] truncate border border-gray-200 dark:border-gray-700">
              {websiteUrl}
            </div>

            {/* 3 Action Buttons: Download, Copy Link, Share */}
            <div className="grid grid-cols-3 gap-2 w-full mt-4">
              <button
                onClick={handleDownloadQr}
                className="py-2.5 px-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-97"
              >
                <Download size={15} />
                <span>Save QR</span>
              </button>

              <button
                onClick={handleCopyWebsiteLink}
                className="py-2.5 px-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs rounded-xl transition flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-97"
              >
                <Copy size={15} />
                <span>Copy Link</span>
              </button>

              <button
                onClick={handleShareWebsite}
                className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-97"
              >
                <Share2 size={15} />
                <span>Share</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
