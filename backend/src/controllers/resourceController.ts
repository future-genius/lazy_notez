import { Request, Response } from 'express';
import Resource from '../models/Resource';
import sanitizeHtml from 'sanitize-html';

export const createResource = async (req: Request, res: Response) => {
  try {
    const title = sanitizeHtml(req.body.title);
    const description = sanitizeHtml(req.body.description || '');
    const url = req.body.url; // URL validation done by express-validator
    const tags = req.body.tags?.map((t: string) => sanitizeHtml(t)) || [];
    const uploadedBy = (req as any).user?._id;
    
    const resource = new Resource({ title, description, url, tags, uploadedBy });
    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create resource' });
  }
};

export const listResources = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = Math.max(0, parseInt(req.query.skip as string) || 0);
    const tag = req.query.tag as string;
    
    const query = tag ? { tags: tag } : {};
    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('uploadedBy', 'username');
    
    const total = await Resource.countDocuments(query);
    res.json({ resources, total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};

export const updateResource = async (req: Request, res: Response) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    
    // Only uploader or admin can update
    if (resource.uploadedBy?.toString() !== (req as any).user._id.toString() && (req as any).user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    if (req.body.title) resource.title = sanitizeHtml(req.body.title);
    if (req.body.description) resource.description = sanitizeHtml(req.body.description);
    if (req.body.url) resource.url = req.body.url;
    if (req.body.tags) resource.tags = req.body.tags.map((t: string) => sanitizeHtml(t));
    
    await resource.save();
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update resource' });
  }
};

export const deleteResource = async (req: Request, res: Response) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    
    // Only uploader or admin can delete
    if (resource.uploadedBy?.toString() !== (req as any).user._id.toString() && (req as any).user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete resource' });
  }
};
