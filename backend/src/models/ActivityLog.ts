import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  user?: mongoose.Types.ObjectId;
  action: string;
  ip?: string;
  meta?: any;
  createdAt: Date;
}

const ActivityLogSchema: Schema = new Schema<IActivityLog>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  ip: { type: String },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
