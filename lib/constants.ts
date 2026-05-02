import { ComparisonStatus } from '@/types/comparison';
import { Role } from '@/types/user';
import { ContradictionStatus } from '@/types/contradiction';

export const roleLabels: Record<Role, string> = {
  superadmin: 'Főadmin',
  admin: 'Admin',
  reviewer: 'Reviewer',
  editor: 'Szerkesztő',
};

export const comparisonStatusLabels: Record<ComparisonStatus, string> = {
  review: 'Review alatt',
  needs_fix: 'Javítandó',
  published: 'Publikált',
  draft: 'Piszkozat',
};

export const contradictionStatusLabels: Record<ContradictionStatus, string> = {
  review: 'Review alatt',
  published: 'Publikált',
  draft: 'Piszkozat',
};
