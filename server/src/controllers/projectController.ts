import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project';

// Whitelist prevents mass-assignment — only these fields ever touch the DB
const ALLOWED_FIELDS = [
  'title', 'description', 'imageUrl', 'githubUrl', 'liveUrl', 'tags', 'featured', 'order',
] as const;

type AllowedField = typeof ALLOWED_FIELDS[number];

function pickAllowed(body: Record<string, unknown>): Partial<Record<AllowedField, unknown>> {
  return Object.fromEntries(
    Object.entries(body).filter(([k]) => (ALLOWED_FIELDS as readonly string[]).includes(k))
  ) as Partial<Record<AllowedField, unknown>>;
}

// Converts Mongoose errors to clean 400 responses; returns true if handled
function handleMongooseError(err: unknown, res: Response): boolean {
  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    res.status(400).json({ success: false, message });
    return true;
  }
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ success: false, message: `Invalid value for field "${err.path}"` });
    return true;
  }
  return false;
}

// GET /api/projects?featured=true
export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.featured === 'true') filter.featured = true;

    const projects = await Project.find(filter).sort({ featured: -1, order: 1, createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (err) {
    console.error('[getProjects]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/projects/:id
export const getProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.json({ success: true, data: project });
  } catch (err) {
    if (handleMongooseError(err, res)) return;
    console.error('[getProject]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/projects  (protected)
export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = pickAllowed(req.body);

    if (!data.title || !data.description || !data.imageUrl) {
      res.status(400).json({
        success: false,
        message: 'title, description, and imageUrl are required',
      });
      return;
    }

    const project = await Project.create(data);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    if (handleMongooseError(err, res)) return;
    console.error('[createProject]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/projects/:id  (protected)
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = pickAllowed(req.body);

    if (Object.keys(data).length === 0) {
      res.status(400).json({ success: false, message: 'No valid fields provided' });
      return;
    }

    const project = await Project.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.json({ success: true, data: project });
  } catch (err) {
    if (handleMongooseError(err, res)) return;
    console.error('[updateProject]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/projects/:id  (protected)
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    if (handleMongooseError(err, res)) return;
    console.error('[deleteProject]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
