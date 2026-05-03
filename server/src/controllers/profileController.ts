import { Request, Response } from 'express';
import SiteProfile from '../models/SiteProfile';

// GET /api/profile — public
export const getProfile = async (_req: Request, res: Response): Promise<void> => {
  try {
    let profile = await SiteProfile.findOne();
    if (!profile) {
      // First visit — create the singleton with schema defaults
      profile = await SiteProfile.create({});
    }
    res.json({ success: true, data: profile });
  } catch (err) {
    console.error('[getProfile]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/profile — protected (deep-merge partial updates)
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    let profile = await SiteProfile.findOne();
    if (!profile) profile = new SiteProfile({});

    // Deep-merge each top-level section if provided in request body
    const { hero, about, contact, social } = req.body;
    if (hero) Object.assign(profile.hero, hero);
    if (about) Object.assign(profile.about, about);
    if (contact) Object.assign(profile.contact, contact);
    if (social) Object.assign(profile.social, social);

    await profile.save();
    res.json({ success: true, data: profile });
  } catch (err) {
    console.error('[updateProfile]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
