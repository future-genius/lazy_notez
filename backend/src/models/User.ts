import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  name: string;
  username: string;
  email: string;
  password: string;
  loginMethod: 'google' | 'manual';
  role: 'super_admin' | 'admin' | 'faculty' | 'student' | 'user';
  status: 'active' | 'inactive';
  refreshTokens: string[];
  lastLogin?: Date;
  registrationDate: Date;
  universityRegisterNumber?: string;
  department?: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  loginMethod: { type: String, enum: ['google', 'manual'], default: 'manual' },
  role: { type: String, enum: ['super_admin', 'admin', 'faculty', 'student', 'user'], default: 'user' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  refreshTokens: { type: [String], default: [] },
  lastLogin: { type: Date },
  registrationDate: { type: Date, default: Date.now },
  universityRegisterNumber: { type: String, required: false },
  department: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);
