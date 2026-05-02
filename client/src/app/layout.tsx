import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'K Veeresh | Data Engineer & Full-Stack Developer',
  description:
    'CSE student (AIET 2026) and Data Engineer Intern at MyVoteLabs. Strong in DSA (Java), System Design, MERN Stack, and building scalable data pipelines.',
  keywords: [
    'K Veeresh', 'Data Engineer', 'Full-Stack Developer', 'MERN', 'Next.js',
    'TypeScript', 'Java', 'DSA', 'System Design', 'AIET', 'MyVoteLabs',
  ],
  authors: [{ name: 'K Veeresh' }],
  openGraph: {
    title: 'K Veeresh | Data Engineer & Full-Stack Developer',
    description: 'CSE student (AIET 2026) | Data Engineer Intern at MyVoteLabs | DSA • MERN • System Design',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="relative z-10">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d1224',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
            },
          }}
        />
      </body>
    </html>
  );
}
