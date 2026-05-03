export interface Project {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  githubUrl?: string;
  liveUrl?: string;
  tags: string[];
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  _id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'tools' | 'other';
  iconName: string;
  proficiency: number;
  order: number;
}

export interface SiteProfile {
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

export type MfaChannel = 'email' | 'totp';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export type SkillCategory = Skill['category'];

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  devops: 'DevOps',
  tools: 'Tools',
  other: 'Other',
};

export const DEFAULT_PROFILE: SiteProfile = {
  hero: {
    name: 'K Veeresh',
    badge: 'Open to full-time SWE / DE roles from June 2026',
    roles: ['Data Engineer Intern', 'Full-Stack Developer', 'DSA & Problem Solver', 'MERN Specialist'],
    subtitle:
      "CSE student at AIET (2026) · Data Engineer Intern at MyVoteLabs · Building scalable data pipelines, full-stack apps, and solving problems with Java DSA.",
  },
  about: {
    bio: [
      "Computer Science Engineering student at Alva's Institute of Engineering & Technology (graduating 2026), with a strong foundation in Data Structures & Algorithms (Java), System Design, and Full-Stack Development (MERN).",
      "Currently working as a Software Engineer Intern at MyVoteLabs, building data pipelines and cloud-based solutions for political analytics platforms.",
    ],
  },
  contact: {
    email: 'kveeresh288@gmail.com',
    phone: '+91 76192 80422',
    workLocation: 'HSR Layout, Bangalore',
    workMapsUrl: 'https://maps.app.goo.gl/rqKYTsb5eZy4pKKy7?g_st=aw',
    college: 'AIET · Moodbidri, Mangalore',
  },
  social: {
    github: 'https://github.com/kveeresh288',
    linkedin: 'https://www.linkedin.com/in/veeresh-k-41107b25b/',
    twitter: '',
    resume: '',
  },
};
