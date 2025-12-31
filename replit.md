# NameWizard.io

## Overview

NameWizard.io is an AI-powered file renaming and organization application. It allows users to upload files, analyze their content using various AI models (OpenAI, Anthropic Claude, Google Gemini, etc.), and receive intelligent naming suggestions. The application supports batch processing, OCR for images, cloud storage integrations (Dropbox, Google Drive), and customizable renaming templates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state, React Context for local state (BatchProcessingContext, ThemeContext, OnboardingContext)
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom theme system supporting multiple color schemes
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **Authentication**: Passport.js with local strategy, session-based auth using PostgreSQL session store
- **File Handling**: Multer for multipart uploads (10MB limit)

### Data Storage
- **Database**: PostgreSQL via Neon serverless driver
- **ORM**: Drizzle ORM with Zod schema validation
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Key Database Tables
- `users` - User accounts with role-based access (user, admin, god_admin)
- `apiKeys` - User API keys for various LLM providers
- `cloudConnections` - Cloud storage integrations
- `files` - File metadata and processing history
- `presets` - Renaming templates and rules
- `agents` - Automated processing configurations
- `naming_templates` - System and user naming templates (Research, Financial, Design, Medical, Agile, General)
- `abbreviations` - Standard abbreviation dictionary (61 entries: document types, time periods, versions, status)
- `job_queue` - Batch processing job queue with priority and progress tracking
- `custom_instructions` - Per-user naming preferences (style, separator, date format, custom prompts)
- `password_reset_tokens` - Secure password reset token management
- `api_metrics` - Provider performance tracking (latency, success/error rates)
- `file_hash_cache` - Duplicate file detection and caching

### Authentication & Authorization
- Password hashing using scrypt with random salt
- Role-based access control with three tiers: user, admin, god_admin
- Protected routes on frontend with role checks
- Session-based authentication with secure cookie handling

### AI Service Integrations (GPT-5 Stack - Updated Dec 2025)
- **OpenAI**: GPT-5 Nano (Free/Basic), GPT-5.2 (Pro/Unlimited)
- **Google**: Gemini 2.5 Flash (secondary for all tiers)
- **Mistral**: Mistral Small 2025 (tertiary validation)
- **Meta**: Llama 3.1 Small (quaternary fallback)
- Services include tiered model routing with automatic fallbacks

### OCR Providers
- **TechVision**: Budget OCR for clean text (Free tier primary)
- **Google Cloud Vision**: Standard/Advanced (Basic+ tiers)
- **Azure Computer Vision**: Standard/Advanced (All tiers)
- **AWS Textract**: Forms and tables (Pro/Unlimited only)

### Tier Configuration (shared/tier-config.ts)
- **Free**: plan_tier="free", GPT-5 Nano + TechVision
- **Basic ($19)**: plan_tier="medium", plan_name="basic", GPT-5 Nano + Google Vision Standard
- **Pro ($49)**: plan_tier="medium", plan_name="pro", GPT-5.2 + Google Vision Advanced
- **Unlimited ($99)**: plan_tier="premium", GPT-5.2 + All OCR providers

## External Dependencies

### AI/ML Services
- **OpenAI API**: Primary AI provider (GPT-5 Nano, GPT-5.2)
- **Google APIs**: Gemini 2.5 Flash for multimodal, Cloud Vision for OCR
- **Mistral API**: Structured reasoning and validation
- **Meta/OpenRouter**: Llama 3.1 for fallback routing

### Cloud Storage
- **Dropbox API**: File sync and cloud storage access
- **Google Drive API**: File management and cloud integration

### Payment Processing
- **Stripe**: Subscription management and payment processing (@stripe/stripe-js, @stripe/react-stripe-js)

### Database
- **Neon**: Serverless PostgreSQL hosting (@neondatabase/serverless)

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `passport` / `passport-local`: Authentication
- `express-session` / `connect-pg-simple`: Session management
- `bcryptjs`: Password hashing fallback
- `multer`: File upload handling
- `@tanstack/react-query`: Data fetching and caching
- `@hello-pangea/dnd`: Drag and drop functionality
- `canvas-confetti`: Gamification effects
- `framer-motion`: Animations (implied by AnimatePresence usage)