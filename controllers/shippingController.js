const Setting = require("../models/settingModel");

// Check pincode serviceability and shipping rates
exports.checkPincode = async (req, res) => {
  try {
    const { pincode, orderAmount = 0 } = req.body;
    const cleanPin = String(pincode || "").trim();

    if (!cleanPin || cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit Indian PIN code",
      });
    }

    const settings = (await Setting.findOne()) || {};
    const threshold = settings.freeShippingThreshold || 999;
    const isFreeShipping = Number(orderAmount) >= threshold;

    const isKashmir = cleanPin.startsWith("19"); // J&K PIN code prefix (190001 - 194999)
    const isNorthIndia = ["11", "12", "13", "14", "15", "16", "17", "18", "20", "24"].some((prefix) =>
      cleanPin.startsWith(prefix)
    );

    let standardCharge = 99;
    let expressCharge = 199;
    let estimatedDays = "4 - 7 Business Days";
    let locationZone = "National Standard Delivery";

    if (isKashmir) {
      standardCharge = 49;
      expressCharge = 99;
      estimatedDays = "1 - 3 Business Days (Same/Next Day in Valley)";
      locationZone = "Kashmir Valley Express Zone";
    } else if (isNorthIndia) {
      standardCharge = 79;
      expressCharge = 149;
      estimatedDays = "3 - 5 Business Days";
      locationZone = "North India Zone";
    }

    const finalShippingCharge = isFreeShipping ? 0 : standardCharge;

    return res.status(200).json({
      success: true,
      data: {
        pincode: cleanPin,
        serviceable: true,
        locationZone,
        estimatedDelivery: estimatedDays,
        shippingCharge: finalShippingCharge,
        originalCharge: standardCharge,
        isFreeShipping,
        freeShippingThreshold: threshold,
        codAvailable: true,
      },
      message: isFreeShipping
        ? `🎉 Eligible for FREE Express Delivery to ${cleanPin}!`
        : `Delivery available to ${cleanPin} in ${estimatedDays}`,
    });
  } catch (error) {
    console.error("Check pincode error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
