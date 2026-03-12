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
    const uploadedByEmail = sanitizeHtml(req.body.uploadedByEmail || (req as any).user?.email || '').trim().toLowerCase();
    const uploadedByUserId = sanitizeHtml(req.body.uploadedByUserId || '').trim();

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
      uploadedByEmail: uploadedByEmail || undefined,
      uploadedByUserId: uploadedByUserId || undefined,
      approved: true,
      approvedAt: new Date(),
      approvedBy: uploadedBy || undefined,
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
    query.approved = true;
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

export const listAdminResources = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 200, 500);
    const skip = Math.max(0, parseInt(req.query.skip as string) || 0);
    const approved = (req.query.approved as string) || '';

    const query: any = {};
    if (approved === 'true') query.approved = true;
    if (approved === 'false') query.approved = false;

    const resources = await Resource.find(query)
      .sort({ approved: 1, createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Resource.countDocuments(query);
    res.json({ resources, total });
  } catch {
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};

export const listMyResources = async (req: Request, res: Response) => {
  try {
    const uploadedByUserId = sanitizeHtml((req.query.uploadedByUserId as string) || '').trim();
    const uploadedByEmail = sanitizeHtml((req.query.uploadedByEmail as string) || '').trim().toLowerCase();
    if (!uploadedByUserId || !uploadedByEmail) return res.status(400).json({ message: 'Missing identity' });

    const resources = await Resource.find({ uploadedByUserId, uploadedByEmail })
      .sort({ createdAt: -1 })
      .limit(500);

    res.json({ resources, total: resources.length });
  } catch {
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};

export const approveResource = async (req: Request, res: Response) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const approved = Boolean(req.body.approved);
    resource.approved = approved;
    resource.approvedAt = approved ? new Date() : undefined;
    resource.approvedBy = (req as any).user?._id;
    await resource.save();

    getIO()?.emit('resources.updated', { action: 'approve', id: resource._id?.toString(), approved });
    res.json(resource);
  } catch {
    res.status(500).json({ message: 'Failed to approve resource' });
  }
};

export const submitResource = async (req: Request, res: Response) => {
  try {
    const title = sanitizeHtml(req.body.title);
    const category = 'notes';
    const department = sanitizeHtml(req.body.department);
    const semester = sanitizeHtml(req.body.semester);
    const subject = sanitizeHtml(req.body.subject || '');
    const googleDriveUrl = sanitizeHtml(req.body.driveLink || req.body.googleDriveUrl || '');
    const uploadedByName = sanitizeHtml(req.body.uploadedByName || 'User');
    const uploadedByEmail = sanitizeHtml(req.body.uploadedByEmail || '').trim().toLowerCase();
    const uploadedByUserId = sanitizeHtml(req.body.uploadedByUserId || '').trim();

    if (!title || !department || !semester || !googleDriveUrl || !uploadedByEmail || !uploadedByUserId) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const resource = new Resource({
      title,
      category,
      department,
      semester,
      subject,
      googleDriveUrl,
      uploadedByName,
      uploadedByEmail,
      uploadedByUserId,
      approved: false,
      uploadDate: new Date()
    });
    await resource.save();

    await ActivityLog.create({
      action: 'resource.submit',
      ip: req.ip,
      meta: { resourceId: resource._id, title: resource.title, uploadedByEmail }
    });

    getIO()?.emit('resources.updated', { action: 'submit', id: resource._id?.toString() });
    res.status(201).json(resource);
  } catch {
    res.status(500).json({ message: 'Failed to submit resource' });
  }
};

export const updateSubmission = async (req: Request, res: Response) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const uploadedByUserId = sanitizeHtml(req.body.uploadedByUserId || '').trim();
    const uploadedByEmail = sanitizeHtml(req.body.uploadedByEmail || '').trim().toLowerCase();
    if (!uploadedByUserId || !uploadedByEmail) return res.status(400).json({ message: 'Unauthorized' });

    if ((resource as any).uploadedByUserId !== uploadedByUserId || (resource as any).uploadedByEmail !== uploadedByEmail) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (resource.approved) return res.status(400).json({ message: 'Approved notes cannot be edited from user portal' });

    if (req.body.title !== undefined) resource.title = sanitizeHtml(req.body.title || '').trim();
    if (req.body.department !== undefined) resource.department = sanitizeHtml(req.body.department || '').trim();
    if (req.body.semester !== undefined) resource.semester = sanitizeHtml(req.body.semester || '').trim();
    if (req.body.subject !== undefined) resource.subject = sanitizeHtml(req.body.subject || '').trim();
    if (req.body.driveLink !== undefined || req.body.googleDriveUrl !== undefined) {
      resource.googleDriveUrl = sanitizeHtml(req.body.driveLink || req.body.googleDriveUrl || '').trim();
    }

    await resource.save();
    getIO()?.emit('resources.updated', { action: 'submission.update', id: resource._id?.toString() });
    res.json(resource);
  } catch {
    res.status(500).json({ message: 'Failed to update submission' });
  }
};

export const deleteSubmission = async (req: Request, res: Response) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    const uploadedByUserId = sanitizeHtml(req.body.uploadedByUserId || '').trim();
    const uploadedByEmail = sanitizeHtml(req.body.uploadedByEmail || '').trim().toLowerCase();
    if (!uploadedByUserId || !uploadedByEmail) return res.status(400).json({ message: 'Unauthorized' });

    if ((resource as any).uploadedByUserId !== uploadedByUserId || (resource as any).uploadedByEmail !== uploadedByEmail) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    getIO()?.emit('resources.updated', { action: 'submission.delete', id: req.params.id });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete submission' });
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
    if (req.body.uploadedByEmail !== undefined) {
      const nextEmail = sanitizeHtml(req.body.uploadedByEmail || '').trim().toLowerCase();
      (resource as any).uploadedByEmail = nextEmail || undefined;
    }
    if (req.body.uploadedByUserId !== undefined) {
      const nextUserId = sanitizeHtml(req.body.uploadedByUserId || '').trim();
      (resource as any).uploadedByUserId = nextUserId || undefined;
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
