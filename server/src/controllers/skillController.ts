import { Request, Response } from 'express';
import Skill from '../models/Skill';

export const getSkills = async (_req: Request, res: Response): Promise<void> => {
  try {
    const skills = await Skill.find().sort({ category: 1, order: 1 });
    res.json({ success: true, data: skills });
  } catch (err) {
    console.error('[getSkills]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const skill = await Skill.create(req.body);
    res.status(201).json({ success: true, data: skill });
  } catch (err) {
    console.error('[createSkill]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!skill) {
      res.status(404).json({ success: false, message: 'Skill not found' });
      return;
    }
    res.json({ success: true, data: skill });
  } catch (err) {
    console.error('[updateSkill]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) {
      res.status(404).json({ success: false, message: 'Skill not found' });
      return;
    }
    res.json({ success: true, message: 'Skill deleted' });
  } catch (err) {
    console.error('[deleteSkill]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
