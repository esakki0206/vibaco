const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log('   No changes made.');
      return;
    }

    // Default admin credentials (should be changed after first login)
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@sareestore.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@2024';
    
    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    const adminUser = await User.create({
      name: 'System Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      phone: '0000000000'
    });

    console.log('✅ Admin user created successfully!');
    console.log('═══════════════════════════════════════');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('═══════════════════════════════════════');
    console.log('⚠️  IMPORTANT: Change this password after first login!');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Add --force flag to override existing admin
if (process.argv.includes('--force')) {
  const deleteExistingAdmin = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      const result = await User.deleteMany({ role: 'admin' });
      console.log(`🗑️  Deleted ${result.deletedCount} existing admin user(s)`);
      await mongoose.disconnect();
    } catch (error) {
      console.error('❌ Error deleting admin:', error.message);
      process.exit(1);
    }
  };

  deleteExistingAdmin().then(() => seedAdmin());
} else {
  seedAdmin();
}