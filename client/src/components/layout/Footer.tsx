import { Github, Linkedin, Mail, Phone } from 'lucide-react';

const SOCIALS = [
  { icon: Github, href: 'https://github.com/kveeresh288', label: 'GitHub' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/veeresh-k-41107b25b/', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:kveeresh288@gmail.com', label: 'Email' },
  { icon: Phone, href: 'tel:+917619280422', label: 'Phone' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 mt-20">
      <div className="section-container flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-heading font-bold text-gradient-cyan text-lg">KV.dev</p>
          <p className="text-xs text-slate-500 mt-0.5">K Veeresh — CSE @ AIET 2026</p>
        </div>

        <div className="flex items-center gap-4">
          {SOCIALS.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              aria-label={label}
              className="text-slate-500 hover:text-cyan-400 transition-colors duration-200"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>

        <p className="text-xs text-slate-500">
          &copy; {new Date().getFullYear()} K Veeresh. Built with Next.js &amp; ❤️
        </p>
      </div>
    </footer>
  );
}
