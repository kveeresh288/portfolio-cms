/**
 * Mongoose models for use in Next.js Route Handlers (server-side only).
 * Uses getModel pattern to avoid "Cannot overwrite model" errors during hot-reload.
 */
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// ── User ───────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  email: string;
  password: string;
  mfaChannel: 'email' | 'totp';
  isMfaEnabled: boolean;
  mfaSecret?: string;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  mfaChannel: { type: String, enum: ['email', 'totp'], default: 'email' },
  isMfaEnabled: { type: Boolean, default: false },
  mfaSecret: { type: String, select: false },
});
// Mongoose v9: async hooks must NOT call next() — just return a Promise
UserSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});
UserSchema.methods.comparePassword = function (c: string) { return bcrypt.compare(c, this.password); };

// ── OtpSession ─────────────────────────────────────────────────────────────

export interface IOtpSession extends Document {
  sessionToken: string;
  userId: mongoose.Types.ObjectId;
  otpHash: string;
  channel: 'email' | 'totp';
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

const OtpSessionSchema = new Schema<IOtpSession>({
  sessionToken: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  otpHash: { type: String, required: true },
  channel: { type: String, enum: ['email', 'totp'], required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
}, { timestamps: true });
OtpSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ── SiteProfile ────────────────────────────────────────────────────────────

export interface ISiteProfile extends Document {
  hero: { name: string; badge: string; roles: string[]; subtitle: string };
  about: { bio: string[] };
  contact: { email: string; phone: string; workLocation: string; workMapsUrl: string; college: string };
  social: { github: string; linkedin: string; twitter: string; resume: string };
}

const SiteProfileSchema = new Schema<ISiteProfile>({
  hero: {
    name: { type: String, default: 'K Veeresh' },
    badge: { type: String, default: 'Open to full-time SWE / DE roles from June 2026' },
    roles: { type: [String], default: ['Data Engineer Intern', 'Full-Stack Developer', 'DSA & Problem Solver', 'MERN Specialist'] },
    subtitle: { type: String, default: "CSE student at AIET (2026) · Data Engineer Intern at MyVoteLabs · Building scalable data pipelines, full-stack apps, and solving problems with Java DSA." },
  },
  about: { bio: { type: [String], default: ["Computer Science Engineering student at Alva's Institute of Engineering & Technology (graduating 2026).", "Currently working as a Software Engineer Intern at MyVoteLabs, building data pipelines for political analytics platforms."] } },
  contact: {
    email: { type: String, default: 'kveeresh288@gmail.com' },
    phone: { type: String, default: '+91 76192 80422' },
    workLocation: { type: String, default: 'HSR Layout, Bangalore' },
    workMapsUrl: { type: String, default: 'https://maps.app.goo.gl/rqKYTsb5eZy4pKKy7?g_st=aw' },
    college: { type: String, default: 'AIET · Moodbidri, Mangalore' },
  },
  social: {
    github: { type: String, default: 'https://github.com/kveeresh288' },
    linkedin: { type: String, default: 'https://www.linkedin.com/in/veeresh-k-41107b25b/' },
    twitter: { type: String, default: '' },
    resume: { type: String, default: '' },
  },
}, { timestamps: true });

// ── Project ────────────────────────────────────────────────────────────────

export interface IProject extends Document {
  title: string; description: string; imageUrl: string;
  githubUrl: string; liveUrl: string; tags: string[];
  featured: boolean; order: number; createdAt: Date; updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  tags: [{ type: String, trim: true }],
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// ── Skill ──────────────────────────────────────────────────────────────────

export interface ISkill extends Document {
  name: string; category: string; iconName: string; proficiency: number; order: number;
}

const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['frontend','backend','database','devops','tools','other'] },
  iconName: { type: String, required: true },
  proficiency: { type: Number, required: true, min: 1, max: 100 },
  order: { type: Number, default: 0 },
});

// ── Safe model getters (prevent "overwrite" error in dev hot-reload) ────────

function getModel<T extends Document>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] as Model<T>) ?? mongoose.model<T>(name, schema);
}

export const User = () => getModel<IUser>('User', UserSchema);
export const OtpSession = () => getModel<IOtpSession>('OtpSession', OtpSessionSchema);
export const SiteProfile = () => getModel<ISiteProfile>('SiteProfile', SiteProfileSchema);
export const Project = () => getModel<IProject>('Project', ProjectSchema);
export const Skill = () => getModel<ISkill>('Skill', SkillSchema);
