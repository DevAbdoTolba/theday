<!--
SYNC IMPACT REPORT
==================
Version change: N/A → 1.0.0 (initial ratification — template was never filled in)
Modified principles: none (first-time population)
Added sections:
  - Core Principles (5 principles derived from project context)
  - Tech Stack & Constraints
  - Development Workflow
  - Governance
Removed sections: N/A (template placeholders replaced)
Templates reviewed:
  - .specify/templates/plan-template.md    ✅ Constitution Check gate already present; principles align
  - .specify/templates/spec-template.md    ✅ user story + acceptance-criteria structure aligns with Principle I
  - .specify/templates/tasks-template.md   ✅ MVP-first / story-driven phases align with Principles IV & V
  - .specify/templates/agent-file-template.md  ✅ generic; no constitution-specific references
  - .specify/templates/checklist-template.md   ✅ generic; no constitution-specific references
  No template modifications required at this time.
Deferred TODOs:
  - TODO(RATIFICATION_DATE): Original adoption date is unknown; marked as TODO until confirmed.
-->

# TheDay Constitution

## Core Principles

### I. User-Centered Performance

Every feature MUST deliver a fast, accessible, and responsive experience for students.
UI decisions MUST be justified by direct user value. Pages MUST load primary content
within 3 seconds on a typical connection. Features that measurably degrade performance
or break keyboard/screen-reader accessibility require explicit documented justification.

**Rationale**: TheDay's users are students under time pressure. A slow or inaccessible
UI directly harms their ability to find and use study materials.

### II. TypeScript Strict

All source code MUST be written in TypeScript. Use of `any` is prohibited unless
unavoidable due to an external library limitation, in which case it MUST be isolated,
narrowly scoped, and accompanied by a `// TODO: tighten type` comment. Component props,
API response shapes, and utility function signatures MUST all carry explicit types.

**Rationale**: 100% TypeScript is already the project standard. Strict typing prevents
runtime errors and makes the codebase approachable for rotating student contributors.

### III. Component Reusability

UI components MUST be reusable and configured via props. MUI primitives are the default
building block; custom components MUST extend or compose — not duplicate — MUI components.
A component that serves only one page and has no reuse potential MUST be justified in its
PR description. Styles MUST use MUI's `sx` prop or theme tokens, not inline CSS strings.

**Rationale**: The project spans 8 semesters with growing surface area. Reusable components
reduce duplication and enforce visual consistency across all pages.

### IV. Performance & Caching

New features that introduce additional API calls MUST document the expected load-time
impact and MUST include a cache invalidation strategy. IndexedDB MUST be used for data
that changes infrequently (course listings, file metadata). The Google Drive API MUST NOT
be called on every page render without a caching layer. PWA service worker behaviour MUST
NOT regress offline capability.

**Rationale**: Load time was historically reduced from 10+ seconds to 2–3 seconds. Every
new feature MUST protect — and ideally improve — this baseline.

### V. Simplicity (YAGNI)

Complexity MUST be justified by a present, concrete requirement. New abstractions,
utilities, helper layers, and npm dependencies are permitted only when they solve an
existing problem that cannot be addressed with the current stack. Speculative features,
premature optimisation, and over-engineered patterns are prohibited. When two approaches
solve the same problem, the simpler one MUST be chosen unless a documented, measurable
reason favours the complex one.

**Rationale**: TheDay is maintained primarily by CS students with varying experience
levels. Simple, direct code lowers the barrier to contribution and review.

## Tech Stack & Constraints

The following technologies form the approved stack. Introducing any library outside
this list requires a documented rationale in the relevant spec or plan document:

- **Framework**: Next.js 15 (follow existing router conventions — do not mix)
- **UI Library**: React 19 + MUI v5 (Material UI)
- **Animations**: Framer Motion (reuse existing motion patterns; no new animation libs)
- **Language**: TypeScript (strict mode enforced)
- **Database**: MongoDB (transcript and class-group features only)
- **External APIs**: Google Drive API v3 (file content), IndexedDB (client-side cache)
- **Deployment**: Vercel (environment variables and edge config must stay Vercel-compatible)

## Development Workflow

- New features MUST begin with a `spec.md` that defines user stories and acceptance
  criteria before any implementation work starts.
- Implementation plans (`plan.md`) MUST include a Constitution Check gate that verifies
  compliance with the Core Principles before Phase 0 research begins.
- Commits MUST be atomic and reference the user story or task they address.
- Pull requests MUST be reviewed for TypeScript correctness, component reusability, and
  performance impact before merging to `main`.
- Breaking changes to shared components or external API contracts MUST be flagged
  explicitly in the PR description.
- Complexity deviations from the Core Principles MUST be documented in the plan's
  Complexity Tracking table with justification.

## Governance

This constitution supersedes all other development practices documented in this
repository. Amendments MUST follow this procedure:

1. Run `/speckit.constitution` to generate a proposed amendment.
2. Increment the version per semantic versioning:
   - **MAJOR**: An existing principle is removed or its meaning fundamentally redefined.
   - **MINOR**: A new principle or major section is added.
   - **PATCH**: Clarifications, wording refinements, typo fixes, non-semantic changes.
3. The amended constitution MUST be reviewed and merged via a pull request — it MUST NOT
   be committed directly to `main` without review.
4. If the amendment invalidates existing code, a migration note MUST be included
   describing the required follow-up work.

All PRs and code reviews MUST verify compliance with the five Core Principles above.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date | **Last Amended**: 2026-03-12
