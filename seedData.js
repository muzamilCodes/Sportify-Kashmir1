require("dotenv").config();
const mongoose = require("mongoose");
const connectDb = require("./config/connectDb");
const { Category } = require("./models/categoryModel");
const { Brand } = require("./models/brandModel");
const { Product } = require("./models/productModel");

const initialCategories = [
  { name: "Cricket", description: "Cricket bats, balls, pads & protective gear", subcategories: ["Bats", "Balls", "Pads", "Gloves", "Helmets"] },
  { name: "Football", description: "Professional footballs, boots & gear", subcategories: ["Footballs", "Boots", "Shin Guards", "Goalkeeper Gloves"] },
  { name: "Badminton", description: "Badminton rackets, shuttles & grips", subcategories: ["Rackets", "Shuttlecocks", "Shoes", "Grips"] },
  { name: "Basketball", description: "Basketballs, shoes & jerseys", subcategories: ["Balls", "Shoes", "Nets"] },
  { name: "Tennis", description: "Tennis rackets, balls & accessories", subcategories: ["Rackets", "Balls", "Grips"] },
  { name: "Gym & Fitness", description: "Dumbbells, resistance bands & yoga mats", subcategories: ["Dumbbells", "Resistance Bands", "Yoga Mats"] },
  { name: "Sports Wear", description: "Athletic t-shirts, shorts & tracksuits", subcategories: ["T-Shirts", "Shorts", "Tracksuits"] },
  { name: "Accessories", description: "Sports bags, bottles & caps", subcategories: ["Bags", "Bottles", "Socks", "Caps"] }
];

const initialBrands = [
  { name: "Nike", description: "World leading athletic apparel & footwear brand" },
  { name: "Adidas", description: "High performance sports equipment & wear" },
  { name: "Puma", description: "Innovative sports footwear & gear" },
  { name: "Yonex", description: "World leader in badminton and tennis gear" },
  { name: "SG", description: "Sanspareils Greenlands - Premier cricket equipment manufacturer" },
  { name: "Cosco", description: "Quality sports equipment for all games" },
  { name: "Nivia", description: "Popular Indian sports brand for football & basketball" }
];

const initialProducts = [
  {
    name: "SG Kashmir Willow Cricket Bat",
    description: "Handcrafted from selected Kashmir Willow. Superior grain quality with thick edges for maximum power.",
    price: 2499,
    discount: 10,
    stock: 25,
    isAvailable: true,
    isArchived: false,
    onSale: true,
    categoryName: "Cricket",
    brandName: "SG",
    productImgUrls: ["https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&auto=format&fit=crop&q=80"]
  },
  {
    name: "Nike Premier League Football",
    description: "High-contrast graphics for easy tracking. 12-panel design for true and accurate flight.",
    price: 1899,
    discount: 15,
    stock: 40,
    isAvailable: true,
    isArchived: false,
    onSale: true,
    categoryName: "Football",
    brandName: "Nike",
    productImgUrls: ["https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=600&auto=format&fit=crop&q=80"]
  },
  {
    name: "Yonex Muscle Power 29 Badminton Racket",
    description: "Isometric frame shape designed for greater accuracy on off-center hits. Lightweight carbon frame.",
    price: 3299,
    discount: 5,
    stock: 4, // Low stock demo item
    isAvailable: true,
    isArchived: false,
    onSale: false,
    categoryName: "Badminton",
    brandName: "Yonex",
    productImgUrls: ["https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80"]
  },
  {
    name: "Adidas Rubber Basketball (Size 7)",
    description: "Durable rubber cover suited for outdoor court play. Deep channel design for superior grip.",
    price: 1299,
    discount: 0,
    stock: 18,
    isAvailable: true,
    isArchived: false,
    onSale: false,
    categoryName: "Basketball",
    brandName: "Adidas",
    productImgUrls: ["https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80"]
  },
  {
    name: "Puma Running Shoes Ultra",
    description: "Breathable mesh upper with cushioned EVA midsole for high-comfort long distance running.",
    price: 4499,
    discount: 20,
    stock: 2, // Low stock demo item
    isAvailable: true,
    isArchived: false,
    onSale: true,
    categoryName: "Sports Wear",
    brandName: "Puma",
    productImgUrls: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"]
  },
  {
    name: "Cosco Vinyl Dumbbell Pair (5kg x 2)",
    description: "Vinyl coated cast iron dumbbells for home workout, shoulder press, bicep curls, and strength training.",
    price: 1599,
    discount: 0,
    stock: 30,
    isAvailable: true,
    isArchived: false,
    onSale: false,
    categoryName: "Gym & Fitness",
    brandName: "Cosco",
    productImgUrls: ["https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80"]
  },
  {
    name: "Nivia Pro Shin Guards",
    description: "High impact protective shell with soft foam padding for comfortable shank protection in football.",
    price: 499,
    discount: 0,
    stock: 0, // Out of stock demo item
    isAvailable: true,
    isArchived: false,
    onSale: false,
    categoryName: "Football",
    brandName: "Nivia",
    productImgUrls: ["https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80"]
  },
  {
    name: "Sportify Stainless Steel Water Bottle 1L",
    description: "Insulated double wall stainless steel bottle keeps drinks cold for 24 hours during workouts.",
    price: 799,
    discount: 10,
    stock: 50,
    isAvailable: true,
    isArchived: false,
    onSale: true,
    categoryName: "Accessories",
    brandName: "Nike",
    productImgUrls: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80"]
  }
];

async function seedData() {
  try {
    await connectDb();
    console.log("🌱 Connected to MongoDB, starting database seed...");

    // 1. Seed Categories
    const categoryMap = {};
    for (const catData of initialCategories) {
      let cat = await Category.findOne({ name: catData.name });
      if (!cat) {
        cat = await Category.create(catData);
        console.log(`✅ Category created: ${cat.name}`);
      } else {
        console.log(`ℹ️ Category exists: ${cat.name}`);
      }
      categoryMap[cat.name] = cat._id;
    }

    // 2. Seed Brands
    const brandMap = {};
    for (const brandData of initialBrands) {
      let b = await Brand.findOne({ name: brandData.name });
      if (!b) {
        b = await Brand.create(brandData);
        console.log(`✅ Brand created: ${b.name}`);
      } else {
        console.log(`ℹ️ Brand exists: ${b.name}`);
      }
      brandMap[b.name] = b._id;
    }

    // 3. Seed Products
    for (const prodData of initialProducts) {
      const existing = await Product.findOne({ name: prodData.name });
      if (!existing) {
        await Product.create({
          name: prodData.name,
          description: prodData.description,
          price: prodData.price,
          discount: prodData.discount,
          stock: prodData.stock,
          isAvailable: prodData.isAvailable,
          isArchived: prodData.isArchived,
          onSale: prodData.onSale,
          category: categoryMap[prodData.categoryName],
          brand: brandMap[prodData.brandName],
          productImgUrls: prodData.productImgUrls,
        });
        console.log(`✅ Product created: ${prodData.name} (Stock: ${prodData.stock})`);
      } else {
        console.log(`ℹ️ Product exists: ${prodData.name}`);
      }
    }

    console.log("🎉 Database seeding finished successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seedData();
