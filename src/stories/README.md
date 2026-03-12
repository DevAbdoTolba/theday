# TheDay Component Stories

All component stories live here, mirroring the `src/components/` structure.

## Naming Convention

`ComponentName.stories.tsx` — one story file per component.

## Story File Template

See `.specify/memory/constitution.md` and `specs/001-storybook-components/quickstart.md` for the full template.

Quick example:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from '@/components/MyComponent';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { /* props */ } };
```

## Accessibility

Every story must pass WCAG 2.1 Level AA. Check the **Accessibility** panel in Storybook
after creating any story and fix all violations before marking the task complete.
