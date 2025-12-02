import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunity extends Document {
  name: string;
  description?: string;
  link?: string;
  createdAt: Date;
}

const CommunitySchema: Schema = new Schema<ICommunity>({
  name: { type: String, required: true },
  description: { type: String },
  link: { type: String }
}, { timestamps: true });

export default mongoose.model<ICommunity>('Community', CommunitySchema);
