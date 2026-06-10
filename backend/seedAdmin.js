require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const adminExists = await User.findOne({ email: 'admin@stayzium.com' });

    if (adminExists) {
      console.log('Admin user already exists!');
      process.exit();
    }

    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@example.com',
      password: 'adminpassword123',
      role: 'admin'
    });

    console.log('Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('Password:', 'adminpassword123');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
