# Idea: NotebookLM Integration & AI Study Mode Redesign

## Problem

### Current AI Mode is Bare-Bones
The existing AI mode (feature 003-ai-study-cart) is a simple toggle with basic cart functionality — switches and old-school UI. Students don't feel drawn to use it. The UX needs to be immersive, creative, and interactive to drive real adoption.

### NotebookLM Has No API (Free Tier)
- NotebookLM accepts: Google Docs, Slides, PDFs, website URLs, YouTube URLs (with captions), pasted text, images, audio
- Free tier: 50 sources/notebook, no API, no deep linking, no URL pre-population
- Enterprise: $9/license/mo, full REST API (create notebooks, add sources programmatically) — too expensive for a free student platform
- Students must manually add sources to NotebookLM
- Our job: make the collection + export so smooth that the manual step is painless

### Students Need Context, Not Just URLs
Pasting raw URLs into NotebookLM loses the structural context — which subject, which category, how materials relate to each other. A repomix-style structured prompt can provide this context as a pasted text source alongside the actual file sources.

## User Stories

### US1: Student enters an immersive study session builder
As a student, when I activate AI mode, the interface should transform into a focused "Study Session Builder" — not just a toggle, but a visual shift (dim overlay, selection rings on cards, floating panel) that makes me feel like I'm curating my own study kit.

### US2: Student selects materials across subjects and categories
As a student, I should be able to tap/click on any file card across multiple subjects and categories to add it to my study session, with smooth animations and visual feedback showing what's selected and grouped by subject.

### US3: Student exports URLs for NotebookLM
As a student, I should be able to click "Copy URLs for NotebookLM" to copy all selected Drive/YouTube URLs to my clipboard, then open NotebookLM and add them as sources. The URLs should be in a format NotebookLM accepts (drive.google.com/file/d/{ID}/preview for Drive files, youtube.com/watch?v={ID} for videos).

### US4: Student exports a structured study context prompt
As a student, I should be able to click "Copy Study Context" to copy a repomix-style structured prompt that I paste into NotebookLM as a text source. This prompt includes: course name, subject, categories, material names/types, and instructions telling the AI how to help me study.

### US5: Student gets a smooth one-click NotebookLM workflow
As a student, when I click "Open in NotebookLM," it should copy my URLs to clipboard, open NotebookLM in a new tab, and show me a brief guide/toast: "URLs copied! Add them as sources in NotebookLM." Minimize friction between my platform and NotebookLM.

## Technical Notes

### NotebookLM Capabilities (researched)
- Accepts website URLs including `drive.google.com/file/d/{ID}/preview`
- Accepts YouTube URLs (must have captions — auto-generated counts)
- Accepts pasted text (our structured prompt goes here)
- Free: 50 sources/notebook, 500K words/source, 100 notebooks, 50 chats/day, 3 audio overviews/day
- Can share notebooks via link (up to 50 users on personal accounts)
- No programmatic creation on free tier

### Existing AI Cart (003-ai-study-cart)
- Uses localStorage for state + cart items
- Has AiCartContext, AiCartFab, AiCartPanel, AiModeToggle components
- Framer Motion animations with prefers-reduced-motion support
- Cross-tab sync exists
- Currently exports to clipboard as hierarchical Markdown

### Student File URL Patterns
- Drive files: `https://drive.google.com/file/d/{FILE_ID}/preview`
- YouTube: detected from filename pattern `{youtube-url} {title}`
- YouTube embed: `https://www.youtube.com/embed/{VIDEO_ID}?autoplay=1`
- YouTube thumbnail: `https://img.youtube.com/vi/{VIDEO_ID}/hqdefault.jpg`
- Images: `https://drive.google.com/thumbnail?id={FILE_ID}&sz=w800`

### Repomix-Style Prompt Structure
```xml
<study-session>
  <course>Computer Science - Data Structures</course>
  <student-goal>Exam preparation</student-goal>
  <materials>
    <material category="Lectures" name="Week 1 - Arrays">
      Type: PDF | Source: Google Drive
    </material>
    <material category="Lectures" name="Week 2 - Linked Lists">
      Type: YouTube Video
    </material>
  </materials>
  <instructions>
    You are helping a university student study these materials.
    Create practice questions, explain difficult concepts, and
    identify connections between topics.
  </instructions>
</study-session>
```

## Open Questions
- Should we support other AI tools besides NotebookLM? (ChatGPT, Claude, etc.)
- How creative should the UI transformation be? (subtle overlay vs full theme shift)
- Should study sessions be saveable/shareable between students?
- Should the prompt template be customizable by the student?
