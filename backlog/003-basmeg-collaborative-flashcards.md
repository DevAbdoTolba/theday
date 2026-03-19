# Idea: بصمج (Basmeg) — Collaborative Flashcards

## Concept

A collaborative Anki-style flashcard system built into theday, where students in the same class can collectively build and study shared card decks.

## Problem

Students currently study individually with no shared knowledge base. Creating quality flashcard decks is time-consuming alone, but a whole class contributing means better coverage with less effort per person.

## Core Idea

- Students in a class collaboratively create and vote on flashcard decks tied to specific subjects/categories
- Each card has a front (question/term) and back (answer/explanation)
- Spaced repetition (like Anki) tracks each student's personal progress independently, even though the deck is shared
- Students can suggest new cards; the community upvotes/approves them

## Potential Features

- **Shared decks** scoped to a class + subject (like existing content)
- **Card creation** — any student can propose a card
- **Upvoting / approval** — cards need a threshold of upvotes (or admin approval) before becoming official
- **Personal SRS tracking** — each user has their own review schedule (ease factor, interval, due date)
- **Study mode** — flip cards, rate difficulty (Again / Hard / Good / Easy)
- **Leaderboard / streaks** — optional gamification to encourage daily review
- **AI-assisted card generation** — generate cards from uploaded PDFs/notes (ties into AI study cart)

## Data Model (rough)

```
FlashcardDeck: { classId, subject, category, title, createdBy, cardCount }
FlashcardCard: { deckId, front, back, createdBy, upvotes, status: pending|approved }
FlashcardProgress: { userId, cardId, easeFactor, interval, dueDate, lapses }
```

## Open Questions

- Moderation: admin-only approval vs. community voting threshold?
- Import from Anki (.apkg) files?
- Offline support (IndexedDB cache for due cards)?
- Should decks be auto-generated from subject materials?
