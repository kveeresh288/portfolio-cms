'use client';

import Image from 'next/image';
import { ExternalLink, Github, Star } from 'lucide-react';
import { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  compact?: boolean;
}

export default function ProjectCard({ project, compact = false }: ProjectCardProps) {
  return (
    <div className="group glass glass-hover rounded-2xl overflow-hidden flex flex-col h-full border border-white/10 hover:border-cyan-400/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10">
      {/* Image */}
      <div className={`relative overflow-hidden ${compact ? 'h-40' : 'h-52'}`}>
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />

        {project.featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-400/20 border border-amber-400/40 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Star size={10} fill="currentColor" />
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="font-heading font-bold text-white text-lg leading-tight group-hover:text-cyan-400 transition-colors">
          {project.title}
        </h3>

        <p className={`text-slate-400 text-sm leading-relaxed ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {project.tags.slice(0, compact ? 3 : 6).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > (compact ? 3 : 6) && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-500">
              +{project.tags.length - (compact ? 3 : 6)}
            </span>
          )}
        </div>

        {/* Links */}
        <div className="flex items-center gap-3 pt-1 border-t border-white/5 mt-1">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <Github size={14} />
              Code
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors ml-auto"
            >
              <ExternalLink size={14} />
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
