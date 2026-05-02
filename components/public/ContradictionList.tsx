import Badge from '@/components/shared/Badge';
import SectionCard from '@/components/shared/SectionCard';
import { contradictionStatusLabels } from '@/lib/constants';
import { Contradiction } from '@/types/contradiction';

export default function ContradictionList({ items }: { items: Contradiction[] }) {
  return (
    <SectionCard title="Ellentmondások" subtitle="Korábbi és későbbi kijelentések egymás mellett.">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="font-bold">{item.actor}</div>
                <div className="mt-1 text-sm text-slate-600">Téma: {item.topic}</div>
              </div>
              <Badge tone={item.status === 'published' ? 'green' : item.status === 'review' ? 'amber' : 'slate'}>
                {contradictionStatusLabels[item.status]}
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{item.earlierDate} — {item.earlier}</div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{item.laterDate} — {item.later}</div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
