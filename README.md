# Skinova

A Next.js application for AI-powered skin disease detection and online consultation.

## Features

- **User Authentication**: Sign up and sign in functionality
- **Protected Upload**: Users must be logged in to upload images
- **Professional Landing Page**: Medical-grade UI for healthcare platform
- **MongoDB Integration**: User data storage with Mongoose
- **NextAuth.js**: Secure authentication system

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/skin-disease-detection
   NEXT_PUBLIC_APP_NAME=Skinova
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here-change-in-production
   ```

4. Start MongoDB service (if using local MongoDB)

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication Flow

1. **Sign Up**: Create a new account at `/auth/signup`
2. **Sign In**: Log in at `/auth/signin`
3. **Protected Upload**: Access `/upload` after authentication
4. **Sign Out**: Use the header button to log out

## Project Structure

```
app/
├── api/auth/           # Authentication API routes
├── auth/               # Sign in/up pages
├── upload/             # Protected upload page
components/             # Reusable UI components
lib/                    # Database and auth configuration
models/                 # MongoDB schemas
```

## API Routes

- `POST /api/auth/signup` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js handler
- `GET /api/test-db` - Database connection test

## Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **NextAuth.js** - Authentication
- **MongoDB** - Database
- **Mongoose** - ODM
- **bcryptjs** - Password hashing

## Development

- Run tests: `npm run build`
- Lint code: `npm run lint`
- Start dev server: `npm run dev`

## Future Features

- AI image analysis integration
- Online consultation system
- Dermatologist dashboard
- Advanced user profiles

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
