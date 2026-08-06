



const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    firstName: { 
      type: String, 
      required: [true, "First name is required"],
      trim: true 
    },
    lastName: { 
      type: String, 
      trim: true 
    },
    street: { 
      type: String, 
      required: [true, "Street address is required"],
      trim: true 
    },
    city: { 
      type: String, 
      required: [true, "City is required"],
      trim: true 
    },
    district: { 
      type: String, 
      trim: true 
    },
    state: { 
      type: String, 
      required: [true, "State is required"],
      trim: true 
    },
    pincode: { 
      type: String, 
      required: [true, "Pincode is required"],
      trim: true 
    },
    country: { 
      type: String, 
      default: "India",
      trim: true 
    },
    email: { 
      type: String,
      trim: true,
      lowercase: true 
    },
    mobile: { 
      type: String, 
      required: [true, "Mobile number is required"],
      trim: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }
  },
  { 
    timestamps: true,
    collection: "addresses" // Explicitly set collection name
  }
);

// Add index for faster queries
addressSchema.index({ userId: 1 });

const Address = mongoose.model("Address", addressSchema);

module.exports = { Address };
