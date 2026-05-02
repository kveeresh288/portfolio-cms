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
