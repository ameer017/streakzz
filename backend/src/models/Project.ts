import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  liveLink: string;
  githubLink: string;
  submittedAt: Date;
  createdAt: Date;
}

const ProjectSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  liveLink: {
    type: String,
    required: true,
    trim: true
  },
  githubLink: {
    type: String,
    required: true,
    trim: true
  },
  createdAt:{
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<IProject>('Project', ProjectSchema); 