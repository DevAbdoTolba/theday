# Research: Storybook Component Library Setup

**Feature**: 001-storybook-components
**Date**: 2026-03-12
**Status**: Complete — No critical unknowns remain

## Findings Summary

All technical decisions are resolved. The feature aligns with existing TheDay tech stack and best practices.

### 1. Storybook Version & Configuration

**Decision**: Storybook v7.x (latest stable)

**Rationale**:
- v7 is the current stable release with excellent Next.js/React 19 support
- Provides TypeScript-first configuration
- Built-in accessibility add-ons (axe, ARIA)
- Supports Vite/Webpack both; project uses Webpack (Next.js default)

**Alternatives Considered**:
- Storybook v8 (experimental) — Rejected: stability unknown; v7 sufficient
- Chromatic (hosted Storybook) — Deferred: can be added later for team collaboration

### 2. Story File Location & Organization

**Decision**: Dedicated `src/stories/` directory with parallel component structure

**Rationale**:
- Keeps stories separate from component source, reducing noise in src/components/
- Easier to exclude from production builds
- Matches common Next.js Storybook patterns
- Allows story-only assets (mock data, fixtures) to be co-located

**Alternatives Considered**:
- Co-locate stories in component directories (e.g., Button.stories.tsx next to Button.tsx) — Feasible but less clean for a large component library
- Separate storybook-only repo — Rejected: unnecessary complexity

### 3. Storybook Addons & Tools

**Decision**: Essential add-ons only (no extras initially)

**Selected**:
- `@storybook/addon-essentials` — Controls, Docs, Viewport, Actions (all included)
- `@storybook/addon-a11y` — Accessibility axe checks (required for WCAG 2.1 Level AA)
- `@storybook/addon-interactions` — For interactive testing of component state

**Deferred**:
- Visual regression testing (Percy, Chromatic) — Can be added post-launch
- Design system docs (Zeroheight) — Can be integrated later

### 4. TypeScript Support in Stories

**Decision**: Full TypeScript for all story files; strict typing mandatory

**Rationale**:
- Aligns with Constitution Principle II (TypeScript Strict)
- Type-safe prop definitions prevent runtime errors in stories
- Better IDE autocomplete for developers writing stories

**Implementation**:
- tsconfig.json adjusted for Storybook (include .storybook/*, src/stories/*)
- All stories use `Meta<typeof Component>` pattern for full type safety

### 5. MUI Theme Integration

**Decision**: Storybook preview wraps all stories with MUI ThemeProvider

**Rationale**:
- Components use MUI's sx prop and theme tokens
- Stories must reflect production styling
- Allows theme switching in Storybook (dark/light mode demo)

**Implementation**:
- .storybook/preview.tsx imports MUI theme and wraps all stories
- MUI CssBaseline applied globally

### 6. Handling Components with External Dependencies

**Decision**: Use Storybook decorators to mock/provide dependencies (Context, Redux, etc.)

**Rationale**:
- Components can be tested in isolation without full app bootstrap
- Meets FR-006 (rebuild components to accept explicit props)
- Allows multiple story variants (with/without context)

**Implementation Examples**:
- Redux components: Use Redux mock store via decorator
- Context-dependent: Wrap in MockContextProvider decorator
- Google Drive API calls: Mock via MSW (Mock Service Worker) in browser

### 7. Deployment & Hosting

**Decision**: Vercel deployment (static Storybook build)

**Rationale**:
- Project already uses Vercel for TheDay main app
- Static export of Storybook is trivial to deploy
- Can be auto-deployed on main branch updates
- Free with existing Vercel account

**Alternatives Considered**:
- GitHub Pages — Works but less integrated
- Netlify — Works but unnecessary given Vercel already in use

### 8. Accessibility Testing Strategy

**Decision**: Automated (axe addon) + manual WCAG 2.1 Level AA verification

**Rationale**:
- Storybook addon-a11y catches 40–50% of accessibility issues automatically
- Manual testing catches contrast, focus visibility, keyboard navigation edge cases
- 100% compliance required per spec clarification (WCAG 2.1 Level AA)

**Process**:
- Every story includes axe checks (automated)
- QA manually verifies focus states, keyboard navigation, screen reader compatibility
- Accessibility violation = story cannot be marked complete

### 9. Component Inventory & Refactoring Priority

**Decision**: Audit all 30–50 components; identify refactoring candidates upfront

**Rationale**:
- Prevents bottleneck mid-implementation (discovering broken components too late)
- Allows parallel story writing + component refactoring
- Meets FR-005 (detect components that cannot be rendered in isolation)

**Approach**:
1. Scan src/components/ for TypeScript type definitions
2. Identify imports of external Context, Redux, or API clients (immediate red flags)
3. Create refactoring checklist with estimated effort per component
4. Prioritize: high-reuse components first

### 10. Build & Performance Targets

**Decision**: Storybook build <30 seconds; dev server instant reload

**Rationale**:
- 30 seconds is acceptable for a CI build (component count: 30–50)
- Instant reload in dev mode for developer productivity
- Aligns with Constitution Principle I (User-Centered Performance)

**Monitoring**:
- Track build time in CI logs
- If >30s, optimize by splitting stories into chapters or lazy-loading

## Outstanding Decisions (Deferred to Implementation)

- Exact component refactoring effort estimates (determined during audit)
- Visual regression tool selection (Percy vs. Chromatic vs. none) — not in MVP
- Design token documentation format (can follow Storybook defaults initially)

---

**Research Status**: ✅ Complete. All findings feed into Phase 1 design (data-model.md, quickstart.md, contracts/).
