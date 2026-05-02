export type ContradictionStatus = 'review' | 'published' | 'draft';

export type Contradiction = {
  id: number;
  actor: string;
  topic: string;
  earlierDate: string;
  laterDate: string;
  earlier: string;
  later: string;
  status: ContradictionStatus;
};
