'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Skill, CATEGORY_LABELS, SkillCategory } from '@/lib/types';

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  frontend: 'from-cyan-400 to-teal-400',
  backend: 'from-purple-400 to-violet-400',
  database: 'from-emerald-400 to-green-400',
  devops: 'from-orange-400 to-amber-400',
  tools: 'from-pink-400 to-rose-400',
  other: 'from-slate-400 to-slate-300',
};

const CATEGORY_BORDER: Record<SkillCategory, string> = {
  frontend: 'border-cyan-400/30',
  backend: 'border-purple-400/30',
  database: 'border-emerald-400/30',
  devops: 'border-orange-400/30',
  tools: 'border-pink-400/30',
  other: 'border-slate-400/30',
};

function SkillCard({ skill, delay }: { skill: Skill; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className={`glass glass-hover rounded-xl p-4 border ${CATEGORY_BORDER[skill.category]}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-white">{skill.name}</span>
        <span className="text-xs text-slate-500">{skill.proficiency}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${skill.proficiency}%` }}
          transition={{ duration: 0.8, delay: delay + 0.2, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-r ${CATEGORY_COLORS[skill.category]}`}
        />
      </div>
    </motion.div>
  );
}

export default function Skills({ skills }: { skills: Skill[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const grouped = skills.reduce<Partial<Record<SkillCategory, Skill[]>>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category]!.push(skill);
    return acc;
  }, {});

  // Marquee — duplicate array for seamless loop
  const allSkillNames = [...skills, ...skills].map((s) => s.name);

  return (
    <section id="skills" className="py-24" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-2">
            What I Know
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-white">
            Tech <span className="text-gradient-cyan">Stack</span>
          </h2>
        </motion.div>

        {/* Scrolling marquee */}
        <div className="overflow-hidden mb-14 py-2 mask-gradient">
          <div className="flex gap-4 animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
            {allSkillNames.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="glass px-4 py-2 rounded-full text-sm text-slate-300 border border-white/10 flex-shrink-0"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Grouped skills */}
        {(Object.keys(grouped) as SkillCategory[]).map((category, ci) => (
          <div key={category} className="mb-10">
            <motion.h3
              initial={{ opacity: 0, x: -16 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: ci * 0.1 }}
              className={`text-sm font-bold uppercase tracking-widest mb-4 bg-gradient-to-r ${CATEGORY_COLORS[category]} bg-clip-text text-transparent`}
            >
              {CATEGORY_LABELS[category]}
            </motion.h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {grouped[category]!.map((skill, i) => (
                <SkillCard
                  key={skill._id}
                  skill={skill}
                  delay={isInView ? ci * 0.05 + i * 0.06 : 0}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
