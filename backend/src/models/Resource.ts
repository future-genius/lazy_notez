import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  category?: 'notes' | 'question_paper' | 'study_material';
  department: string;
  semester: string;
  subject: string;
  title: string;
  googleDriveUrl: string;
  uploadedByName: string;
  uploadedByEmail?: string;
  uploadedByUserId?: string;
  approved: boolean;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  uploadDate: Date;
  downloadCount: number;
  description?: string;
  uploadedBy?: mongoose.Types.ObjectId;
  tags?: string[];
  createdAt: Date;
}

const ResourceSchema: Schema = new Schema<IResource>({
  category: { type: String, enum: ['notes', 'question_paper', 'study_material'], default: 'study_material', index: true },
  department: { type: String, required: true, trim: true, index: true },
  semester: { type: String, required: true, trim: true, index: true },
  subject: { type: String, required: true, trim: true, index: true },
  title: { type: String, required: true },
  googleDriveUrl: { type: String, required: true },
  uploadedByName: { type: String, required: true },
  uploadedByEmail: { type: String, lowercase: true, trim: true, index: true },
  uploadedByUserId: { type: String, trim: true, index: true },
  approved: { type: Boolean, default: true, index: true },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadDate: { type: Date, default: Date.now },
  downloadCount: { type: Number, default: 0 },
  description: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model<IResource>('Resource', ResourceSchema);
