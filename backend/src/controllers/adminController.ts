import { Request, Response } from 'express';
import ActivityLog from '../models/ActivityLog';
import About from '../models/About';
import Note from '../models/Note';
import User from '../models/User';
import Feedback from '../models/Feedback';
import sanitizeHtml from 'sanitize-html';
import { getIO } from '../utils/socket';

export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const skip = Math.max(0, parseInt(req.query.skip as string) || 0);
    
    const logs = await ActivityLog.find()
      .populate('user', 'username email')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
    
    const total = await ActivityLog.countDocuments();
    res.json({ logs, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch activity logs' });
  }
};

export const getSystemStats = async (_req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const totalNotes = await Note.countDocuments();
    const totalLogs = await ActivityLog.countDocuments();
    
    res.json({
      totalUsers,
      activeUsers,
      adminCount,
      totalNotes,
      totalLogs
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch system stats' });
  }
};

export const updateAbout = async (req: Request, res: Response) => {
  try {
    const title = sanitizeHtml(req.body.title);
    const content = sanitizeHtml(req.body.content);
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content required' });
    }
    
    let about = await About.findOne();
    if (!about) {
      about = new About({ title, content });
    } else {
      about.title = title;
      about.content = content;
    }
    
    await about.save();
    res.json(about);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update About' });
  }
};

export const getAbout = async (_req: Request, res: Response) => {
  try {
    const about = await About.findOne();
    res.json(about || { title: 'About', content: '' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch About' });
  }
};

export const deleteNoteAdmin = async (req: Request, res: Response) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete note' });
  }
};

export const clearActivityLogs = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.body.days) || 30;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const result = await ActivityLog.deleteMany({ createdAt: { $lt: cutoff } });
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear logs' });
  }
};

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Feedback message is required' });
    }

    const userId = (req as any).user?._id;
    const feedback = new Feedback({
      name: name || '',
      email: email || '',
      message: message.trim(),
      user: userId || undefined
    });

    await feedback.save();

    // Emit feedback event to all connected clients
    try {
      const io = getIO();
      if (io) {
        io.emit('feedback.submitted', {
          id: feedback._id,
          name: feedback.name,
          email: feedback.email,
          message: feedback.message,
          createdAt: feedback.createdAt
        });
      }
    } catch (e) {
      console.warn('Failed to emit feedback event', e);
    }

    res.status(201).json({ message: 'Feedback submitted', feedback });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};

export const listFeedback = async (_req: Request, res: Response) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name username email')
      .sort({ createdAt: -1 });
    res.json({ feedbacks, total: feedbacks.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
};

export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete feedback' });
  }
};

export const resyncUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 });

    // Emit all users to connected admins via socket
    try {
      const io = getIO();
      if (io) {
        const payload = users.map(u => ({
          _id: u._id,
          name: u.name,
          username: u.username,
          email: u.email,
          role: u.role,
          status: u.status,
          department: u.department,
          universityRegisterNumber: u.universityRegisterNumber,
          createdAt: u.createdAt
        }));
        io.emit('users.resync', payload);
      }
    } catch (e) {
      console.warn('Failed to emit resync event', e);
    }

    res.json({ message: 'Users resynced', users, total: users.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resync users' });
  }
};
