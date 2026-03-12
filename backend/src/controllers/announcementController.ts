import { Request, Response } from 'express';
import sanitizeHtml from 'sanitize-html';
import Announcement from '../models/Announcement';
import ActivityLog from '../models/ActivityLog';
import { getIO } from '../utils/socket';

const buildQuery = (req: Request, opts: { includeDrafts: boolean }) => {
  const department = (req.query.department as string) || '';
  const priority = (req.query.priority as string) || '';
  const q: any = {};

  if (!opts.includeDrafts) q.published = true;
  if (department) q.$or = [{ department }, { department: { $exists: false } }, { department: null }, { department: '' }];
  if (priority && ['normal', 'important'].includes(priority)) q.priority = priority;

  return q;
};

export const listPublicAnnouncements = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = Math.max(0, parseInt(req.query.skip as string) || 0);

    const query = buildQuery(req, { includeDrafts: false });

    const announcements = await Announcement.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('-updatedBy');

    const total = await Announcement.countDocuments(query);
    res.json({ announcements, total });
  } catch {
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
};

export const listAdminAnnouncements = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = Math.max(0, parseInt(req.query.skip as string) || 0);
    const published = req.query.published as string | undefined;

    const query: any = buildQuery(req, { includeDrafts: true });
    if (published === 'true') query.published = true;
    if (published === 'false') query.published = false;

    const announcements = await Announcement.find(query)
      .sort({ date: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('createdBy', 'username name email role');

    const total = await Announcement.countDocuments(query);
    res.json({ announcements, total });
  } catch {
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const title = sanitizeHtml(req.body.title || '').trim();
    const description = sanitizeHtml(req.body.description || '').trim();
    const date = req.body.date ? new Date(req.body.date) : new Date();
    const department = sanitizeHtml(req.body.department || '').trim();
    const priority = req.body.priority === 'important' ? 'important' : 'normal';
    const published = Boolean(req.body.published);

    if (!title || !description) return res.status(400).json({ message: 'Title and description are required' });
    if (Number.isNaN(date.getTime())) return res.status(400).json({ message: 'Invalid date' });

    const actor = (req as any).user?._id;

    const announcement = await Announcement.create({
      title,
      description,
      date,
      department: department || undefined,
      priority,
      published,
      createdBy: actor,
      updatedBy: actor
    });

    await ActivityLog.create({
      user: actor,
      action: 'announcement.create',
      ip: req.ip,
      meta: { announcementId: announcement._id, title: announcement.title }
    });

    getIO()?.emit('announcements.updated', { action: 'create', id: announcement._id?.toString() });
    res.status(201).json(announcement);
  } catch {
    res.status(500).json({ message: 'Failed to create announcement' });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    if (req.body.title !== undefined) announcement.title = sanitizeHtml(req.body.title || '').trim();
    if (req.body.description !== undefined) announcement.description = sanitizeHtml(req.body.description || '').trim();
    if (req.body.department !== undefined) {
      const department = sanitizeHtml(req.body.department || '').trim();
      announcement.department = department || undefined;
    }
    if (req.body.priority !== undefined) {
      announcement.priority = req.body.priority === 'important' ? 'important' : 'normal';
    }
    if (req.body.date !== undefined) {
      const date = new Date(req.body.date);
      if (Number.isNaN(date.getTime())) return res.status(400).json({ message: 'Invalid date' });
      announcement.date = date;
    }
    if (req.body.published !== undefined) announcement.published = Boolean(req.body.published);

    announcement.updatedBy = (req as any).user?._id;
    await announcement.save();

    await ActivityLog.create({
      user: (req as any).user?._id,
      action: 'announcement.update',
      ip: req.ip,
      meta: { announcementId: announcement._id, title: announcement.title }
    });

    getIO()?.emit('announcements.updated', { action: 'update', id: announcement._id?.toString() });
    res.json(announcement);
  } catch {
    res.status(500).json({ message: 'Failed to update announcement' });
  }
};

export const publishAnnouncement = async (req: Request, res: Response) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    announcement.published = Boolean(req.body.published);
    announcement.updatedBy = (req as any).user?._id;
    await announcement.save();

    await ActivityLog.create({
      user: (req as any).user?._id,
      action: announcement.published ? 'announcement.publish' : 'announcement.unpublish',
      ip: req.ip,
      meta: { announcementId: announcement._id, title: announcement.title }
    });

    getIO()?.emit('announcements.updated', { action: 'publish', id: announcement._id?.toString(), published: announcement.published });
    res.json(announcement);
  } catch {
    res.status(500).json({ message: 'Failed to update publish status' });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    await Announcement.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      user: (req as any).user?._id,
      action: 'announcement.delete',
      ip: req.ip,
      meta: { announcementId: req.params.id, title: announcement.title }
    });

    getIO()?.emit('announcements.updated', { action: 'delete', id: req.params.id });
    res.json({ message: 'Announcement deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete announcement' });
  }
};
