import { Github, Linkedin, Mail, Phone, Twitter } from 'lucide-react';
import { SiteProfile } from '@/lib/types';

export default function Footer({ profile }: { profile: SiteProfile }) {
  const { social, contact } = profile;
  const initials = profile.hero.name.split(' ').map((w) => w[0]).join('').toUpperCase();

  const SOCIALS = [
    social.github && { icon: Github, href: social.github, label: 'GitHub' },
    social.linkedin && { icon: Linkedin, href: social.linkedin, label: 'LinkedIn' },
    social.twitter && { icon: Twitter, href: social.twitter, label: 'Twitter' },
    contact.email && { icon: Mail, href: `mailto:${contact.email}`, label: 'Email', external: false },
    contact.phone && {
      icon: Phone,
      href: `tel:${contact.phone.replace(/\s/g, '')}`,
      label: 'Phone',
      external: false,
    },
  ].filter(Boolean) as { icon: React.FC<{ size: number }>; href: string; label: string; external?: boolean }[];

  return (
    <footer className="border-t border-white/10 py-10 mt-20">
      <div className="section-container flex flex-col sm:flex-row items-center justify-between gap-5">
        <div>
          <p className="font-heading font-bold text-gradient-cyan text-lg">{initials}.dev</p>
          <p className="text-xs text-slate-500 mt-0.5">{profile.hero.name} — CSE @ AIET 2026</p>
        </div>

        <div className="flex items-center gap-4">
          {SOCIALS.map(({ icon: Icon, href, label, external = true }) => (
            <a
              key={label}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              aria-label={label}
              className="text-slate-500 hover:text-cyan-400 transition-colors duration-200"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>

        <p className="text-xs text-slate-500 text-center sm:text-right">
          &copy; {new Date().getFullYear()} {profile.hero.name}. Built with Next.js
        </p>
      </div>
    </footer>
  );
}
