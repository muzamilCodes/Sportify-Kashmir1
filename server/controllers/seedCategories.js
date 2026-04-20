require("dotenv").config();
const mongoose = require("mongoose");
const { Category } = require("../models/categoryModel");

const categories = [
  { name: "Cricket", description: "Cricket equipment and gear" },
  { name: "Football", description: "Football equipment and gear" },
  { name: "Fitness", description: "Fitness equipment and accessories" },
  { name: "Apparel", description: "Sports clothing and apparel" },
  { name: "Tennis", description: "Tennis equipment and gear" },
  { name: "Basketball", description: "Basketball equipment and gear" },
];

async function seedCategories() {
  try {
    // Connect to MongoDB (adjust connection string as needed)
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/sports-ecommerce");

    console.log("Connected to MongoDB");

    for (const cat of categories) {
      const existing = await Category.findOne({ name: { $regex: new RegExp(`^${cat.name}$`, 'i') } });
      if (!existing) {
        await Category.create(cat);
        console.log(`Created category: ${cat.name}`);
      } else {
        console.log(`Category already exists: ${cat.name}`);
      }
    }

    console.log("Seeding completed");
  } catch (error) {
    console.error("Error seeding categories:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedCategories();
