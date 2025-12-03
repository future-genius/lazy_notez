import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  name?: string;
  email?: string;
  message: string;
  user?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: false },
    message: { type: String, required: true },
    user: { type: mongoose.Types.ObjectId, ref: 'User', required: false }
  },
  { timestamps: true }
);

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
