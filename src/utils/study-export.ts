import { SessionItem } from './types';

/**
 * Formats collected items as structured XML with direct URLs for pasting into NotebookLM as a text source.
 * Items are grouped by subjectName → category, sorted alphabetically.
 */
export function formatStudyContext(items: SessionItem[]): string {
  const subjectMap = new Map<string, { abbr: string; categories: Map<string, SessionItem[]> }>();

  for (const item of items) {
    if (!subjectMap.has(item.subjectName)) {
      subjectMap.set(item.subjectName, { abbr: item.subjectAbbr, categories: new Map() });
    }
    const subject = subjectMap.get(item.subjectName)!;
    if (!subject.categories.has(item.category)) {
      subject.categories.set(item.category, []);
    }
    subject.categories.get(item.category)!.push(item);
  }

  const sortedSubjects = Array.from(subjectMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  const subjectLines = sortedSubjects.map(([subjectName, { abbr, categories }]) => {
    const sortedCategories = Array.from(categories.entries()).sort(([a], [b]) => a.localeCompare(b));
    const categoryLines = sortedCategories.map(([categoryName, categoryItems]) => {
      const materialLines = categoryItems
        .map((item: SessionItem) =>
          `      <material name="${escapeXml(item.name)}" type="${item.type}" url="${escapeXml(item.url)}" />`
        )
        .join('\n');
      return `    <category name="${escapeXml(categoryName)}">\n${materialLines}\n    </category>`;
    });
    return `  <subject name="${escapeXml(subjectName)}" abbreviation="${escapeXml(abbr)}">\n${categoryLines.join('\n')}\n  </subject>`;
  });

  return [
    '<study-session>',
    '  <instructions>',
    '    IMPORTANT: Use ONLY the materials listed below as your knowledge sources.',
    '    Each material has a direct Google Drive URL — use those URLs to access the content.',
    '    Do NOT search the web or use any external sources beyond what is provided here.',
    '    Help the student understand these materials, identify connections between subjects,',
    '    create comprehensive study notes, and prepare for exams.',
    '  </instructions>',
    ...subjectLines,
    '</study-session>',
  ].join('\n');
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
