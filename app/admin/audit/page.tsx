import AuditLogList from '@/components/admin/AuditLogList';
import { mockAuditLog } from '@/data/mockAuditLog';

export default function AdminAuditPage() {
  return <AuditLogList items={mockAuditLog} />;
}
