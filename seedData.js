require("dotenv").config();
const mongoose = require("mongoose");
const connectDb = require("./config/connectDb");
const { Category } = require("./models/categoryModel");
const { Brand } = require("./models/brandModel");
const { Product } = require("./models/productModel");

const categoriesData = [
  {
    name: "Cricket",
    description: "Premium English and Kashmir willow bats, leather balls, protective pads, gloves & helmets",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Bats", "Balls", "Pads", "Gloves", "Helmets", "Kits"]
  },
  {
    name: "Football",
    description: "Professional match footballs, firm ground cleats, shin guards and goalkeeper gear",
    image: "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Footballs", "Boots", "Shin Guards", "Goalkeeper Gloves", "Jerseys"]
  },
  {
    name: "Badminton",
    description: "High tension graphite rackets, nylon and feather shuttlecocks, court shoes and grips",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Rackets", "Shuttlecocks", "Shoes", "Grips", "Kit Bags"]
  },
  {
    name: "Basketball",
    description: "Official indoor/outdoor composite basketballs, high-ankle shoes, nets and jerseys",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Balls", "Shoes", "Nets", "Jerseys"]
  },
  {
    name: "Volleyball",
    description: "Professional tournament volleyballs, shock-absorbing knee guards, nets and accessories",
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Balls", "Knee Pads", "Nets", "Accessories"]
  },
  {
    name: "Tennis",
    description: "Championship tennis rackets, pressurized balls, tour bags and vibration dampeners",
    image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Rackets", "Balls", "Grips", "Bags"]
  },
  {
    name: "Gym & Fitness",
    description: "Hex dumbbells, resistance bands, dual-grip yoga mats and strength training essentials",
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Dumbbells", "Resistance Bands", "Yoga Mats", "Weight Plates", "Belts"]
  },
  {
    name: "Running",
    description: "Lightweight cushioned road running shoes, breathable headbands and hydration packs",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Shoes", "Hydration Packs", "Headbands", "Socks"]
  },
  {
    name: "Cycling",
    description: "Aerodynamic road cycling helmets, gel-padded gloves, insulated bottles and accessories",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80",
    subcategories: ["Helmets", "Gloves", "Bottles", "Accessories"]
  },
  {
    name: "Sports Wear",
    description: "Moisture-wicking athletic t-shirts, training shorts, hoodies and tracksuits",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
    subcategories: ["T-Shirts", "Shorts", "Tracksuits", "Hoodies", "Caps"]
  }
];

const brandsData = [
  {
    name: "Nike",
    description: "World leading athletic apparel, footwear and high-performance equipment",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Adidas",
    description: "High performance sports equipment, three-stripes apparel and athletic footwear",
    image: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Puma",
    description: "Innovative sports footwear, running gear and lifestyle athletic apparel",
    image: "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Yonex",
    description: "World leader in professional badminton and tennis rackets and court footwear",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "SG",
    description: "Sanspareils Greenlands - Premier cricket equipment and Kashmir willow bats",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "SS",
    description: "Sareen Sports - Legendary English and Kashmir willow cricket bats and gear",
    image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Cosco",
    description: "Top Indian sports equipment manufacturer for football, tennis, gym & fitness",
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Nivia",
    description: "Trusted sports brand for professional footballs, basketballs and protective gear",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Wilson",
    description: "Iconic American sports equipment brand famous for championship tennis and basketball",
    image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Head",
    description: "Global racquet sports and championship tennis equipment manufacturer",
    image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Asics",
    description: "Japanese performance running footwear with Gel cushioning technology",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&auto=format&fit=crop&q=80"
  },
  {
    name: "Under Armour",
    description: "Performance athletic heatgear, training shirts, compression wear and accessories",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80"
  }
];

const productsData = [
  // ===================== CRICKET =====================
  {
    name: "SG Player Edition Kashmir Willow Cricket Bat",
    description: "Handcrafted in the Kashmir valley from specially selected Grade 1 Kashmir Willow. Features massive thick edges, a full spine profile for explosive power hitting, and an imported cane handle with chevron grip.",
    price: 3499,
    discount: 15,
    stock: 22,
    categoryName: "Cricket",
    subcategory: "Bats",
    brandName: "SG",
    colors: ["Natural Wood"],
    sizes: ["Full Size (SH)", "Size 6", "Size 5"],
    tags: ["cricket", "bat", "kashmir willow", "sg", "hard leather"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "SS Ton Matrix English Willow Cricket Bat",
    description: "Premium English Willow with 7-9 straight grains. Expertly balanced with an extended sweet spot, lightweight pickup, and toe guard protection. Designed for tournament level batsmen.",
    price: 7499,
    discount: 10,
    stock: 14,
    categoryName: "Cricket",
    subcategory: "Bats",
    brandName: "SS",
    colors: ["Natural Wood"],
    sizes: ["Full Size (SH)"],
    tags: ["cricket", "bat", "english willow", "ss ton", "professional"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "SG Club Four-Piece Leather Cricket Ball (Pack of 2)",
    description: "Hand-stitched alum tanned genuine leather four-piece cricket ball. High quality cork core provides consistent bounce and shape retention for 50-over matches.",
    price: 899,
    discount: 5,
    stock: 45,
    categoryName: "Cricket",
    subcategory: "Balls",
    brandName: "SG",
    colors: ["Red", "White"],
    sizes: ["Standard 5.5oz"],
    tags: ["cricket", "ball", "leather", "sg", "match ball"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1589801258579-18e091f4ca26?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "SS Gladiator Cricket Batting Pads & Legguards",
    description: "High-density molded foam front with cane reinforcement. Features extra wide padded straps, gel knee bolster, and mesh side protection for ultimate comfort and safety against fast bowling.",
    price: 2499,
    discount: 12,
    stock: 18,
    categoryName: "Cricket",
    subcategory: "Pads",
    brandName: "SS",
    colors: ["White"],
    sizes: ["Adult", "Youth"],
    tags: ["cricket", "pads", "legguards", "ss", "protective"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop&q=80"
    ]
  },

  // ===================== FOOTBALL =====================
  {
    name: "Nike Flight Match Football (Size 5)",
    description: "Revolutionary Aerowsculpt molded grooves disrupt airflow across the ball for 30% truer flight. 3D-printed ink overlays fine-tune texture for precise grip in all weather conditions.",
    price: 2299,
    discount: 15,
    stock: 35,
    categoryName: "Football",
    subcategory: "Footballs",
    brandName: "Nike",
    colors: ["White/Blue", "Yellow/Black"],
    sizes: ["Size 5", "Size 4"],
    tags: ["football", "soccer", "nike", "match ball", "fifa"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "Puma Future Ultimate FG/AG Football Boots",
    description: "Adaptive FUZIONFIT360 dual mesh upper with PWRTAPE support locks down the foot for high-agility cuts. Dynamic Motion System outsole provides instant traction on firm natural grass and turf.",
    price: 5999,
    discount: 20,
    stock: 16,
    categoryName: "Football",
    subcategory: "Boots",
    brandName: "Puma",
    colors: ["Electric Blue", "Triple Black"],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    tags: ["football", "boots", "cleats", "puma", "shoes"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "Nivia Carbonite Pro Goalkeeper Gloves",
    description: "4mm German contact latex foam palm delivers supreme shock absorption and all-weather grip. Features removable finger spines and a breathable elastic wristband with double wrap strap.",
    price: 1499,
    discount: 10,
    stock: 24,
    categoryName: "Football",
    subcategory: "Goalkeeper Gloves",
    brandName: "Nivia",
    colors: ["Neon Green/Black", "Solar Orange"],
    sizes: ["Size 8", "Size 9", "Size 10"],
    tags: ["football", "goalkeeper", "gloves", "nivia", "protection"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800&auto=format&fit=crop&q=80"
    ]
  },

  // ===================== BADMINTON =====================
  {
    name: "Yonex Astrox 99 Pro Badminton Racket",
    description: "Head-heavy power racket engineered with Rotational Generator System and Namd graphite for steep downward smashes. Used by elite world tour champions for supreme shuttle hold and recoil.",
    price: 5499,
    discount: 12,
    stock: 15,
    categoryName: "Badminton",
    subcategory: "Rackets",
    brandName: "Yonex",
    colors: ["Cherry Sunburst", "White Tiger"],
    sizes: ["4U/G5 (83g)", "3U/G4 (88g)"],
    tags: ["badminton", "racket", "yonex", "astrox", "smash"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "Yonex Mavis 350 Nylon Shuttlecocks (Tube of 6)",
    description: "Precision-manufactured nylon skirt mimics the trajectory and recovery of natural feather shuttles while offering 4x greater durability. Precision Portuguese cork base.",
    price: 849,
    discount: 5,
    stock: 60,
    categoryName: "Badminton",
    subcategory: "Shuttlecocks",
    brandName: "Yonex",
    colors: ["Yellow", "White"],
    sizes: ["Medium Speed (Blue Cap)"],
    tags: ["badminton", "shuttlecock", "yonex", "mavis 350", "nylon"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "Yonex Power Cushion Comfort Z3 Badminton Shoes",
    description: "Shock-absorbing Power Cushion+ midsole converts impact energy into explosive bounce back. Hexagrip non-marking gum rubber sole provides 3% more grip and 20% lighter court maneuvers.",
    price: 4299,
    discount: 15,
    stock: 18,
    categoryName: "Badminton",
    subcategory: "Shoes",
    brandName: "Yonex",
    colors: ["White/Red", "Black/Gold"],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10"],
    tags: ["badminton", "shoes", "non marking", "yonex", "court"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80"
    ]
  },

  // ===================== BASKETBALL =====================
  {
    name: "Nike Elite All-Court Official Basketball (Size 7)",
    description: "Deep channel design and pebbled composite leather casing provide exceptional fingertip control and soft touch whether playing on hardwood gym courts or outdoor tarmac.",
    price: 2499,
    discount: 10,
    stock: 30,
    categoryName: "Basketball",
    subcategory: "Balls",
    brandName: "Nike",
    colors: ["Classic Amber/Black"],
    sizes: ["Official Size 7 (Men)", "Size 6 (Women)"],
    tags: ["basketball", "ball", "nike", "nba", "all court"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "Adidas Harden Vol 7 Basketball Shoes",
    description: "Hybrid BOOST and Lightstrike midsole provides responsive energy return and featherlight comfort for dynamic crossovers. Circular traction herringbone pattern prevents sliding.",
    price: 6999,
    discount: 18,
    stock: 12,
    categoryName: "Basketball",
    subcategory: "Shoes",
    brandName: "Adidas",
    colors: ["Cloud White/Core Black", "Silver Metallic"],
    sizes: ["UK 8", "UK 9", "UK 10", "UK 11"],
    tags: ["basketball", "shoes", "adidas", "harden", "boost"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=80"
    ]
  },

  // ===================== VOLLEYBALL =====================
  {
    name: "Cosco Super Volley Synthetic Leather Volleyball",
    description: "18-panel laminated composite synthetic leather volleyball built with microfiber technology for optimal touch, flight stability, and water resistance for intense league tournaments.",
    price: 1299,
    discount: 10,
    stock: 32,
    categoryName: "Volleyball",
    subcategory: "Balls",
    brandName: "Cosco",
    colors: ["Yellow/Blue/White"],
    sizes: ["Official Size 4"],
    tags: ["volleyball", "ball", "cosco", "tournament", "leather"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "Nivia Pro Impact Volleyball Knee Guards (Pair)",
    description: "Contoured high-density EVA foam padding cushions diving saves on hard indoor courts. Breathable, sweat-wicking elastic sleeve stays securely in place during rapid rallies.",
    price: 699,
    discount: 8,
    stock: 40,
    categoryName: "Volleyball",
    subcategory: "Knee Pads",
    brandName: "Nivia",
    colors: ["Jet Black", "Navy Blue"],
    sizes: ["Medium", "Large", "XL"],
    tags: ["volleyball", "knee pads", "nivia", "guards", "protection"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1592656094267-764a45160876?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&auto=format&fit=crop&q=80"
    ]
  },

  // ===================== TENNIS =====================
  {
    name: "Wilson Pro Staff 97 v14 Tennis Racket",
    description: "Precision-engineered graphite braided frame designed for ultimate pinpoint control and surgical feel. Paradigm Bending carbon construction optimizes bending between hoop and shaft.",
    price: 9499,
    discount: 10,
    stock: 12,
    categoryName: "Tennis",
    subcategory: "Rackets",
    brandName: "Wilson",
    colors: ["Classic Bronze/Black"],
    sizes: ["Grip 3 (4 3/8)", "Grip 2 (4 1/4)"],
    tags: ["tennis", "racket", "wilson", "pro staff", "federer"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "Head Tour XT Championship Tennis Balls (Can of 3)",
    description: "Premium Impact (Encore) technology core extends ball longevity and crisp responsiveness. SmartOptik high-visibility felt coating enhances ball tracking under bright sunlight or stadium floodlights.",
    price: 549,
    discount: 0,
    stock: 55,
    categoryName: "Tennis",
    subcategory: "Balls",
    brandName: "Head",
    colors: ["Optic Yellow"],
    sizes: ["Pressurized Can (3 Balls)"],
    tags: ["tennis", "balls", "head", "tour xt", "championship"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80"
    ]
  },

  // ===================== GYM & FITNESS =====================
  {
    name: "Cosco Rubber Coated Hex Dumbbell Set (10kg Pair)",
    description: "Solid cast iron core with heavy-duty virgin rubber coating protects gym floors and eliminates clatter. Ergonomic chrome knurled steel handle delivers a secure, non-slip grip during bicep curls and presses.",
    price: 3199,
    discount: 15,
    stock: 25,
    categoryName: "Gym & Fitness",
    subcategory: "Dumbbells",
    brandName: "Cosco",
    colors: ["Matte Black"],
    sizes: ["10kg x 2 Pair", "7.5kg x 2 Pair", "5kg x 2 Pair"],
    tags: ["gym", "fitness", "dumbbells", "weights", "strength"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "Puma Premium Dual-Grip Anti-Slip Yoga Mat (8mm)",
    description: "Eco-friendly high density TPE mat provides joint cushioning for yoga poses, pilates, and floor core routines. Dual-texture non-slip surface grips firmly to wood, tile, and concrete floors.",
    price: 1599,
    discount: 10,
    stock: 30,
    categoryName: "Gym & Fitness",
    subcategory: "Yoga Mats",
    brandName: "Puma",
    colors: ["Teal/Grey", "Charcoal Black"],
    sizes: ["183cm x 61cm (8mm Thick)"],
    tags: ["fitness", "yoga", "mat", "puma", "exercise"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80"
    ]
  },

  // ===================== RUNNING =====================
  {
    name: "Nike Pegasus 40 Mens Road Running Shoes",
    description: "Dual Nike Zoom Air units at forefoot and heel pair with Nike React foam for springy, durable cushioning on marathon runs and daily 10Ks. Engineered single layer mesh offers supreme airflow.",
    price: 8499,
    discount: 15,
    stock: 20,
    categoryName: "Running",
    subcategory: "Shoes",
    brandName: "Nike",
    colors: ["Racer Blue/White", "Triple Black", "Wolf Grey"],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    tags: ["running", "shoes", "nike", "pegasus", "marathon"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "Asics Gel-Kayano 30 Stability Running Shoes",
    description: "4D GUIDANCE SYSTEM provides adaptive stability on long runs. PureGEL technology delivers softer landings and smoother heel-to-toe transitions for road and trail runners.",
    price: 9999,
    discount: 12,
    stock: 14,
    categoryName: "Running",
    subcategory: "Shoes",
    brandName: "Asics",
    colors: ["Deep Ocean/Pure Silver", "Black/Glow Yellow"],
    sizes: ["UK 8", "UK 9", "UK 10"],
    tags: ["running", "shoes", "asics", "gel kayano", "stability"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&auto=format&fit=crop&q=80"
    ]
  },

  // ===================== CYCLING =====================
  {
    name: "Cosco Pro Aero Road Cycling Helmet with Safety Light",
    description: "In-mold polycarbonate shell with EPS foam liner cushions high-velocity impacts. 21 wind-tunnel airflow vents keep your head cool during hot summer hill climbs in Kashmir.",
    price: 1999,
    discount: 10,
    stock: 25,
    categoryName: "Cycling",
    subcategory: "Helmets",
    brandName: "Cosco",
    colors: ["Matte Titanium", "Hi-Vis Neon Lime", "Midnight Black"],
    sizes: ["Medium (54-58cm)", "Large (58-62cm)"],
    tags: ["cycling", "helmet", "bike", "cosco", "safety"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1559348349-86f1f65817fe?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "Nivia Gel Padded Cycling Fingerless Gloves",
    description: "Ergonomic shock-absorbing silicone gel palm padding eliminates handlebar numbness and road vibrations. Breathable Lycra mesh back with quick-release finger pull tabs.",
    price: 649,
    discount: 5,
    stock: 40,
    categoryName: "Cycling",
    subcategory: "Gloves",
    brandName: "Nivia",
    colors: ["Black/Racing Red", "Black/Cobalt Blue"],
    sizes: ["Medium", "Large", "XL"],
    tags: ["cycling", "gloves", "nivia", "gel padding", "road bike"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1559348349-86f1f65817fe?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80"
    ]
  },

  // ===================== SPORTS WEAR =====================
  {
    name: "Nike Dri-FIT Academy Training Tracksuit",
    description: "Signature Dri-FIT sweat-wicking double-knit fabric keeps athletes dry and comfortable. Full-zip track jacket with ribbed cuffs paired with tapered pants featuring zippered ankle hems.",
    price: 4299,
    discount: 20,
    stock: 30,
    categoryName: "Sports Wear",
    subcategory: "Tracksuits",
    brandName: "Nike",
    colors: ["Obsidian Navy/White", "Black/Anthracite"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    tags: ["sportswear", "tracksuit", "nike", "dri-fit", "training"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "Under Armour Tech 2.0 Short-Sleeve Athletic T-Shirt",
    description: "Ultra-soft UA Tech fabric with quick-drying moisture transport system. Anti-odor technology prevents growth of odor-causing microbes during heavy workout sessions.",
    price: 1399,
    discount: 10,
    stock: 45,
    categoryName: "Sports Wear",
    subcategory: "T-Shirts",
    brandName: "Under Armour",
    colors: ["Royal Blue", "Carbon Heather", "Pitch Gray"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    tags: ["sportswear", "t-shirt", "under armour", "gym", "breathable"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "Adidas Tiro 23 League Training Shorts",
    description: "AEROREADY moisture-absorbing polyester interlock fabric with iconic contrast 3-Stripes branding along the side seams. Zippered side pockets keep keys and phone secure.",
    price: 1499,
    discount: 15,
    stock: 35,
    categoryName: "Sports Wear",
    subcategory: "Shorts",
    brandName: "Adidas",
    colors: ["Black/White", "Team Navy/White"],
    sizes: ["S", "M", "L", "XL"],
    tags: ["sportswear", "shorts", "adidas", "tiro", "football"],
    productImgUrls: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80"
    ]
  }
];

async function seedData() {
  try {
    await connectDb();
    console.log("🌱 Connected to MongoDB, starting database seed for Sportify Kashmir...");

    // 1. Seed Categories
    const categoryMap = {};
    for (const catData of categoriesData) {
      let cat = await Category.findOne({ name: catData.name });
      if (!cat) {
        cat = await Category.create(catData);
        console.log(`✅ Category created: ${cat.name}`);
      } else {
        cat.description = catData.description;
        cat.subcategories = catData.subcategories;
        if (catData.image) cat.image = catData.image;
        await cat.save();
        console.log(`ℹ️ Category updated: ${cat.name}`);
      }
      categoryMap[cat.name] = cat._id;
    }

    // 2. Seed Brands
    const brandMap = {};
    for (const brandData of brandsData) {
      let b = await Brand.findOne({ name: brandData.name });
      if (!b) {
        b = await Brand.create(brandData);
        console.log(`✅ Brand created: ${b.name}`);
      } else {
        b.description = brandData.description;
        if (brandData.image) b.image = brandData.image;
        await b.save();
        console.log(`ℹ️ Brand updated: ${b.name}`);
      }
      brandMap[b.name] = b._id;
    }

    // 3. Clear existing old products to prevent duplication, then insert fresh products
    const deletedCount = await Product.deleteMany({});
    console.log(`🧹 Cleared ${deletedCount.deletedCount} old products before seeding.`);

    // 4. Seed Products
    let createdCount = 0;
    for (const prodData of productsData) {
      const categoryId = categoryMap[prodData.categoryName];
      const brandId = brandMap[prodData.brandName];

      if (!categoryId) {
        console.warn(`⚠️ Warning: Category ${prodData.categoryName} not found for product ${prodData.name}`);
        continue;
      }

      await Product.create({
        name: prodData.name,
        description: prodData.description,
        price: prodData.price,
        discount: prodData.discount,
        stock: prodData.stock,
        category: categoryId,
        subcategory: prodData.subcategory || "",
        brand: brandId,
        colors: prodData.colors || [],
        sizes: prodData.sizes || [],
        tags: prodData.tags || [],
        isAvailable: true,
        isArchived: false,
        onSale: Boolean(prodData.discount > 0),
        productImgUrls: prodData.productImgUrls
      });
      createdCount++;
      console.log(`✅ Product created (${createdCount}/${productsData.length}): ${prodData.name} (3 images, Category: ${prodData.categoryName}, Brand: ${prodData.brandName})`);
    }

    console.log(`\n🎉 Database seeding finished successfully! Total products created: ${createdCount}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seedData();
