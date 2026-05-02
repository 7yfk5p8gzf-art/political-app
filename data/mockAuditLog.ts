import { AuditLogItem } from '@/types/audit';

export const mockAuditLog: AuditLogItem[] = [
  { id: 1, actor: 'Bálint', action: 'Publikálta', target: 'migracio-2026', timestamp: '2026-04-21 12:32' },
  { id: 2, actor: 'Admin 2', action: 'Módosította', target: 'adozas-2026', timestamp: '2026-04-21 11:10' },
  { id: 3, actor: 'Reviewer 1', action: 'Visszaküldte', target: 'energia-2026', timestamp: '2026-04-21 10:02' },
];
