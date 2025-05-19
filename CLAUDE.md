# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dynamic Island Todo is a Next.js web application that provides a todo list with team collaboration features. The UI includes a Dynamic Island-inspired component (similar to iPhone's Dynamic Island) for task management.

### Tech Stack

- Next.js 15.2.4 with App Router
- React 19
- TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Prisma ORM for database operations
- Supabase (PostgreSQL) as the backend
- NextAuth.js for authentication (Google OAuth)

## Development Commands

```bash
# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev

# Build for production
npm run build
# or
pnpm build

# Start production server
npm run start
# or
pnpm start

# Run linting
npm run lint
# or
pnpm lint
```

## Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npm run migrate
# or
npx prisma migrate dev

# Push schema changes to database
npm run db:push
# or
npx prisma db push
```

## Environment Setup

The application requires the following environment variables in a `.env` file:

```
# NextAuth configuration
NEXTAUTH_URL="http://localhost:3000"  # Development environment
NEXTAUTH_SECRET="your-secure-secret"  # Random secure string

# Google OAuth configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
DATABASE_URL="postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres"
```

## Architecture Overview

### App Structure

- `/app`: Next.js App Router files
  - `/api`: API routes for backend functionality
  - `/auth`: Authentication pages
  - `/dashboard`: Main dashboard page
- `/components`: React components including Dynamic Island Todo component
- `/hooks`: Custom React hooks for data fetching/state management
- `/lib`: Utility functions and services
  - `/api`: API client utilities
  - `/services`: Supabase service integration
- `/prisma`: Database schema and migrations
- `/styles`: CSS files including Dynamic Island styling
- `/types`: TypeScript type definitions

### Data Flow

1. **Authentication**: NextAuth.js handles user authentication with Google OAuth
2. **Data Storage**: Todo items and teams are stored in Supabase database
3. **Data Access**:
   - Server components use direct Prisma client access
   - Client components use API routes or hooks to fetch/modify data

### Dynamic Island Component

The application features a custom Dynamic Island component with smooth animations powered by Framer Motion. The component uses specific motion patterns for transitions:

1. Snappy transitions using spring animation
2. Expand/collapse animations
3. List item animations with enter/exit effects
4. AnimatePresence for handling component mounting/unmounting

## Deployment

The project is configured for deployment on Vercel. The following environment variables must be set in the Vercel project:

- `NEXTAUTH_URL`: Production URL
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`

## Documentation Resources

Additional documentation is available in the `/docs` directory:

- `supabase-setup.md`: Initial Supabase and NextAuth.js setup guide
- `supabase-guide.md`: Usage guide for Supabase in the application
- `motion-patterns.md`: Animation patterns for the Dynamic Island component