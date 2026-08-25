"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  Minus,
  Plus,
  Facebook,
  Twitter,
  Linkedin,
  AlertCircle,
  Package,
  Tag,
  Zap,
  ThumbsUp,
  Award,
  Bell,
  MapPin,
  MessageCircle,
  Sparkles,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { resolveProductImage } from "@/lib/imageHelper";
import ProductImage from "@/components/ProductImage";

const ProductCard = dynamic(() => import("@/components/ProductCard"), {
  loading: () => <div className="h-80 rounded-xl bg-gray-100 animate-pulse" />,
});

const PrimeMembershipModal = dynamic(() => import("@/components/shared/PrimeMembershipModal"), {
  ssr: false,
});

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount?: number;
  productImgUrls: string[];
  colors: string[];
  sizes: string[];
  isAvailable: boolean;
  stock: number;
  category?: { _id: string; name: string } | string;
  brand?: { _id: string; name: string } | string;
  tags: string[];
  onSale?: boolean;
  createdAt: string;
}

interface RelatedProduct {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  productImgUrls: string[];
  stock: number;
  isAvailable: boolean;
}

interface Review { _id: string; rating: number; title?: string; comment: string; createdAt: string; user?: { username?: string } }

/* ─── Kashmir & J&K Instant Pincode Knowledge Map ─── */
interface PincodeData {
  location: string;
  areas?: string[];
  district?: string;
  speed: string;
  express: boolean;
}

const KASHMIR_PINCODES: Record<string, PincodeData> = {
  // ─── 1. SRINAGAR & CENTRAL VALLEY ───
  "190001": { location: "Lal Chowk / Residency Road / GPO, Srinagar", district: "Srinagar", areas: ["Lal Chowk", "Residency Road", "GPO Srinagar", "Badami Bagh", "Munshi Bagh", "Maisuma", "Polo View", "Amira Kadal"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190002": { location: "SR Gunj / Zaina Kadal / Maharaj Gunj / Downtown, Srinagar", district: "Srinagar", areas: ["SR Gunj", "Zaina Kadal", "Maharaj Gunj", "Downtown Srinagar", "Bohri Kadal", "Fateh Kadal", "Nowhatta"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190003": { location: "Batamaloo / Dalgate / Sonwar / Civil Lines, Srinagar", district: "Srinagar", areas: ["Batamaloo", "Dalgate", "Sonwar Bagh", "Civil Lines", "Boulevard Road", "TRC", "Nehru Park"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190004": { location: "Soura / SKIMS Medical Institute / Buchpora, Srinagar", district: "Srinagar", areas: ["Soura", "SKIMS Institute", "Buchpora", "Illahi Bagh", "Umerhair", "Anchar"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190005": { location: "Hazratbal Shrine / Kashmir University / Naseem Bagh, Srinagar", district: "Srinagar", areas: ["Hazratbal", "Kashmir University Campus", "Naseem Bagh", "Habak", "Saderbal", "Nigeen Lake"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190006": { location: "Nowshera / Hawal / Alamgari Bazar / Zadibal, Srinagar", district: "Srinagar", areas: ["Nowshera", "Hawal", "Alamgari Bazar", "Zadibal", "Gojwara", "Khanyar Road"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190007": { location: "Jawahar Nagar / Rajbagh / Mehjoor Nagar / Kursu, Srinagar", district: "Srinagar", areas: ["Jawahar Nagar", "Rajbagh", "Mehjoor Nagar", "Kursu Rajbagh", "Zero Bridge", "Padshahi Bagh"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190008": { location: "Natipora / Chanapora / Rambagh / Sanat Nagar, Srinagar", district: "Srinagar", areas: ["Natipora", "Chanapora", "Rambagh", "Sanat Nagar", "Methan", "Azad Bast"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190009": { location: "Hyderpora / Rawalpora / Peerbagh / Baghi Mehtab, Srinagar", district: "Srinagar", areas: ["Hyderpora Chowk", "Peerbagh", "Rawalpora", "Baghi Mehtab", "Gulberg Colony", "Airport Road"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190010": { location: "Bemina / Qamarwari / Jhelum Valley Medical College, Srinagar", district: "Srinagar", areas: ["Bemina Main", "Qamarwari Chowk", "JVC Medical College", "Firdousabad", "Hamdania Colony", "Parimpora Crossing"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190011": { location: "Chanapora Main / Housing Colony, Srinagar", district: "Srinagar", areas: ["Chanapora Main Town", "Housing Colony", "Lal Nagar", "Tengpora", "Budshah Nagar"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190012": { location: "Baghat / Barzulla / Bone & Joint Hospital, Srinagar", district: "Srinagar", areas: ["Baghat Kanipora", "Barzulla", "Bone & Joint Hospital", "Parraypora", "Sanat Nagar Byepass"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190013": { location: "Eidgah / Safa Kadal / Ali Jan Road, Srinagar", district: "Srinagar", areas: ["Eidgah", "Safa Kadal", "Ali Jan Road", "Sekidafar", "Wanganpora", "Noorbagh"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190014": { location: "Rawalpora / Rangreth Industrial & IT Park, Srinagar", district: "Srinagar", areas: ["Rawalpora", "Rangreth IT Park", "Wanbal", "Gogoo Land", "Old Airfield Road"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190015": { location: "Rangreth SIDCO Industrial Estate / Airforce Station, Srinagar", district: "Srinagar", areas: ["Rangreth SIDCO", "Airforce Station Area", "Industrial Complex", "Kralpora Crossing"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190017": { location: "Karan Nagar / SMHS Hospital / GMC, Srinagar", district: "Srinagar", areas: ["Karan Nagar", "SMHS Hospital Area", "GMC Srinagar", "Kak Saraf", "Balgarden", "Chotta Bazar"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190018": { location: "Rainawari / JLNM Hospital / Saida Kadal, Srinagar", district: "Srinagar", areas: ["Rainawari", "JLNM Hospital Area", "Saida Kadal", "Naidyar", "Miskeen Bagh", "Kathi Darwaza"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190019": { location: "Shalteng / Parimpora Fruit Mandi / Maloora, Srinagar", district: "Srinagar", areas: ["Shalteng", "Parimpora Fruit Mandi", "Maloora", "HMT Crossing", "Zainkote Industrial Area"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190020": { location: "Humhama / Srinagar International Airport / Old Airfield, Srinagar", district: "Srinagar", areas: ["Humhama", "Srinagar International Airport", "Old Airfield", "Gogoland", "Friends Colony"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190021": { location: "Nishat / Harwan / Shalimar Gardens / Brein / Dal Lake East, Srinagar", district: "Srinagar", areas: ["Nishat", "Harwan", "Shalimar Gardens", "Brein", "Dal Lake East", "Foreshore Road", "Dara"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190022": { location: "Zakura / Tailbal / Gulab Bagh / Alasteng, Srinagar", district: "Srinagar", areas: ["Zakura", "Tailbal", "Gulab Bagh", "Alasteng", "Batamaloo Crossing Zakura", "Wussan Route"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190023": { location: "Pantha Chowk / Lasjan / Nowgam Railway Station Hub, Srinagar", district: "Srinagar", areas: ["Pantha Chowk", "Lasjan", "Nowgam Railway Station", "Zewan Crossing", "Soiteng", "Padshahi Bagh Byepass"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190024": { location: "Lawaypora / Mujgund / Shalteng West, Srinagar", district: "Srinagar", areas: ["Lawaypora", "Mujgund", "Shalteng West", "Gund Hassi Bhat", "Narbal Border"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "190025": { location: "Zewan / Khanmoh Industrial Estate / Balhama, Srinagar", district: "Srinagar", areas: ["Zewan", "Khanmoh Industrial Estate", "Balhama", "Wuyan Crossing", "Sampora"], speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "191104": { location: "Pampore Post Office / Saffron Belt (Srinagar-Pulwama Corridor)", district: "Pulwama / Srinagar", areas: ["Pampore Post Office", "Kadlabal", "Frestabal", "Saffron Colony", "Drangbal"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "191105": { location: "Pampore / Khrew Industrial & Cement Belt, Srinagar/Pulwama", district: "Pulwama / Srinagar", areas: ["Pampore East", "Khrew Industrial Area", "Wuyan", "Shar Shali", "Nagander"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "191106": { location: "Tral Road Junction / Awantipora Sector, Srinagar/Pulwama", district: "Pulwama / Srinagar", areas: ["Tral Road Junction", "Dadsara Route", "Awantipora North", "Padgampora Crossing"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "191107": { location: "Awantipora Road Area / AIIMS & IUST Corridor, Srinagar/Pulwama", district: "Pulwama / Srinagar", areas: ["Awantipora Road", "AIIMS Kashmir Corridor", "IUST Campus Area", "Jawbrara"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },

  // ─── 2. GANDERBAL DISTRICT ───
  "191201": { location: "Ganderbal Main Town / Beehama / Duderhama / Qamaria Stadium, Ganderbal", district: "Ganderbal", areas: ["Ganderbal Main Town", "Beehama Chowk", "Duderhama", "Qamaria Stadium Ground", "Tawheed Chowk", "Salora", "Wussan"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "191202": { location: "Kangan Town / Sindh Valley / Sonamarg Route, Ganderbal", district: "Ganderbal", areas: ["Kangan Main Market", "Sindh Valley", "Sonamarg Route", "Wangath", "Preng", "Gund Kangan"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "191203": { location: "Lar / Manasbal Lake / Repora Apple Belt, Ganderbal", district: "Ganderbal", areas: ["Lar Main Town", "Manasbal Lake Belt", "Repora Apple & Grapes Belt", "Watlar", "Benhama"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "191204": { location: "Wakura / Dab / Batwina, Ganderbal", district: "Ganderbal", areas: ["Wakura Town", "Dab", "Batwina", "Chundina", "Kurhama"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "191205": { location: "Tullamulla / Mata Kheer Bhawani Shrine / Central Ganderbal", district: "Ganderbal", areas: ["Tullamulla Town", "Mata Kheer Bhawani Shrine Area", "Central Ganderbal", "Dangerpora Ganderbal"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },

  // ─── 3. BUDGAM DISTRICT ───
  "191111": { location: "Budgam Main Town / Ompora Housing Colony / Railway Station / Beerwah Road, Budgam", district: "Budgam", areas: ["Budgam Main Town", "Ompora Housing Colony", "Railway Station Budgam", "Beerwah Road", "Humhama Road", "Narkara"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "191112": { location: "Chadoora Main Town / Nagam / Wathora / Budgam Road Area, Budgam", district: "Budgam", areas: ["Chadoora Main Town", "Nagam", "Wathora", "Budgam Road", "Kralpora Budgam", "Zoolwah"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "191113": { location: "Charar-i-Sharief Sufi Shrine / Yousmarg Sports Meadow / Chadoora Road, Budgam", district: "Budgam", areas: ["Charar-i-Sharief Town", "Sufi Shrine Complex", "Yousmarg Sports Meadow Route", "Chadoora Road", "Pakherpora Crossing"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "191121": { location: "Khansahib Town / Doodhpathri Tourism Valley, Budgam", district: "Budgam", areas: ["Khansahib Town", "Doodhpathri Tourism Valley", "Raithan", "Kremshore", "Yarikha"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193401": { location: "Magam Main Town / Kanihama (Kani Shawl Hub) / Kunzer / Tangmarg Gateway, Budgam/Baramulla", district: "Budgam / Baramulla", areas: ["Magam Main Town", "Kanihama (Kani Shawl Hub)", "Kunzer", "Tangmarg Gateway", "Aripanthan", "Mazhama Railway Station"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193411": { location: "Beerwah Main Town / Chewdara / Chandanwari Rural Belt, Budgam/Baramulla", district: "Budgam / Baramulla", areas: ["Beerwah Main Town", "Chewdara", "Chandanwari Rural Belt", "Gondipora", "Utligam"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },

  // ─── 4. PULWAMA & SHOPIAN DISTRICTS (SOUTH BAT & APPLE BELT) ───
  "192121": { location: "Sangam (Cricket Bat Hub) / Pampore (Saffron Capital) / Kadlabal, Pulwama/Anantnag", district: "Pulwama / Anantnag", areas: ["Sangam Bat Market", "Pampore Saffron Town", "Kadlabal", "Frestabal", "Namlabal", "Halmulla Sangam"], speed: "24–48 Hours Valley Express Delivery (Direct Factory Hub & Free COD)", express: true },
  "192122": { location: "Awantipora / Islamic University (IUST) / AIIMS Kashmir / Bijbehara, Pulwama/Anantnag", district: "Pulwama / Anantnag", areas: ["Awantipora Main Town", "Islamic University (IUST) Campus", "AIIMS Kashmir", "Bijbehara Town", "Padgampora Industrial Area"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192123": { location: "Tral Main Town / Bus Stand / Dadsara / Lurgam, Pulwama", district: "Pulwama", areas: ["Tral Main Town", "General Bus Stand Tral", "Dadsara", "Lurgam", "Pinglish", "Aripal Tral"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192128": { location: "Sambora / Khrew Cement & Industrial Town, Pulwama", district: "Pulwama", areas: ["Sambora", "Khrew Cement Town", "Wuyan", "Shar Shali", "Ladhoo Industrial Complex"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192301": { location: "Pulwama Town / Murran Chowk / Washbugh / Tahab, Pulwama", district: "Pulwama", areas: ["Pulwama Main Town", "Murran Chowk", "Washbugh", "Tahab Road", "Chatapora", "Prichoo", "Pinglena"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192302": { location: "Hawal / Tral Sub-division / Pulwama West", district: "Pulwama", areas: ["Hawal Pulwama", "Tral Sub-division", "Rajpora Crossing", "Dadsara Route"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192303": { location: "Kakapora / Ratnipora / Railway Station & Shopian Border, Pulwama/Shopian", district: "Pulwama / Shopian", areas: ["Kakapora Town", "Kakapora Railway Station", "Ratnipora", "Marval", "Shopian Border Area"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192304": { location: "Rajpora Town / Lassipora SIDCO Industrial Complex & Shopian Rural, Pulwama/Shopian", district: "Pulwama / Shopian", areas: ["Rajpora Town", "Lassipora SIDCO Complex", "Hawal Pulwama", "Shopian Rural Belt", "Tujan", "Qasbayar"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192305": { location: "Achan / Litter / Hawal & Shopian Apple Belt, Pulwama/Shopian", district: "Pulwama / Shopian", areas: ["Achan", "Litter Belt", "Shopian Apple Belt", "Heff Shirmal", "Zainapora Route"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192306": { location: "Litter / Shadimarg & Shopian District Area, Pulwama/Shopian", district: "Pulwama / Shopian", areas: ["Litter Main Chowk", "Shadimarg", "Shopian District Area", "Aglar", "Naina"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192307": { location: "Shopian Main Town / Golu / Batapora / Hirpora Wildlife Sanctuary, Shopian", district: "Shopian", areas: ["Shopian Main Town", "Golu Chowk", "Batapora", "Hirpora Wildlife Sanctuary", "Bongam", "Memander"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192308": { location: "Shopian Rural Belt / Keller / Sedow / Peer Ki Gali Route, Shopian", district: "Shopian", areas: ["Shopian Rural Belt", "Keller", "Sedow", "Peer Ki Gali Route", "Zawoora Apple Belt", "Dobispora"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192309": { location: "Arihal / Tahab Road, Pulwama", district: "Pulwama", areas: ["Arihal", "Tahab Road", "Wasura", "Gudoora"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },

  // ─── 5. KULGAM DISTRICT ───
  "192231": { location: "Kulgam Main Town / Ashmuji / Chawalgam / Ahrabal Falls Route, Kulgam", district: "Kulgam", areas: ["Kulgam Main Town", "Ashmuji", "Chawalgam", "Ahrabal Falls Route", "Brazloo", "Bugam", "Lirrow"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192232": { location: "Qaimoh / Khudwani / Mirbazar Junction, Kulgam", district: "Kulgam", areas: ["Qaimoh Town", "Khudwani", "Mirbazar Junction", "Wanpoh Route", "Redwani"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192233": { location: "Devsar / Kund Valley / Razloo, Kulgam", district: "Kulgam", areas: ["Devsar Town", "Kund Valley", "Razloo", "Hablish", "Kilam", "Manzgam"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192234": { location: "Yaripora Town / Frisal / Kulgam Apple Belt, Kulgam", district: "Kulgam", areas: ["Yaripora Town", "Frisal", "Kulgam Apple Belt", "Munand", "Matibugh", "Kanjikulla"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },

  // ─── 6. ANANTNAG (ISLAMABAD) DISTRICT ───
  "192101": { location: "Anantnag Head Post Office / KP Road / Lal Chowk Islamabad, Anantnag", district: "Anantnag", areas: ["Anantnag Head Post Office", "KP Road", "Lal Chowk Islamabad", "Reshi Bazar", "Court Road", "Mattan Adda"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192102": { location: "Janglat Mandi / District Hospital / Nai Basti, Anantnag", district: "Anantnag", areas: ["Janglat Mandi", "District Hospital Area", "Nai Basti", "Ashajipora", "Donipawa", "Brakpora Road"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192124": { location: "Sethar / Halmulla (Cricket Bat Manufacturing Cluster) / Bijbehara, Anantnag", district: "Anantnag", areas: ["Sethar Cricket Bat Cluster", "Halmulla Bat Industry", "Bijbehara Town", "Padgampora", "Pujteng", "Charsoo Bat Belt"], speed: "24–48 Hours Valley Express Delivery (Direct Factory Hub & Free COD)", express: true },
  "192125": { location: "Martand / Mattan Sun Temple / Akura / Bumzoo, Anantnag", district: "Anantnag", areas: ["Martand / Mattan Town", "Sun Temple Belt", "Akura", "Bumzoo", "Ranipora"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192126": { location: "Pahalgam Tourist & Sports Valley / Lidder, Anantnag", district: "Anantnag", areas: ["Pahalgam Main Market", "Lidder River Valley", "Betaab Valley Route", "Aru Valley Road", "Laripora", "Bhavani Nagar"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192129": { location: "S.K. Gund / Sallar / Lidder Valley, Anantnag", district: "Anantnag", areas: ["S.K. Gund", "Sallar", "Lidder Valley Route", "Overa Wildlife Belt"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192201": { location: "Achabal Mughal Gardens / Dialgam / Ashajipora / Muniwar, Anantnag", district: "Anantnag", areas: ["Achabal Mughal Gardens", "Dialgam", "Ashajipora", "Muniwar", "Shangus Route"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192202": { location: "Kokernag Botanical Valley / Sarnal / Khanabal Junction / NH-44, Anantnag", district: "Anantnag", areas: ["Kokernag Botanical Garden", "Sarnal", "Khanabal Junction", "NH-44 Highway", "Batengoo"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192210": { location: "Dialgam / Shangus Tehsil / Muniwar, Anantnag", district: "Anantnag", areas: ["Dialgam", "Shangus Tehsil", "Muniwar", "Nowgam Shangus", "Chattergul"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192211": { location: "Dooru Shahabad / Brakpora / Chee / Anantnag South", district: "Anantnag", areas: ["Dooru Shahabad", "Brakpora", "Chee", "Anantnag South", "Larkipora Route"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192212": { location: "Verinag Spring Origin Hub / Vailoo / Bringi, Anantnag", district: "Anantnag", areas: ["Verinag Spring Origin", "Vailoo", "Bringi Valley", "Omoh", "Zadoora"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192215": { location: "Larkipora / Dooru Road Junction, Anantnag", district: "Anantnag", areas: ["Larkipora Town", "Dooru Road Junction", "Fatehpora", "Kamad"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192221": { location: "Qazigund (Gateway of Kashmir) / Lower Munda / Tunnel Road, Anantnag", district: "Anantnag", areas: ["Qazigund Town", "Lower Munda", "Tunnel Road", "Nawa", "Chursoo"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192241": { location: "Dooru Shahabad / Verinag Spring Origin Hub, Anantnag", district: "Anantnag", areas: ["Dooru Town", "Verinag Hub", "Hiller", "Batamaloo Dooru"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192244": { location: "Qazigund Lower Munda / NH-44 Hub, Anantnag", district: "Anantnag", areas: ["Lower Munda", "NH-44 Corridor", "Zig Post", "Malpora"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192245": { location: "Aishmuqam Sufi Shrine / Lidder Valley, Anantnag", district: "Anantnag", areas: ["Aishmuqam Sufi Shrine", "Lidder Valley Route", "Hapatnar", "Khelan"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192246": { location: "Seer Hamdan / Mattan Belt, Anantnag", district: "Anantnag", areas: ["Seer Hamdan", "Mattan Belt", "Hutmarah", "Kanganhall"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192401": { location: "Srigufwara / Dachnipora / Apple Valley, Anantnag", district: "Anantnag", areas: ["Srigufwara", "Dachnipora", "Apple Valley", "Khiram", "Sirhama"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },

  // ─── 7. BANDIPORA DISTRICT ───
  "193501": { location: "Sonawari / Safapora / Sumbal / Wular Lake Belt, Bandipora/Ganderbal/Baramulla", district: "Bandipora / Ganderbal / Baramulla", areas: ["Sonawari", "Safapora", "Sumbal", "Shadipora", "Manasbal Lake Belt", "Ajas"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193502": { location: "Bandipora Main Town / Gulshan Chowk / Kaloosa / Nishat Park, Bandipora", district: "Bandipora", areas: ["Bandipora Main Town", "Gulshan Chowk", "Kaloosa", "Nishat Park", "Plan Bandipora", "Gamroo", "Nadihal"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193503": { location: "Sumbal Town / Shadipora / Wular Delta, Bandipora", district: "Bandipora", areas: ["Sumbal Town", "Shadipora", "Wular Delta", "Nesbal", "Nowgam Sumbal"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193504": { location: "Safapora / Manasbal North / Bandipora", district: "Bandipora", areas: ["Safapora Town", "Manasbal North", "Kondabal", "Chewa"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193505": { location: "Hajin Town / Naidkhai / Vijpara, Bandipora", district: "Bandipora", areas: ["Hajin Town", "Naidkhai", "Vijpara", "Shahgund", "Banyari"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },

  // ─── 8. KUPWARA DISTRICT ───
  "193221": { location: "Handwara Main Town / Chogal / Main Market, Kupwara", district: "Kupwara", areas: ["Handwara Main Town", "Chogal", "Main Market Handwara", "Kulangam", "Wadipora Handwara", "Magam Handwara", "Braripora"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193222": { location: "Kupwara Main Town / Rigipora / Bus Stand / Zangli, Kupwara", district: "Kupwara", areas: ["Kupwara Main Town", "Rigipora", "General Bus Stand Kupwara", "Zangli Army Garrison", "Batergam", "Galgossa", "Bumhama"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193223": { location: "Sogam / Lolab Valley / Chandigam / Kalaroos, Kupwara", district: "Kupwara", areas: ["Sogam Lolab", "Lolab Valley", "Chandigam", "Kalaroos Caves Belt", "Khurhama", "Warnow", "Dever"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193224": { location: "Trehgam Town / Meelyal / Kupwara North, Kupwara", district: "Kupwara", areas: ["Trehgam Town", "Meelyal", "Guzriyal", "Kupwara North Belt", "Gulgam", "Hiri"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193225": { location: "Kralpora Town / Chowkibal / Keran Route, Kupwara", district: "Kupwara", areas: ["Kralpora Town", "Chowkibal", "Keran Border Route", "Pheelpora", "Guzrial"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193226": { location: "Lolab Valley / Lalpora / Khurhama, Kupwara", district: "Kupwara", areas: ["Lalpora Lolab", "Lolab Valley Central", "Khurhama", "Kanthpora", "Kalaroos"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193227": { location: "Tangdhar / Karnah Valley / Teetwal Border, Kupwara", district: "Kupwara", areas: ["Tangdhar Town", "Karnah Valley", "Teetwal Border", "Chamkot", "Kandi Karnah"], speed: "2–3 Days Priority Express Delivery", express: true },
  "193228": { location: "Vilgam / Ramhal / Tarathpora, Kupwara", district: "Kupwara", areas: ["Vilgam Town", "Ramhal", "Tarathpora", "Champora", "Dolipora"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193302": { location: "Langate / Rohama Border Belt, Kupwara/Baramulla", district: "Kupwara / Baramulla", areas: ["Langate Main Town", "Rohama", "Ladoora", "Wadipora", "Hadipora", "Kalamabad Route", "Upper Rafiabad", "Chakla"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193305": { location: "Langate / Qalamabad / Mawar Valley, Handwara, Kupwara", district: "Kupwara", areas: ["Langate", "Qalamabad", "Mawar Valley", "Sanzippora", "Nowgam Handwara"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193306": { location: "Chogal / Drugmulla / Nutnussa, Kupwara", district: "Kupwara", areas: ["Chogal", "Drugmulla", "Nutnussa", "Kandi Kupwara", "Waterkhani"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },

  // ─── 9. BARAMULLA DISTRICT ───
  "193101": { location: "Baramulla Main Town / Tehsil Road / Cariappa Park, Baramulla", district: "Baramulla", areas: ["Baramulla Main Town", "Tehsil Road", "Cariappa Park", "Old Town Baramulla", "Kanthbagh", "Noorbagh", "Ushkara"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193103": { location: "Khawaja Bagh / Kanispora / Delina, Baramulla", district: "Baramulla", areas: ["Khawaja Bagh", "Kanispora", "Delina", "Singhpora Crossing", "Juhama"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193121": { location: "Pattan Main Town / Hygam Wetland / Palhalan, Baramulla", district: "Baramulla", areas: ["Pattan Main Town", "Hygam Wetland", "Palhalan", "Nihalpora", "Mirgund", "Tapper"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193122": { location: "Seelu / Dangerpora / Sopore North, Baramulla", district: "Baramulla", areas: ["Seelu", "Dangerpora", "Sopore North", "Botingoo", "Watlab Wular"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193123": { location: "Pattan Rural / Nihalpora / Mirgund, Baramulla", district: "Baramulla", areas: ["Pattan Rural", "Nihalpora", "Mirgund", "Wanigam", "Goshbugh"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193201": { location: "Sopore Main Town / Iqbal Market / Fruit Mandi / Degree College, Baramulla", district: "Baramulla", areas: ["Sopore Main Town", "Iqbal Market", "Fruit Mandi Sopore", "Degree College Road", "Main Chowk Sopore", "Arampora", "Bagh-i-Islam"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193202": { location: "Kanispora / Delina / Singhpora, Baramulla", district: "Baramulla", areas: ["Kanispora", "Delina", "Singhpora Pattan", "Sheri", "Gohan"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193301": { location: "Rohama / Watergam / Rafiabad / Hadipora, Baramulla", district: "Baramulla", areas: ["Rohama", "Watergam", "Rafiabad Apple Belt", "Hadipora", "Achabal Rafiabad", "Chatloora"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193303": { location: "Dangiwacha / Rafiabad Apple Belt, Baramulla", district: "Baramulla", areas: ["Dangiwacha", "Rafiabad Apple Belt", "Bahrampora", "Zandfaran", "Pajpora"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193402": { location: "Tangmarg / Gulmarg International Winter Sports Hub / Ski Resort, Baramulla", district: "Baramulla", areas: ["Tangmarg Main Chowk", "Gulmarg Resort & Gondola Base", "Kunzer", "Ferozpora", "Drung Waterfall", "Baba Reshi"], speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "193403": { location: "Uri Border Town / Lagama / Trade Center, Baramulla", district: "Baramulla", areas: ["Uri Main Town", "Lagama", "Trade Center", "Salamabad", "Boniyar Route"], speed: "2–3 Days Valley Express Delivery", express: true },
  "193404": { location: "Boniyar / Limber Wildlife Sanctuary, Baramulla", district: "Baramulla", areas: ["Boniyar", "Limber Wildlife Sanctuary", "Nowshera Uri", "Trikanjan"], speed: "2–3 Days Valley Express Delivery", express: true },
};

/* ─── Kashmir Postal Circle & J&K District Knowledge Base ─── */
const JK_POSTAL_REGIONS: Record<string, { district: string; speed: string; express: boolean }> = {
  // Kashmir Valley (190xxx - 193xxx)
  "190": { district: "Srinagar & Central Valley", speed: "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD)", express: true },
  "191": { district: "Ganderbal & Budgam Districts", speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "192": { district: "Anantnag, Pulwama, Kulgam & Shopian (South Kashmir Bat Belt)", speed: "24–48 Hours Valley Express Delivery (Direct Factory Hub & Free COD)", express: true },
  "193": { district: "Baramulla, Sopore, Kupwara & Bandipora (North Kashmir)", speed: "24–48 Hours Valley Express Delivery (Free Shipping & COD)", express: true },
  "194": { district: "Leh & Kargil (Ladakh Division)", speed: "3–4 Days Priority Express Delivery", express: true },

  // Jammu Division (180xxx - 185xxx)
  "180": { district: "Jammu City & Tawi Region", speed: "2–3 Days Priority Express Delivery", express: true },
  "181": { district: "Samba & Reasi / Katra", speed: "2–3 Days Priority Express Delivery", express: true },
  "182": { district: "Udhampur, Ramban, Doda & Kishtwar", speed: "2–3 Days Priority Express Delivery", express: true },
  "184": { district: "Kathua & Outer Jammu Belt", speed: "2–3 Days Priority Express Delivery", express: true },
  "185": { district: "Rajouri & Poonch Districts", speed: "2–3 Days Priority Express Delivery", express: true },
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState({ average: 0, count: 0 });
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [reviewing, setReviewing] = useState(false);
  const [pincode, setPincode] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<{
    pincode: string;
    location: string;
    district?: string;
    areas: string[];
    speed: string;
    express: boolean;
    valid: boolean;
  } | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [sizeGuideTab, setSizeGuideTab] = useState<"bats" | "shoes" | "apparel">("bats");
  const [showPrimeModal, setShowPrimeModal] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifying, setNotifying] = useState(false);
  const relatedSectionRef = useRef<HTMLDivElement>(null);
  const relatedRequestedRef = useRef(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      const recent = JSON.parse(localStorage.getItem("recentlyViewed") || "[]") as string[];
      localStorage.setItem("recentlyViewed", JSON.stringify([productId, ...recent.filter((id) => id !== productId)].slice(0, 10)));
    }
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
    const savedPin = localStorage.getItem("deliveryPincode");
    const savedArea = localStorage.getItem("selectedDeliveryArea");
    if (savedPin) {
      setPincode(savedPin);
      if (savedArea) setSelectedArea(savedArea);
    }
  }, [productId]);

  useEffect(() => {
    if (productId && activeTab === "reviews") fetchReviews();
  }, [activeTab, productId]);

  useEffect(() => {
    const section = relatedSectionRef.current;
    if (!section || relatedRequestedRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || relatedRequestedRef.current) return;
      relatedRequestedRef.current = true;
      fetchRelatedProducts();
      observer.disconnect();
    }, { rootMargin: "500px 0px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const result = await (await fetch(`${API_URL}/reviews/${productId}`)).json();
      if (result.success) { setReviews(result.data || []); setReviewSummary(result.summary || { average: 0, count: 0 }); }
    } catch (error) { console.error("Error fetching reviews:", error); }
  };

  const checkDeliveryPin = async (pinValue?: string) => {
    const pin = (pinValue || pincode).trim();
    if (!/^\d{6}$/.test(pin)) {
      setDeliveryResult({
        pincode: pin,
        location: "Invalid Pincode",
        areas: [],
        speed: "Please enter a valid 6-digit Indian postal code (e.g. 190001, 192121, 193302)",
        express: false,
        valid: false,
      });
      setSelectedArea("");
      return;
    }

    setPincodeLoading(true);

    // 1. Fast local Kashmir & J&K instant match
    if (KASHMIR_PINCODES[pin]) {
      const info = KASHMIR_PINCODES[pin];
      const parsedAreas = info.areas && info.areas.length > 0
        ? info.areas
        : info.location
            .split("/")
            .map((s) => s.replace(/\(.*?\)/g, "").replace(/,.*$/, "").trim())
            .filter((s) => s.length > 1);

      const defaultArea = parsedAreas[0] || info.location;
      setSelectedArea(defaultArea);
      localStorage.setItem("selectedDeliveryArea", defaultArea);
      localStorage.setItem("deliveryPincode", pin);

      setDeliveryResult({
        pincode: pin,
        location: `${info.location} (${pin})`,
        district: info.district,
        areas: parsedAreas,
        speed: info.speed,
        express: info.express,
        valid: true,
      });
      setPincodeLoading(false);
      return;
    }

    try {
      // 2. Fetch live exact post offices from India Post API
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();

      if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const postOffices = data[0].PostOffice;
        const mainPO = postOffices[0];
        const areasList = Array.from(new Set(postOffices.map((p: any) => p.Name).filter(Boolean))) as string[];
        
        const defaultArea = areasList[0] || mainPO.Name;
        setSelectedArea(defaultArea);
        localStorage.setItem("selectedDeliveryArea", defaultArea);
        localStorage.setItem("deliveryPincode", pin);

        const officeNames = postOffices
          .slice(0, 2)
          .map((p: any) => p.Name)
          .join(" / ");

        const locationName = `${officeNames}, ${mainPO.District} (${pin})`;
        const isJK =
          mainPO.State?.toLowerCase().includes("jammu") ||
          mainPO.State?.toLowerCase().includes("kashmir") ||
          pin.startsWith("19") ||
          pin.startsWith("18");

        const isValley = pin.startsWith("19");
        const speed = isValley
          ? "Delivery Tomorrow by 4 PM • 24h Valley Express (Free Shipping & COD Available)"
          : isJK
          ? "24–48 Hours J&K Priority Express Delivery (Free Shipping & COD Available)"
          : "2–4 Days Priority Air Express Delivery (Free Shipping on ₹999+)";

        setDeliveryResult({
          pincode: pin,
          location: locationName,
          district: `${mainPO.District}, ${mainPO.State}`,
          areas: areasList,
          speed,
          express: isJK,
          valid: true,
        });
      } else {
        // Fallback using official postal region prefixes
        const prefix3 = pin.slice(0, 3);
        const regionInfo = JK_POSTAL_REGIONS[prefix3];
        const isJK = pin.startsWith("19") || pin.startsWith("18");
        const fallbackDistrict = regionInfo ? regionInfo.district : isJK ? "Jammu & Kashmir" : "Pan-India";

        setSelectedArea(fallbackDistrict);
        setDeliveryResult({
          pincode: pin,
          location: regionInfo ? `${regionInfo.district} (${pin})` : isJK ? `Jammu & Kashmir Delivery Circle (${pin})` : `Pan-India Delivery Hub (${pin})`,
          district: fallbackDistrict,
          areas: [fallbackDistrict],
          speed: regionInfo ? regionInfo.speed : isJK ? "24–48 Hours Valley Express Delivery" : "3–5 Days Priority Delivery",
          express: isJK,
          valid: true,
        });
      }
    } catch {
      const prefix3 = pin.slice(0, 3);
      const regionInfo = JK_POSTAL_REGIONS[prefix3];
      const isJK = pin.startsWith("19") || pin.startsWith("18");
      const fallbackDistrict = regionInfo ? regionInfo.district : isJK ? "Jammu & Kashmir" : "Pan-India";

      setSelectedArea(fallbackDistrict);
      setDeliveryResult({
        pincode: pin,
        location: regionInfo ? `${regionInfo.district} (${pin})` : isJK ? `J&K Priority Delivery (${pin})` : `Pan-India Delivery (${pin})`,
        district: fallbackDistrict,
        areas: [fallbackDistrict],
        speed: regionInfo ? regionInfo.speed : isJK ? "24–48 Hours Express Delivery" : "3–5 Days Delivery",
        express: isJK,
        valid: true,
      });
    } finally {
      setPincodeLoading(false);
    }
  };

  const isCricketProduct = Boolean(
    product && (
      product.name?.toLowerCase().includes("bat") ||
      product.name?.toLowerCase().includes("cricket") ||
      product.name?.toLowerCase().includes("willow") ||
      (typeof product.category === "object" && product.category?.name?.toLowerCase().includes("cricket")) ||
      (typeof product.category === "string" && product.category.toLowerCase().includes("cricket"))
    )
  );

  const handleWhatsAppOrder = () => {
    if (!product) return;
    const finalPrice = product.discount && product.discount > 0 
      ? product.price - (product.price * product.discount) / 100 
      : product.price;

    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const sizeText = selectedSize ? `, Size: ${selectedSize}` : "";
    const colorText = selectedColor ? `, Color: ${selectedColor}` : "";
    const knockingNote = isCricketProduct ? " (Include Free Machine Knocking & Oiling)" : "";
    const locationText = selectedArea
      ? `\n📍 Delivery Location: ${selectedArea}${deliveryResult?.district ? `, ${deliveryResult.district}` : ""} (${deliveryResult?.pincode || pincode})`
      : deliveryResult?.location
      ? `\n📍 Delivery Location: ${deliveryResult.location}`
      : "";

    const message = `Assalamu Alaikum Sportify Kashmir! I want to order this product:\n\n*${product.name}*\nPrice: ₹${finalPrice.toLocaleString()} (Qty: ${quantity}${sizeText}${colorText})${locationText}${knockingNote}\n\nLink: ${currentUrl}\n\nPlease confirm availability & delivery details!`;

    const whatsappUrl = `https://wa.me/919682645127?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const submitReview = async () => {
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Please login to write a review"); router.push("/login"); return; }
    if (!reviewForm.comment.trim()) { toast.error("Please write a review"); return; }
    setReviewing(true);
    try {
      const response = await fetch(`${API_URL}/reviews/${productId}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(reviewForm) });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      toast.success("Review saved"); setReviewForm({ rating: 5, title: "", comment: "" }); await fetchReviews();
    } catch (error: any) { toast.error(error.message || "Unable to save review"); } finally { setReviewing(false); }
  };

  const subscribeBackInStock = async () => {
    if (!notifyEmail) { toast.error("Enter your email address"); return; }
    setNotifying(true);
    try {
      const response = await fetch(`${API_URL}/stock-notifications/${productId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: notifyEmail }) });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      toast.success(result.message); setNotifyEmail("");
    } catch (error: any) { toast.error(error.message || "Unable to subscribe"); } finally { setNotifying(false); }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const getImageUrl = (url: string) => {
    if (!url) return "/placeholder.svg";
    if (url.startsWith("http")) return url;
    return `${API_URL}/uploads/${url}`;
  };

  const getCategoryName = (category: Product['category']): string => {
    if (!category) return '';
    if (typeof category === 'object' && category !== null) {
      return category.name || '';
    }
    if (typeof category === 'string') return category;
    return '';
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/product/get/${productId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (result.success && result.data) {
        const productData = {
          ...result.data,
          stock: result.data.stock || 10,
        };
        setProduct(productData);
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/product/getAll?limit=8&available=true&inStock=true&includeTotal=false`, {
        cache: "force-cache",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const products = Array.isArray(result.data) ? result.data : result.data?.items || [];
      if (result.success && products.length) {
        // Get products from same category, excluding current product
        const related = products
          .filter((p: any) => p._id !== productId && p.isAvailable && !p.isArchived)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const cartId = localStorage.getItem("cartId");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const body: any = {
        quantity,
        color: selectedColor,
        size: selectedSize,
      };
      if (!token && cartId) body.cartId = cartId;

      const response = await fetch(`${apiUrl}/cart/addtoCart/${product?._id}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (result.success) {
        if (!token && result.data && result.data._id) {
          localStorage.setItem("cartId", result.data._id);
        }
        toast.success("Added to cart!");
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        router.push("/login");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

      const response = await fetch(`${apiUrl}/cart/addtoCart/${product?._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity,
          color: selectedColor,
          size: selectedSize,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Proceeding to checkout...");
        router.push("/checkout");
      } else {
        toast.error(result.message || "Failed to proceed to checkout");
      }
    } catch (error) {
      console.error("Buy now error:", error);
      toast.error("Failed to process");
    }
  };

  const toggleWishlist = () => {
    if (!product) return;
    let newWishlist: string[];
    if (wishlist.includes(product._id)) {
      newWishlist = wishlist.filter((id) => id !== product._id);
      toast.success("Removed from wishlist");
    } else {
      newWishlist = [...wishlist, product._id];
      toast.success("Added to wishlist");
    }
    setWishlist(newWishlist);
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out ${product?.name} on Sportify Kashmir!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const calculateDiscountedPrice = () => {
    if (!product) return 0;
    if (product.discount && product.discount > 0) {
      return product.price - (product.price * product.discount) / 100;
    }
    return product.price;
  };

  const discountPrice = calculateDiscountedPrice();
  const hasDiscount = product?.discount && product.discount > 0;
  const saving = product ? product.price - discountPrice : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link href="/products" className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-orange-500">Products</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Product Main Section */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-square mb-4">
                <ProductImage
                  product={product.productImgUrls?.[selectedImage] || product}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                />
                {hasDiscount && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                    {product.discount}% OFF
                  </div>
                )}
                {product.onSale && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse z-10">
                    SALE
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.productImgUrls && product.productImgUrls.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.productImgUrls.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index
                          ? "border-orange-500 shadow-md"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <ProductImage
                        product={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Category/Brand Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                {product.category && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {typeof product.category === 'object' ? product.category.name : product.category}
                  </span>
                )}
                {product.brand && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {typeof product.brand === 'object' ? product.brand.name : product.brand}
                  </span>
                )}
                {product.stock > 0 ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> In Stock
                  </span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <Star className="w-5 h-5 text-gray-300" />
                </div>
                <span className="text-sm text-gray-500">({reviewSummary.average || "New"} · {reviewSummary.count} reviews)</span>
                <button onClick={() => setActiveTab("reviews")} className="text-sm text-blue-600 hover:text-blue-700">Write a review</button>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-bold text-orange-600">
                    ₹{discountPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ₹{product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-green-600 font-medium">
                        Save ₹{saving.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
                {hasDiscount && (
                  <p className="text-sm text-green-600 mt-1">
                    You save {product.discount}% on this purchase
                  </p>
                )}
              </div>

              {/* Sportify Prime VIP Benefits Strip */}
              <div className="mb-6 p-3 rounded-2xl bg-gradient-to-r from-[#002f36]/10 via-[#005f73]/10 to-[#0a9396]/10 dark:from-[#002f36]/40 dark:via-[#005f73]/40 dark:to-[#0a9396]/30 border border-[#00a8e1]/40 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex items-center bg-[#002f36] text-white px-2 py-0.5 rounded-md text-[11px] font-black tracking-tight shrink-0 shadow-xs">
                    <span>sportify</span>
                    <span className="text-[#00a8e1] ml-0.5">prime</span>
                  </div>
                  <div className="text-xs text-gray-800 dark:text-gray-200 min-w-0">
                    <span className="font-bold text-gray-900 dark:text-white">FREE 24h Valley Delivery</span>
                    <span className="text-gray-600 dark:text-gray-400"> &amp; earn <strong>₹{Math.round(discountPrice * 0.05)} Wallet Cashback</strong></span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPrimeModal(true)}
                  className="text-xs font-bold text-[#00a8e1] hover:text-[#0081ab] dark:text-cyan-400 whitespace-nowrap underline cursor-pointer shrink-0"
                >
                  Kashmir VIP Perks ›
                </button>
              </div>
              {/* Stock Info */}
              {product.stock < 10 && product.stock > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-yellow-700">
                    Only {product.stock} items left in stock! Order soon.
                  </span>
                </div>
              )}
              {product.stock === 0 && (
                <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-orange-700"><Bell className="h-4 w-4" /> Get notified when back in stock</div>
                  <div className="mt-2 flex gap-2"><input value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} type="email" placeholder="your@email.com" className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" /><button onClick={subscribeBackInStock} disabled={notifying} className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Notify me</button></div>
                </div>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border rounded-lg text-sm capitalize transition ${selectedColor === color
                          ? "border-orange-500 bg-orange-50 text-orange-600"
                          : "border-gray-300 hover:border-gray-400"
                          }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <span>Available Sizes</span>
                      {selectedSize && (
                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-900/50">
                          {selectedSize}
                        </span>
                      )}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(true)}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Size Guide</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[48px] h-10 px-3.5 py-1.5 border rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center shrink-0 cursor-pointer whitespace-nowrap ${
                          selectedSize === size
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 shadow-sm ring-2 ring-orange-500/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.stock} items available
                  </span>
                </div>
              </div>

              {/* Cricket Bat Special Value Add-ons (Free Knocking & Oiling) */}
              {isCricketProduct && (
                <div className="mb-6 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-400 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Free Kashmir Master Craftsman Services Included:</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                      <span><strong>Free 15,000+ Machine Knocking</strong> & Linseed Oiling (Match Ready)</span>
                      <span className="ml-auto font-bold text-emerald-600 text-[11px]">FREE (₹0)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                      <span><strong>Free Premium Chevron Rubber Grip</strong> Pre-Applied</span>
                      <span className="ml-auto font-bold text-emerald-600 text-[11px]">FREE (₹0)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                      <span><strong>Free Extratec Edge & Toe Guard Sheet</strong> Protection</span>
                      <span className="ml-auto font-bold text-emerald-600 text-[11px]">FREE (₹0)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.isAvailable || product.stock === 0}
                    className="flex-1 bg-gray-900 dark:bg-gray-800 text-white py-3.5 rounded-xl font-bold hover:bg-orange-600 dark:hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!product.isAvailable || product.stock === 0}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3.5 rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Zap className="w-5 h-5" />
                    Buy Now
                  </button>
                  <button
                    onClick={toggleWishlist}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                    title="Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${wishlist.includes(product._id) ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
                  </button>
                  <button
                    onClick={shareProduct}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* 📲 1-Click WhatsApp Direct Order Button */}
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition hover:scale-101 active:scale-99 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span>⚡ 1-Click Order on WhatsApp (Direct Inquiry & COD)</span>
                </button>
              </div>

              {/* Delivery Info */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <MapPin className="w-5 h-5 text-orange-600 shrink-0" />
                  <span className="font-semibold">Check Kashmir / Pan-India Delivery:</span>
                  <div className="flex items-center gap-2">
                    <input
                      value={pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setPincode(val);
                        if (val.length === 6) {
                          checkDeliveryPin(val);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") checkDeliveryPin();
                      }}
                      placeholder="Enter Pincode (e.g. 190001)"
                      className="w-48 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => checkDeliveryPin()}
                      disabled={pincodeLoading}
                      className="rounded-lg bg-gray-900 dark:bg-gray-700 hover:bg-orange-600 px-3.5 py-1.5 text-xs font-bold text-white transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {pincodeLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{pincodeLoading ? "Checking..." : "Check"}</span>
                    </button>
                  </div>
                </div>
                {deliveryResult && (
                  <div
                    className={`p-4 rounded-2xl border transition-all duration-200 ${
                      deliveryResult.valid
                        ? "bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border-orange-500/30 shadow-xs"
                        : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl shrink-0">{deliveryResult.express ? "⚡" : "📦"}</span>
                      <div className="text-xs flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 justify-between">
                          <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                            <span>
                              {selectedArea ? `${selectedArea}` : deliveryResult.location}
                              {deliveryResult.district && selectedArea ? ` (${deliveryResult.district} - ${deliveryResult.pincode})` : ""}
                            </span>
                            {deliveryResult.valid && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Serviceable
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 📍 Select Specific Area Dropdown & Interactive Pills */}
                        {deliveryResult.areas && deliveryResult.areas.length > 0 && (
                          <div className="mt-2.5 pt-2.5 border-t border-orange-500/20">
                            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                              <span>Select your specific area / locality:</span>
                            </label>
                            
                            <select
                              value={selectedArea}
                              onChange={(e) => {
                                setSelectedArea(e.target.value);
                                localStorage.setItem("selectedDeliveryArea", e.target.value);
                                localStorage.setItem("deliveryPincode", deliveryResult.pincode);
                              }}
                              className="w-full bg-white dark:bg-gray-800 border border-orange-300 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 cursor-pointer"
                            >
                              {deliveryResult.areas.map((area) => (
                                <option key={area} value={area}>
                                  📍 {area}
                                </option>
                              ))}
                            </select>

                            {deliveryResult.areas.length > 1 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {deliveryResult.areas.slice(0, 8).map((area) => (
                                  <button
                                    key={area}
                                    type="button"
                                    onClick={() => {
                                      setSelectedArea(area);
                                      localStorage.setItem("selectedDeliveryArea", area);
                                      localStorage.setItem("deliveryPincode", deliveryResult.pincode);
                                    }}
                                    className={`px-2 py-1 rounded-md text-[10px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                                      selectedArea === area
                                        ? "bg-orange-500 text-white shadow-xs"
                                        : "bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                                    }`}
                                  >
                                    {selectedArea === area && <Check className="w-3 h-3 text-white" />}
                                    <span>{area}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-gray-700 dark:text-gray-300 mt-2 font-medium flex items-center gap-1.5">
                          <span className="font-semibold text-orange-600 dark:text-orange-400">Delivery:</span>
                          <span>{deliveryResult.speed}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Truck className="w-5 h-5 text-green-600 shrink-0" />
                  <span>Free Express Delivery on orders above ₹999 across Kashmir Valley</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>100% Genuine Handcrafted Guarantee with 7-Day Easy Exchange</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <RotateCcw className="w-5 h-5 text-purple-600 shrink-0" />
                  <span>Cash on Delivery (COD) & Doorstep UPI available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xs border border-gray-200 dark:border-gray-700 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-6 px-6">
              <button
                onClick={() => setActiveTab("description")}
                className={`py-3.5 text-[14px] sm:text-[15px] font-semibold transition ${
                  activeTab === "description"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("details")}
                className={`py-3.5 text-[14px] sm:text-[15px] font-semibold transition ${
                  activeTab === "details"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-3.5 text-[14px] sm:text-[15px] font-semibold transition ${
                  activeTab === "reviews"
                    ? "text-orange-600 border-b-2 border-orange-600"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Reviews ({reviewSummary.count})
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "description" && (
              <div className="prose max-w-none text-[14px] sm:text-[15px]">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {product.description || "No description available for this product."}
                </p>
              </div>
            )}

            {activeTab === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px] sm:text-[14px]">
                <div className="space-y-3">
                  <div className="flex py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="w-32 text-gray-500 dark:text-gray-400">Product Name</span>
                    <span className="text-gray-900 dark:text-white font-medium">{product.name}</span>
                  </div>
                  <div className="flex py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="w-32 text-gray-500 dark:text-gray-400">Price</span>
                    <span className="text-gray-900 dark:text-white font-medium">₹{product.price}</span>
                  </div>
                  {hasDiscount && (
                    <div className="flex py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="w-32 text-gray-500 dark:text-gray-400">Discount</span>
                      <span className="text-green-600 font-semibold">{product.discount}% OFF</span>
                    </div>
                  )}
                  <div className="flex py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="w-32 text-gray-500 dark:text-gray-400">Stock Status</span>
                    <span className={product.stock > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {product.stock > 0 ? `${product.stock} items` : "Out of Stock"}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="w-32 text-gray-500 dark:text-gray-400">Category</span>
                    <span className="text-gray-900 dark:text-white font-medium">{typeof product.category === 'object' ? product.category.name : product.category}</span>
                  </div>
                  {product.brand && (
                    <div className="flex py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="w-32 text-gray-500 dark:text-gray-400">Brand</span>
                      <span className="text-gray-900 dark:text-white font-medium">{typeof product.brand === 'object' ? product.brand.name : product.brand}</span>
                    </div>
                  )}
                  <div className="flex py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="w-32 text-gray-500 dark:text-gray-400">Colors</span>
                    <span className="text-gray-900 dark:text-white font-medium">{product.colors?.join(", ") || "N/A"}</span>
                  </div>
                  <div className="flex py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="w-32 text-gray-500 dark:text-gray-400">Sizes</span>
                    <span className="text-gray-900 dark:text-white font-medium">{product.sizes?.join(", ") || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                  <div className="rounded-xl bg-orange-50 p-4 text-center"><div className="text-3xl font-bold text-orange-600">{reviewSummary.average || "—"}</div><div className="mt-1 text-amber-500">★★★★★</div><div className="text-xs text-gray-500">{reviewSummary.count} verified reviews</div></div>
                  <div className="rounded-xl border p-4"><h3 className="mb-3 font-semibold">Write a review</h3><div className="mb-2 flex gap-1">{[1, 2, 3, 4, 5].map((star) => <button key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })} aria-label={`${star} stars`}><Star className={`h-5 w-5 ${star <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} /></button>)}</div><input value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} placeholder="Review title (optional)" className="mb-2 w-full rounded border px-3 py-2 text-sm" /><textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Share your experience" rows={3} className="mb-2 w-full rounded border px-3 py-2 text-sm" /><button onClick={submitReview} disabled={reviewing} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{reviewing ? "Saving…" : "Submit review"}</button></div>
                </div>
                {reviews.length === 0 ? <div className="py-6 text-center text-sm text-gray-500">No reviews yet. Be the first to review this product.</div> : reviews.map((review) => <article key={review._id} className="border-b pb-4"><div className="flex items-center gap-2"><span className="font-semibold">{review.user?.username || "Customer"}</span><span className="text-amber-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span></div>{review.title && <h4 className="mt-1 font-medium">{review.title}</h4>}<p className="mt-1 text-sm text-gray-600">{review.comment}</p><time className="mt-2 block text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("en-IN")}</time></article>)}
              </div>
            )}
          </div>
        </div>

        <div ref={relatedSectionRef} aria-hidden="true" className="h-px" />
        {/* Related Products: Section Heading 24–28px */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-[22px] sm:text-[25px] md:text-[28px] font-bold text-gray-900 dark:text-white">You May Also Like</h2>
              <Link href="/products" className="text-orange-600 hover:text-orange-700 dark:text-orange-400 text-[13px] sm:text-[14px] font-semibold flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4.5">
              {relatedProducts.map((relatedProduct) => {
                const relatedDiscountedPrice = relatedProduct.discount
                  ? relatedProduct.price - (relatedProduct.price * relatedProduct.discount) / 100
                  : relatedProduct.price;
                const hasRelatedDiscount = !!(relatedProduct.discount && relatedProduct.discount > 0);

                return (
                  <ProductCard
                    key={relatedProduct._id}
                    product={relatedProduct as any}
                    discountedPrice={relatedDiscountedPrice}
                    hasDiscount={hasRelatedDiscount}
                    wishlist={wishlist}
                  />
                );
              })}
            </div>
          </div>
        )}
        {/* Size Guide Modal */}
        {showSizeGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full transition cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 dark:text-white">Official Size Guide</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sportify Kashmir Standard Sizing Chart</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSizeGuideTab("bats")}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                    sizeGuideTab === "bats"
                      ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-xs"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  🏏 Cricket Bats
                </button>
                <button
                  type="button"
                  onClick={() => setSizeGuideTab("shoes")}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                    sizeGuideTab === "shoes"
                      ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-xs"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  👟 Shoes / Studs
                </button>
                <button
                  type="button"
                  onClick={() => setSizeGuideTab("apparel")}
                  className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                    sizeGuideTab === "apparel"
                      ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-xs"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  👕 Apparel / Kits
                </button>
              </div>

              {/* Tab 1: Bats */}
              {sizeGuideTab === "bats" && (
                <div className="space-y-3 text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-[11px]">
                        <th className="py-2">Bat Size</th>
                        <th className="py-2">Player Height</th>
                        <th className="py-2">Age Group</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
                      <tr className="bg-orange-50/50 dark:bg-orange-950/20 font-bold">
                        <td className="py-2 text-orange-600 dark:text-orange-400">Full Size (SH)</td>
                        <td className="py-2">5ft 8in – 6ft 2in</td>
                        <td className="py-2">15+ Yrs / Adults</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold">Long Handle (LH)</td>
                        <td className="py-2">6ft 2in+</td>
                        <td className="py-2">Adults (Tall)</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold">Harrow</td>
                        <td className="py-2">5ft 4in – 5ft 8in</td>
                        <td className="py-2">13 – 15 Yrs</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold">Size 6</td>
                        <td className="py-2">5ft 0in – 5ft 4in</td>
                        <td className="py-2">11 – 13 Yrs</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold">Size 5</td>
                        <td className="py-2">4ft 8in – 5ft 0in</td>
                        <td className="py-2">9 – 11 Yrs</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-semibold">Size 4</td>
                        <td className="py-2">4ft 4in – 4ft 8in</td>
                        <td className="py-2">7 – 9 Yrs</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                    💡 <strong>Pro Tip:</strong> Full Size (SH) Short Handle is standard for 95% of adult cricketers in Kashmir and worldwide.
                  </p>
                </div>
              )}

              {/* Tab 2: Shoes */}
              {sizeGuideTab === "shoes" && (
                <div className="space-y-3 text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-[11px]">
                        <th className="py-2">UK / India</th>
                        <th className="py-2">US</th>
                        <th className="py-2">EU</th>
                        <th className="py-2">Foot Length (cm)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
                      <tr><td className="py-2 font-bold">UK 6</td><td className="py-2">US 7</td><td className="py-2">EU 40</td><td className="py-2">25.0 cm</td></tr>
                      <tr><td className="py-2 font-bold">UK 7</td><td className="py-2">US 8</td><td className="py-2">EU 41</td><td className="py-2">26.0 cm</td></tr>
                      <tr><td className="py-2 font-bold">UK 8</td><td className="py-2">US 9</td><td className="py-2">EU 42</td><td className="py-2">27.0 cm</td></tr>
                      <tr><td className="py-2 font-bold">UK 9</td><td className="py-2">US 10</td><td className="py-2">EU 43</td><td className="py-2">28.0 cm</td></tr>
                      <tr><td className="py-2 font-bold">UK 10</td><td className="py-2">US 11</td><td className="py-2">EU 44</td><td className="py-2">29.0 cm</td></tr>
                      <tr><td className="py-2 font-bold">UK 11</td><td className="py-2">US 12</td><td className="py-2">EU 45</td><td className="py-2">30.0 cm</td></tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 3: Apparel */}
              {sizeGuideTab === "apparel" && (
                <div className="space-y-3 text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-[11px]">
                        <th className="py-2">Size</th>
                        <th className="py-2">Chest (Inches)</th>
                        <th className="py-2">Waist (Inches)</th>
                        <th className="py-2">Fit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
                      <tr><td className="py-2 font-bold">S</td><td className="py-2">36 – 38"</td><td className="py-2">28 – 30"</td><td className="py-2">Athletic Slim</td></tr>
                      <tr><td className="py-2 font-bold">M</td><td className="py-2">38 – 40"</td><td className="py-2">30 – 32"</td><td className="py-2">Regular Fit</td></tr>
                      <tr><td className="py-2 font-bold">L</td><td className="py-2">40 – 42"</td><td className="py-2">32 – 34"</td><td className="py-2">Comfort Fit</td></tr>
                      <tr><td className="py-2 font-bold">XL</td><td className="py-2">42 – 44"</td><td className="py-2">34 – 36"</td><td className="py-2">Relaxed Fit</td></tr>
                      <tr><td className="py-2 font-bold">XXL</td><td className="py-2">44 – 46"</td><td className="py-2">36 – 38"</td><td className="py-2">Loose Fit</td></tr>
                    </tbody>
                  </table>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="w-full mt-5 py-2.5 bg-gray-900 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Got It, Close
              </button>
            </div>
          </div>
        )}

        {/* Sportify Prime VIP Modal */}
        <PrimeMembershipModal
          isOpen={showPrimeModal}
          onClose={() => setShowPrimeModal(false)}
        />
      </div>
    </div>
  );
}
