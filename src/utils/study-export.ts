import { SessionItem } from './types';

/**
 * Formats collected items as one URL per line for pasting into NotebookLM as website sources.
 */
export function formatUrls(items: SessionItem[]): string {
  return items.map(item => item.url).join('\n');
}

/**
 * Formats collected items as structured XML-inspired text for pasting as a text source in NotebookLM.
 * Items are grouped by subjectName → category, sorted alphabetically.
 */
export function formatStudyContext(items: SessionItem[]): string {
  // Group by subject, then category
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

  // Sort subjects alphabetically
  const sortedSubjects = Array.from(subjectMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  const subjectLines = sortedSubjects.map(([subjectName, { abbr, categories }]) => {
    // Sort categories alphabetically
    const sortedCategories = Array.from(categories.entries()).sort(([a], [b]) => a.localeCompare(b));
    const categoryLines = sortedCategories.map(([categoryName, categoryItems]) => {
      const materialLines = categoryItems
        .map((item: SessionItem) => `      <material name="${escapeXml(item.name)}" type="${item.type}" />`)
        .join('\n');
      return `    <category name="${escapeXml(categoryName)}">\n${materialLines}\n    </category>`;
    });
    return `  <subject name="${escapeXml(subjectName)}" abbreviation="${escapeXml(abbr)}">\n${categoryLines.join('\n')}\n  </subject>`;
  });

  return [
    '<study-session>',
    ...subjectLines,
    '  <instructions>',
    '    This study session combines materials from multiple courses.',
    '    Help the student identify connections between subjects,',
    '    create comprehensive study notes, and prepare for exams.',
    '    Focus on cross-subject relationships where concepts overlap.',
    '  </instructions>',
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
