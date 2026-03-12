# Contract: Component Interface & Story Format

**Feature**: 001-storybook-components
**Date**: 2026-03-12
**Type**: TypeScript Interface Specification

## Overview

This contract defines the standardized interface that all components must expose and how stories must document them.
It ensures consistency across the component library and makes Storybook stories predictable and testable.

## Primary Contract: React Component Props

### Requirement

All exported React components MUST:

1. **Accept props as a single typed object** (React convention)
   ```typescript
   export interface ComponentNameProps {
     // All required and optional props documented here
   }

   export function ComponentName(props: ComponentNameProps) { ... }
   ```

2. **Export a prop interface** (visible to Storybook & consumers)
   ```typescript
   export interface ButtonProps {
     label: string;           // Required. Button text
     variant?: 'primary' | 'secondary'; // Optional. Defaults to 'primary'
     disabled?: boolean;      // Optional. Defaults to false
     onClick?: (e: React.MouseEvent) => void; // Optional. Click handler
   }
   ```

3. **Use complete TypeScript types** (no `any`)
   - Primitive types: `string`, `number`, `boolean`
   - Union types: `'primary' | 'secondary'`
   - React types: `React.ReactNode`, `React.MouseEvent`, etc.
   - Enum types: `type ButtonVariant = 'primary' | 'secondary'`
   - Callback types: `(arg: Type) => ReturnType`

4. **Provide JSDoc comments** for all props (optional but recommended)
   ```typescript
   /**
    * Primary action button for forms and user interactions.
    * @example
    * <Button label="Submit" variant="primary" onClick={handleSubmit} />
    */
   export function Button({ label, variant = 'primary', disabled = false, onClick }: ButtonProps) { ... }
   ```

## Secondary Contract: Story Format

### Requirement

All story files MUST follow this structure:

```typescript
// src/stories/ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName, ComponentNameProps } from '@/components/path/ComponentName';

const meta = {
  title: 'Components/ComponentCategory/ComponentName', // Storybook navigation path
  component: ComponentName,
  parameters: {
    layout: 'centered', // or 'padded', 'fullscreen' as appropriate
  },
  tags: ['autodocs'], // Auto-generate docs from JSDoc
  argTypes: {
    // Define control types for props (optional; Storybook auto-detects many)
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Button visual style',
    },
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story (primary use case)
export const Default: Story = {
  args: {
    label: 'Default Button',
    variant: 'primary',
  },
};

// Additional variants (cover all important prop combinations)
export const Secondary: Story = {
  args: {
    label: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Button',
    disabled: true,
  },
};

// Edge cases
export const LongLabel: Story = {
  args: {
    label: 'This is a very long button label to test text wrapping and layout behavior',
  },
};
```

### Accessibility Requirements

Every story file MUST include accessibility considerations:

```typescript
// In story file, add accessibility metadata:
export const Default: Story = {
  args: { label: 'Default Button' },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast', // Example: enforce contrast for this story
            enabled: true,
          },
        ],
      },
    },
  },
};
```

**Story Accessibility Checklist**:
- [ ] All interactive elements are keyboard accessible (Tab, Enter, Space)
- [ ] Color is not the only visual indicator (e.g., disabled buttons must have additional visual cue)
- [ ] Text contrast meets WCAG 2.1 Level AA (4.5:1 for normal text, 3:1 for large text)
- [ ] ARIA attributes are present where needed (role, aria-label, aria-disabled, etc.)
- [ ] Focus indicators are visible (CSS outline, focus-visible)

## Tertiary Contract: Storybook Configuration

### Global Setup (`.storybook/preview.tsx`)

The Storybook preview MUST:

1. **Apply MUI theme globally** (all stories inherit MUI styling)
   ```typescript
   import { ThemeProvider } from '@mui/material/styles';
   import CssBaseline from '@mui/material/CssBaseline';
   import { muiTheme } from '@/styles/theme'; // TheDay's MUI theme

   export const decorators = [
     (Story) => (
       <ThemeProvider theme={muiTheme}>
         <CssBaseline />
         <Story />
       </ThemeProvider>
     ),
   ];
   ```

2. **Provide mock decorators** for components requiring Context/external dependencies
   ```typescript
   export const withMockContext = (Story) => (
     <MockContextProvider>
       <Story />
     </MockContextProvider>
   );
   ```

3. **Set viewport defaults** (responsive testing)
   ```typescript
   export const parameters = {
     viewport: {
       defaultViewport: 'desktop', // Options: mobile, tablet, desktop
       viewports: {
         mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
         tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
       },
     },
   };
   ```

### Addon Configuration

**Required Addons**:
- `@storybook/addon-essentials` (Controls, Docs, Viewport, etc.)
- `@storybook/addon-a11y` (Accessibility checks)
- `@storybook/addon-interactions` (State management testing)

**Configuration** (`.storybook/main.ts`):
```typescript
export default {
  stories: ['../src/stories/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-interactions',
  ],
  framework: '@storybook/nextjs',
  typescript: { reactDocgen: 'react-docgen-typescript' },
};
```

## Data Format Examples

### Valid Component Interface
```typescript
// ✅ CORRECT
export interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'outlined' | 'elevated';
  onClick?: () => void;
}
```

### Invalid Component Interface (Violations)
```typescript
// ❌ WRONG: using 'any'
export interface BadCardProps {
  title: any; // violates Principle II (TypeScript Strict)
  content: any;
}

// ❌ WRONG: incomplete types
export interface BadCardProps {
  props: any; // all props bundled into 'any'
}

// ❌ WRONG: missing required prop type
export interface BadCardProps {
  title; // no type annotation
  children;
}
```

### Valid Story Format
```typescript
// ✅ CORRECT
export const Primary: Story = {
  args: { title: 'Card Title', children: 'Card content' },
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } } },
};
```

### Invalid Story Format (Violations)
```typescript
// ❌ WRONG: no Meta definition
export const CardStory = () => <Card title="Card" />;

// ❌ WRONG: missing accessibility parameters
export const Variant: Story = {
  args: { title: 'Card', variant: 'elevated' },
  // Missing accessibility checks
};
```

## Governance & Validation

### Pre-Publication Checklist

Before a component story is published to the Storybook build:

1. **TypeScript Compliance**
   - [ ] All props have explicit types (no `any`)
   - [ ] Component compiles without errors
   - [ ] PropTypes or TypeScript interfaces exported

2. **Story Completeness**
   - [ ] Default story exists
   - [ ] All major variants documented (Primary, Secondary, Disabled, etc.)
   - [ ] Edge cases covered (LongLabel, Empty, Error states)

3. **Accessibility (WCAG 2.1 Level AA)**
   - [ ] Automated axe checks pass (Storybook addon-a11y)
   - [ ] Manual verification by QA:
     - [ ] Keyboard navigation (Tab, Enter, Space)
     - [ ] Focus indicators visible
     - [ ] Color contrast verified
     - [ ] ARIA attributes correct

4. **Documentation**
   - [ ] JSDoc comments on all props
   - [ ] Example usage provided
   - [ ] Any special setup/mocking documented

### Rejection Criteria

A story is **rejected** if:
- Component uses `any` type anywhere
- Story fails axe accessibility checks
- Story has no Default variant
- QA cannot interact with component using keyboard alone
- Component requires external API call or context injection without mock decorator

## Notes

- All contracts are enforceable via TypeScript compiler and Storybook linting
- Accessibility is not optional; WCAG 2.1 Level AA is mandatory
- Contracts evolve; new versions must remain backward compatible
