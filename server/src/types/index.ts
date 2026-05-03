import { Request } from 'express';
import { Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  imageUrl: string;
  githubUrl?: string;
  liveUrl?: string;
  tags: string[];
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISkill extends Document {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'tools' | 'other';
  iconName: string;
  proficiency: number;
  order: number;
}

export type MfaChannel = 'email' | 'totp';

export interface IUser extends Document {
  email: string;
  password: string;
  mfaChannel: MfaChannel;
  isMfaEnabled: boolean;
  mfaSecret?: string;
  comparePassword(candidate: string): Promise<boolean>;
}

export interface IOtpSession extends Document {
  sessionToken: string;
  userId: string;
  otpHash: string;
  channel: 'email' | 'totp';
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

export interface ISiteProfile extends Document {
  hero: {
    name: string;
    badge: string;
    roles: string[];
    subtitle: string;
  };
  about: {
    bio: string[];
  };
  contact: {
    email: string;
    phone: string;
    workLocation: string;
    workMapsUrl: string;
    college: string;
  };
  social: {
    github: string;
    linkedin: string;
    twitter: string;
    resume: string;
  };
}

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}
