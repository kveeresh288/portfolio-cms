import { Project, Skill } from '@/lib/types';

export const MOCK_PROJECTS: Project[] = [
  {
    _id: '1',
    title: 'SecureVault MFA',
    description:
      'Production-ready Multi-Factor Authentication system supporting Email OTP, TOTP Authenticator (speakeasy), and WebAuthn Passkeys — built on MERN stack with security-first architecture.',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    githubUrl: 'https://github.com/kveeresh288/Internship_MFA_Project',
    liveUrl: '',
    tags: ['Node.js', 'Express', 'MongoDB', 'React', 'WebAuthn', 'JWT', 'TOTP'],
    featured: true,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Portfolio CMS',
    description:
      'Full-stack Portfolio & Content Management System with a Next.js 14 App Router frontend, MFA-protected admin panel (speakeasy TOTP), and RESTful Express API.',
    imageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80',
    githubUrl: 'https://github.com/kveeresh288/portfolio-cms',
    liveUrl: '',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'MongoDB', 'Express'],
    featured: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    title: 'AI Identity Document Forgery Detector',
    description:
      'AI-powered system to detect forged identity documents using computer vision and machine learning techniques.',
    imageUrl: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&q=80',
    githubUrl: 'https://github.com/kveeresh288/AI-Identity-Document-Forgery-Detector',
    liveUrl: '',
    tags: ['Python', 'Machine Learning', 'Computer Vision', 'AI'],
    featured: false,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '4',
    title: 'Voter OCR System',
    description:
      'OCR-based voter information extraction system built during the MyVoteLabs internship for processing voter ID documents at scale.',
    imageUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&q=80',
    githubUrl: 'https://github.com/kveeresh288/voter-ocr-system',
    liveUrl: '',
    tags: ['Python', 'OCR', 'Data Pipeline', 'Cloud', 'MyVoteLabs'],
    featured: false,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_SKILLS: Skill[] = [
  // Frontend
  { _id: 's1', name: 'React', category: 'frontend', iconName: 'React', proficiency: 88, order: 0 },
  { _id: 's2', name: 'Next.js', category: 'frontend', iconName: 'Next.js', proficiency: 85, order: 1 },
  { _id: 's3', name: 'TypeScript', category: 'frontend', iconName: 'TypeScript', proficiency: 82, order: 2 },
  { _id: 's4', name: 'Tailwind CSS', category: 'frontend', iconName: 'Tailwind', proficiency: 92, order: 3 },
  // Backend
  { _id: 's5', name: 'Node.js', category: 'backend', iconName: 'Node.js', proficiency: 85, order: 0 },
  { _id: 's6', name: 'Express', category: 'backend', iconName: 'Express', proficiency: 85, order: 1 },
  { _id: 's7', name: 'Java', category: 'backend', iconName: 'Java', proficiency: 90, order: 2 },
  // Database
  { _id: 's8', name: 'MongoDB', category: 'database', iconName: 'MongoDB', proficiency: 82, order: 0 },
  { _id: 's9', name: 'SQL', category: 'database', iconName: 'SQL', proficiency: 78, order: 1 },
  // DevOps / Data
  { _id: 's10', name: 'Data Pipelines', category: 'devops', iconName: 'Pipeline', proficiency: 75, order: 0 },
  { _id: 's11', name: 'Cloud (AWS/GCP)', category: 'devops', iconName: 'Cloud', proficiency: 68, order: 1 },
  // Tools
  { _id: 's12', name: 'Git', category: 'tools', iconName: 'Git', proficiency: 90, order: 0 },
  { _id: 's13', name: 'DSA (Java)', category: 'tools', iconName: 'DSA', proficiency: 88, order: 1 },
  { _id: 's14', name: 'System Design', category: 'tools', iconName: 'Design', proficiency: 75, order: 2 },
];
