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

export interface IUser extends Document {
  email: string;
  password: string;
  totpSecret?: string;
  isTotpEnabled: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}
