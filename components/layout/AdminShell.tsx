'use client';

import AdminSidebar from '@/components/layout/AdminSidebar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const allowedRoles = ['superadmin', 'admin', 'reviewer', 'editor'];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const [roleLoading, setRoleLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkRole() {
      if (isLoading) return;

      if (!user) {
        router.replace('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !profile || !allowedRoles.includes(profile.role)) {
        router.replace('/');
        return;
      }

      setAllowed(true);
      setRoleLoading(false);
    }

    checkRole();
  }, [isLoading, router, user]);

  if (isLoading || roleLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Jogosultság ellenőrzése...</div>;
  }

  if (!allowed) return null;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex">
        <AdminSidebar
          user={user}
          onLogout={async () => {
            await logout();
            router.push('/login');
          }}
        />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}