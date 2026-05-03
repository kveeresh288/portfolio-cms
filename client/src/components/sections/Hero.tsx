'use client';

import { motion } from 'framer-motion';
import { ArrowDown, Github, Linkedin } from 'lucide-react';
import { SiteProfile } from '@/lib/types';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Hero({ profile }: { profile: SiteProfile }) {
  const { hero, social } = profile;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `linear-gradient(rgba(6,182,212,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6,182,212,0.4) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating orbs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/3 right-1/4 w-64 sm:w-80 h-64 sm:h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"
      />

      <div className="section-container text-center relative z-10 pt-20 w-full">
        {/* Badge */}
        <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
          <span className="text-xs text-slate-400 font-medium tracking-wide">{hero.badge}</span>
        </motion.div>

        {/* Name */}
        <motion.h1
          {...fadeUp(0.2)}
          className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-4"
        >
          <span className="text-white">Hi, I&apos;m </span>
          <span className="text-gradient">{hero.name}</span>
        </motion.h1>

        {/* Role ticker */}
        {hero.roles.length > 0 && (
          <motion.div {...fadeUp(0.35)} className="h-9 sm:h-10 overflow-hidden mb-6">
            {hero.roles.map((role, i) => (
              <motion.p
                key={role}
                initial={{ y: 0 }}
                animate={{ y: `-${(i / hero.roles.length) * 100}%` }}
                transition={{
                  duration: 0.5,
                  delay: 1.5 + i * 2,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatDelay: hero.roles.length * 2 - 0.5,
                }}
                className="text-lg sm:text-xl md:text-2xl font-semibold text-cyan-400 h-9 sm:h-10 flex items-center justify-center"
              >
                {role}
              </motion.p>
            ))}
          </motion.div>
        )}

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.45)}
          className="max-w-xl sm:max-w-2xl mx-auto text-slate-400 text-base sm:text-lg md:text-xl leading-relaxed mb-10"
        >
          {hero.subtitle}
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.55)} className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <a
            href="#projects"
            className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold text-sm text-bg bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 transition-all duration-300 glow-cyan"
          >
            View My Work
          </a>
          <a
            href="#contact"
            className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold text-sm glass glass-hover text-white border border-white/20 hover:border-cyan-400/50 transition-all duration-300"
          >
            Get in Touch
          </a>
          {social.github && (
            <a
              href={social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 sm:p-3.5 rounded-xl glass glass-hover text-slate-400 hover:text-white"
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
          )}
          {social.linkedin && (
            <a
              href={social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 sm:p-3.5 rounded-xl glass glass-hover text-slate-400 hover:text-white"
              aria-label="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
          )}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          {...fadeUp(0.8)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
        >
          <span className="text-xs tracking-widest uppercase hidden sm:block">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ArrowDown size={16} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
