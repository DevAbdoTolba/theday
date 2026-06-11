import type { SessionItem } from './types';

function set(key: string, value: string | number | boolean): void {
  if (typeof window !== 'undefined' && (window as any).clarity) {
    (window as any).clarity('set', key, String(value));
  }
}

function bucketCount(n: number): string {
  if (n === 0) return '0';
  if (n === 1) return '1';
  if (n <= 5) return '2-5';
  if (n <= 10) return '6-10';
  if (n <= 20) return '11-20';
  return '21+';
}

export function trackStudyToggle(nowActive: boolean): void {
  set('StudyAction', nowActive ? 'Toggle_On' : 'Toggle_Off');
  set('StudyMode', nowActive ? 'Enabled' : 'Disabled');
}

export function trackStudyCopy(items: SessionItem[], mode: 'URLs' | 'Context', source: 'Queue' | 'Collection'): void {
  const subjects = [...new Set(items.map(i => i.subjectName))];
  const abbrs   = [...new Set(items.map(i => i.subjectAbbr))];
  const cats    = [...new Set(items.map(i => i.category))];
  const types   = [...new Set(items.map(i => i.type))];

  set('StudyAction',          `Copy_${mode}`);
  set('StudySource',          source);
  set('StudyCopyMode',        mode);
  set('StudyItemCount',       items.length);
  set('StudyItemCountBucket', bucketCount(items.length));
  set('StudySubjectCount',    subjects.length);
  set('StudySubjects',        subjects.join(', '));
  set('StudySubjectAbbrs',    abbrs.join(', '));
  set('StudyCategories',      cats.join(', '));
  set('StudyItemTypes',       types.join(', '));
  set('StudyItemNames',       items.map(i => i.name).join(' | '));
  set('StudyItemIds',         items.map(i => i.id).join(','));
  set('StudyItemUrls',        items.map(i => i.url).join(' '));
}

export function trackStudyOpenNLM(items: SessionItem[], source: 'Queue' | 'Collection'): void {
  const subjects = [...new Set(items.map(i => i.subjectName))];
  const abbrs   = [...new Set(items.map(i => i.subjectAbbr))];
  const cats    = [...new Set(items.map(i => i.category))];
  const types   = [...new Set(items.map(i => i.type))];

  set('StudyAction',          'OpenNLM');
  set('StudySource',          source);
  set('StudyItemCount',       items.length);
  set('StudyItemCountBucket', bucketCount(items.length));
  set('StudySubjectCount',    subjects.length);
  set('StudySubjects',        subjects.join(', '));
  set('StudySubjectAbbrs',    abbrs.join(', '));
  set('StudyCategories',      cats.join(', '));
  set('StudyItemTypes',       types.join(', '));
  set('StudyItemNames',       items.map(i => i.name).join(' | '));
  set('StudyItemIds',         items.map(i => i.id).join(','));
  set('StudyItemUrls',        items.map(i => i.url).join(' '));
}
