import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User';
import Project from '../src/models/Project';
import Skill from '../src/models/Skill';
import SiteProfile from '../src/models/SiteProfile';

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log('✅ Connected to MongoDB');

  // Admin user
  const email = process.env.ADMIN_EMAIL!;
  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({
      email,
      password: process.env.ADMIN_PASSWORD!,
      mfaChannel: 'email',
      isMfaEnabled: false,
    });
    console.log(`✅ Admin user created: ${email}`);
    console.log('   MFA is disabled on first boot — log in and enable it from the dashboard');
  } else {
    console.log(`ℹ️  Admin user already exists: ${email}`);
  }

  // Site profile (singleton)
  const profileCount = await SiteProfile.countDocuments();
  if (profileCount === 0) {
    await SiteProfile.create({});
    console.log('✅ Default SiteProfile created');
  }

  // Sample projects
  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    await Project.insertMany([
      {
        title: 'SecureVault MFA',
        description: 'Production-ready Multi-Factor Authentication system supporting Email OTP, TOTP Authenticator, and WebAuthn Passkeys built on the MERN stack.',
        imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
        githubUrl: 'https://github.com/kveeresh288/SecureVault-MFA',
        liveUrl: '',
        tags: ['Node.js', 'Express', 'MongoDB', 'React', 'WebAuthn', 'TOTP'],
        featured: true,
        order: 0,
      },
      {
        title: 'Portfolio CMS',
        description: 'Full-stack Portfolio & CMS with Next.js 14 App Router frontend, MFA-protected admin panel, and RESTful Express API.',
        imageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80',
        githubUrl: 'https://github.com/kveeresh288/portfolio-cms',
        liveUrl: '',
        tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'MongoDB'],
        featured: true,
        order: 1,
      },
      {
        title: 'AI Identity Document Forgery Detector',
        description: 'AI-powered system to detect forged identity documents using computer vision and machine learning.',
        imageUrl: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&q=80',
        githubUrl: 'https://github.com/kveeresh288/AI-Identity-Document-Forgery-Detector',
        liveUrl: '',
        tags: ['Python', 'Machine Learning', 'Computer Vision', 'AI'],
        featured: false,
        order: 2,
      },
    ]);
    console.log('✅ Sample projects seeded');
  }

  // Sample skills
  const skillCount = await Skill.countDocuments();
  if (skillCount === 0) {
    await Skill.insertMany([
      { name: 'React', category: 'frontend', iconName: 'React', proficiency: 88, order: 0 },
      { name: 'Next.js', category: 'frontend', iconName: 'Next.js', proficiency: 85, order: 1 },
      { name: 'TypeScript', category: 'frontend', iconName: 'TypeScript', proficiency: 82, order: 2 },
      { name: 'Tailwind CSS', category: 'frontend', iconName: 'Tailwind', proficiency: 92, order: 3 },
      { name: 'Node.js', category: 'backend', iconName: 'Node.js', proficiency: 85, order: 0 },
      { name: 'Express', category: 'backend', iconName: 'Express', proficiency: 85, order: 1 },
      { name: 'Java', category: 'backend', iconName: 'Java', proficiency: 90, order: 2 },
      { name: 'MongoDB', category: 'database', iconName: 'MongoDB', proficiency: 82, order: 0 },
      { name: 'SQL', category: 'database', iconName: 'SQL', proficiency: 78, order: 1 },
      { name: 'Git', category: 'tools', iconName: 'Git', proficiency: 90, order: 0 },
      { name: 'DSA (Java)', category: 'tools', iconName: 'DSA', proficiency: 88, order: 1 },
      { name: 'System Design', category: 'tools', iconName: 'Design', proficiency: 75, order: 2 },
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
