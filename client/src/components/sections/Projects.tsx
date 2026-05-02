'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Project } from '@/lib/types';
import ProjectCard from '@/components/ui/ProjectCard';

export default function Projects({ projects }: { projects: Project[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="py-24" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-2">
            My Work
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-white">
            Featured <span className="text-gradient-cyan">Projects</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            A selection of projects I&apos;ve built — from security-focused backend systems to
            polished frontend experiences.
          </p>
        </motion.div>

        {/* Featured grid */}
        {featured.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {featured.map((project, i) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 32 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Other projects */}
        {rest.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((project, i) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
              >
                <ProjectCard project={project} compact />
              </motion.div>
            ))}
          </div>
        )}

        {projects.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center text-slate-500">
            No projects yet. Add some from the admin panel.
          </div>
        )}
      </div>
    </section>
  );
}
