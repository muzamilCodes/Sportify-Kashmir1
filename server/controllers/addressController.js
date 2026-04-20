const { Address } = require("../models/addressModel");
const { User } = require("../models/userModel");
const { resHandler } = require("../utilities/resHandler");

exports.createAddress = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const {
      firstName,
      lastName,
      street,
      city,
      district,
      state,
      pincode,
      country,
      mobile,
      email,
      landmark,
      addressType,
      isDefault,
    } = req.body;

    // Validate required fields (explicitly check existence and not empty)
    if (!firstName || !street || !city || !state || !pincode || !mobile) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: firstName, street, city, state, pincode, mobile",
      });
    }

    // Safely convert to string and check length
    const mobileStr = String(mobile).trim();
    if (mobileStr.length !== 10) {
      return res.status(400).json({ success: false, message: "Mobile number must be 10 digits" });
    }

    const pincodeStr = String(pincode).trim();
    if (pincodeStr.length < 6) {
      return res.status(400).json({ success: false, message: "Pincode must be at least 6 digits" });
    }

    // If this address is set as default, unset others
    if (isDefault === true) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const address = await Address.create({
      userId,
      firstName: firstName.trim(),
      lastName: lastName ? lastName.trim() : "",
      street: street.trim(),
      city: city.trim(),
      district: district ? district.trim() : city.trim(),
      state: state.trim(),
      pincode: pincodeStr,
      country: country || "India",
      mobile: mobileStr,
      email: email ? email.trim() : "",
      landmark: landmark ? landmark.trim() : "",
      addressType: addressType || "home",
      isDefault: isDefault === true,
    });

    // Add address reference to user
    await User.findByIdAndUpdate(userId, { $push: { addresses: address._id } });

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: address,
    });
  } catch (error) {
    console.error("❌ ERROR creating address:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// Get all addresses for the logged-in user
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.userId;
    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
    return res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const {
      firstName,
      lastName,
      street,
      city,
      district,
      state,
      pincode,
      country,
      email,
      mobile,
    } = req.body;

    let findAddress = await Address.findById(addressId);

    if (!findAddress) {
      return resHandler(res, 404, "Address Not Found!");
    }

    findAddress.firstName = firstName;
    findAddress.lastName = lastName;
    findAddress.street = street;
    findAddress.city = city;
    findAddress.district = district;
    findAddress.state = state;
    findAddress.pincode = pincode;
    findAddress.country = country;
    findAddress.email = email;
    findAddress.mobile = mobile;

    await findAddress.save();

    return resHandler(res, 200, "Address updated successfully", findAddress);
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error");
  }
};

exports.removeAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { addressId } = req.params;

    // Find the user
    const user = await User.findById(userId); // db query
    if (!user) {
      return resHandler(res, 404, "User Not Found!");
    }

    // Find the address
    const address = await Address.findById(addressId); // db query
    if (!address) {
      return resHandler(res, 404, "Address Not Found!");
    }

    // Remove address reference from user

    // at max it will run three times
    user.addresses = user.addresses.filter(
      (addrId) => addrId.toString() !== addressId
    );

    await user.save(); // db query

    // Remove the address document
    await Address.findByIdAndDelete(addressId); // db query

    return resHandler(res, 200, "Address removed successfully");
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error");
  }
};

exports.getAllAddresses = async (req, res) => {
  try {
    const addresses = await Address.find();

    if (addresses.length > 0) {
      resHandler(res, 200, `${addresses.length} addresses Found!`, addresses);
    } else {
      resHandler(res, 404, `No addresses Found!`);
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error");
  }
};

exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.userId;

    const addresses = await Address.find({ userId });

    // Transform addresses to match frontend interface
    const transformedAddresses = addresses.map(addr => ({
      _id: addr._id,
      fullName: `${addr.firstName} ${addr.lastName}`.trim(),
      mobileNumber: addr.mobile,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      country: addr.country,
      postalCode: addr.pincode,
      isDefault: false, // You can add isDefault field to Address model if needed
    }));

    if (transformedAddresses.length > 0) {
      return resHandler(res, 200, `${transformedAddresses.length} addresses Found!`, transformedAddresses);
    } else {
      return resHandler(res, 200, "No addresses Found!", []);
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error");
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const { addressId } = req.params;
    const address= await Address.findById(addressId);

    if (address) {
      resHandler(res, 200, undefined,address );
    } else {
      resHandler(res, 404, `No addresses Found!`);
    }
  } catch (error) {
    console.error(error)
    return resHandler(res, 500, "Server Error");
  }
};
