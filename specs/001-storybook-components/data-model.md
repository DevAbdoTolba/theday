# Data Model: Storybook Component Library

**Feature**: 001-storybook-components
**Date**: 2026-03-12

## Overview

The Storybook component library is primarily a documentation and testing tool with minimal data persistence.
This document captures the logical entities and relationships that define how components, stories, and
component metadata are organized.

## Entities

### Entity 1: Component

**Purpose**: A reusable UI building block with defined props, behavior, and documentation.

**Fields**:
- `name` (string, unique) — Component display name (e.g., "Button", "TextField")
- `description` (string, optional) — Brief description of component purpose
- `filePath` (string) — Absolute path to component source (e.g., `src/components/dashboard/Button.tsx`)
- `isRefactored` (boolean) — Whether component was refactored during this feature (true if it was in "poorly designed" category)
- `typesComplete` (boolean) — Whether all props have TypeScript type definitions
- `storyCount` (integer) — Number of stories defined for this component (typically 3–5)
- `accessibilityStatus` (enum: PENDING | VERIFIED | FAILED) — WCAG 2.1 Level AA compliance status
- `lastVerified` (date, optional) — Last date component was accessibility-tested

**Relationships**:
- `1 Component → N Stories` (one component has many stories)
- `1 Component → 1 RefactoringRecord` (if refactored)

**Validation Rules**:
- `name` and `filePath` are required and unique
- `storyCount` ≥ 1 (every component must have at least one story)
- If `isRefactored === true`, component must pass accessibility test before `accessibilityStatus = VERIFIED`
- If `typesComplete === false`, component is considered incomplete and cannot be published to Storybook build

### Entity 2: Story

**Purpose**: An interactive example demonstrating a component in a specific state or configuration.

**Fields**:
- `id` (string, unique) — Story identifier (e.g., "Button-Primary", "TextField-WithError")
- `name` (string) — Display name in Storybook (e.g., "Primary Button")
- `componentName` (string) — Foreign key to Component.name
- `filePath` (string) — Path to story source file (e.g., `src/stories/Button.stories.tsx`)
- `storyType` (enum: DEFAULT | INTERACTIVE | VARIANT | EDGE_CASE) — Categorizes the story's purpose
- `args` (object) — Default props/controls for the story (e.g., `{ label: "Click me", variant: "primary" }`)
- `accessibility` (object) — Accessibility metadata for this specific story:
  - `wcagLevel` (enum: A | AA | AAA) — Compliance target for this story (typically AA)
  - `axeStatus` (enum: PASS | FAIL | REVIEW) — Automated axe addon result
  - `manualReviewNeeded` (boolean) — Whether QA must manually verify this story
- `isPublished` (boolean) — Whether story is included in Storybook build (false during development)

**Relationships**:
- `N Stories → 1 Component` (multiple stories per component)

**Validation Rules**:
- `componentName` must reference an existing Component
- `storyType` defaults to DEFAULT if not specified
- If `accessibility.wcagLevel = AA` and `accessibility.axeStatus = FAIL`, story cannot be published
- `isPublished` defaults to false until component + story are accessibility-verified

### Entity 3: RefactoringRecord

**Purpose**: Audit trail of components that were refactored during this feature.

**Fields**:
- `componentName` (string) — Foreign key to Component.name
- `originalProblems` (array of strings) — Issues identified (e.g., "missing TypeScript types", "requires Context injection")
- `refactoringApproach` (string) — Description of how component was fixed
- `estimatedEffort` (enum: LOW | MEDIUM | HIGH) — Developer time estimate
- `completionDate` (date, optional) — Date refactoring was completed
- `testCoverage` (object):
  - `storyCount` (integer) — Number of stories written for refactored component
  - `accessibilityVerified` (boolean) — WCAG 2.1 Level AA verification complete
- `changelogEntry` (string, required) — What changed; included in feature changelog

**Relationships**:
- `1 RefactoringRecord ← 1 Component`

**Validation Rules**:
- `componentName` must reference a Component with `isRefactored = true`
- `originalProblems` array must not be empty
- `completionDate` is required before component can be published
- `changelogEntry` must be non-empty and human-readable

### Entity 4: StoryMetadata

**Purpose**: Captures configuration and build information for Storybook itself.

**Fields**:
- `version` (string) — Storybook version (e.g., "7.5.0")
- `builtAt` (date) — Last Storybook build timestamp
- `buildTimeMs` (integer) — Time to build Storybook (milliseconds)
- `totalComponentsIndexed` (integer) — Count of components included in build
- `totalStoriesIndexed` (integer) — Count of stories included in build
- `accessibilityStatus` (object):
  - `componentsCertified` (integer) — Components passing WCAG 2.1 Level AA
  - `pendingReview` (integer) — Components not yet manually verified
  - `failures` (integer) — Components failing accessibility checks
- `deployment` (object):
  - `url` (string) — Public/internal URL where Storybook is deployed
  - `lastDeployment` (date) — Timestamp of latest deployment

**Validation Rules**:
- `totalComponentsIndexed` should equal number of published components (validation check)
- `totalStoriesIndexed` should equal sum of all Story.isPublished = true records
- `buildTimeMs` must be <30,000 (30 seconds) per performance goal
- `accessibilityStatus.componentsCertified + pendingReview + failures` should equal `totalComponentsIndexed`

## Relationships & Dependencies

```
Component (1) ──→ (N) Story
    ↓ (optional)
RefactoringRecord

Story → Component (required foreign key)

StoryMetadata (singleton) ← references all Components & Stories (aggregation)
```

## State Transitions

### Component Lifecycle

```
NOT_INDEXED
    ↓ (added to project)
DISCOVERED [typesComplete = false, storyCount = 0]
    ↓ (stories created)
STORY_CREATED [storyCount ≥ 1]
    ↓ (if refactoring needed)
REFACTORING_IN_PROGRESS [isRefactored = true, accessibilityStatus = PENDING]
    ↓ (refactoring complete, accessibility verified)
VERIFIED [accessibilityStatus = VERIFIED, typesComplete = true]
    ↓ (included in Storybook build)
PUBLISHED
```

### Story Lifecycle

```
DRAFT [isPublished = false]
    ↓ (accessibility checks pass or marked for review)
READY_FOR_REVIEW [accessibility.axeStatus = PASS]
    ↓ (manual verification complete)
VERIFIED [accessibility.manualReviewNeeded = false]
    ↓ (included in Storybook build)
PUBLISHED [isPublished = true]
```

## Data Volume & Scale

- **Components**: 30–50 total
- **Stories per component**: 3–5 (average)
- **Total stories**: ~150–250
- **Refactored components**: ~5–10 (estimated)
- **Storage**: Minimal; all data is configuration + markdown (no database required)
- **Build output**: ~10–50 MB (compiled Storybook app; git-ignored)

## Consistency & Integrity Rules

1. **Component Completeness**: A component cannot be published unless:
   - `typesComplete = true` (all props typed)
   - `storyCount ≥ 1` (at least one story)
   - `accessibilityStatus = VERIFIED` (WCAG 2.1 Level AA checked)

2. **Story Consistency**: A story cannot be published unless:
   - Its referenced Component is published
   - `accessibility.wcagLevel = AA` (or higher)
   - `accessibility.axeStatus ≠ FAIL`
   - If `accessibility.manualReviewNeeded = true`, story is held until QA clears it

3. **RefactoringRecord Audit**: Every refactored component must have:
   - Non-empty `originalProblems` array
   - Non-empty `changelogEntry`
   - `completionDate` before publication

## Notes

- Accessibility status is the primary quality gate; no component/story publishes if WCAG 2.1 Level AA is at risk
- All entities are represented as configuration files (JSON/YAML in .storybook/) or TypeScript metadata in story files
- No external database required; data is version-controlled as part of the repository
