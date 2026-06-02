import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './mongodb';
import dbConnect from './db';
import User from '../models/User';
import Doctor from '../models/Doctor';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        isDoctor: { label: 'Is Doctor', type: 'boolean' },
        temporaryPassword: { label: 'Temporary Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || (!credentials?.password && !credentials?.temporaryPassword)) {
          return null;
        }

        try {
          await dbConnect();
          const normalizedEmail = credentials.email.toLowerCase().trim();

          const isDoctorLogin = String(credentials.isDoctor).toLowerCase() === 'true';

          // Check if this is a doctor login
          if (isDoctorLogin) {
            const doctor = await Doctor.findOne({ email: normalizedEmail });

            if (!doctor) {
              console.log('Auth: Doctor not found:', normalizedEmail);
              return null;
            }

            if (doctor.status !== 'APPROVED') {
              console.log('Auth: Doctor not approved:', normalizedEmail);
              return null;
            }

            if (doctor.suspended === true) {
              console.log('Auth: Doctor is suspended:', normalizedEmail);
              return null;
            }

            let isPasswordValid = false;

            // Check temporary password (first login)
            if (credentials.temporaryPassword && doctor.temporaryPassword) {
              isPasswordValid = credentials.temporaryPassword === doctor.temporaryPassword;
            }
            // Check regular password (after setting own password)
            else if (credentials.password && doctor.password) {
              isPasswordValid = await bcrypt.compare(credentials.password, doctor.password);
            }

            if (!isPasswordValid) {
              console.log('Auth: Invalid password for doctor:', normalizedEmail);
              return null;
            }

            console.log('Auth: Doctor authenticated:', normalizedEmail);

            return {
              id: doctor._id.toString(),
              email: doctor.email,
              name: doctor.name,
              role: 'DOCTOR',
              profileImage: doctor.profileImage || null,
            };
          }

          // Regular user login
          const user = await User.findOne({ email: normalizedEmail });

          if (!user) {
            console.log('Auth: User not found:', normalizedEmail);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password!,
            user.password
          );

          if (!isPasswordValid) {
            console.log('Auth: Invalid password for user:', normalizedEmail);
            return null;
          }

          console.log('Auth: User authenticated:', normalizedEmail);

          // Check if user is admin by comparing email with env variable
          const adminEmail = process.env.ADMIN_EMAIL;
          const isAdmin = adminEmail && user.email.toLowerCase() === adminEmail.toLowerCase();

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: isAdmin ? 'ADMIN' : 'USER',
            profileImage: user.profileImage || null,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If url is a relative URL, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // If url is on the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Otherwise, redirect to baseUrl
      return baseUrl;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'USER';
        token.email = (user as any).email;
        token.profileImage = (user as any).profileImage || null;
      }
      
      // When session is updated via update() call
      if (trigger === 'update') {
        // If profileImage is provided in the update call, use it directly
        if (session && (session as any).profileImage !== undefined) {
          token.profileImage = (session as any).profileImage;
        } else {
          // Otherwise, fetch latest from database
          try {
            await dbConnect();
            const normalizedEmail = (token.email as string)?.toLowerCase();
            
            if (!normalizedEmail) return token;
            
            if (token.role === 'DOCTOR') {
              const doctor = await Doctor.findOne({ email: normalizedEmail });
              if (doctor) {
                token.profileImage = doctor.profileImage || null;
              }
            } else {
              const userDoc = await User.findOne({ email: normalizedEmail });
              if (userDoc) {
                token.profileImage = userDoc.profileImage || null;
              }
            }
          } catch (error) {
            console.error('Error fetching profileImage in JWT callback:', error);
          }
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string || 'USER';
        (session.user as any).email = token.email as string;
        (session.user as any).profileImage = token.profileImage as string || null;
      }
      return session;
    },
  },
};