# Quickstart: NotebookLM Study Session Builder

**Branch**: `008-notebooklm-study-builder`

## What This Feature Does

Adds a "Study Mode" to subject browsing pages. Students toggle it on, tap file cards to collect materials across multiple subjects, then export URLs and structured context for Google NotebookLM.

## Architecture at a Glance

```
StudySessionContext (in _app.tsx)
  ├── StudyModeToggle (in ModernHeader, subject pages only)
  ├── StudyFab (in _app.tsx, visible when active or items > 0)
  │   └── CollectionPanel (drawer, opened by FAB tap)
  │       ├── CollectionGroup (per subject, collapsible)
  │       │   └── SessionItemRow (per item, removable)
  │       └── Footer: Copy URLs | Copy Context | Open NotebookLM | Clear
  └── Selection props flow:
      [subject].tsx → FileBrowser → FileCard / FileListItem
                                     └── SelectionOverlay
```

## Key Files

| File | Purpose |
|------|---------|
| `src/context/StudySessionContext.tsx` | Context provider + `useStudySession` hook. Manages items array, localStorage persistence, cross-tab sync. |
| `src/components/study/StudyModeToggle.tsx` | Header toggle switch. Calls `toggleMode()` from context. |
| `src/components/study/SelectionOverlay.tsx` | Visual overlay on file cards — pulsing border when selectable, check icon when selected. |
| `src/components/study/StudyFab.tsx` | Floating action button with MUI Badge for item count. Toggles CollectionPanel. |
| `src/components/study/CollectionPanel.tsx` | MUI Drawer showing grouped items and export actions. |
| `src/components/study/CollectionGroup.tsx` | Collapsible subject section within the panel. |
| `src/components/study/SessionItemRow.tsx` | Single item row with remove button. |
| `src/components/study/ClipboardFallback.tsx` | Textarea modal when clipboard API fails. |
| `src/utils/study-export.ts` | Pure functions: `formatUrls(items)` and `formatStudyContext(items)`. |
| `src/styles/study-mode.css` | Keyframe animations for selection pulse. |

## Modified Files

| File | Change |
|------|--------|
| `src/pages/_app.tsx` | Wrap with `StudySessionProvider`, render `StudyFab`, import study-mode.css |
| `src/components/ModernHeader.tsx` | Add `StudyModeToggle` (subject pages only) |
| `src/components/FileCard.tsx` | Add `studyModeActive`, `isSelected`, `onStudySelect` props + `SelectionOverlay` |
| `src/components/FileListItem.tsx` | Add same three props + selected styling |
| `src/components/FileBrowser.tsx` | Accept and pass through study selection props |
| `src/pages/subjects/[subject].tsx` | Wire `useStudySession` to FileBrowser selection props |

## Data Flow

1. `StudySessionContext` hydrates from localStorage on mount
2. `[subject].tsx` reads `isActive`, `isSelected`, `toggleItem` from context
3. Passes them through `FileBrowser` → `FileCard` / `FileListItem` as props
4. User taps card → `toggleItem(sessionItem)` → context updates state + localStorage
5. FAB badge updates reactively from `itemCount`
6. User taps FAB → `CollectionPanel` opens → shows grouped items
7. User taps "Copy URLs" → `formatUrls(items)` → `navigator.clipboard.writeText()`
8. User taps "Open NotebookLM" → auto-copy URLs + `window.open('https://notebooklm.google.com')`

## No Server Changes

This feature is 100% client-side. No new API routes, no database models, no server-side code.
