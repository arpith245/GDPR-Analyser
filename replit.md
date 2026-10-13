# GDPR Analyzer Pro

## Overview

GDPR Analyzer Pro is a comprehensive web application designed to analyze websites for privacy compliance with modern data protection regulations. The application performs automated analysis of websites to assess compliance with GDPR 2025 updates, India's DPDP Act 2023, and privacy-by-design principles. It provides detailed reports covering cookie analysis, beacon detection, security assessment, and generates actionable recommendations for compliance improvements.

The system is built as a full-stack application with a React frontend and Express.js backend, featuring real-time analysis capabilities, PDF report generation, and comprehensive privacy assessment tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript, implementing a modern component-based architecture. The UI framework leverages shadcn/ui components built on top of Radix UI primitives, providing a consistent and accessible design system. The application uses Wouter for lightweight routing and TanStack Query for server state management and data fetching.

Key design decisions include:
- **Component Architecture**: Modular React components with clear separation of concerns between UI components and business logic
- **State Management**: TanStack Query handles server state, eliminating the need for complex client-side state management
- **Styling**: Tailwind CSS with CSS custom properties for theming, supporting both light and dark modes
- **Type Safety**: Full TypeScript implementation with shared schema validation between frontend and backend

### Backend Architecture
The server implements a RESTful API using Express.js with TypeScript. The architecture follows a service-oriented pattern where analysis functionality is broken down into specialized services for different types of compliance checking.

Core architectural components:
- **Analysis Services**: Modular services for cookie analysis, beacon detection, security assessment, GDPR checking, and DPDP compliance
- **Storage Layer**: Abstract storage interface with in-memory implementation for development, designed to be easily replaceable with database implementations
- **PDF Generation**: Server-side PDF report generation using PDFKit
- **Real-time Analysis**: Background processing with status polling for long-running website analysis tasks

### Data Storage Solutions
The application uses a flexible storage abstraction that currently implements in-memory storage for development. The schema is defined using Drizzle ORM with PostgreSQL as the target database, providing type-safe database operations and migrations.

Database design features:
- **Analysis Tracking**: Separate tables for analysis requests and results, enabling request queuing and result caching
- **User Management**: Basic user authentication structure for future multi-user support
- **JSON Storage**: Complex analysis data stored as JSONB for flexibility while maintaining queryability

### Authentication and Authorization
The current implementation includes a basic user schema structure but does not implement active authentication. The architecture is prepared for session-based authentication using connect-pg-simple for PostgreSQL session storage.

## External Dependencies

### Database Services
- **Neon Database**: PostgreSQL hosting service configured via DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database operations and schema management
- **PostgreSQL**: Primary database for persistent storage of analysis results and user data

### Analysis and Automation
- **Puppeteer**: Headless browser automation for website crawling and analysis
- **PDFKit**: Server-side PDF generation for compliance reports

### Frontend Libraries
- **Radix UI**: Accessible component primitives for building the UI
- **shadcn/ui**: Pre-built component library with consistent design patterns
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with Zod schema validation
- **Tailwind CSS**: Utility-first CSS framework for styling

### Development and Build Tools
- **Vite**: Fast development server and build tool optimized for React
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Static type checking across the entire application
- **Replit Plugins**: Development environment enhancements for the Replit platform

### Third-party Integrations
The application analyzes websites for integration with various tracking and analytics services including Google Analytics, Facebook Pixel, and other marketing beacons. The analysis services are designed to detect and evaluate compliance implications of these third-party integrations without requiring direct API access to the services themselves.