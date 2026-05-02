import Badge from '@/components/shared/Badge';
import Link from 'next/link';

export default function HomeHero() {
  return (
    <div className="rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm md:p-10">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div>
          <Badge tone="slate">Két oldal egymás mellett</Badge>
          <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
            Politikai álláspontok
            <span className="block text-slate-500">forrásokkal és dátumokkal.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Ugyanarról a témáról két nézőpont egymás mellett, plusz külön ellentmondás modul, hogy gyorsan átlásd a lényeget.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white">Admin belépés</Link>
            <Link href="/contradictions" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium">Ellentmondások</Link>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">A oldal</div>
            <div className="mt-3 text-2xl font-bold">Keményebb szabályozás</div>
            <p className="mt-3 text-sm text-slate-700">Rövid, tiszta kivonat az egyik politikai oldal fő állításáról.</p>
          </div>
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-rose-700">B oldal</div>
            <div className="mt-3 text-2xl font-bold">Közös európai megoldás</div>
            <p className="mt-3 text-sm text-slate-700">Ugyanannak a témának a másik oldala, jól összehasonlítható formában.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
