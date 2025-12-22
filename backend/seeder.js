import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/userModel.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const seedAdmin = async () => {
  await connectDB();

  try {
    const adminExists = await User.findOne({ role: 'Admin' });

    if (adminExists) {
      console.log('An admin user already exists. Database already seeded.');
      process.exit();
    }

    // Check if variables are provided in environment (non-interactive mode)
    let name = process.env.INITIAL_ADMIN_NAME;
    let email = process.env.INITIAL_ADMIN_EMAIL;
    let password = process.env.INITIAL_ADMIN_PASSWORD;

    // If not in env, ask via terminal (interactive mode for local setup)
    if (!name || !email || !password) {
      console.log('--- Creating Initial Admin User (Interactive Mode) ---');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

      name = await question('Enter admin name: ');
      email = await question('Enter admin email: ');
      password = await question('Enter admin password: ');
      rl.close();
    }

    if (!name || !email || !password) {
      console.error('Error: Name, email, and password are required to seed admin.');
      process.exit(1);
    }

    await User.create({
      name,
      email,
      password,
      role: 'Admin',
    });

    console.log('✅ Admin user created successfully!');
    process.exit();

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();