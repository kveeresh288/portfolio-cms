'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Github, ExternalLink, BookOpen, FolderOpen } from 'lucide-react';

interface Resource {
  title: string;
  description: string;
  source: string;
  sourceIcon: typeof Github;
  sourceLabel: string;
  href: string;
  tags: string[];
  accent: string;
  accentBorder: string;
}

const RESOURCES: Resource[] = [
  {
    title: 'Computer Science — Algorithms365',
    description:
      'Comprehensive DSA & CS fundamentals notes built from the Algorithms365 course. Covers arrays, trees, graphs, dynamic programming, system design, and more from scratch to advanced.',
    source: 'GitHub',
    sourceIcon: Github,
    sourceLabel: 'View on GitHub',
    href: 'https://github.com/kveeresh288/Computer-Science',
    tags: ['DSA', 'System Design', 'Algorithms', 'Data Structures', 'Algorithms365'],
    accent: 'from-cyan-400 to-teal-400',
    accentBorder: 'border-cyan-400/30',
  },
  {
    title: 'Apna College DSA Notes — GitHub',
    description:
      "Hand-crafted DSA notes following Apna College's Java DSA course. Structured topic-wise from basics to advanced with code examples and problem-solving patterns.",
    source: 'GitHub',
    sourceIcon: Github,
    sourceLabel: 'View on GitHub',
    href: 'https://github.com/kveeresh288/ApnaCollege-DSA-Notes',
    tags: ['DSA', 'Java', 'Apna College', 'Problem Solving', 'Algorithms'],
    accent: 'from-purple-400 to-violet-400',
    accentBorder: 'border-purple-400/30',
  },
  {
    title: 'Apna College DSA Notes — Drive',
    description:
      'Full written DSA notes from the Apna College Java DSA course in Google Drive. Includes handwritten explanations, diagrams, and revision sheets for quick reference.',
    source: 'Drive',
    sourceIcon: FolderOpen,
    sourceLabel: 'Open in Drive',
    href: 'https://drive.google.com/drive/folders/1JoautfR0jew2KElDnQIgz5silUp7aofr',
    tags: ['DSA', 'Java', 'Apna College', 'Notes', 'Handwritten'],
    accent: 'from-emerald-400 to-green-400',
    accentBorder: 'border-emerald-400/30',
  },
];

export default function Resources() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="resources" className="py-24" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-2">
            Learning Resources
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-white">
            DSA <span className="text-gradient-cyan">Notes</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Scratch-to-advanced DSA notes I built while studying with{' '}
            <span className="text-white">Apna College</span> and{' '}
            <span className="text-white">Algorithms365</span>. Fully open — feel free to use them.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {RESOURCES.map((res, i) => {
            const SrcIcon = res.sourceIcon;
            return (
              <motion.a
                key={res.title}
                href={res.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 32 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className={`group glass rounded-2xl border ${res.accentBorder} p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${res.accent} flex items-center justify-center shrink-0`}>
                  <BookOpen size={18} className="text-bg" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-white text-base leading-snug mb-2 group-hover:text-cyan-400 transition-colors">
                    {res.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                    {res.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {res.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Link label */}
                <div className={`flex items-center gap-2 text-xs font-semibold bg-gradient-to-r ${res.accent} bg-clip-text text-transparent`}>
                  <SrcIcon size={13} className="text-slate-400" />
                  {res.sourceLabel}
                  <ExternalLink size={11} className="text-slate-500 ml-auto" />
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
