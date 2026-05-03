import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  // 'email' = send OTP via email; 'totp' = authenticator app
  mfaChannel: { type: String, enum: ['email', 'totp'], default: 'email' },
  // false on first install; true once admin sets up MFA
  isMfaEnabled: { type: Boolean, default: false },
  // Base32 TOTP secret — only populated when mfaChannel === 'totp'
  mfaSecret: { type: String, select: false },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
