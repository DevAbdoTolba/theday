# Data Model: NotebookLM Study Session Builder

**Date**: 2026-03-16 | **Feature**: 008-notebooklm-study-builder

## Overview

All data is client-side only. No database models, no API contracts. Two localStorage keys hold the entire state.

## Entities

### SessionItem

A single collected file/video reference.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Google Drive file ID (unique identifier) |
| name | string | yes | Display name (parsed, without staging suffix) |
| url | string | yes | Full URL — Drive preview or YouTube watch URL |
| type | ParsedFile['type'] | yes | File type: 'pdf' \| 'image' \| 'video' \| 'youtube' \| 'doc' \| 'slide' \| 'sheet' \| 'unknown' |
| subjectName | string | yes | Full subject name (e.g., "Data Structures") |
| subjectAbbr | string | yes | Subject abbreviation (e.g., "DS") |
| category | string | yes | Category within subject (e.g., "Lectures") |
| thumbnailUrl | string | no | Thumbnail URL for panel display |
| addedAt | number | yes | Timestamp (Date.now()) when item was added |

**Identity rule**: Unique by `id` (Drive file ID). If the same file appears in multiple categories (not possible in current data model but defensive), the first selection wins.

**Excluded types**: Items with `type === 'folder'` are never stored. Selection is blocked at the UI level.

### StudySessionState

The full state managed by StudySessionContext.

| Field | Type | Description |
|-------|------|-------------|
| isActive | boolean | Whether Study Mode is currently enabled |
| items | SessionItem[] | Ordered array of collected items (insertion order) |

### localStorage Schema

| Key | Type | Description |
|-----|------|-------------|
| `studyModeActive` | `"true"` \| `"false"` | Study Mode toggle state |
| `studySessionItems` | JSON string (SessionItem[]) | Serialized items array |

**Size estimate**: Each SessionItem is ~300 bytes JSON. 50 items ≈ 15KB. Well within localStorage's ~5MB limit.

## State Transitions

```
Study Mode OFF, 0 items (initial state)
  → toggle mode → Study Mode ON, 0 items
  → (FAB hidden)

Study Mode ON, 0 items
  → select file → Study Mode ON, 1 item
  → toggle mode → Study Mode OFF, 0 items
  → (FAB visible with badge "0" or hidden until first item)

Study Mode ON, N items (1 ≤ N < 50)
  → select file → Study Mode ON, N+1 items
  → deselect file → Study Mode ON, N-1 items
  → remove from panel → Study Mode ON, N-1 items
  → clear all (confirmed) → Study Mode ON, 0 items
  → toggle mode → Study Mode OFF, N items (items preserved)
  → copy URLs → no state change (clipboard side effect)
  → copy context → no state change (clipboard side effect)
  → open NotebookLM → no state change (new tab side effect)

Study Mode ON, 50 items (limit reached)
  → select file → BLOCKED with warning toast
  → deselect/remove → Study Mode ON, 49 items (unblocked)

Study Mode OFF, N items (N > 0)
  → (FAB visible — student can open panel to export/clear)
  → toggle mode → Study Mode ON, N items
  → open panel via FAB → can export/remove/clear
```

## Export Formats

### URL Export (Copy URLs)

Plain text, one URL per line:

```
https://drive.google.com/file/d/abc123/preview
https://www.youtube.com/watch?v=xyz789
https://drive.google.com/file/d/def456/preview
```

### Context Export (Copy Study Context)

Structured XML-inspired text (see research.md R6 for full example):

```xml
<study-session>
  <subject name="[Full Name]" abbreviation="[ABBR]">
    <category name="[Category]">
      <material name="[Display Name]" type="[type]" />
    </category>
  </subject>
  <instructions>
    [AI study instructions for cross-subject connections]
  </instructions>
</study-session>
```

Items are grouped by `subjectName` → `category`, sorted alphabetically by subject then category. Materials within a category are in insertion order.
