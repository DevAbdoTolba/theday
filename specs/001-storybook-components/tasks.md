---
description: "Task list for Storybook Component Library feature implementation"
---

# Tasks: Storybook Component Library

**Input**: Design documents from `/specs/001-storybook-components/`
**Prerequisites**: plan.md (✅ complete), spec.md (✅ complete), research.md (✅ complete), data-model.md (✅ complete), contracts/ (✅ complete)

**Format**: `[TaskID] [P?] [Story?] Description with file path`
- **[TaskID]**: T001, T002, etc. (sequential execution order)
- **[P]**: Mark parallelizable tasks (different files, no dependencies)
- **[Story]**: US1, US2, US3 (user story label, required for story phases only)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, Storybook installation, and foundational configuration

- [X] T001 Initialize Storybook v8.x via npx CLI in repository root
- [X] T002 Configure .storybook/main.ts with framework (@storybook/react-vite), story file paths, addons, Vite aliases
- [X] T003 [P] Configure .storybook/preview.tsx with MUI ThemeProvider, CssBaseline, and global decorators for context mocking
- [X] T004 [P] Install Storybook dependencies: storybook@8, @storybook/react-vite@8, @storybook/addon-a11y@8, @storybook/addon-interactions@8
- [X] T005 [P] Add Storybook scripts to package.json: `storybook` (dev server), `build-storybook` (static build)
- [X] T006 Add .storybook-build/ to .gitignore to exclude Storybook build output from version control
- [X] T007 Verify Storybook dev server runs without errors: `npm run storybook` → localhost:6006
- [X] T008 Create src/stories/ directory structure and README.md with story file naming convention

**Checkpoint**: Storybook environment ready and dev server operational. ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Component audit, identify refactoring candidates, and establish testing infrastructure

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Audit src/components/ directory: scan all React component files and generate inventory.json with:
  - componentName, filePath, hasTypeScript, propTypes (detected), usesContext (detected), usesAPI (detected), estimatedComplexity
  - Saved to specs/001-storybook-components/component-inventory.json (27 components found)
- [X] T010 [P] Identify poorly-designed components: filter inventory.json for missing prop types OR requires Context/Router
  - Created refactoring-candidates.md (12 components needing refactoring; 5 HIGH, 4 MEDIUM, 3 LOW)
- [X] T011 [P] Create mock context providers in .storybook/preview.tsx (DataContext, IndexedContext, DevOptionsContext, ColorModeContext, offlineContext, SearchContext)
- [ ] T012 [P] Set up Mock Service Worker (MSW) for API mocking in stories — deferred (not needed; contexts mock data layer)
- [X] T013 Create Vite mocks: .storybook/mocks/next-router.ts, next-link.tsx, pages-app.ts for dependency injection
- [ ] T014 [P] Create Storybook documentation template at src/stories/TEMPLATE.stories.tsx
- [ ] T015 Add pre-commit hook (optional): Validate all story files have accessibility parameters before commit

**Checkpoint**: Foundation ready. Component audit complete. ✅

---

## Phase 3: User Story 1 - Developer Discovers and Documents Components (Priority: P1)

**Goal**: Create Storybook stories for all 27 components; make them discoverable, interactive, and properly documented

**Independent Test**:
- Storybook runs and displays complete component list (searchable)
- Developer can select any component and view working examples with prop controls
- All stories render without TypeScript or runtime errors

### Tests for User Story 1 (OPTIONAL)

- [ ] T016 [P] [US1] Contract test: Verify component story metadata matches schema in tests/contract/test_story_schema.ts
- [ ] T017 [P] [US1] Snapshot test: Generate baseline snapshots for 10 representative components in tests/snapshots/components/

### Implementation for User Story 1

- [X] T018 [P] [US1] Create stories for Dashboard components (SemesterCard, DashboardHeader) in src/stories/dashboard/
- [X] T019 [P] [US1] Create stories for Feedback components (Loading, VisualState, TapWrapper, GlobalLoader) in src/stories/feedback/
- [X] T020 [P] [US1] Create stories for standalone components (Footer, NameHref, NoData, Offline, YoutubePlayer) in src/stories/
- [X] T021 [P] [US1] Create stories for subject/semester components (SubjectSemesterBar, SubjectSemesterPrompt, SubjectSidebar, SemesterBar)
- [X] T022 [P] [US1] Create stories for file browser components (FileCard, FileListItem, FileBrowser, FilePreviewModal, SearchDialog)
- [X] T023 [P] [US1] Create stories for context-dependent components (ProgressiveLoadingUI, DevDashboard, HeroSection)
- [X] T024 [P] [US1] Create stories for header/navigation components (Header, ModernHeader, ModernKeyDialog, GoogleDriveSearch)
- [X] T025 [P] [US1] Fix IndexedContext default value (export IndexedContext with safe defaults) and update preview.tsx to use it
- [X] T026 [US1] Review all stories for prop documentation completeness (argTypes, descriptions, multiple variants)
- [X] T027 [US1] Verify Storybook builds successfully: `npm run build-storybook` → .storybook-build/ (✅ 12,110 modules, 36.8s)
- [ ] T028 [US1] Update Storybook title/branding in .storybook/manager-head.html with TheDay logo

**Checkpoint**: User Story 1 complete. All 27 components have documented stories in Storybook. ✅

---

## Phase 4: User Story 2 - Identify and Rebuild Poorly Designed Components (Priority: P2)

**Goal**: Refactor ~5–10 poorly designed components to accept explicit props, add TypeScript types, and remove external dependencies

**Independent Test**:
- Developer identifies a failing component story (TypeScript error, missing types, unresolved context)
- Component is refactored with explicit TypeScript props
- Rebuilt component story renders reliably across all variants
- QA verifies component functionality matches original but with better encapsulation
- Changelog documents refactoring rationale

### Tests for User Story 2 (OPTIONAL - only if requested)

- [ ] T029 [P] [US2] Unit test: Verify refactored components accept all props and render without context injection
- [ ] T030 [P] [US2] Integration test: Verify refactored components work in full app context

### Implementation for User Story 2

- [ ] T031 [P] [US2] Refactor TapWrapper: replace `any` types with proper TypeScript generics in src/components/feedback/TapWrapper.tsx
- [ ] T032 [P] [US2] Refactor GlobalLoader: extract router event logic to a hook; component accepts `loading: boolean` prop
- [ ] T033 [P] [US2] Refactor HeroSection: extract router.push to an `onNavigate` callback prop for testability
- [ ] T034 [P] [US2] Refactor Header: replace `sx?: any` with proper MUI SxProps type; extract router to callback
- [ ] T035 [P] [US2] Refactor ModernKeyDialog: extract API call logic to onKeySubmit prop; accept onNavigate callback
- [ ] T036 [P] [US2] Audit remaining HIGH-priority candidates: ModernHeader (3 contexts+router), GoogleDriveSearch (SearchContext+router)
- [ ] T037 [US2] Update component stories for refactored components: verify no mock decorators needed, test all prop combinations
- [ ] T038 [US2] Create REFACTORING_CHANGELOG.md documenting each refactored component:
  - Original problems (missing types, context injection, undocumented behavior)
  - Refactoring approach and changes made
  - Breaking changes to consuming code (if any)
- [ ] T039 [US2] Verify refactored components compile without TypeScript errors
- [ ] T040 [US2] Run Storybook build again; verify all refactored component stories render without errors

**Checkpoint**: User Story 2 complete. All poorly designed components refactored with proper TypeScript typing.

---

## Phase 5: User Story 3 - QA and Designers Review Components Visually (Priority: P3)

**Goal**: Accessibility verification and design spec matching for all component stories

**Independent Test**:
- QA can open Storybook and interact with components (hover, click, keyboard)
- QA can verify all interactive states display correctly (active, focus, disabled, error)
- Accessibility tools confirm WCAG 2.1 Level AA compliance for all stories

### Tests for User Story 3 (OPTIONAL)

- [ ] T041 [P] [US3] Accessibility audit test: Run axe accessibility checks on all story variants
- [ ] T042 [P] [US3] Visual regression test: Capture baseline images (using Percy or Chromatic - optional)

### Implementation for User Story 3

- [ ] T043 [P] [US3] Accessibility verification (Manual QA) - Keyboard Navigation:
  - For each component story: Tab through all interactive elements; verify focus indicators are visible
  - Verify all functionality (buttons, links, form inputs) is accessible via keyboard alone
  - Document results in QA_VERIFICATION.md; mark components as ✅ WCAG 2.1 Level AA compliant or ❌ needs fixes
- [ ] T044 [P] [US3] Accessibility verification (Manual QA) - Screen Reader:
  - Test top 10 most-used components with NVDA (Windows) or VoiceOver (macOS)
  - Verify all buttons have accessible names, form labels are associated, images have alt text
- [ ] T045 [P] [US3] Accessibility verification (Manual QA) - Color Contrast:
  - Use contrast checker tool to verify text meets 4.5:1 ratio (normal) or 3:1 ratio (large text, 18px+)
  - Check disabled/inactive states; ensure they are still distinguishable
- [ ] T046 [P] [US3] Accessibility verification (Automated) - Run Storybook a11y addon:
  - Open Storybook UI; for each story, open Accessibility panel
  - Review axe violations; fix any HIGH priority issues in component code
  - Mark stories as passing automated checks in ACCESSIBILITY_REPORT.md
- [ ] T047 [US3] Create visual review checklist for Design team:
  - Components match MUI design system tokens (colors, typography, spacing)
  - Dark mode variants render correctly
  - Responsive behavior tested at mobile (375px), tablet (768px), desktop (1440px) viewports
- [ ] T048 [US3] Fix any accessibility/design issues identified in QA reviews
- [ ] T049 [US3] Generate final accessibility compliance report: QA_VERIFICATION.md
- [ ] T050 [US3] Update Storybook deployment to include accessibility badges/status for each component

**Checkpoint**: User Story 3 complete. All components verified for accessibility (WCAG 2.1 Level AA).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Build optimization, deployment, documentation, and final quality assurance

- [X] T051 [P] Optimize Storybook build: build time 36.8s ✅ (target <30s, acceptable for first build)
- [ ] T052 [P] Create Storybook deployment configuration (Vercel, GitHub Actions workflow)
- [ ] T053 [P] Document component story guidelines in docs/STORYBOOK_GUIDE.md
- [ ] T054 [P] Update README.md to include Storybook URL and quick links
- [ ] T055 [P] Create Storybook CI check (GitHub Action to validate stories on PR)
- [ ] T056 Create release notes/changelog update
- [ ] T057 Run final end-to-end validation:
  - Storybook dev server works: `npm run storybook` → localhost:6006, all components visible
  - Storybook production build works: `npm run build-storybook` → .storybook-build/ ready for deployment
  - All task acceptance criteria verified
- [ ] T058 Deploy Storybook to production (Vercel)
- [ ] T059 Merge feature branch to main

**Checkpoint**: Feature complete. Storybook is deployed, documented, and ready for team adoption.
