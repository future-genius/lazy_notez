import { Request, Response } from 'express';
import Note from '../models/Note';
import sanitizeHtml from 'sanitize-html';

export const createNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const title = sanitizeHtml(req.body.title);
    const content = sanitizeHtml(req.body.content);
    const tags = req.body.tags?.map((t: string) => sanitizeHtml(t)) || [];
    
    const note = new Note({ user: userId, title, content, tags });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create note' });
  }
};

export const listNotes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = Math.max(0, parseInt(req.query.skip as string) || 0);
    
    const notes = await Note.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await Note.countDocuments({ user: userId });
    res.json({ notes, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
};

export const getNote = async (req: Request, res: Response) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.user.toString() !== (req as any).user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch note' });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.user.toString() !== (req as any).user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    if (req.body.title) note.title = sanitizeHtml(req.body.title);
    if (req.body.content) note.content = sanitizeHtml(req.body.content);
    if (req.body.tags) note.tags = req.body.tags.map((t: string) => sanitizeHtml(t));
    
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update note' });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    const isOwner = note.user.toString() === (req as any).user._id.toString();
    const isAdmin = (req as any).user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete note' });
  }
};
