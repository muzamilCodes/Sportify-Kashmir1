const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const paymentSchema = new mongoose.Schema(
  {
    orderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order", 
      required: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    
    // Payment Details
    amount: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    currency: { 
      type: String, 
      default: "INR", 
      required: true 
    },
    
    // Payment Gateway Details
    paymentGateway: { 
      type: String, 
      enum: ["razorpay", "stripe", "paypal", "cash_on_delivery"], 
      required: true 
    },
    gatewayPaymentId: { 
      type: String, 
      required: true 
    },
    gatewayOrderId: { 
      type: String 
    },
    gatewaySignature: { 
      type: String 
    },
    
    // Payment Status
    status: { 
      type: String, 
      enum: ["created", "attempted", "paid", "failed", "refunded", "partially_refunded"], 
      default: "created" 
    },
    
    // Payment Method
    method: { 
      type: String, 
      enum: ["card", "netbanking", "upi", "wallet", "cash"], 
      required: true 
    },
    
    // Refund Details (if applicable)
    refundAmount: { 
      type: Number, 
      default: 0 
    },
    refundId: { 
      type: String 
    },
    refundReason: { 
      type: String 
    },
    
    // Additional Info
    email: { 
      type: String 
    },
    contact: { 
      type: String 
    },
    
    // Metadata
    metadata: { 
      type: mongoose.Schema.Types.Mixed 
    }
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ gatewayPaymentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Plugin for pagination
paymentSchema.plugin(mongoosePaginate);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = { Payment };