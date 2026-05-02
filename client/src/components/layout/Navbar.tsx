'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#projects', label: 'Projects' },
  { href: '#resources', label: 'Notes' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/10 shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <nav className="section-container flex items-center justify-between h-16">
        <Link href="/" className="font-heading text-xl font-bold text-gradient-cyan tracking-tight">
          KV<span className="text-white/40">.</span>dev
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-200"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs glass glass-hover text-slate-400 hover:text-cyan-400 px-3 py-1.5 rounded-lg transition-all"
          >
            <Lock size={12} />
            Admin
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-slate-400 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-white/10">
          <ul className="section-container py-4 flex flex-col gap-3">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="block text-slate-300 hover:text-cyan-400 transition-colors py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors py-1"
                onClick={() => setMenuOpen(false)}
              >
                <Lock size={14} />
                Admin Panel
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
