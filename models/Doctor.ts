import mongoose from 'mongoose';

export interface IDoctor extends mongoose.Document {
  name: string;
  email: string;
  password?: string;
  profileImage?: string;
  age: number;
  professionalExperience: number; // in years
  phoneNumber: string;
  degreeUrl: string; // URL to uploaded degree document
  description?: string; // Doctor's professional description
  consultationHours?: {
    startTime: string; // e.g., "17:00" (5pm)
    endTime: string; // e.g., "21:00" (9pm)
    days: string[]; // e.g., ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    slotDuration: number; // in minutes, default 30
  };
  bankDetails?: {
    accountTitle: string;
    accountNumber: string;
    bankName: string;
    iban: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  suspended: boolean; // Whether doctor is suspended
  approvedBy?: mongoose.Types.ObjectId; // Admin who approved
  approvedAt?: Date;
  rejectionReason?: string;
  temporaryPassword?: string; // Random password sent by admin
  passwordSet: boolean; // Whether doctor has set their own password
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new mongoose.Schema<IDoctor>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
    },
    profileImage: {
      type: String,
      default: null,
    },
    age: {
      type: Number,
      required: [true, 'Please provide your age'],
      min: [18, 'Age must be at least 18'],
      max: [100, 'Age must be less than 100'],
    },
    professionalExperience: {
      type: Number,
      required: [true, 'Please provide professional experience'],
      min: [0, 'Experience cannot be negative'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide a phone number'],
    },
    degreeUrl: {
      type: String,
      required: [true, 'Please upload your degree'],
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING', // New registrations start as PENDING, admin approves them
      required: true,
    },
    suspended: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    temporaryPassword: {
      type: String,
    },
    passwordSet: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    consultationHours: {
      startTime: {
        type: String,
        default: '17:00', // 5pm
      },
      endTime: {
        type: String,
        default: '21:00', // 9pm
      },
      days: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      slotDuration: {
        type: Number,
        default: 30, // 30 minutes
      },
    },
    bankDetails: {
      accountTitle: {
        type: String,
        default: '',
      },
      accountNumber: {
        type: String,
        default: '',
      },
      bankName: {
        type: String,
        default: '',
      },
      iban: {
        type: String,
        default: '',
      },
    },
  },
  {
    timestamps: true,
  }
);

const Doctor = mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);

export default Doctor;



