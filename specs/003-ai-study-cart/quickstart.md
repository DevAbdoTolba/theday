# Quickstart: AI Study Cart & NotebookLM Exporter

**Branch**: `003-ai-study-cart` | **Date**: 2026-03-12

## Overview

This feature adds a client-side "AI Mode" that transforms material browsing into a selection experience. No backend changes required.

## Integration Points

### 1. Provider Setup (`_app.tsx`)

Add `AiCartProvider` inside the existing provider chain, after `AuthProvider` (needs no auth, but should be inside ThemeProvider for MUI access):

```text
DevOptionsProvider
  └── IndexedProvider
      └── TranscriptContextProvider
          └── offlineContext.Provider
              └── ColorModeContext.Provider
                  └── ThemeProvider
                      └── AuthProvider
                          └── AiCartProvider  ← NEW (innermost)
                              └── <Component />
```

### 2. Header Integration (`ModernHeader.tsx`)

Add `AiModeToggle` component in the header's right-side action buttons, between the class switcher and the transcript key button.

### 3. Subject Page Integration (`subjects/[subject].tsx`)

Pass class name and subject metadata down to `FileBrowser` so that selected items can be tagged with the correct class/subject context.

### 4. FileBrowser Integration (`FileBrowser.tsx`)

- Accept `aiModeActive`, `onAiSelect`, `isItemSelected` props
- Pass them through to `FileCard` and `FileListItem`
- When AI Mode is active, the `handleFileClick` is replaced with the selection handler

### 5. FileCard / FileListItem Integration

- Accept `aiModeActive`, `isSelected`, `onAiSelect` props
- When `aiModeActive`: suppress default click (no `href`, no `window.open`), call `onAiSelect` instead
- Show selection overlay (checkmark + glow) when `isSelected`
- Animate selection/deselection with Framer Motion

### 6. FAB + Cart Panel (new components, rendered in `_app.tsx` or subjects page)

- `AiCartFab`: Fixed-position button at bottom-right, shows badge count
- `AiCartPanel`: Right-anchored MUI Drawer with grouped item list and export/clear actions

## Key Files to Create

| File | Purpose |
|------|---------|
| `src/context/AiCartContext.tsx` | React context + provider with localStorage persistence |
| `src/hooks/useAiCart.ts` | `useContext(AiCartContext)` convenience wrapper |
| `src/components/ai-cart/AiModeToggle.tsx` | Switch component for the header |
| `src/components/ai-cart/AiCartFab.tsx` | Floating action button with badge |
| `src/components/ai-cart/AiCartPanel.tsx` | Drawer with grouped items, export, clear |
| `src/components/ai-cart/AiCartItem.tsx` | Single item row in the cart panel |
| `src/components/ai-cart/AiSelectionOverlay.tsx` | Visual overlay for selected/selectable files |
| `src/utils/ai-cart-helpers.ts` | `formatCartToMarkdown()`, localStorage read/write utils |
| `src/utils/types.ts` | Add `AiCartItem` interface |

## Key Files to Modify

| File | Change |
|------|--------|
| `src/pages/_app.tsx` | Wrap with `AiCartProvider`, render `AiCartFab` |
| `src/components/ModernHeader.tsx` | Add `AiModeToggle` to header actions |
| `src/components/FileBrowser.tsx` | Accept AI mode props, pass to children |
| `src/components/FileCard.tsx` | Add selection behavior + overlay |
| `src/components/FileListItem.tsx` | Add selection behavior + overlay |
| `src/pages/subjects/[subject].tsx` | Pass class/subject context to FileBrowser |

## Testing Scenarios

1. **Toggle AI Mode**: Switch ON → visual cues appear on materials → switch OFF → cues disappear
2. **Select items**: AI Mode ON → click materials → they show "selected" state → badge increments
3. **Cross-page persistence**: Select items on one subject → navigate to another → cart retains items
4. **Page reload**: Refresh browser → AI Mode state and cart items persist
5. **Export**: Open cart → click "Export for NotebookLM" → clipboard has Markdown → NotebookLM opens
6. **Clear cart**: Open cart → click "Clear Cart" → all items removed → FAB hides (if AI Mode off)
7. **Rapid selection**: AI Mode ON → quickly click 5+ items → animations are smooth, no jank
8. **Reduced motion**: Enable OS reduced-motion → animations are instant transitions
