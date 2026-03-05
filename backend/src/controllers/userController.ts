import { Request, Response } from 'express';
import User from '../models/User';
import sanitizeHtml from 'sanitize-html';

export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 });
    res.json({ users, total: users.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshTokens');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    if (target.role === 'super_admin' && actor.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only super admin can modify this user' });
    }

    const updates: any = {};

    // Only allow specific fields to be updated
    if (req.body.name) updates.name = sanitizeHtml(req.body.name);
    if (req.body.email) updates.email = sanitizeHtml(req.body.email);
    if (req.body.role && ['super_admin', 'admin', 'faculty', 'student', 'user'].includes(req.body.role)) {
      if (req.body.role === 'super_admin' && actor.role !== 'super_admin') {
        return res.status(403).json({ message: 'Only super admin can assign super admin role' });
      }
      updates.role = req.body.role;
    }
    if (req.body.status && ['active', 'inactive'].includes(req.body.status)) updates.status = req.body.status;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password -refreshTokens');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    if (target.role === 'super_admin' && actor.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only super admin can delete this user' });
    }

    // Prevent deleting self
    if (req.params.id === actor._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};
