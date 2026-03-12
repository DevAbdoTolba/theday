# Data Model: AI Study Cart & NotebookLM Exporter

**Branch**: `003-ai-study-cart` | **Date**: 2026-03-12

## Entities

### AiCartItem

A study material selected for export. Stored as a JSON object in the `aiCartItems` localStorage array.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier — Google Drive file ID (matches `ParsedFile.id`) |
| `name` | `string` | Yes | Display name of the material (matches `ParsedFile.name`) |
| `url` | `string` | Yes | Clickable URL — Drive preview link or extracted external URL (matches `ParsedFile.url`) |
| `type` | `'folder' \| 'pdf' \| 'image' \| 'video' \| 'youtube' \| 'doc' \| 'sheet' \| 'slide' \| 'unknown'` | Yes | Content type (matches `ParsedFile.type`) |
| `className` | `string` | Yes | The class this material belongs to (e.g., "CS 2110") — from TranscriptContext/localStorage |
| `subjectName` | `string` | Yes | The subject this material belongs to (e.g., "Calculas 1") — full name from data.json |
| `subjectAbbr` | `string` | Yes | Subject abbreviation (e.g., "CALC1") — from route parameter |
| `category` | `string` | Yes | The folder/category name (e.g., "Lectures", "Assignments") — from FileBrowser active tab |
| `thumbnailUrl` | `string \| undefined` | No | Thumbnail URL if available (matches `ParsedFile.thumbnailUrl`) |
| `addedAt` | `number` | Yes | Timestamp (Date.now()) when item was added — for display ordering |

**Identity rule**: Uniquely identified by `id` (Drive file ID). Deduplication uses this field.

**Validation rules**:
- `id` must be a non-empty string
- `url` must be a non-empty string
- `className` must be a non-empty string
- `subjectName` must be a non-empty string

### AiCartState (Context Value)

The React context shape exposed by `AiCartContext`.

| Field | Type | Description |
|-------|------|-------------|
| `aiModeActive` | `boolean` | Whether AI selection mode is currently ON |
| `items` | `AiCartItem[]` | All items currently in the cart |
| `itemCount` | `number` | Computed: `items.length` |
| `toggleAiMode` | `() => void` | Toggle AI Mode on/off (persists to localStorage) |
| `addItem` | `(item: AiCartItem) => void` | Add item to cart (deduplicates by `id`) |
| `removeItem` | `(id: string) => void` | Remove item by `id` |
| `toggleItem` | `(item: AiCartItem) => void` | Add if not present, remove if present |
| `clearCart` | `() => void` | Remove all items and clear localStorage |
| `isSelected` | `(id: string) => boolean` | Check if item with given `id` is in cart |
| `exportMarkdown` | `() => string` | Generate grouped Markdown string |

## localStorage Keys

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `aiModeActive` | `"true" \| "false"` | `"false"` | AI Mode toggle state |
| `aiCartItems` | `string` (JSON array) | `"[]"` | Serialized `AiCartItem[]` |

## Relationships

```text
AiCartItem
  ├── className  → matches localStorage "className" / TranscriptContext
  ├── subjectName → derived from data.json lookup by subjectAbbr
  ├── subjectAbbr → matches route param in /subjects/[subject]
  ├── category    → matches FileBrowser category tab key
  └── id/name/url/type → derived from ParsedFile (via parseGoogleFile)
```

## Grouping Structure (for display and export)

```text
Cart Items
└── Grouped by className
    └── Grouped by subjectName
        └── Individual AiCartItem entries
            (sorted by addedAt ascending within each group)
```

## Export Format (Markdown)

```markdown
# {className}

## {subjectName}

- [{item.name}]({item.url})
- [{item.name}]({item.url})

## {subjectName2}

- [{item.name}]({item.url})

# {className2}

## {subjectName}

- [{item.name}]({item.url})
```

## State Transitions

```text
AI Mode: OFF → ON (toggle)
  - Visual cues appear on all materials
  - FAB becomes visible (if not already)
  - Click behavior changes: select instead of open

AI Mode: ON → OFF (toggle)
  - Visual cues removed
  - Click behavior reverts to default (open/navigate)
  - Cart items are NOT cleared
  - FAB remains visible if items.length > 0

Cart Item Lifecycle:
  [not in cart] → addItem/toggleItem → [in cart] → removeItem/toggleItem → [not in cart]
  [in cart] → clearCart → [not in cart]

FAB Visibility:
  Hidden when: aiModeActive === false AND items.length === 0
  Visible when: aiModeActive === true OR items.length > 0
```
