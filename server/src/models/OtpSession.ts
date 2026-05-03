import mongoose, { Schema } from 'mongoose';
import { IOtpSession } from '../types';

// Ported from the MFA project (JavaScript → TypeScript)
const OtpSessionSchema = new Schema<IOtpSession>(
  {
    // Cryptographically random hex token returned to the client after password check
    sessionToken: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId as unknown as typeof String, ref: 'User', required: true },
    // 6-digit OTP hashed with bcrypt before storage
    otpHash: { type: String, required: true },
    channel: { type: String, enum: ['email', 'totp'], required: true },
    // MongoDB TTL index auto-deletes expired sessions
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// TTL — MongoDB will delete documents once expiresAt has passed
OtpSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOtpSession>('OtpSession', OtpSessionSchema);
