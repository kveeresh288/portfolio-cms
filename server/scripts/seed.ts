import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User';
import Project from '../src/models/Project';
import Skill from '../src/models/Skill';

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log('✅ Connected to MongoDB');

  // Admin user
  const email = process.env.ADMIN_EMAIL!;
  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({ email, password: process.env.ADMIN_PASSWORD!, isTotpEnabled: false });
    console.log(`✅ Admin user created: ${email}`);
  } else {
    console.log(`ℹ️  Admin user already exists: ${email}`);
  }

  // Sample projects
  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    await Project.insertMany([
      {
        title: 'SecureVault MFA',
        description: 'A production-ready Multi-Factor Authentication system supporting Email OTP, TOTP, and WebAuthn Passkeys built with MERN stack.',
        imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
        githubUrl: 'https://github.com',
        liveUrl: '',
        tags: ['Node.js', 'Express', 'MongoDB', 'React', 'WebAuthn', 'TOTP'],
        featured: true,
        order: 0,
      },
      {
        title: 'Portfolio CMS',
        description: 'This very app — a full-stack Portfolio & Content Management System with a Next.js 14 frontend and a secured admin panel.',
        imageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80',
        githubUrl: 'https://github.com',
        liveUrl: '',
        tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'MongoDB'],
        featured: true,
        order: 1,
      },
    ]);
    console.log('✅ Sample projects seeded');
  }

  // Sample skills
  const skillCount = await Skill.countDocuments();
  if (skillCount === 0) {
    await Skill.insertMany([
      { name: 'React', category: 'frontend', iconName: 'React', proficiency: 90, order: 0 },
      { name: 'Next.js', category: 'frontend', iconName: 'Next.js', proficiency: 85, order: 1 },
      { name: 'TypeScript', category: 'frontend', iconName: 'TypeScript', proficiency: 85, order: 2 },
      { name: 'Tailwind CSS', category: 'frontend', iconName: 'Tailwind', proficiency: 95, order: 3 },
      { name: 'Node.js', category: 'backend', iconName: 'Node.js', proficiency: 88, order: 0 },
      { name: 'Express', category: 'backend', iconName: 'Express', proficiency: 88, order: 1 },
      { name: 'MongoDB', category: 'database', iconName: 'MongoDB', proficiency: 82, order: 0 },
      { name: 'Docker', category: 'devops', iconName: 'Docker', proficiency: 70, order: 0 },
      { name: 'Git', category: 'tools', iconName: 'Git', proficiency: 90, order: 0 },
    ]);
    console.log('✅ Sample skills seeded');
  }

  await mongoose.disconnect();
  console.log('🎉 Seed complete');
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
