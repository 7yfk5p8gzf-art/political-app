export type ComparisonSide = {
  actor: string;
  role: string;
  headline: string;
  body: string;
  quote: string;
  source: string;
};

export type ComparisonStatus = 'review' | 'needs_fix' | 'published' | 'draft';

export type Comparison = {
  id: number;
  slug: string;
  title: string;
  topic: string;
  status: ComparisonStatus;
  aiScore: number;
  votes: number;
  date: string;
  left: ComparisonSide;
  right: ComparisonSide;
  aiReason: string;
};
