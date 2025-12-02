import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
  title: string;
  description?: string;
  url?: string;
  uploadedBy?: mongoose.Types.ObjectId;
  tags?: string[];
  createdAt: Date;
}

const ResourceSchema: Schema = new Schema<IResource>({
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tags: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model<IResource>('Resource', ResourceSchema);
