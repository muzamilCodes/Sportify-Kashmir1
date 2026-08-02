



const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    firstName : {type :String},
    lastName : {type :String},
    street : {type :String},
    city : {type :String},
    district : {type :String},
    state : {type :String},
    pincode : {type:String},
    country : {type :String},
    email: { type: String},
    mobile: { type: String },
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  },
  { timestamps: true }
);

const Address = mongoose.model("Address", addressSchema);

module.exports = { Address };
