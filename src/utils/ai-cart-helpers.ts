// src/utils/ai-cart-helpers.ts
import { AiCartItem } from './types';

const AI_MODE_KEY = 'aiModeActive';
const AI_CART_KEY = 'aiCartItems';

export function readAiModeActive(): boolean {
  try {
    return localStorage.getItem(AI_MODE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function writeAiModeActive(active: boolean): void {
  try {
    localStorage.setItem(AI_MODE_KEY, String(active));
  } catch {
    // storage full — handled at context level
  }
}

export function readAiCartItems(): AiCartItem[] {
  try {
    const raw = localStorage.getItem(AI_CART_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as AiCartItem[];
  } catch {
    return [];
  }
}

export function writeAiCartItems(items: AiCartItem[]): void {
  localStorage.setItem(AI_CART_KEY, JSON.stringify(items));
}

export function clearAiCartStorage(): void {
  try {
    localStorage.removeItem(AI_CART_KEY);
  } catch {
    // ignore
  }
}

export function formatCartToMarkdown(items: AiCartItem[]): string {
  const grouped = items.reduce<Record<string, Record<string, AiCartItem[]>>>(
    (acc, item) => {
      if (!acc[item.className]) acc[item.className] = {};
      if (!acc[item.className][item.subjectName])
        acc[item.className][item.subjectName] = [];
      acc[item.className][item.subjectName].push(item);
      return acc;
    },
    {}
  );

  const classNames = Object.keys(grouped).sort();
  const parts: string[] = [];

  for (const cls of classNames) {
    parts.push(`# ${cls}\n`);
    const subjects = Object.keys(grouped[cls]).sort();
    for (const sub of subjects) {
      parts.push(`## ${sub}\n`);
      const sorted = grouped[cls][sub].sort((a, b) => a.addedAt - b.addedAt);
      for (const item of sorted) {
        parts.push(`- [${item.name}](${item.url})`);
      }
      parts.push('');
    }
  }

  return parts.join('\n').trim();
}
