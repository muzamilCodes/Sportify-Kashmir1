const { Address } = require("../models/addressModel");
const { User } = require("../models/userModel");
const { resHandler } = require("../utilities/resHandler");

exports.createAddress = async (req, res) => {
  try {
    const userId = req.userId;

    let user = await User.findById(userId);

    if (!user) {
      return resHandler(res, 404, "User Not Found!");
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
      email,
      mobile,
    } = req.body;

    if (user.addresses.length > 2) {
      return resHandler(res, 400, "Only 3 addresses are allowed for one User!");
    }

    const newAddress = await Address.create({
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
      userId,
    });

    if (newAddress) {
      user.addresses.push(newAddress._id);
      await user.save();
      return resHandler(res, 201, "Address created", newAddress);
    }
  } catch (error) {
    console.error(error);
    return resHandler(res, 500, "Server Error");
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
