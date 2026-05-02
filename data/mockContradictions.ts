import { Contradiction } from '@/types/contradiction';

export const mockContradictions: Contradiction[] = [
  {
    id: 1,
    actor: 'Politikus X',
    topic: 'Adózás',
    earlierDate: '2024-06-12',
    laterDate: '2026-01-22',
    earlier: 'Nem lesz adóemelés.',
    later: 'Bizonyos adók emelése szükséges.',
    status: 'review',
  },
  {
    id: 2,
    actor: 'Politikus Y',
    topic: 'EU politika',
    earlierDate: '2025-02-05',
    laterDate: '2026-03-10',
    earlier: 'Nem támogatjuk ezt a csomagot.',
    later: 'A csomag fontos és szükséges.',
    status: 'published',
  },
];
