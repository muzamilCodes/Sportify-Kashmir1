const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const refundSchema = new mongoose.Schema(
  {
    orderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order", 
      required: true 
    },
    paymentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Payment", 
      required: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    
    // Refund Details
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
    
    // Refund Status
    status: { 
      type: String, 
      enum: ["requested", "processing", "processed", "failed", "cancelled"], 
      default: "requested" 
    },
    
    // Refund Reason
    reason: { 
      type: String, 
      required: true 
    },
    notes: { 
      type: String 
    },
    
    // Gateway Details
    gatewayRefundId: { 
      type: String 
    },
    gatewayResponse: { 
      type: mongoose.Schema.Types.Mixed 
    },
    
    // Approved By (Admin)
    approvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
    approvedAt: { 
      type: Date 
    },
    
    // Timestamps
    processedAt: { 
      type: Date 
    }
  },
  {
    timestamps: true,
  }
);

// Add indexes
refundSchema.index({ orderId: 1 });
refundSchema.index({ paymentId: 1 });
refundSchema.index({ userId: 1 });
refundSchema.index({ status: 1 });
refundSchema.index({ createdAt: -1 });

// Plugin for pagination
refundSchema.plugin(mongoosePaginate);

const Refund = mongoose.model("Refund", refundSchema);

module.exports = { Refund };