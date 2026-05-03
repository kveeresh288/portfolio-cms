import { DEFAULT_PROFILE, Project, Skill, SiteProfile } from '@/lib/types';
import { MOCK_PROJECTS, MOCK_SKILLS } from '@/data/mock';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import Resources from '@/components/sections/Resources';
import Contact from '@/components/sections/Contact';

// Fetch data directly from MongoDB in the Server Component (no HTTP hop)
async function getData() {
  try {
    const { connectDB } = await import('@/lib/db');
    const { Project: ProjectModel, Skill: SkillModel, SiteProfile: ProfileModel } = await import('@/lib/serverModels');
    await connectDB();

    const [projects, skills, profile] = await Promise.all([
      ProjectModel().find().sort({ featured: -1, order: 1, createdAt: -1 }).lean(),
      SkillModel().find().sort({ category: 1, order: 1 }).lean(),
      ProfileModel().findOne().lean(),
    ]);

    return {
      projects: JSON.parse(JSON.stringify(projects)) as Project[],
      skills: JSON.parse(JSON.stringify(skills)) as Skill[],
      profile: (profile ? JSON.parse(JSON.stringify(profile)) : null) as SiteProfile | null,
    };
  } catch {
    // DB not configured yet — fall back to mock data
    return { projects: null, skills: null, profile: null };
  }
}

export const revalidate = 60; // ISR — re-fetch every 60 seconds

export default async function HomePage() {
  const { projects, skills, profile } = await getData();
  const p = profile ?? DEFAULT_PROFILE;

  return (
    <>
      <Navbar profile={p} />
      <main>
        <Hero profile={p} />
        <About profile={p} />
        <Skills skills={skills ?? MOCK_SKILLS} />
        <Projects projects={projects ?? MOCK_PROJECTS} />
        <Resources />
        <Contact profile={p} />
      </main>
      <Footer profile={p} />
    </>
  );
}
