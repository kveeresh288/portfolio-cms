import mongoose, { Schema } from 'mongoose';
import { IProject } from '../types';

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IProject>('Project', ProjectSchema);
