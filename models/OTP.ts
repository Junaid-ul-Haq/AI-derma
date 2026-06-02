import mongoose from 'mongoose';

export interface IOTP extends mongoose.Document {
  email: string;
  otp: string;
  type: 'FORGOT_PASSWORD_USER' | 'FORGOT_PASSWORD_DOCTOR';
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const OTPSchema = new mongoose.Schema<IOTP>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['FORGOT_PASSWORD_USER', 'FORGOT_PASSWORD_DOCTOR'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
OTPSchema.index({ email: 1, type: 1 });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs

const OTP = mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);

export default OTP;







