export type AuditLogItem = {
  id: number;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
};
