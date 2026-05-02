'use client';

import Badge from '@/components/shared/Badge';
import SectionCard from '@/components/shared/SectionCard';
import { useAuth } from '@/hooks/useAuth';
import { roleLabels } from '@/lib/constants';
import { canManageUsers } from '@/lib/permissions';
import { supabase } from '@/lib/supabase';
import { Role } from '@/types/user';
import { useEffect, useState } from 'react';

type ProfileRow = {
  id: string;
  email: string;
  role: Role;
  full_name: string | null;
  created_at: string;
};

const roleTone: Record<Role, 'blue' | 'green' | 'amber' | 'slate'> = {
  superadmin: 'blue',
  admin: 'green',
  reviewer: 'amber',
  editor: 'slate',
};

export default function UserList() {
  const { user } = useAuth();
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setUsers((data ?? []) as ProfileRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (user && canManageUsers(user.role)) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const updateRole = async (id: string, role: Role) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setUsers((current) => current.map((item) => (item.id === id ? { ...item, role } : item)));
  };

  if (!user || !canManageUsers(user.role)) {
    return (
      <SectionCard title="Felhasználók" subtitle="Ezt az oldalt csak a főadmin láthatja.">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Nincs jogosultságod a felhasználók kezeléséhez.
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Felhasználók" subtitle="Supabase profiles tábla alapján. Role közvetlenül módosítható.">
      <div className="space-y-4">
        {message ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div> : null}
        {loading ? <div className="text-sm text-slate-500">Betöltés...</div> : null}
        {!loading && users.length === 0 ? <div className="text-sm text-slate-500">Nincs még felhasználó.</div> : null}

        {users.map((item) => (
          <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="font-bold">{item.full_name?.trim() || item.email}</div>
              <div className="mt-1 text-sm text-slate-600">{item.email}</div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={roleTone[item.role]}>{roleLabels[item.role]}</Badge>
              <select
                value={item.role}
                onChange={(e) => updateRole(item.id, e.target.value as Role)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="editor">Editor</option>
                <option value="reviewer">Reviewer</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Főadmin</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
