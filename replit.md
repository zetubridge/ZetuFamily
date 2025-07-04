# ZetuBridge - Medical Apps Store

## Overview

ZetuBridge is a full-stack web application designed as a medical apps store, specifically targeting Kenya Medical Training College (KMTC) students and medical professionals. The platform allows developers to publish medical education apps and users to browse, download, and discover essential medical tools. The application follows a Google Play Store-like design pattern with a focus on medical education content.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with custom medical theme colors
- **UI Components**: Radix UI components with shadcn/ui design system
- **State Management**: Zustand for authentication state
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Session Management**: Express sessions with configurable storage
- **Authentication**: Session-based authentication with bcrypt password hashing
- **API Design**: RESTful API with structured error handling
- **Build Tool**: Vite for development and esbuild for production

## Key Components

### Database Layer
- **Primary Database**: Firebase Firestore (NoSQL document database)
- **ORM Alternative**: Drizzle ORM configured for PostgreSQL (ready for future migration)
- **Schema Management**: Centralized schema definitions in `/shared/schema.ts`
- **Data Models**: Developer accounts, Apps, and Payment records

### Authentication System
- **Strategy**: Session-based authentication
- **Password Security**: bcrypt hashing with salt rounds
- **Session Storage**: Configurable (default in-memory, production-ready with external stores)
- **Authorization**: Role-based access control (developers, admin)

### Payment Integration
- **Payment Provider**: Paystack for African market
- **Flow**: Initialize payment → Verify payment → Update app status
- **Security**: Server-side payment verification with webhook support

### App Management
- **Publishing Flow**: Submit app → Payment → Admin approval → Published
- **Status Tracking**: Pending, Published, Rejected states
- **File Management**: External URL-based asset storage
- **Content Validation**: Zod schema validation for all app metadata

## Data Flow

1. **Developer Registration/Login**
   - Form submission → Server validation → Firebase user creation → Session establishment

2. **App Publishing**
   - Form submission → Validation → Payment initialization → Paystack redirect → Payment verification → App creation (pending status)

3. **App Approval**
   - Admin review → Status update → App becomes available for download

4. **App Discovery**
   - Browse published apps → View details → Download (with tracking)

5. **Download Tracking**
   - Download button click → Server-side counter increment → External URL redirect

## External Dependencies

### Payment Processing
- **Paystack**: Payment gateway for subscription/publishing fees
- **Environment Variables**: `PAYSTACK_SECRET_KEY` for API authentication

### Database
- **Firebase**: Primary data storage
- **Environment Variables**: `FIREBASE_CONFIG` or `FIREBASE_SERVICE_ACCOUNT` for service account configuration

### Development Tools
- **Vite**: Development server with HMR
- **Replit Integration**: Development environment optimization
- **Google Fonts**: Roboto and Inter font families for typography

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **React Hook Form**: Form state management

## Deployment Strategy

### Build Process
- **Development**: `npm run dev` - Vite dev server with Express backend
- **Production Build**: `npm run build` - Vite frontend build + esbuild backend compilation
- **Production Start**: `npm start` - Node.js production server

### Environment Configuration
- **Database**: Firebase configuration via environment variables
- **Payments**: Paystack secret key configuration
- **Sessions**: Configurable session secret for security
- **Development**: Replit-specific optimizations and debugging tools

### File Structure
- `/client` - React frontend application
- `/server` - Express backend services
- `/shared` - Common TypeScript definitions and schemas
- `/dist` - Production build output
- `/migrations` - Database migration files (Drizzle, future use)

## Changelog

- July 04, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.