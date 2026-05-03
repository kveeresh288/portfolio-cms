import { serverFetch } from '@/lib/api';
import { Project, Skill, SiteProfile, DEFAULT_PROFILE } from '@/lib/types';
import { MOCK_PROJECTS, MOCK_SKILLS } from '@/data/mock';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import Resources from '@/components/sections/Resources';
import Contact from '@/components/sections/Contact';

export default async function HomePage() {
  const [projects, skills, profile] = await Promise.all([
    serverFetch<Project[]>('/projects'),
    serverFetch<Skill[]>('/skills'),
    serverFetch<SiteProfile>('/profile'),
  ]);

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
