import mongoose, { Schema } from 'mongoose';

const AnnouncementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    date: { type: Date, required: true },
    department: { type: String, trim: true },
    priority: { type: String, enum: ['normal', 'important'], default: 'normal' },
    published: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('Announcement', AnnouncementSchema);

