const { Refund } = require("../models/refundModel");
const { resHandler } = require("../utilities/resHandler");

exports.getAllRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find()
      .populate("orderId", "orderId orderValue orderStatus paymentMethod")
      .populate("paymentId", "amount currency status method")
      .populate("userId", "username email mobile")
      .populate("approvedBy", "username email")
      .sort({ createdAt: -1 });

    if (refunds.length > 0) {
      return resHandler(res, 200, `${refunds.length} refunds found!`, refunds);
    }

    return resHandler(res, 200, "No refunds found!", []);
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.getRefundById = async (req, res) => {
  try {
    const { refundId } = req.params;
    const refund = await Refund.findById(refundId)
      .populate("orderId", "orderId orderValue orderStatus paymentMethod")
      .populate("paymentId", "amount currency status method")
      .populate("userId", "username email mobile")
      .populate("approvedBy", "username email");

    if (!refund) {
      return resHandler(res, 404, "Refund not found!");
    }

    return resHandler(res, 200, "Refund found!", refund);
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};

exports.updateRefundStatus = async (req, res) => {
  try {
    const { refundId } = req.params;
    const { status, notes } = req.body;
    const allowedStatuses = ["requested", "processing", "processed", "failed", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return resHandler(res, 400, "Invalid refund status provided!");
    }

    const refund = await Refund.findById(refundId);
    if (!refund) {
      return resHandler(res, 404, "Refund not found!");
    }

    refund.status = status;
    if (typeof notes === "string") {
      refund.notes = notes;
    }

    if (["processed", "cancelled", "failed"].includes(status)) {
      refund.processedAt = new Date();
    }

    if (["processed", "cancelled"].includes(status)) {
      refund.approvedBy = req.userId;
      refund.approvedAt = new Date();
    }

    await refund.save();

    const populatedRefund = await Refund.findById(refundId)
      .populate("orderId", "orderId orderValue orderStatus paymentMethod")
      .populate("paymentId", "amount currency status method")
      .populate("userId", "username email mobile")
      .populate("approvedBy", "username email");

    return resHandler(res, 200, "Refund status updated successfully!", populatedRefund);
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error!");
  }
};
