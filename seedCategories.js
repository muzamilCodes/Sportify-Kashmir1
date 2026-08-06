require("dotenv").config();
const mongoose = require("mongoose");
const { Category } = require("./models/categoryModel");
const connectDb = require("./config/connectDb");

const initialCategories = [
  { name: "Football", description: "All football gear and equipment", subcategories: ["Balls", "Boots", "Jerseys", "Gloves", "Shin Guards"] },
  { name: "Cricket", description: "Premium cricket equipment", subcategories: ["Bats", "Balls", "Gloves", "Pads", "Helmets", "Shoes"] },
  { name: "Badminton", description: "Badminton rackets and accessories", subcategories: ["Rackets", "Shuttlecocks", "Shoes", "Bags"] },
  { name: "Basketball", description: "Basketball gear", subcategories: ["Balls", "Shoes", "Jerseys"] },
  { name: "Volleyball", description: "Volleyball equipment", subcategories: ["Balls", "Nets", "Shoes"] },
  { name: "Tennis", description: "Tennis rackets and gear", subcategories: ["Rackets", "Balls", "Shoes"] },
  { name: "Gym & Fitness", description: "Home and gym fitness equipment", subcategories: ["Dumbbells", "Barbells", "Resistance Bands", "Yoga Mats"] },
  { name: "Running", description: "Running shoes and apparel", subcategories: ["Shoes", "T-Shirts", "Shorts", "Watches"] },
  { name: "Cycling", description: "Bicycles and accessories", subcategories: ["Bicycles", "Helmets", "Gloves", "Accessories"] },
  { name: "Swimming", description: "Swimwear and gear", subcategories: ["Swimwear", "Goggles", "Caps"] },
  { name: "Indoor Games", description: "Board games and indoor sports", subcategories: ["Chess", "Carrom", "Table Tennis"] },
  { name: "Sports Wear", description: "Activewear and apparel", subcategories: ["T-Shirts", "Shorts", "Tracksuits", "Hoodies"] },
  { name: "Sports Shoes", description: "Footwear for all sports", subcategories: ["Running", "Football", "Cricket", "Basketball", "Tennis"] },
  { name: "Accessories", description: "Sports bags, bottles and accessories", subcategories: ["Bags", "Bottles", "Caps", "Socks", "Towels"] },
  { name: "Cups & Trophies", description: "Awards and recognition", subcategories: ["Winner Cups", "Champion Trophies", "Medals", "Shields", "Certificates", "Custom Engraving Trophies"] }
];

async function seed() {
  try {
    await connectDb();
    console.log("Connected to DB, seeding categories...");

    let count = 0;
    for (const cat of initialCategories) {
      // Find existing category to update subcategories, or create new
      const existing = await Category.findOne({ name: { $regex: new RegExp(`^${cat.name}$`, 'i') } });
      if (existing) {
        existing.subcategories = cat.subcategories;
        existing.description = existing.description || cat.description;
        await existing.save();
        console.log(`Updated existing category: ${cat.name}`);
      } else {
        await Category.create(cat);
        console.log(`Created new category: ${cat.name}`);
      }
      count++;
    }

    console.log(`Successfully seeded ${count} categories!`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
