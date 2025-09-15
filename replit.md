# AI Commerce Platform

## Overview

This is a multi-tenant AI-powered e-commerce platform that enables businesses to deploy intelligent sales assistants across messaging channels like Telegram and WhatsApp. The platform provides a comprehensive suite of tools for managing tenants, product catalogs, orders, conversations, and knowledge bases. Each tenant operates independently with their own data isolation, product catalog, and AI configuration.

The system is designed to handle the complete customer journey from product discovery through order completion, with AI assistants that can understand customer intent, provide product recommendations, handle comparisons, and escalate to human operators when needed.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built using React with TypeScript and follows a component-based architecture:

- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized production builds

The application uses a dashboard layout with a sidebar navigation and supports multi-tenant context switching through a tenant provider pattern.

### Backend Architecture

The backend follows a REST API architecture with Express.js:

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL with connection pooling
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling
- **File Structure**: Modular separation with routes, storage layer, and business logic

The server implements a storage abstraction layer that encapsulates all database operations, making it easy to swap implementations or add caching layers.

### Data Storage Solutions

**Database Schema Design**:
- Multi-tenant architecture with tenant-scoped data isolation
- Core entities: Tenants, Users, Products, Orders, Conversations, Knowledge Base
- JSONB fields for flexible metadata storage (product specifications, settings)
- UUID primary keys for security and scalability
- Proper foreign key relationships with cascade behaviors

**Key Tables**:
- `tenants`: Organization data with settings and industry information
- `products`: Catalog items with pricing, categories, and specifications
- `conversations`: AI chat sessions with confidence tracking
- `knowledge_base`: Structured content for AI responses
- `orders`: E-commerce transactions with status tracking

### Authentication and Authorization

The system implements a role-based access control (RBAC) system:
- User roles: user, admin, super_admin
- Tenant-scoped permissions ensure data isolation
- Session-based authentication with cookie management
- Multi-tenant context switching for admin users

### AI Integration Architecture

**OpenAI Integration**:
- GPT-5 model for natural language processing
- Structured prompt engineering for consistent responses
- Intent classification and entity extraction
- Confidence scoring for escalation decisions
- Context-aware responses using product catalog and knowledge base

**AI Service Features**:
- Customer message analysis with intent recognition
- Product search and recommendation algorithms
- Automatic escalation triggers based on confidence thresholds
- Multi-language support with automatic detection

### File Upload System

The platform supports file uploads through multiple storage options:
- **Google Cloud Storage**: Primary storage for production files
- **Uppy Integration**: Modern file upload experience with drag-drop
- Progress tracking and validation
- Support for images, documents, and other media types

## External Dependencies

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting with automatic scaling
- **Drizzle ORM**: Type-safe database toolkit with migration support
- **WebSocket Support**: Real-time capabilities via `ws` library

### AI and Machine Learning
- **OpenAI API**: GPT-5 model access for natural language processing
- **@google-cloud/storage**: File storage and media management

### UI and User Experience
- **Radix UI**: Accessible component primitives (@radix-ui/react-*)
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form management with validation
- **Zod**: Schema validation and type inference

### Development and Build Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Static type checking across the entire stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration

### File Upload and Media
- **Uppy**: Modern file uploader with multiple backend support
- **AWS S3 Support**: Alternative cloud storage option via @uppy/aws-s3

### Messaging Platform Integration
- **Telegram Bot API**: Direct integration for customer conversations
- **WhatsApp Business API**: Support for WhatsApp messaging channels
- **TanStack Query**: Efficient data fetching and caching for real-time updates

The platform is designed to be cloud-native and scalable, with proper separation of concerns between the frontend React application, Express.js API server, and external services. The multi-tenant architecture ensures complete data isolation while maintaining operational efficiency.