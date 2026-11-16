const Address = require('../models/address.model');

class AddressService {
  /**
   * Get all addresses for a user
   */
  async getAddresses(userId) {
    return await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  /**
   * Get a single address by ID
   */
  async getAddressById(userId, addressId) {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      const error = new Error('Delivery address not found');
      error.statusCode = 404;
      throw error;
    }
    return address;
  }

  /**
   * Create a new address for a user
   */
  async createAddress(userId, data) {
    // Check if user has existing addresses
    const count = await Address.countDocuments({ user: userId });
    const isFirst = count === 0;

    const address = new Address({
      user: userId,
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      street: data.street.trim(),
      apartment: data.apartment ? data.apartment.trim() : '',
      city: data.city.trim(),
      state: data.state.trim(),
      postalCode: data.postalCode.trim(),
      country: data.country ? data.country.trim() : 'India',
      isDefault: isFirst ? true : Boolean(data.isDefault),
      type: data.type || 'HOME',
    });

    await address.save();
    return address;
  }

  /**
   * Update an address
   */
  async updateAddress(userId, addressId, data) {
    const address = await this.getAddressById(userId, addressId);

    if (data.fullName) address.fullName = data.fullName.trim();
    if (data.phone) address.phone = data.phone.trim();
    if (data.street) address.street = data.street.trim();
    if (data.apartment !== undefined) address.apartment = data.apartment.trim();
    if (data.city) address.city = data.city.trim();
    if (data.state) address.state = data.state.trim();
    if (data.postalCode) address.postalCode = data.postalCode.trim();
    if (data.country) address.country = data.country.trim();
    if (data.type) address.type = data.type;
    if (data.isDefault !== undefined) address.isDefault = Boolean(data.isDefault);

    await address.save();
    return address;
  }

  /**
   * Set address as default
   */
  async setDefaultAddress(userId, addressId) {
    const address = await this.getAddressById(userId, addressId);
    address.isDefault = true;
    await address.save();
    return address;
  }

  /**
   * Delete an address
   */
  async deleteAddress(userId, addressId) {
    const address = await this.getAddressById(userId, addressId);
    const wasDefault = address.isDefault;
    await address.deleteOne();

    // If the deleted address was default, set another address as default
    if (wasDefault) {
      const nextAddress = await Address.findOne({ user: userId }).sort({ createdAt: -1 });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    return { message: 'Address removed successfully' };
  }
}

module.exports = new AddressService();
