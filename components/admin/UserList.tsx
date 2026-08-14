'use client';

import Badge from '@/components/shared/Badge';
import SectionCard from '@/components/shared/SectionCard';
import { useAuth } from '@/hooks/useAuth';
import { roleLabels } from '@/lib/constants';
import { getAuthHeaders } from '@/lib/clientAuth';
import { Role } from '@/types/user';
import { useEffect, useState } from 'react';

type ProfileRow = {
  id: string;
  email: string;
  role: Role;
  full_name: string | null;
  created_at: string;
  is_active: boolean | null;
};

const roleTone: Record<Role, 'blue' | 'green' | 'amber' | 'slate'> = {
  superadmin: 'blue',
  admin: 'green',
  reviewer: 'amber',
  editor: 'slate',
};

function isMainAdmin(role: string) {
  return role === 'superadmin';
}

function canOpenUsers(role: string) {
  return isMainAdmin(role) || role === 'admin';
}

function canEditTarget(currentRole: string, targetRole: string) {
  if (isMainAdmin(currentRole)) return true;

  if (currentRole === 'admin') {
    return targetRole === 'editor' || targetRole === 'reviewer';
  }

  return false;
}

function allowedRolesFor(currentRole: string, targetRole: string) {
  if (isMainAdmin(currentRole)) {
    return ['editor', 'reviewer', 'admin', 'superadmin'];
  }

  if (currentRole === 'admin') {
    if (targetRole === 'editor' || targetRole === 'reviewer') {
      return ['editor', 'reviewer'];
    }
  }

  return [targetRole];
}

export default function UserList() {
  const { user } = useAuth();
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setMessage('');

    const response = await fetch('/api/admin/users', { headers: await getAuthHeaders() });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(result?.error ?? 'Felhasználók betöltése sikertelen.');
      setLoading(false);
      return;
    }

    setUsers((result?.users ?? []) as ProfileRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (user && canOpenUsers(user.role)) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const updateRole = async (id: string, newRole: Role) => {
    if (!user) return;

    const targetUser = users.find((item) => item.id === id);

    if (!targetUser) {
      setMessage('Nem találom a felhasználót.');
      return;
    }

    if (!canEditTarget(user.role, targetUser.role)) {
      setMessage('Nincs jogosultságod ezt a felhasználót módosítani.');
      return;
    }

    const selectableRoles = allowedRolesFor(user.role, targetUser.role);

    if (!selectableRoles.includes(newRole)) {
      setMessage('Ezt a szerepkört nem állíthatod be.');
      return;
    }

    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
      body: JSON.stringify({ role: newRole }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(result?.error ?? 'Felhasználó módosítása sikertelen.');
      return;
    }

    setUsers((current) =>
      current.map((item) =>
        item.id === id ? { ...item, role: newRole } : item
      )
    );

    setMessage('Role módosítva.');
  };

  const updateActiveStatus = async (id: string, isActive: boolean) => {
    if (!user) return;

    const targetUser = users.find((item) => item.id === id);

    if (!targetUser) {
      setMessage('Nem találom a felhasználót.');
      return;
    }

    if (targetUser.id === user.id && !isActive) {
      setMessage('Saját magadat nem tilthatod le.');
      return;
    }

    if (!canEditTarget(user.role, targetUser.role)) {
      setMessage('Nincs jogosultságod ezt a felhasználót módosítani.');
      return;
    }

    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
      body: JSON.stringify({ is_active: isActive }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(result?.error ?? 'Felhasználó módosítása sikertelen.');
      return;
    }

    setUsers((current) =>
      current.map((item) =>
        item.id === id ? { ...item, is_active: isActive } : item
      )
    );

    setMessage(isActive ? 'Felhasználó újraaktiválva.' : 'Felhasználó letiltva.');
  };

  if (!user || !canOpenUsers(user.role)) {
    return (
      <SectionCard
        title="Felhasználók"
        subtitle="Ezt az oldalt csak admin vagy főadmin láthatja."
      >
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Nincs jogosultságod a felhasználók kezeléséhez.
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Felhasználók"
      subtitle="Felhasználók, szerepkörök és jogosultságok kezelése."
    >
      <div className="space-y-4">
        {message ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="text-sm text-slate-500">Betöltés...</div>
        ) : null}

        {!loading && users.length === 0 ? (
          <div className="text-sm text-slate-500">Nincs még felhasználó.</div>
        ) : null}

        {users.map((item) => {
          const editable = canEditTarget(user.role, item.role);
          const roles = allowedRolesFor(user.role, item.role);
          const isActive = item.is_active !== false;

          return (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="font-bold">
                  {item.full_name?.trim() || item.email}
                </div>

                <div className="mt-1 text-sm text-slate-600">
                  {item.email}
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  Létrehozva:{' '}
                  {item.created_at
                    ? new Date(item.created_at).toLocaleString()
                    : '-'}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={roleTone[item.role] || 'slate'}>
                  {roleLabels[item.role] || item.role}
                </Badge>

                <span
                  className={
                    isActive
                      ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700'
                      : 'rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700'
                  }
                >
                  {isActive ? 'Active' : 'Inactive'}
                </span>

                <select
                  value={item.role}
                  disabled={!editable}
                  onChange={(e) => updateRole(item.id, e.target.value as Role)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {roles.includes('editor') && (
                    <option value="editor">Editor</option>
                  )}

                  {roles.includes('reviewer') && (
                    <option value="reviewer">Reviewer</option>
                  )}

                  {roles.includes('admin') && (
                    <option value="admin">Admin</option>
                  )}

                  {roles.includes('superadmin') && (
                    <option value="superadmin">Főadmin</option>
                  )}

                  {item.role === 'superadmin' && (
                    <option value="superadmin">Főadmin régi</option>
                  )}
                </select>

                {isActive ? (
                  <button
                    disabled={!editable || item.id === user.id}
                    onClick={() => updateActiveStatus(item.id, false)}
                    className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    disabled={!editable}
                    onClick={() => updateActiveStatus(item.id, true)}
                    className="rounded-xl border border-green-200 bg-white px-3 py-2 text-sm font-bold text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
