import mongoose, { Schema } from 'mongoose';
import { ISkill } from '../types';

const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['frontend', 'backend', 'database', 'devops', 'tools', 'other'],
  },
  iconName: { type: String, required: true },
  proficiency: { type: Number, required: true, min: 1, max: 100 },
  order: { type: Number, default: 0 },
});

export default mongoose.model<ISkill>('Skill', SkillSchema);
