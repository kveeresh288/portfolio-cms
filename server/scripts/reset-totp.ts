/**
 * Resets TOTP for the admin user so they can set it up fresh from the dashboard.
 * Usage: npm run reset-totp
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User';

async function resetTotp() {
  await mongoose.connect(process.env.MONGO_URI!);
  const email = process.env.ADMIN_EMAIL!;
  const result = await User.updateOne(
    { email },
    { $set: { isTotpEnabled: false }, $unset: { totpSecret: '' } }
  );
  if (result.matchedCount === 0) {
    console.error(`❌ No user found with email: ${email}`);
  } else {
    console.log(`✅ TOTP reset for ${email} — log in without 2FA and re-enable from the dashboard.`);
  }
  await mongoose.disconnect();
}

resetTotp().catch((err) => { console.error(err); process.exit(1); });
