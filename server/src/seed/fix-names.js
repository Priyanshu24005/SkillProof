/**
 * Fixes test accounts where `name` was mistakenly set to the user's
 * email instead of an actual name. Replaces it with a readable
 * placeholder derived from their username (e.g. "priyanshu2408" ->
 * "Priyanshu2408") — safe to manually rename further afterward in
 * Compass if you want a cleaner display name.
 *
 * Usage (from the server/ folder):
 *   node src/seed/fix-names.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/users');

const looksLikeEmail = (value) => typeof value === 'string' && value.includes('@');

const toTitleCase = (str) =>
  str
    .replace(/[_\-.]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.\n');

  const brokenUsers = await User.find({ name: { $regex: '@' } });

  if (brokenUsers.length === 0) {
    console.log('No users found with an email in the name field. Nothing to fix.');
  } else {
    console.log(`Found ${brokenUsers.length} user(s) with a broken name field:\n`);
    for (const user of brokenUsers) {
      const oldName = user.name;
      const newName = toTitleCase(user.username);
      user.name = newName;
      await user.save();
      console.log(`  ${user.email}: "${oldName}" -> "${newName}"`);
    }
    console.log('\nDone. You can manually rename any of these further in Compass if needed.');
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('fix-names failed:', err);
  process.exit(1);
});