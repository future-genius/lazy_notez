import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  username: string;
  email?: string;
  password: string;
  role: 'admin' | 'faculty' | 'student' | 'user';
  status: 'active' | 'inactive';
  refreshTokens: string[];
  lastLogin?: Date;
  createdAt: Date;
}

const UserSchema: Schema = new Schema<IUser>({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: false, unique: false },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'faculty', 'student', 'user'], default: 'user' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  refreshTokens: { type: [String], default: [] },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);
