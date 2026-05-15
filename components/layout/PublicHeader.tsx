import Link from "next/link";

export default function PublicHeader() {
  return (
    <header
      className="
        sticky top-0 z-50

        border-b border-white/10

        bg-slate-950/70
        backdrop-blur-2xl

        shadow-[0_10px_40px_rgba(0,0,0,0.25)]
      "
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 md:px-8">
        <Link href="/" className="group block">
          <div className="text-xs font-black uppercase tracking-[0.35em] text-slate-400 transition-all duration-300 group-hover:text-slate-300">
            Political Intelligence
          </div>

          <div className="mt-1 text-2xl font-black tracking-tight text-white transition-all duration-300 group-hover:text-slate-100">
            Contradiction Platform
          </div>
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          <Link
            href="/"
            className="
              rounded-full px-4 py-2
              text-sm font-bold text-slate-300

              transition-all duration-300

              hover:bg-white/10
              hover:text-white
            "
          >
            Home
          </Link>

          <Link
            href="/contradictions"
            className="
              rounded-full px-4 py-2
              text-sm font-bold text-slate-300

              transition-all duration-300

              hover:bg-white/10
              hover:text-white
            "
          >
            Contradictions
          </Link>

          <Link
            href="/politicians"
            className="
              rounded-full px-4 py-2
              text-sm font-bold text-slate-300

              transition-all duration-300

              hover:bg-white/10
              hover:text-white
            "
          >
            Politicians
          </Link>

          <Link
            href="/login"
            className="
              rounded-full

              bg-white px-5 py-2.5

              text-sm font-black text-slate-900

              transition-all duration-300

              hover:scale-[1.03]
              hover:bg-slate-200
            "
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}