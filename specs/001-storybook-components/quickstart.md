# Quickstart: Storybook Component Library

**Feature**: 001-storybook-components
**Date**: 2026-03-12

## Overview

This quickstart guide walks you through setting up and running Storybook for TheDay component library.

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- TheDay codebase cloned and dependencies installed (`npm install`)
- Familiarity with React, TypeScript, and component props
- Understanding of WCAG 2.1 accessibility standards (no prior experience needed; learn as you go)

## Installation & Setup

### Step 1: Install Storybook

From the repository root:

```bash
# Install Storybook CLI globally (optional, for convenience)
npm install -g @storybook/cli

# Or run init directly
npx storybook@latest init
```

This will:
- Detect your framework (Next.js) and create `.storybook/` directory
- Scaffold `main.ts` and `preview.tsx` configurations
- Add Storybook scripts to `package.json`
- Install required dependencies

### Step 2: Verify Installation

```bash
# Start Storybook dev server
npm run storybook

# Expected output:
# Storybook started on http://localhost:6006
```

Open http://localhost:6006 in your browser. You should see a welcome screen.

### Step 3: Configure MUI Theme

Edit `.storybook/preview.tsx`:

```typescript
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';

const muiTheme = createTheme({
  palette: {
    mode: 'light', // Match TheDay theme
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

export const decorators = [
  (Story) => (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Story />
    </ThemeProvider>
  ),
];

export const parameters = {
  layout: 'centered',
  viewport: { defaultViewport: 'desktop' },
};
```

### Step 4: Create Your First Story

Create a story file for an existing component:

```bash
mkdir -p src/stories
touch src/stories/Button.stories.tsx
```

Add this content:

```typescript
// src/stories/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/Button'; // Adjust path to your component

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { label: 'Primary Button', variant: 'primary' },
};

export const Secondary: Story = {
  args: { label: 'Secondary Button', variant: 'secondary' },
};

export const Disabled: Story = {
  args: { label: 'Disabled Button', disabled: true },
};
```

### Step 5: Reload & Verify

- Save the file
- Storybook hot-reloads automatically
- You should see "Button" in the sidebar with three stories (Primary, Secondary, Disabled)
- Click each story to interact with it

## Creating Component Stories

### Workflow

For each component you document:

1. **Examine the component source** to understand its props
2. **Create a `.stories.tsx` file** in `src/stories/`
3. **Write the Meta definition** (title, component, parameters)
4. **Create story variants**:
   - Default (primary use case)
   - Other variants (all major prop combinations)
   - Edge cases (very long text, empty state, error state)
5. **Test accessibility** (see Accessibility Testing below)
6. **Verify in Storybook UI** before committing

### Template: Story File

```typescript
// src/stories/[ComponentName].stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { [ComponentName] } from '@/components/path/[ComponentName]';

const meta = {
  title: 'Components/[Category]/[ComponentName]', // e.g., 'Components/Dashboard/Header'
  component: [ComponentName],
  parameters: { layout: 'centered' }, // or 'padded', 'fullscreen'
  tags: ['autodocs'],
  argTypes: {
    // Define control UI for props (optional)
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
  },
} satisfies Meta<typeof [ComponentName]>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story (primary use case)
export const Default: Story = {
  args: {
    // Provide default prop values here
  },
};

// Additional variants (as needed)
export const Variant2: Story = {
  args: {
    // Different prop combination
  },
};

// Edge cases
export const EdgeCase: Story = {
  args: {
    // Extreme prop values
  },
};
```

### Common Patterns

#### Components with Context (Redux, Themes, etc.)

If your component requires external context, use a decorator:

```typescript
// src/stories/ContextualComponent.stories.tsx
import { Provider } from 'react-redux'; // or your context provider
import { mockStore } from '../__mocks__/store'; // Create mock fixture

const meta = {
  // ...
  decorators: [
    (Story) => (
      <Provider store={mockStore}>
        <Story />
      </Provider>
    ),
  ],
} satisfies Meta<typeof ContextualComponent>;
```

#### Components with API Calls

Use Mock Service Worker (MSW) browser for API mocking:

```typescript
import { setupWorker, rest } from 'msw'; // Already in typical Next.js projects

const handlers = [
  rest.get('/api/data', (req, res, ctx) => {
    return res(ctx.json({ data: 'mock data' }));
  }),
];

export const worker = setupWorker(...handlers);

// In story:
export const WithData: Story = {
  args: { /* ... */ },
  beforeEach: async () => {
    // API calls in this story will be mocked
  },
};
```

## Accessibility Testing

### Automated Checks (Built-in)

Storybook includes the axe accessibility tool. Check the "Accessibility" tab in any story:

1. Open any story
2. Click the "Accessibility" tab (bottom panel)
3. Review violations and warnings
4. Fix issues in the component code, then reload

### Manual Verification (Required)

Use this checklist for each story:

- [ ] **Keyboard Navigation**
  - Press `Tab` to navigate through all interactive elements
  - Press `Shift+Tab` to navigate backward
  - Press `Enter` or `Space` to activate buttons
  - Are focus indicators visible?
  - Can all functionality be accessed via keyboard?

- [ ] **Screen Reader**
  - Use your OS screen reader (NVDA on Windows, VoiceOver on macOS)
  - Can the screen reader read all text?
  - Do buttons have accessible names?
  - Are form labels properly associated?

- [ ] **Color Contrast**
  - Text should have 4.5:1 contrast (normal text)
  - Large text (18px+) should have 3:1 contrast
  - Use a contrast checker tool if unsure

- [ ] **Focus Visibility**
  - Interactive elements must have a visible focus indicator
  - Default browser focus is acceptable; custom focus is preferred

### Tools

- **Storybook a11y addon** (built-in) — Run `npm run storybook`
- **WAVE Browser Extension** — https://wave.webaim.org/extension/
- **axe DevTools** — https://www.deque.com/axe/devtools/
- **Contrast Checker** — https://webaim.org/resources/contrastchecker/

## Building & Deploying

### Local Build

```bash
npm run build-storybook
```

Output: `.storybook-build/` directory (ready to deploy as static site)

### Deploy to Vercel

```bash
# Option 1: Using Vercel CLI
npm install -g vercel
vercel --cwd .storybook-build

# Option 2: Git push (if Vercel is configured for auto-deploy)
git add .
git commit -m "feat: add Storybook component library"
git push origin 001-storybook-components
# Vercel auto-detects and deploys .storybook-build/
```

**Expected deployment time**: <2 minutes

**URL format**: `https://theday-storybook.vercel.app` (example; actual URL assigned by Vercel)

## Component Refactoring Workflow

### Identifying Poorly Designed Components

1. **Start Storybook**: `npm run storybook`
2. **For each component**, try to create a story:
   - If component requires external Context/Redux → Refactor needed
   - If component has missing TypeScript types → Refactor needed
   - If component props are undocumented → Refactor needed
   - If you cannot isolate the component in Storybook → Refactor needed

3. **Create refactoring checklist** in `REFACTORING.md`:
   ```markdown
   # Components Needing Refactoring

   - [ ] CardHeader — requires Context (Card.useCardContext)
   - [ ] SearchInput — no TypeScript props, uses window.fetch
   - [ ] Dashboard — tightly coupled to MongoDB/API
   ```

### Refactoring Steps

1. **Add complete TypeScript types** to component props
2. **Extract Context dependencies** → Pass via props or decorator
3. **Document all props** with JSDoc comments
4. **Write stories** for the refactored component
5. **Test accessibility** (axe + manual)
6. **Commit**:
   ```bash
   git add src/components/[Component].tsx
   git commit -m "refactor: make [Component] Storybook-compatible"
   ```

## Troubleshooting

### Storybook won't start

```bash
# Clear cache and reinstall
rm -rf node_modules/.cache
npm install
npm run storybook
```

### Story doesn't render component

**Check**:
1. Is the import path correct? (`@/components/...` uses your Next.js path alias)
2. Does the component export properly? (named export, not default)
3. Are dependencies installed? (`npm install`)
4. Check browser console for errors

### Component requires external setup

**Solution**: Use decorators (see "Common Patterns" above)

### Accessibility checks fail

**Next steps**:
1. Review violations in axe panel
2. Check HTML/CSS in component source
3. Refer to [WCAG 2.1 documentation](https://www.w3.org/WAI/WCAG21/quickref/)
4. Ask the team for accessibility guidance

## Resources

- **Storybook Docs**: https://storybook.js.org/docs/react/get-started/introduction
- **WCAG 2.1 Quick Ref**: https://www.w3.org/WAI/WCAG21/quickref/
- **MDN Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **MUI Documentation**: https://mui.com/

## Next Steps

Once Storybook is running and a few stories are working:

1. Run `/speckit.tasks` to generate the implementation task list
2. Begin documenting all components in parallel (developers can work independently)
3. Identify and refactor poorly designed components
4. Deploy Storybook build to Vercel
5. Share Storybook URL with the team
