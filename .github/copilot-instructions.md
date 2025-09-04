# TheDay - AI Agent Instructions

## Project Overview
TheDay is a Next.js application designed as a student resource hub for AASTMT Aswan CS students. It organizes and provides access to course materials, schedules, and previous exams, with data stored in Google Drive.

## Architecture & Data Flow

### Core Components
- **App Structure**: Next.js app with TypeScript and Material UI
- **State Management**: 
  - Context providers (`IndexedContext.tsx`, `TranscriptContext.tsx`, `SearchContext.tsx`)
  - LocalStorage for user preferences and semester selection
  - Dexie.js for IndexedDB storage of subject data
- **Data Sources**:
  - Google Drive API for course materials
  - Local JSON for subject/semester structure
- **PWA Support**: Configured with next-pwa for offline functionality

### Key Patterns

1. **Responsive Design Pattern**:
   - Separate components for desktop/mobile views (e.g., `MainPc.tsx`/`MainPhone.tsx`)
   - Responsive components detect device type and render accordingly
   - Example: `src/pages/theday/q/[q]/Main.tsx` conditionally renders PC/Phone components

2. **Context-Based State Management**:
   - `IndexedContext.tsx` - Manages local database with Dexie.js
   - `TranscriptContext.tsx` - Provides course structure data
   - `SearchContext.tsx` - Manages search functionality

3. **Data Caching Strategy**:
   - Google Drive data fetched via API and cached in IndexedDB
   - Offline support via PWA and local storage

4. **API Integration**:
   - Google Drive API for fetching course materials (`src/pages/api/subjects/[subject].js`)
   - Authentication handled via service account credentials in environment variables

## Development Workflows

### Setup & Running
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Testing
- Vitest is configured with Storybook integration
- Run tests with: `npm test`

### Storybook
- Components have Storybook stories in `src/stories/`
- Run Storybook: `npm run storybook`

## Project Conventions

### File Structure
- `pages/` - Next.js pages with file-based routing
- `components/` - Reusable UI components
- `context/` - React Context providers
- `hooks/` - Custom React hooks
- `styles/` - CSS and style-related files
- `public/` - Static assets and PWA manifest

### Component Patterns
- Functional components with TypeScript interfaces
- Material UI for styling and components
- Responsive design with separate PC/Phone components

### API Conventions
- API routes under `pages/api/`
- Google Drive integration for content retrieval
- Caching implemented for performance

## Common Tasks

### Adding a New Subject
1. Update transcript data structure
2. Ensure Google Drive folders follow naming convention
3. Update caching logic if needed

### Modifying UI Components
- Remember to update both PC and Phone versions of components
- Use MUI components and theming for consistency
- Test changes with different viewport sizes

### External Services
- Google Drive API for content storage/retrieval
- Required environment variables include Google API credentials

## Debugging Tips
- Check browser console for error messages
- Verify offline mode functionality in development
- Use browser dev tools to inspect IndexedDB storage
- Theme toggle (light/dark mode) might need testing for both states
