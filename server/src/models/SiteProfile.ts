import mongoose, { Schema } from 'mongoose';
import { ISiteProfile } from '../types';

// Singleton document — only one per database
const SiteProfileSchema = new Schema<ISiteProfile>(
  {
    hero: {
      name: { type: String, default: 'K Veeresh' },
      badge: { type: String, default: 'Open to full-time SWE / DE roles from June 2026' },
      roles: {
        type: [String],
        default: ['Data Engineer Intern', 'Full-Stack Developer', 'DSA & Problem Solver', 'MERN Specialist'],
      },
      subtitle: {
        type: String,
        default:
          "CSE student at AIET (2026) · Data Engineer Intern at MyVoteLabs · Building scalable data pipelines, full-stack apps, and solving problems with Java DSA.",
      },
    },
    about: {
      bio: {
        type: [String],
        default: [
          "Computer Science Engineering student at Alva's Institute of Engineering & Technology (graduating 2026), with a strong foundation in Data Structures & Algorithms (Java), System Design, and Full-Stack Development (MERN).",
          "Currently working as a Software Engineer Intern at MyVoteLabs, building data pipelines and cloud-based solutions for political analytics platforms. Passionate about applying algorithmic thinking to real-world, scalable systems.",
        ],
      },
    },
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
  },
  { timestamps: true }
);

export default mongoose.model<ISiteProfile>('SiteProfile', SiteProfileSchema);
