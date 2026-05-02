import Link from 'next/link';

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href="/" className="block">
          <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Politikai App</div>
          <div className="text-xl font-bold">Összehasonlító platform</div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <Link href="/">Kezdőlap</Link>
          <Link href="/contradictions">Ellentmondások</Link>
          <Link href="/login">Belépés</Link>
        </nav>
      </div>
    </header>
  );
}
