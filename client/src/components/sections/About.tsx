'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Code2, Shield, Database, Users, MapPin, GraduationCap, Briefcase } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: Code2, label: 'DSA & Java', color: 'text-cyan-400' },
  { icon: Database, label: 'Data Engineering', color: 'text-purple-400' },
  { icon: Shield, label: 'MERN Stack', color: 'text-emerald-400' },
  { icon: Users, label: 'System Design', color: 'text-amber-400' },
];

const TIMELINE = [
  {
    icon: Briefcase,
    color: 'text-cyan-400',
    border: 'border-cyan-400/30',
    title: 'Data Engineer Intern',
    org: 'MyVoteLabs, HSR Layout · Bangalore',
    desc: 'Building scalable data pipelines and cloud-based solutions for political analytics. Agile remote environment.',
    mapUrl: 'https://maps.app.goo.gl/rqKYTsb5eZy4pKKy7?g_st=aw',
  },
  {
    icon: GraduationCap,
    color: 'text-purple-400',
    border: 'border-purple-400/30',
    title: 'B.E. Computer Science Engineering',
    org: "Alva's Institute of Engineering & Technology (AIET) · Moodbidri, Mangalore",
    desc: 'Graduating June 2026. Strong foundation in DSA, Operating Systems, DBMS, and Software Engineering.',
    mapUrl: null,
  },
  {
    icon: MapPin,
    color: 'text-pink-400',
    border: 'border-pink-400/30',
    title: 'Home Base',
    org: 'Siruguppa, Ballari dist · Karnataka 583121',
    desc: null,
    mapUrl: null,
  },
];

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" className="py-24" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <p className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-2">About Me</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-white">
            Who I <span className="text-gradient-cyan">Am</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Bio + highlights */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-2xl font-heading font-black text-bg shrink-0">
                KV
              </div>
              <div>
                <p className="text-xl font-heading font-bold text-white">K Veeresh</p>
                <p className="text-sm text-cyan-400">CSE @ AIET 2026 · Data Engineer Intern</p>
              </div>
            </div>

            <p className="text-slate-300 text-base leading-relaxed">
              Computer Science Engineering student at{' '}
              <span className="text-white font-medium">Alva&apos;s Institute of Engineering &amp; Technology</span>{' '}
              (graduating 2026), with a strong foundation in Data Structures &amp; Algorithms (Java),
              System Design, and Full-Stack Development (MERN).
            </p>
            <p className="text-slate-400 leading-relaxed">
              Currently working as a{' '}
              <span className="text-cyan-400 font-medium">Software Engineer Intern at MyVoteLabs</span>,
              building data pipelines and cloud-based solutions for political analytics platforms.
              Passionate about applying algorithmic thinking to real-world, scalable systems.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {HIGHLIGHTS.map(({ icon: Icon, label, color }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="glass glass-hover rounded-xl p-4 flex items-center gap-3"
                >
                  <Icon size={18} className={color} />
                  <span className="text-sm text-slate-300 font-medium">{label}</span>
                </motion.div>
              ))}
            </div>

            <a
              href="#contact"
              className="inline-block mt-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4"
            >
              Let&apos;s work together →
            </a>
          </motion.div>

          {/* Timeline / locations */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {TIMELINE.map(({ icon: Icon, color, border, title, org, desc, mapUrl }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.1 }}
                className={`glass rounded-2xl p-5 border ${border}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-2 rounded-xl bg-white/5 shrink-0`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm leading-snug">{title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{org}</p>
                    {desc && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{desc}</p>}
                    {mapUrl && (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-2 transition-colors"
                      >
                        <MapPin size={11} />
                        View on Maps
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
