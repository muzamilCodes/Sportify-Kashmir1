"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type LanguageCode = "EN" | "HI" | "UR" | "KS";

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "EN", name: "English", nativeName: "English", flag: "🇮🇳" },
  { code: "HI", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "UR", name: "Urdu", nativeName: "اردو", flag: "🇵🇰" },
  { code: "KS", name: "Kashmiri", nativeName: "کٲشُر", flag: "🏔️" },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  EN: {
    // Navbar & Header
    "nav.all": "All",
    "nav.kashmirExpress": "Kashmir Express",
    "nav.cricket": "Cricket Willow",
    "nav.football": "Football",
    "nav.badminton": "Badminton",
    "nav.gym": "Gym & Fitness",
    "nav.buyAgain": "Buy Again",
    "nav.prime": "Sportify Prime",
    "nav.wholesale": "Academy Wholesale",
    "nav.service": "Customer Service",
    "nav.searchPlaceholder": "Search Kashmir willow bats, match footballs, gym gear, jerseys...",
    "nav.deliverTo": "Deliver to",
    "nav.helloSignIn": "Hello, Sign in",
    "nav.accountLists": "Account & Lists",
    "nav.returnsOrders": "Returns & Orders",
    "nav.cart": "Cart",
    "nav.admin": "Admin Panel",
    "nav.signOut": "Sign Out",
    "nav.manageProfile": "Manage Profile",
    "nav.language": "Language",

    // Hero Slides
    "hero.slide1.title": "Authentic Kashmir",
    "hero.slide1.highlight": "Willow Cricket Bats",
    "hero.slide1.subtitle": "Direct from Sangam & Anantnag workshops. Monster punch, thick edges & feather-light balance.",
    "hero.slide1.badge": "🏏 100% Genuine Handcrafted Willow",
    "hero.slide1.button": "Shop Cricket Bats",

    "hero.slide2.title": "Pro Footballs, Studs",
    "hero.slide2.highlight": "& Match Day Kits",
    "hero.slide2.subtitle": "Thermal bonded match balls, hard-ground turf cleats, pro goalkeeper gloves & customized team jerseys.",
    "hero.slide2.badge": "⚽ FIFA Grade Match Collection",
    "hero.slide2.button": "Shop Football Gear",

    "hero.slide3.title": "Carbon Graphite",
    "hero.slide3.highlight": "Badminton Series",
    "hero.slide3.subtitle": "High-tension 30LBS attack rackets, genuine Yonex Mavis 350 shuttles & non-marking court shoes.",
    "hero.slide3.badge": "🏸 Speed, Power & Precision",
    "hero.slide3.button": "Shop Badminton",

    // Home Page Sections
    "home.featured": "Featured Products",
    "home.featuredSub": "New arrivals & trending picks for athletes",
    "home.specialDeals": "Special Deals & Discounts",
    "home.specialDealsSub": "Limited time sports gear offers & bundles",
    "home.recentlyViewed": "Recently Viewed",
    "home.viewAll": "View All Products",
    "home.loadMore": "Load More Products",
    "home.whyChoose": "Why Choose Sportify Kashmir?",
    "home.expressDelivery": "Express Kashmir Delivery",
    "home.expressDeliveryDesc": "Same/next day delivery across Srinagar & all 10 districts",
    "home.genuineWillow": "100% Handcrafted Willow",
    "home.genuineWillowDesc": "Directly sourced from Sangam & Halmulla master craftsmen",
    "home.securePayments": "100% Safe Payments",
    "home.securePaymentsDesc": "UPI, Cards, NetBanking & Cash on Delivery (COD) supported",
    "home.authenticQuality": "Authentic Guarantee",
    "home.authenticQualityDesc": "100% genuine products with 7-day hassle-free replacement",

    // Product Card
    "product.addToCart": "Add to Cart",
    "product.buyNow": "Buy Now",
    "product.outOfStock": "Out of Stock",
    "product.inStock": "In Stock",
    "product.freeDelivery": "FREE Delivery",
    "product.off": "OFF",

    // Profile & Orders
    "profile.myProfile": "My Profile",
    "profile.editProfile": "Edit Profile",
    "profile.changePhoto": "Change Photo",
    "profile.addresses": "Delivery Addresses",
    "profile.orders": "My Orders",
    "profile.wishlist": "Wishlist",
    "profile.settings": "Account Settings",
    "profile.phone": "Phone Number",
    "profile.email": "Email Address",
    "profile.city": "City / Location",
    "profile.save": "Save Changes",

    // Footer
    "footer.about": "About Sportify Kashmir",
    "footer.aboutDesc": "Kashmir's leading sports equipment destination offering genuine cricket willow, football, badminton, and fitness equipment with express delivery.",
    "footer.quickLinks": "Quick Links",
    "footer.customerService": "Customer Service",
    "footer.trackOrder": "Track Order",
    "footer.allRights": "All Rights Reserved. Made for Kashmir athletes.",
  },

  HI: {
    // Navbar & Header
    "nav.all": "सभी श्रेणियां",
    "nav.kashmirExpress": "कश्मीर एक्सप्रेस",
    "nav.cricket": "क्रिकेट विलो",
    "nav.football": "फुटबॉल",
    "nav.badminton": "बैडमिंटन",
    "nav.gym": "जिम एवं फिटनेस",
    "nav.buyAgain": "दोबारा खरीदें",
    "nav.prime": "स्पोर्टिफाई प्राइम",
    "nav.wholesale": "अकादमी थोक",
    "nav.service": "ग्राहक सेवा",
    "nav.searchPlaceholder": "कश्मीर विलो बैट, फुटबॉल, जिम गियर खोजें...",
    "nav.deliverTo": "डिलीवर करें",
    "nav.helloSignIn": "नमस्ते, साइन इन",
    "nav.accountLists": "खाता एवं सूचियां",
    "nav.returnsOrders": "वापसी और ऑर्डर",
    "nav.cart": "कार्ट",
    "nav.admin": "एडमिन पैनल",
    "nav.signOut": "साइन आउट",
    "nav.manageProfile": "प्रोफ़ाइल प्रबंधित करें",
    "nav.language": "भाषा",

    // Hero Slides
    "hero.slide1.title": "असली कश्मीरी",
    "hero.slide1.highlight": "विलो क्रिकेट बैट",
    "hero.slide1.subtitle": "संगम और अनंतनाग वर्कशॉप से सीधे। शानदार स्ट्रोक, मोटे किनारे और हल्का वजन।",
    "hero.slide1.badge": "🏏 100% असली हाथ से बना कश्मीरी विलो",
    "hero.slide1.button": "क्रिकेट बैट खरीदें",

    "hero.slide2.title": "प्रो फुटबॉल, स्टड्स",
    "hero.slide2.highlight": "& मैच डे किट्स",
    "hero.slide2.subtitle": "थर्मल बॉन्डेड मैच बॉल्स, टर्फ क्लैट्स, प्रो ग्लव्स और कस्टम टीम जर्सी।",
    "hero.slide2.badge": "⚽ फीफा ग्रेड मैच कलेक्शन",
    "hero.slide2.button": "फुटबॉल सामान खरीदें",

    "hero.slide3.title": "कार्बन ग्रेफाइट",
    "hero.slide3.highlight": "बैडमिंटन सीरीज",
    "hero.slide3.subtitle": "30LBS हाई-टेंशन रैकेट्स, असली योनेक्स शटल और कोर्ट शूज।",
    "hero.slide3.badge": "🏸 गति, शक्ति और सटीकता",
    "hero.slide3.button": "बैडमिंटन खरीदें",

    // Home Page Sections
    "home.featured": "विशेष उत्पाद",
    "home.featuredSub": "नए आगमन और ट्रेंडिंग खेल उपकरण",
    "home.specialDeals": "खास डील्स और छूट",
    "home.specialDealsSub": "सीमित समय के खेल ऑफर एवं बंडल",
    "home.recentlyViewed": "हाल ही में देखे गए उत्पाद",
    "home.viewAll": "सभी उत्पाद देखें",
    "home.loadMore": "और उत्पाद लोड करें",
    "home.whyChoose": "स्पोर्टिफाई कश्मीर क्यों चुनें?",
    "home.expressDelivery": "तेज़ कश्मीर डिलीवरी",
    "home.expressDeliveryDesc": "श्रीनगर और सभी 10 जिलों में 24 घंटे में डिलीवरी",
    "home.genuineWillow": "100% असली हाथ से बना विलो",
    "home.genuineWillowDesc": "संगम और हलमुल्ला के प्रमाणित कारीगरों से सीधे",
    "home.securePayments": "100% सुरक्षित भुगतान",
    "home.securePaymentsDesc": "UPI, कार्ड, नेटबैंकिंग और कैश ऑन डिलीवरी समर्थित",
    "home.authenticQuality": "प्रामाणिक गुणवत्ता गारंटी",
    "home.authenticQualityDesc": "7-दिन के आसान रिप्लेसमेंट के साथ 100% असली उत्पाद",

    // Product Card
    "product.addToCart": "कार्ट में जोड़ें",
    "product.buyNow": "अभी खरीदें",
    "product.outOfStock": "स्टॉक में नहीं",
    "product.inStock": "स्टॉक में उपलब्ध",
    "product.freeDelivery": "मुफ्त डिलीवरी",
    "product.off": "छूट",

    // Profile & Orders
    "profile.myProfile": "मेरी प्रोफ़ाइल",
    "profile.editProfile": "प्रोफ़ाइल एडिट करें",
    "profile.changePhoto": "फोटो बदलें",
    "profile.addresses": "डिलीवरी पते",
    "profile.orders": "मेरे ऑर्डर",
    "profile.wishlist": "पसंदीदा सूची",
    "profile.settings": "अकाउंट सेटिंग्स",
    "profile.phone": "फ़ोन नंबर",
    "profile.email": "ईमेल पता",
    "profile.city": "शहर / स्थान",
    "profile.save": "सेव करें",

    // Footer
    "footer.about": "स्पोर्टिफाई कश्मीर के बारे में",
    "footer.aboutDesc": "कश्मीर का प्रमुख खेल स्टोर जो असली क्रिकेट बैट, फुटबॉल, बैडमिंटन और फिटनेस उपकरण सबसे तेज़ डिलीवरी के साथ प्रदान करता है।",
    "footer.quickLinks": "त्वरित लिंक्स",
    "footer.customerService": "ग्राहक सेवा",
    "footer.trackOrder": "ऑर्डर ट्रैक करें",
    "footer.allRights": "सर्वाधिकार सुरक्षित। कश्मीरी एथलीटों के लिए समर्पित।",
  },

  UR: {
    // Navbar & Header
    "nav.all": "تمام زمرے",
    "nav.kashmirExpress": "کشمیر ایکسپریس",
    "nav.cricket": "کرکٹ ولو",
    "nav.football": "فٹ بال",
    "nav.badminton": "بیڈمنٹن",
    "nav.gym": "جم اور فٹنس",
    "nav.buyAgain": "دوبارہ خریدیں",
    "nav.prime": "اسپورٹیفائی پرائم",
    "nav.wholesale": "اکیڈمی ہول سیل",
    "nav.service": "کسٹمر سروس",
    "nav.searchPlaceholder": "کشمیر ولو بیٹ، فٹ بال، جم سامان تلاش کریں...",
    "nav.deliverTo": "پہنچائیں",
    "nav.helloSignIn": "ہیلو، لاگ ان کریں",
    "nav.accountLists": "اکاؤنٹ اور فہرستیں",
    "nav.returnsOrders": "واپسی اور آرڈرز",
    "nav.cart": "کارٹ",
    "nav.admin": "ایڈمن پینل",
    "nav.signOut": "سائن آؤٹ",
    "nav.manageProfile": "پروفائل کا انتظام",
    "nav.language": "زبان",

    // Hero Slides
    "hero.slide1.title": "اصلی کشمیری",
    "hero.slide1.highlight": "ولو کرکٹ بیٹس",
    "hero.slide1.subtitle": "سنگم اور اننت ناگ ورکشاپس سے براہ راست۔ طاقتور اسٹروک، موٹے کنارے اور ہلکا وزن۔",
    "hero.slide1.badge": "🏏 100% اصلی دستکاری کشمیر ولو",
    "hero.slide1.button": "کرکٹ بیٹ خریدیں",

    "hero.slide2.title": "پرو فٹ بال، اسٹڈز",
    "hero.slide2.highlight": "اور میچ ڈے کٹس",
    "hero.slide2.subtitle": "تھرمل بانڈڈ میچ بالز، ٹرف شوز، پرو دستانے اور کسٹم جرسیاں۔",
    "hero.slide2.badge": "⚽ فیفا گریڈ میچ کلیکشن",
    "hero.slide2.button": "فٹ بال سامان خریدیں",

    "hero.slide3.title": "کاربن گریفائٹ",
    "hero.slide3.highlight": "بیڈمنٹن سیریز",
    "hero.slide3.subtitle": "30LBS ہائی ٹینشن ریکٹس، اصلی یونیکس شٹلز اور کورٹ شوز۔",
    "hero.slide3.badge": "🏸 رفتار، طاقت اور درستگی",
    "hero.slide3.button": "بیڈمنٹن خریدیں",

    // Home Page Sections
    "home.featured": "نمایاں مصنوعات",
    "home.featuredSub": "نئی آمد اور کھلاڑیوں کا مقبول سامان",
    "home.specialDeals": "خصوصی ڈیلز اور چھوٹ",
    "home.specialDealsSub": "محدود وقت کے کھیل آفرز اور بنڈلز",
    "home.recentlyViewed": "حالیہ دیکھی گئی اشیاء",
    "home.viewAll": "تمام مصنوعات دیکھیں",
    "home.loadMore": "مزید سامان دیکھیں",
    "home.whyChoose": "اسپورٹیفائی کشمیر کیوں منتخب کریں؟",
    "home.expressDelivery": "تیز کشمیر ڈیلیوری",
    "home.expressDeliveryDesc": "سرینگر اور تمام ۱۰ اضلاع میں ۲۴ گھنٹوں میں ترسیل",
    "home.genuineWillow": "100% اصلی دستکاری ولو",
    "home.genuineWillowDesc": "سنگم اور ہلملہ کے مستند کاریگروں سے براہ راست",
    "home.securePayments": "100% محفوظ ادائیگیاں",
    "home.securePaymentsDesc": "یو پی آئی، کارڈز، نیٹ بینکنگ اور کیش آن ڈیلیوری",
    "home.authenticQuality": "اصلی کوالٹی کی ضمانت",
    "home.authenticQualityDesc": "7 دن کی آسان تبدیلی کے ساتھ 100% اصلی سامان",

    // Product Card
    "product.addToCart": "کارٹ میں شامل کریں",
    "product.buyNow": "ابھی خریدیں",
    "product.outOfStock": "اسٹاک ختم",
    "product.inStock": "اسٹاک موجود ہے",
    "product.freeDelivery": "مفت ڈیلیوری",
    "product.off": "چھوٹ",

    // Profile & Orders
    "profile.myProfile": "میری پروفائل",
    "profile.editProfile": "پروفائل تبدیل کریں",
    "profile.changePhoto": "تصویر تبدیل کریں",
    "profile.addresses": "ڈیلیوری پتے",
    "profile.orders": "میرے آرڈرز",
    "profile.wishlist": "پسندیدہ اشیاء",
    "profile.settings": "اکاؤنٹ سیٹنگز",
    "profile.phone": "فون نمبر",
    "profile.email": "ای میل ایڈریس",
    "profile.city": "شہر / مقام",
    "profile.save": "محفوظ کریں",

    // Footer
    "footer.about": "اسپورٹیفائی کشمیر کے بارے میں",
    "footer.aboutDesc": "کشمیر کا ممتاز اسپورٹس اسٹور جو اصلی کرکٹ بیٹس، فٹ بال، بیڈمنٹن اور فٹنس سامان تیز رفتار ترسیل کے ساتھ فراہم کرتا ہے۔",
    "footer.quickLinks": "فوری لنکس",
    "footer.customerService": "کسٹمر سروس",
    "footer.trackOrder": "آرڈر ٹریک کریں",
    "footer.allRights": "جملہ حقوق محفوظ ہیں۔ کشمیری کھلاڑیوں کے لیے تیار کردہ۔",
  },

  KS: {
    // Navbar & Header
    "nav.all": "سٲری کٹیگری",
    "nav.kashmirExpress": "کٔشیٖر ایکسپریس",
    "nav.cricket": "کِرکٔٹ ویلو",
    "nav.football": "فُٹ بال",
    "nav.badminton": "بیڈمنٹن",
    "nav.gym": "جِم تہٕ فِٹنیس",
    "nav.buyAgain": "بیٚیہِ خریٖدِو",
    "nav.prime": "سپورٹیفائی پرائم",
    "nav.wholesale": "اکیڈمی تھوک",
    "nav.service": "خدمت گاہک",
    "nav.searchPlaceholder": "کٔشیٖر ویلو بیٹ، بال، سامان تلاشن کٔریو...",
    "nav.deliverTo": "پُژناوُن",
    "nav.helloSignIn": "سَلام، لاگ اِن",
    "nav.accountLists": "کھاتہٕ تہٕ فِہرِست",
    "nav.returnsOrders": "واپسی تہٕ آرڈر",
    "nav.cart": "ٹوکری (Cart)",
    "nav.admin": "ایڈمن پینل",
    "nav.signOut": "لاگ آؤٹ",
    "nav.manageProfile": "پروفائل پربندھ",
    "nav.language": "زبان",

    // Hero Slides
    "hero.slide1.title": "اصل کٔشیٖر ہُنٛد",
    "hero.slide1.highlight": "ویلو کِرکٔٹ بیٹ",
    "hero.slide1.subtitle": "سنگم تہٕ اننت ناگ ورکشاپ پیٚٹھٕ سؠدھ۔ زبردست اسٹروک تہٕ اعلیٰ بیلنس۔",
    "hero.slide1.badge": "🏏 ۱۰۰٪ اصل دستکٲری کٔشیٖر ویلو",
    "hero.slide1.button": "کِرکٔٹ بیٹ خریٖدِو",

    "hero.slide2.title": "پرو فُٹ بال، سٹڈز",
    "hero.slide2.highlight": "تہٕ میچ کِٹ",
    "hero.slide2.subtitle": "تھرمل بانڈڈ میچ بال، شوز، گلوز تہٕ کسٹم جرسی۔",
    "hero.slide2.badge": "⚽ فیفا گریڈ میچ کَلیٚکشن",
    "hero.slide2.button": "فُٹ بال سامان خریٖدِو",

    "hero.slide3.title": "کاربن گریٖفائٹ",
    "hero.slide3.highlight": "بیڈمنٹن سیریٖز",
    "hero.slide3.subtitle": "۳۰LBS ہائی ٹینشن ریکٹ، اصل یونیکس شٹل تہٕ شوز۔",
    "hero.slide3.badge": "🏸 رفتار، طاقت تہٕ صفٲیی",
    "hero.slide3.button": "بیڈمنٹن خریٖدِو",

    // Home Page Sections
    "home.featured": "خاص سامان",
    "home.featuredSub": "کھلاڑین خٲطرٕ تازٕ تہٕ مَشہوٗر سامان",
    "home.specialDeals": "خاص آفر تہٕ ڈسکاؤنٹ",
    "home.specialDealsSub": "کٔم وقتکؠ سپورٹس آفر تہٕ بنڈل",
    "home.recentlyViewed": "حال ہی منٛز وُچھِتھ سامان",
    "home.viewAll": "سٲری سامان وُچھِو",
    "home.loadMore": "بیٚیہِ سامان ہاوِو",
    "home.whyChoose": "سپورٹیفائی کٔشیٖر کیازِ چُھناوِو؟",
    "home.expressDelivery": "تیز کٔشیٖر ڈیلیوری",
    "home.expressDeliveryDesc": "سریٖنگر تہٕ سٲری ۱۰ ضلعن منٛز ۲۴ گھنٹن منٛز پُژناوُن",
    "home.genuineWillow": "۱۰۰٪ اصل دستکٲری ویلو",
    "home.genuineWillowDesc": "سنگم تہٕ ہلمُلہ کین مستند کاریگرن پیٚٹھٕ سؠدھ",
    "home.securePayments": "۱۰۰٪ محفوظ ادائیگیاں",
    "home.securePaymentsDesc": "UPI، کارڈ، نیٹ بینکنگ تہٕ کیش آن ڈیلیوری سہولت",
    "home.authenticQuality": "اصل کوالٹی ہٕنٛز ضمانت",
    "home.authenticQualityDesc": "۷ دۄہن منٛز آسان تبدیلی تہٕ ۱۰۰٪ اصل سامان",

    // Product Card
    "product.addToCart": "کارٹ منٛز ترٛٲوِو",
    "product.buyNow": "وۄنؠ خریٖدِو",
    "product.outOfStock": "مال ختم",
    "product.inStock": "دستیاب چُھ",
    "product.freeDelivery": "مُفت ڈیلیوری",
    "product.off": "ڈسکاؤنٹ",

    // Profile & Orders
    "profile.myProfile": "میٚٲنؠ پروفائل",
    "profile.editProfile": "پروفائل بدلاوِو",
    "profile.changePhoto": "فوٹو بدلاوِو",
    "profile.addresses": "ڈیلیوری پتہٕ",
    "profile.orders": "میٚٲنؠ آرڈر",
    "profile.wishlist": "پسندیدہ فِہرِست",
    "profile.settings": "کھاتہٕ سیٹنگز",
    "profile.phone": "فون نَمبر",
    "profile.email": "ای میل ایڈریس",
    "profile.city": "شَہَر / جاے",
    "profile.save": "سیو کٔریو",

    // Footer
    "footer.about": "سپورٹیفائی کٔشیٖر مُتعلق",
    "footer.aboutDesc": "کٔشیٖر ہُنٛد مَشہوٗر سپورٹس سٹور یُس اصل کِرکٔٹ بیٹ، فُٹ بال، بیڈمنٹن تہٕ سامان پُژناوان چُھ۔",
    "footer.quickLinks": "ضروری لنکس",
    "footer.customerService": "گاہک خدمت",
    "footer.trackOrder": "آرڈر ٹریک کٔریو",
    "footer.allRights": "سٲری حقوق محفوظ۔ کٔشیٖر کین کھلاڑین خٲطرٕ۔",
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currentLangOption: LanguageOption;
  t: (key: string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "EN",
  setLanguage: () => {},
  currentLangOption: LANGUAGES[0],
  t: (key: string, defaultText?: string) => defaultText || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("EN");

  useEffect(() => {
    const saved = localStorage.getItem("preferredLanguage") as LanguageCode;
    if (saved && ["EN", "HI", "UR", "KS"].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("preferredLanguage", lang);
    window.dispatchEvent(new Event("languageChanged"));
  };

  const t = (key: string, defaultText?: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.EN;
    return langDict[key] || defaultText || key;
  };

  const currentLangOption = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currentLangOption, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
