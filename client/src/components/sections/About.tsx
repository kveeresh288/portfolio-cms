'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Code2, Database, Shield, Users, Briefcase, GraduationCap, MapPin } from 'lucide-react';
import { SiteProfile } from '@/lib/types';

const HIGHLIGHTS = [
  { icon: Code2, label: 'DSA & Java', color: 'text-cyan-400' },
  { icon: Database, label: 'Data Engineering', color: 'text-purple-400' },
  { icon: Shield, label: 'MERN Stack', color: 'text-emerald-400' },
  { icon: Users, label: 'System Design', color: 'text-amber-400' },
];

export default function About({ profile }: { profile: SiteProfile }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const { about, contact, social } = profile;
  const name = profile.hero.name;
  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase();

  const TIMELINE = [
    {
      icon: Briefcase,
      color: 'text-cyan-400',
      border: 'border-cyan-400/30',
      title: 'Data Engineer Intern',
      org: `MyVoteLabs · ${contact.workLocation}`,
      orgUrl: 'https://myvotelabs.com',
      desc: 'Building scalable data pipelines and cloud-based solutions for political analytics.',
      mapUrl: contact.workMapsUrl || null,
    },
    {
      icon: GraduationCap,
      color: 'text-purple-400',
      border: 'border-purple-400/30',
      title: 'B.E. Computer Science Engineering',
      org: contact.college,
      orgUrl: null,
      desc: 'Graduating June 2026. Strong in DSA, OS, DBMS, and Software Engineering.',
      mapUrl: null,
    },
  ];

  return (
    <section id="about" className="py-20 sm:py-24" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-14"
        >
          <p className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-2">About Me</p>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black text-white">
            Who I <span className="text-gradient-cyan">Am</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10 sm:gap-12 items-start">
          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-5"
          >
            {/* Avatar row */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xl sm:text-2xl font-heading font-black text-bg shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-lg sm:text-xl font-heading font-bold text-white">{name}</p>
                <p className="text-sm text-cyan-400">CSE @ AIET 2026 · Data Engineer Intern</p>
              </div>
            </div>

            {about.bio.map((para, i) => (
              <p key={i} className={i === 0 ? 'text-slate-300 text-base leading-relaxed' : 'text-slate-400 leading-relaxed'}>
                {para}
              </p>
            ))}

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {HIGHLIGHTS.map(({ icon: Icon, label, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="glass glass-hover rounded-xl p-3 sm:p-4 flex items-center gap-3"
                >
                  <Icon size={16} className={color} />
                  <span className="text-xs sm:text-sm text-slate-300 font-medium">{label}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              {social.github && (
                <a href={social.github} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors">
                  GitHub →
                </a>
              )}
              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors">
                  LinkedIn →
                </a>
              )}
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {TIMELINE.map(({ icon: Icon, color, border, title, org, orgUrl, desc, mapUrl }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.1 }}
                className={`glass rounded-2xl p-4 sm:p-5 border ${border}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-xl bg-white/5 shrink-0">
                    <Icon size={15} className={color} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm leading-snug">{title}</p>
                    {orgUrl ? (
                      <a
                        href={orgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cyan-400 hover:text-cyan-300 mt-0.5 inline-flex items-center gap-1 transition-colors group"
                      >
                        {org}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                      </a>
                    ) : (
                      <p className="text-xs text-slate-400 mt-0.5">{org}</p>
                    )}
                    {desc && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{desc}</p>}
                    {mapUrl && (
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-400 mt-2 transition-colors">
                        <MapPin size={10} /> View on Maps
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
