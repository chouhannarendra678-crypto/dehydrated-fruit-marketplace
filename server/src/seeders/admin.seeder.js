const User = require('../models/user.model');
const { ROLES } = require('../constants/roles.constants');

const seedAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dehydratedfruit.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'Platform Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: ROLES.ADMIN,
        isEmailVerified: true,
      });
      console.log(`[Admin Seeder] Super Admin created: ${adminEmail}`);
    } else {
      console.log(`[Admin Seeder] Super Admin already exists: ${adminEmail}`);
    }
  } catch (error) {
    console.error(`[Admin Seeder Error]:`, error.message);
  }
};

module.exports = seedAdminUser;
