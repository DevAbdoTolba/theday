# Component Refactoring Candidates

**Feature**: 001-storybook-components
**Generated**: 2026-03-12
**Total Needing Refactoring**: 12 components

---

## High Priority (Multiple Issues — Hard to Document in Storybook)

### 1. ModernKeyDialog
**File**: `src/components/ModernKeyDialog.tsx`
**Issues**: Context dependency (DataContext) + router dependency + API call to `/api/getTranscriptName`
**Approach**: Add storybook decorator to provide DataContext; mock API call using MSW; storybook-params for router
**Effort**: HIGH
**Changelog Entry**: Extracted API dependency to be injectable via props; added MSW mock for `/api/getTranscriptName`

### 2. ModernHeader
**File**: `src/components/ModernHeader.tsx`
**Issues**: Three context dependencies (ColorModeContext, offlineContext, DataContext) + router usage
**Approach**: All 3 contexts are already provided by preview.tsx decorator; router needs `@storybook/nextjs` OR route-mock
**Effort**: HIGH
**Changelog Entry**: All contexts injectable via Storybook global decorators; router mocked for story display

### 3. GoogleDriveSearch
**File**: `src/components/GoogleDriveSearch.tsx`
**Issues**: Two context dependencies (SearchContext, DevOptionsContext) + router usage + complex state
**Approach**: SearchContext needs a mock decorator; DevOptionsContext already in preview.tsx
**Effort**: HIGH
**Changelog Entry**: Added SearchContext mock decorator; router dependency isolated to event handlers

### 4. Header
**File**: `src/components/Header.tsx`
**Issues**: Router usage + `sx?: any` type (Constitution violation)
**Approach**: Router calls extracted to callback props; `sx: SxProps<Theme>` type replacing `any`
**Effort**: MEDIUM
**Changelog Entry**: Replaced `any` type on `sx` prop with `SxProps<Theme>`; router dependency isolated

### 5. ProgressiveLoadingUI
**File**: `src/components/ProgressiveLoadingUI.tsx`
**Issues**: `DevOptionsContext` dependency + `data: any` type
**Approach**: DevOptionsContext already in preview.tsx; replace `any` type with proper interface
**Effort**: MEDIUM
**Changelog Entry**: Replaced `data: any` with typed `folderData` interface

---

## Medium Priority (Single Issue — Needs Minor Fix)

### 6. HeroSection
**File**: `src/components/HeroSection.tsx`
**Issues**: No TS interface + router dependency (reads `router.query` for last subject)
**Approach**: Add `lastSubject?: { name: string; abbr: string }` prop as override for Storybook
**Effort**: MEDIUM
**Changelog Entry**: Added optional `lastSubject` prop for static rendering in Storybook/tests

### 7. SubjectSidebar
**File**: `src/components/SubjectSidebar.tsx`
**Issues**: DataContext dependency (for transcript data)
**Approach**: Context is already mocked in preview.tsx global decorator — stories work without changes
**Effort**: LOW
**Changelog Entry**: Verified DataContext mock in Storybook preview covers SubjectSidebar needs

### 8. SearchDialog
**File**: `src/components/SearchDialog.tsx`
**Issues**: Uses `IndexedContext` for new-items detection
**Approach**: Add IndexedContext mock to preview.tsx decorator
**Effort**: LOW
**Changelog Entry**: Added IndexedContext mock to Storybook global decorator

### 9. GlobalLoader
**File**: `src/components/feedback/GlobalLoader.tsx`
**Issues**: No TS interface + depends on Next.js router events (routeChangeStart/Complete)
**Approach**: Render in static "loading" state for Storybook by adding `isLoading?: boolean` prop
**Effort**: LOW
**Changelog Entry**: Added `isLoading` prop for static Storybook rendering; router events still work in app

---

## Low Priority (Add TypeScript Interface Only)

### 10. Loading
**File**: `src/components/Loading.tsx`
**Issues**: No TypeScript props interface
**Approach**: Add empty interface (no props required) — purely presentational
**Effort**: LOW
**Changelog Entry**: Added explicit TypeScript export type (no-props component)

### 11. TapWrapper
**File**: `src/components/feedback/TapWrapper.tsx`
**Issues**: Uses `any` for all props (Constitution violation)
**Approach**: Replace `any` with `{ children: React.ReactNode; onClick: () => void; sx?: React.CSSProperties }`
**Effort**: LOW
**Changelog Entry**: Replaced `any` types with explicit TypeScript interfaces

### 12. DevDashboard
**File**: `src/components/DevDashboard.tsx`
**Issues**: No TS interface + DevOptionsContext dependency
**Approach**: DevOptionsContext already in preview.tsx; add empty interface
**Effort**: LOW
**Changelog Entry**: Added TypeScript interface; DevOptionsContext provided via Storybook global decorator

---

## Summary

| Priority | Component | Issues | Effort |
|----------|-----------|--------|--------|
| HIGH | ModernKeyDialog | Context + Router + API | HIGH |
| HIGH | ModernHeader | 3x Context + Router | HIGH |
| HIGH | GoogleDriveSearch | 2x Context + Router | HIGH |
| HIGH | Header | Router + `any` types | MEDIUM |
| HIGH | ProgressiveLoadingUI | Context + `any` type | MEDIUM |
| MED | HeroSection | Router + no interface | MEDIUM |
| MED | SubjectSidebar | DataContext | LOW |
| MED | SearchDialog | IndexedContext | LOW |
| MED | GlobalLoader | Router + no interface | LOW |
| LOW | Loading | No interface | LOW |
| LOW | TapWrapper | `any` types | LOW |
| LOW | DevDashboard | Context + no interface | LOW |

**Estimated Total Refactoring Effort**: ~8–12 hours across the team
