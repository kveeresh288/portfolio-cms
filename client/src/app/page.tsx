import { serverFetch } from '@/lib/api';
import { Project, Skill } from '@/lib/types';
import { MOCK_PROJECTS, MOCK_SKILLS } from '@/data/mock';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import Resources from '@/components/sections/Resources';
import Contact from '@/components/sections/Contact';

// Server Component — fetches live data with 60s ISR, falls back to mock data
export default async function HomePage() {
  const [projects, skills] = await Promise.all([
    serverFetch<Project[]>('/projects'),
    serverFetch<Skill[]>('/skills'),
  ]);

  return (
    <>
      <Hero />
      <About />
      <Skills skills={skills ?? MOCK_SKILLS} />
      <Projects projects={projects ?? MOCK_PROJECTS} />
      <Resources />
      <Contact />
    </>
  );
}
