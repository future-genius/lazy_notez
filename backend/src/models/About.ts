import mongoose, { Schema, Document } from 'mongoose';

export interface IAbout extends Document {
  title: string;
  content: string;
  createdAt: Date;
}

const AboutSchema: Schema = new Schema<IAbout>({
  title: { type: String, required: true },
  content: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IAbout>('About', AboutSchema);
