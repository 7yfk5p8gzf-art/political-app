import SectionCard from '@/components/shared/SectionCard';
import { AuditLogItem } from '@/types/audit';

export default function AuditLogList({ items }: { items: AuditLogItem[] }) {
  return (
    <SectionCard title="Audit log" subtitle="Ki mit csinált a rendszerben.">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <strong>{item.actor}</strong> {item.action.toLowerCase()} a(z) <strong>{item.target}</strong> elemet. <span className="text-slate-500">{item.timestamp}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
