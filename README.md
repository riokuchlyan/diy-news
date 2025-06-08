# DIY News

## Overview
DIY News is a personalized newsletter service that consolidates multiple news sources into a single, customizable daily email. The platform aims to eliminate the need for subscribing to multiple newsletters by allowing users to specify their topics of interest and receive curated news content in one unified digest.

## Purpose
The primary goal of DIY News is to streamline news consumption by providing a centralized solution for personalized news delivery. Instead of managing multiple newsletter subscriptions across different providers, users can maintain a single subscription that covers all their areas of interest.

## Features
- **Customizable Topics**: Users can specify any number of topics they're interested in (maximum 20 topics, 100 characters each)
- **Intelligent Capitalization**: News topics are automatically formatted with proper capitalization
- **Daily Digest**: Automated daily email containing news from selected topics
- **AI-Powered Summaries**: Each news topic receives a focused 100-word summary using OpenAI GPT-4o-mini
- **Topic-Focused Analysis**: AI summaries concentrate specifically on the requested topic within broader news data
- **Single Source**: Consolidates multiple news sources into one email
- **User Authentication**: Secure account management with automatic login/signup detection
- **Topic Management**: Add, remove, or modify news topics at any time
- **Input Validation**: Comprehensive security validation for all user inputs

## Technology Stack

### Frontend
- Next.js 15.3.3 with App Router
- React with TypeScript
- Tailwind CSS for styling
- Server-side rendering for optimal performance

### Backend & APIs
- Next.js API routes
- News API integration for real-time news data
- OpenAI GPT-4o-mini for intelligent news summarization
- Custom validation and sanitization system
- Rate limiting and security protections

### Database & Authentication
- Supabase for authentication and data storage
- User data management with UID-based organization
- Secure password handling (no minimum length requirement)

### Email & Automation
- Resend API for email delivery
- Automated daily digest generation
- Custom email templates
- Newsletter scheduling system

### Security Features
- Input validation and sanitization for all user data
- SQL injection prevention
- XSS attack protection
- DoS attack mitigation
- CSRF protection
- Secure API key management

## Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── news-api/       # News data fetching
│   │   ├── openai/         # AI summarization endpoint
│   │   └── send/           # Email delivery
│   ├── login/              # Authentication pages
│   └── news-list/          # Topic management interface
├── components/             # Reusable UI components
├── services/
│   └── news-letter/        # Newsletter generation service
└── utils/                  # Core utilities and helpers
```

## Core Functionality

### News Processing Pipeline
1. Users add news topics (automatically capitalized)
2. System fetches latest news data for each topic
3. Raw news data is processed through OpenAI for focused summarization
4. AI generates 100-word summaries specific to each topic
5. Summaries are compiled into personalized email digest
6. Daily emails are automatically sent to all users

### Authentication System
- Intelligent login/signup detection
- Automatic account creation for new users
- Secure session management
- Email confirmation workflow

### Data Validation
- Comprehensive input sanitization
- Real-time validation feedback
- Security pattern detection
- Error handling and user feedback

## API Endpoints

### POST /api/openai
- Accepts: `prompt` (required), `query` (optional)
- Returns: AI-generated news summary focused on specified topic
- Uses GPT-4o-mini for concise, relevant summaries

### POST /api/send
- Sends personalized newsletter emails
- Validates email format and content
- Handles delivery status and errors

### GET /api/news-api
- Fetches real-time news data
- Query parameter validation
- Returns structured news information

## Environment Requirements
- OPENAI_API_KEY: OpenAI API access
- RESEND_API_KEY: Email delivery service
- SUPABASE_URL: Database connection
- SUPABASE_ANON_KEY: Database authentication
- NEWS_API_KEY: News data source access
- API_SECRET_KEY: Internal API security
- HOST_URL: Application base URL

## Benefits
- Reduce email clutter by consolidating multiple newsletters
- Save time by reading one comprehensive digest
- Maintain full control over news topics and preferences
- Never miss important updates from your areas of interest
- Easily manage all your news subscriptions in one place
- Receive AI-powered summaries focused on your specific interests

## Development Notes
- Built with modern React patterns and TypeScript
- Comprehensive error handling and logging
- Scalable architecture for multiple users
- Production-ready security implementations
- Automated testing and validation systems