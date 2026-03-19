# theday Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-12

## Active Technologies
- TypeScript 5.2.2 (strict mode) + Next.js 15 (Pages Router), React 19, MUI v6, Mongoose 8.4, googleapis 118 + NEW: firebase, firebase-admin (002-admin-dashboard)
- MongoDB (users, classes, content_items), Google Drive (files), IndexedDB (client cache via Dexie) (002-admin-dashboard)
- TypeScript 5.2.2 (strict mode) + Next.js 15 (Pages Router), React 19, MUI v6, Framer Motion 11.3.28 (003-ai-study-cart)
- localStorage (AI Mode state + cart items array) (003-ai-study-cart)
- TypeScript 5.2.2 (strict mode) + Next.js 15 (Pages Router), React 19, MUI v6, Mongoose 8.4, Firebase 12.10.0, Firebase Admin 13.7.0, googleapis 118, Framer Motion, Dexie (IndexedDB) (004-admin-sudo-ux)
- MongoDB (users, classes, content_items, subject_change_requests [new]), Google Drive (files), IndexedDB (client cache) (004-admin-sudo-ux)
- TypeScript 5.2.2 (strict mode) + Next.js 15 (Pages Router), React 19, MUI v6, Mongoose 8.4, Firebase Admin 13.7.0 (006-admin-class-auth)
- MongoDB (users, classes, content_items, subject_change_requests), Google Drive (files) (006-admin-class-auth)
- TypeScript 5.2.2 (strict mode) + Next.js 15 (Pages Router), React 19, MUI v6, googleapis v118, Firebase Admin 13.7.0, Framer Motion 11.3.28 (007-direct-upload-video)
- Google Drive (files via service account), MongoDB (users, classes — unchanged), Session cache (client-side in-memory, 5-min TTL) (007-direct-upload-video)
- localStorage (client-side persistence), browser Storage event (cross-tab sync) (008-notebooklm-study-builder)

- TypeScript 5.x (strict mode) + Storybook v7.x, Next.js 15, React 19, MUI v5, Framer Motion (001-storybook-components)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x (strict mode): Follow standard conventions

## Recent Changes
- 008-notebooklm-study-builder: Added TypeScript 5.2.2 (strict mode) + Next.js 15 (Pages Router), React 19, MUI v6, Framer Motion 11.3.28
- 007-direct-upload-video: Added TypeScript 5.2.2 (strict mode) + Next.js 15 (Pages Router), React 19, MUI v6, googleapis v118, Firebase Admin 13.7.0, Framer Motion 11.3.28
- 006-admin-class-auth: Added TypeScript 5.2.2 (strict mode) + Next.js 15 (Pages Router), React 19, MUI v6, Mongoose 8.4, Firebase Admin 13.7.0


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
