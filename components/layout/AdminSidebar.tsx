'use client';

import { roleLabels } from '@/lib/constants';
import { canManageUsers, canReview } from '@/lib/permissions';
import { User } from '@/types/user';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar({ user, onLogout }: { user: User; onLogout: () => void | Promise<void> }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', show: true },
    { href: '/admin/review', label: 'Review lista', show: canReview(user.role) },
    { href: '/admin/contradictions', label: 'Ellentmondások', show: canReview(user.role) },
    { href: '/admin/users', label: 'Felhasználók', show: canManageUsers(user.role) },
    { href: '/admin/audit', label: 'Audit log', show: canManageUsers(user.role) },
  ].filter((item) => item.show);

  return (
    <aside className="hidden min-h-screen w-72 flex-col gap-6 bg-slate-900 p-6 text-white md:flex">
      <div>
        <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Politikai App</div>
        <h1 className="mt-2 text-2xl font-bold">Admin Panel</h1>
      </div>

      <nav className="flex flex-col gap-2 text-sm">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`rounded-2xl px-4 py-3 ${active ? 'bg-white/10' : 'hover:bg-white/10'}`}>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-white/5 p-4 text-sm">
  <div className="text-slate-400">Bejelentkezve</div>
  <div className="mt-1 font-semibold">{user.name || 'Admin'}</div>
  <div className="text-slate-400">{roleLabels[user.role]}</div>

  <button
    onClick={() => onLogout()}
    className="mt-4 rounded-xl bg-white px-4 py-2 font-medium text-slate-900"
  >
    Kilépés
  </button>
</div>
    </aside>
  );
}
