'use client';

import { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Send, Mail, MapPin, Phone, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: 'kveeresh288@gmail.com',
    href: 'mailto:kveeresh288@gmail.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 76192 80422',
    href: 'tel:+917619280422',
  },
  {
    icon: MapPin,
    label: 'Current Location',
    value: 'HSR Layout, Bangalore',
    href: 'https://maps.app.goo.gl/rqKYTsb5eZy4pKKy7?g_st=aw',
    external: true,
  },
  {
    icon: MapPin,
    label: 'College',
    value: 'AIET · Moodbidri, Mangalore',
    href: null,
  },
];

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.trim().length < 10) e.message = 'Message too short';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await api.contact.send(form.name, form.email, form.message);
      toast.success("Message sent! I'll get back to you soon.");
      setForm({ name: '', email: '', message: '' });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof typeof form) =>
    `w-full glass px-4 py-3 rounded-xl text-white placeholder-slate-500 outline-none border transition-all duration-200 focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 ${
      errors[field] ? 'border-red-400/50' : 'border-white/10'
    }`;

  return (
    <section id="contact" className="py-24" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs text-cyan-400 font-semibold tracking-widest uppercase mb-2">
            Let&apos;s Talk
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-white">
            Get in <span className="text-gradient-cyan">Touch</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Have a project, opportunity, or just want to connect? Drop me a message and
            I&apos;ll respond within 24 hours.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-8 max-w-4xl mx-auto">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2 space-y-3"
          >
            {CONTACT_INFO.map(({ icon: Icon, label, value, href, external }) => (
              <div key={label} className="glass rounded-xl p-4 flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-lg bg-cyan-400/10 shrink-0">
                  <Icon size={15} className="text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      className="text-sm text-white mt-0.5 hover:text-cyan-400 transition-colors flex items-center gap-1 group"
                    >
                      {value}
                      {external && <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </a>
                  ) : (
                    <p className="text-sm text-white mt-0.5">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="md:col-span-3 glass rounded-2xl p-6 space-y-4"
            noValidate
          >
            <div>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputClass('name')}
              />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>
            <div>
              <input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={inputClass('email')}
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>
            <div>
              <textarea
                placeholder="Tell me about your project or opportunity..."
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                rows={5}
                className={`${inputClass('message')} resize-none`}
              />
              {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-bg bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 glow-cyan"
            >
              <Send size={16} />
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
