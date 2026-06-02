import mongoose from 'mongoose';

export interface IVideoRoom extends mongoose.Document {
  roomId: string;
  consultationId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  isActive: boolean;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VideoRoomSchema = new mongoose.Schema<IVideoRoom>(
  {
    roomId:         { type: String, required: true, unique: true },
    consultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation', required: true },
    doctorId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive:       { type: Boolean, default: false },
    startedAt:      { type: Date },
    endedAt:        { type: Date },
  },
  { timestamps: true }
);

const VideoRoom =
  mongoose.models.VideoRoom ||
  mongoose.model<IVideoRoom>('VideoRoom', VideoRoomSchema);

export default VideoRoom;
