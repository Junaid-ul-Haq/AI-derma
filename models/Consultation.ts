import mongoose from 'mongoose';


export interface IConsultation extends mongoose.Document {
  userId: mongoose.Types.ObjectId; // User who requested consultation
  doctorId: mongoose.Types.ObjectId; // Doctor assigned to consultation
  reportId?: mongoose.Types.ObjectId; // Associated skin report
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IN_CALL' | 'COMPLETED';
  message?: string; // User's message/question
  doctorResponse?: string; // Doctor's response
  scheduledAt?: Date; // Scheduled consultation time
  slotTime?: string; // e.g., "17:00" for 5pm slot
  slotDate?: Date; // Date of the consultation slot
  completedAt?: Date;
  scheduleActive: boolean;
  paymentScreenshot?: string; // URL to uploaded payment screenshot
  paymentVerified: boolean;
  paymentSubmittedAt?: Date;
  paymentVerifiedAt?: Date;
  // Video call fields
  roomId?: string;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationSchema = new mongoose.Schema<IConsultation>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report', // Assuming you have a Report model
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'IN_CALL', 'COMPLETED'],
      default: 'PENDING',
    },
    message: {
      type: String,
    },
    doctorResponse: {
      type: String,
    },
    scheduledAt: {
      type: Date,
    },
    slotTime: {
      type: String,
    },
    slotDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    scheduleActive: {
      type: Boolean,
      default: false,
    },
    paymentScreenshot: {
      type: String, // URL to uploaded payment screenshot
    },
    paymentVerified: {
      type: Boolean,
      default: false,
    },
    paymentSubmittedAt: {
      type: Date,
    },
    paymentVerifiedAt: {
      type: Date,
    },
    roomId:    { type: String },
    startedAt: { type: Date },
    endedAt:   { type: Date },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ConsultationSchema.index({ doctorId: 1, status: 1 });
ConsultationSchema.index({ userId: 1, status: 1 });

const Consultation = mongoose.models.Consultation || mongoose.model<IConsultation>('Consultation', ConsultationSchema);

export default Consultation;


