import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#050816',
        surface: '#0d1224',
        'glass': 'rgba(255,255,255,0.05)',
        accent: {
          cyan: '#06b6d4',
          purple: '#8b5cf6',
          pink: '#ec4899',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient':
          'radial-gradient(ellipse at 50% 50%, rgba(6,182,212,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.08) 0%, transparent 50%)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        marquee: 'marquee 30s linear infinite',
        'glow-cyan': 'glowCyan 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        glowCyan: {
          '0%': { boxShadow: '0 0 8px rgba(6,182,212,0.4)' },
          '100%': { boxShadow: '0 0 24px rgba(6,182,212,0.8), 0 0 48px rgba(6,182,212,0.3)' },
        },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};

export default config;
