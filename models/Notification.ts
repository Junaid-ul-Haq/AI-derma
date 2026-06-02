import mongoose from 'mongoose';

export type NotificationType =
  | 'CONSULTATION_ACCEPTED'
  | 'CONSULTATION_REJECTED'
  | 'CALL_STARTED'
  | 'CALL_ENDED'
  | 'NEW_CONSULTATION'
  | 'PAYMENT_VERIFIED';

export interface INotification extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  userType: 'USER' | 'DOCTOR';
  type: NotificationType;
  title: string;
  message: string;
  consultationId?: mongoose.Types.ObjectId;
  roomId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new mongoose.Schema<INotification>(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, required: true },
    userType: { type: String, enum: ['USER', 'DOCTOR'], required: true },
    type: {
      type: String,
      enum: [
        'CONSULTATION_ACCEPTED',
        'CONSULTATION_REJECTED',
        'CALL_STARTED',
        'CALL_ENDED',
        'NEW_CONSULTATION',
        'PAYMENT_VERIFIED',
      ],
      required: true,
    },
    title:          { type: String, required: true },
    message:        { type: String, required: true },
    consultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
    roomId:         { type: String },
    isRead:         { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
