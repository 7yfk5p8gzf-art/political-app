import { Comparison } from '@/types/comparison';
import Link from 'next/link';

export default function ComparisonCard({ item }: { item: Comparison }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="text-lg font-bold">{item.title}</div>
        <div className="mt-2 text-sm text-slate-600">{item.left.actor} vs {item.right.actor}</div>
        <div className="mt-2 text-xs text-slate-500">{item.date} • {item.votes} szavazat</div>
      </div>
      <Link href={`/compare/${item.slug}`} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white">Megnyit</Link>
    </div>
  );
}
