'use client';

import { roleLabels } from '@/lib/constants';
import { canManageUsers, canReview } from '@/lib/permissions';
import { User } from '@/types/user';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AdminSidebar({ user, onLogout }: { user: User; onLogout: () => void | Promise<void> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Dashboard', show: true },
    { href: '/admin/review', label: 'Review lista', show: canReview(user.role) },
    { href: '/admin/contradictions', label: 'Ellentmondások', show: canReview(user.role) },
    { href: '/admin/users', label: 'Felhasználók', show: canManageUsers(user.role) },
    { href: '/admin/audit', label: 'Audit log', show: canManageUsers(user.role) },
  ].filter((item) => item.show);

  const navigation = (
      <nav className="flex flex-col gap-1 text-sm">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`rounded-xl px-4 py-3 font-semibold ${active ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
              {item.label}
            </Link>;
        })}
      </nav>
  );

  const account = (
    <div className="rounded-xl bg-white/5 p-4 text-sm">
      <div className="text-slate-400">Bejelentkezve</div>
      <div className="mt-1 truncate font-semibold">{user.name || 'Admin'}</div>
      <div className="text-slate-400">{roleLabels[user.role]}</div>
      <button type="button" onClick={() => onLogout()} className="mt-4 w-full rounded-xl bg-white px-4 py-2 font-bold text-slate-900 hover:bg-slate-200">Kilépés</button>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 text-white md:hidden">
        <div><div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Politikai App</div><div className="font-black">Admin Panel</div></div>
        <button type="button" aria-expanded={open} aria-controls="admin-navigation" onClick={() => setOpen((value) => !value)} className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-bold">{open ? 'Bezárás' : 'Menü'}</button>
      </div>
      {open ? <div className="fixed inset-0 top-[65px] z-30 bg-slate-950/60 md:hidden" onClick={() => setOpen(false)} aria-hidden="true" /> : null}
      <aside id="admin-navigation" className={`${open ? 'flex' : 'hidden'} fixed inset-x-0 top-[65px] z-40 min-h-[calc(100vh-65px)] flex-col gap-6 bg-slate-900 p-5 text-white shadow-2xl md:static md:flex md:min-h-screen md:w-72 md:shrink-0 md:p-6`}>
      <div className="hidden md:block">
        <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Politikai App</div>
        <h1 className="mt-2 text-2xl font-bold">Admin Panel</h1>
      </div>
      {navigation}
      <div className="mt-auto">{account}</div>
    </aside>
    </>
  );
}
