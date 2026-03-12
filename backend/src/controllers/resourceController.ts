import { Request, Response } from 'express';
import sanitizeHtml from 'sanitize-html';
import Resource from '../models/Resource';
import ActivityLog from '../models/ActivityLog';
import { getIO } from '../utils/socket';

const buildSort = (sortBy?: string) => {
  switch (sortBy) {
    case 'name':
      return { title: 1 };
    case 'most_downloaded':
      return { downloadCount: -1, createdAt: -1 };
    case 'recent':
    default:
      return { createdAt: -1 };
  }
};

export const createResource = async (req: Request, res: Response) => {
  try {
    const title = sanitizeHtml(req.body.title);
    const category = req.body.category === 'notes' || req.body.category === 'question_paper' || req.body.category === 'study_material'
      ? req.body.category
      : 'study_material';
    const description = sanitizeHtml(req.body.description || '');
    const tags = req.body.tags?.map((t: string) => sanitizeHtml(t)) || [];
    const department = sanitizeHtml(req.body.department);
    const semester = sanitizeHtml(req.body.semester);
    const subject = sanitizeHtml(req.body.subject);
    const googleDriveUrl = sanitizeHtml(req.body.googleDriveUrl);
    const uploadedBy = (req as any).user?._id;
    const uploadedByName = sanitizeHtml(req.body.uploadedByName || (req as any).user?.name || 'Admin');

    const resource = new Resource({
      title,
      category,
      description,
      tags,
      department,
      semester,
      subject,
      googleDriveUrl,
      uploadedBy,
      uploadedByName,
      uploadDate: new Date()
    });
    await resource.save();

    await ActivityLog.create({
      user: uploadedBy,
      action: 'resource.create',
      ip: req.ip,
      meta: { resourceId: resource._id, title: resource.title }
    });

    getIO()?.emit('resources.updated', { action: 'create', id: resource._id?.toString() });
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create resource' });
  }
};

export const listResources = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = Math.max(0, parseInt(req.query.skip as string) || 0);
    const department = (req.query.department as string) || '';
    const semester = (req.query.semester as string) || '';
    const subject = (req.query.subject as string) || '';
    const search = (req.query.search as string) || '';
    const sortBy = (req.query.sortBy as string) || 'recent';
    const category = (req.query.category as string) || '';

    const query: any = {};
    if (department) query.department = department;
    if (semester) query.semester = semester;
    if (subject) query.subject = subject;
    if (category && ['notes', 'question_paper', 'study_material'].includes(category)) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const resources = await Resource.find(query)
      .sort(buildSort(sortBy))
      .limit(limit)
      .skip(skip)
      .populate('uploadedBy', 'username name email');

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

    const requester = (req as any).user;
    const isOwner = resource.uploadedBy?.toString() === requester._id.toString();
    const isAdmin = requester.role === 'admin' || requester.role === 'super_admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

    if (req.body.title) resource.title = sanitizeHtml(req.body.title);
    if (req.body.category && ['notes', 'question_paper', 'study_material'].includes(req.body.category)) {
      (resource as any).category = req.body.category;
    }
    if (req.body.description !== undefined) resource.description = sanitizeHtml(req.body.description || '');
    if (req.body.department) resource.department = sanitizeHtml(req.body.department);
    if (req.body.semester) resource.semester = sanitizeHtml(req.body.semester);
    if (req.body.subject) resource.subject = sanitizeHtml(req.body.subject);
    if (req.body.googleDriveUrl) resource.googleDriveUrl = sanitizeHtml(req.body.googleDriveUrl);
    if (req.body.uploadedByName) resource.uploadedByName = sanitizeHtml(req.body.uploadedByName);
    if (req.body.tags) resource.tags = req.body.tags.map((t: string) => sanitizeHtml(t));

    await resource.save();
    getIO()?.emit('resources.updated', { action: 'update', id: resource._id?.toString() });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update resource' });
  }
};

export const deleteResource = async (req: Request, res: Response) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const requester = (req as any).user;
    const isOwner = resource.uploadedBy?.toString() === requester._id.toString();
    const isAdmin = requester.role === 'admin' || requester.role === 'super_admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Forbidden' });

    await Resource.findByIdAndDelete(req.params.id);
    await ActivityLog.create({
      user: requester._id,
      action: 'resource.delete',
      ip: req.ip,
      meta: { resourceId: req.params.id, title: resource.title }
    });

    getIO()?.emit('resources.updated', { action: 'delete', id: req.params.id });
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete resource' });
  }
};

export const trackResourceDownload = async (req: Request, res: Response) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    resource.downloadCount += 1;
    await resource.save();

    await ActivityLog.create({
      user: (req as any).user?._id,
      action: 'resource.download',
      ip: req.ip,
      meta: { resourceId: resource._id, title: resource.title }
    });

    res.json({
      downloadCount: resource.downloadCount,
      googleDriveUrl: resource.googleDriveUrl
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to track download' });
  }
};
