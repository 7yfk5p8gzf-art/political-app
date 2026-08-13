import { NextResponse } from 'next/server';
import { authenticateRequest, type AppRole } from '@/lib/serverAuth';
import { getServerAdminClient } from '@/lib/serverSupabase';

function canEdit(current: AppRole, target: AppRole, next: AppRole) {
  if (current === 'superadmin') return true;
  return current === 'admin' && ['editor', 'reviewer'].includes(target) && ['editor', 'reviewer'].includes(next);
}
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateRequest(request, ['superadmin', 'admin']);
  if ('failure' in auth) return NextResponse.json({ error: auth.failure.message }, { status: auth.failure.status });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const hasRole = typeof body?.role === 'string';
  const hasActive = typeof body?.is_active === 'boolean';
  if ((!hasRole && !hasActive) || (hasRole && !['superadmin', 'admin', 'reviewer', 'editor'].includes(body.role))) {
    return NextResponse.json({ error: 'Érvénytelen user-módosítás.' }, { status: 400 });
  }
  if (id === auth.user.id && body.is_active === false) {
    return NextResponse.json({ error: 'Saját fiók nem tiltható le.' }, { status: 400 });
  }

  try {
    const client = getServerAdminClient();
    const { data: target, error: targetError } = await client
      .from('profiles')
      .select('id, email, role, is_active')
      .eq('id', id)
      .maybeSingle();
    if (targetError || !target) return NextResponse.json({ error: 'A felhasználó nem található.' }, { status: 404 });
    if (hasRole && !canEdit(auth.user.role, target.role as AppRole, body.role as AppRole)) {
      return NextResponse.json({ error: 'Ezt a szerepkört nem állíthatod be.' }, { status: 403 });
    }

    const update = hasRole ? { role: body.role, ...(hasActive ? { is_active: body.is_active } : {}) } : { is_active: body.is_active };
    const { error } = await client.from('profiles').update(update).eq('id', id);
    if (error) return NextResponse.json({ error: 'Felhasználó módosítása sikertelen.' }, { status: 502 });

    const action = hasRole ? 'update_user_role' : body.is_active ? 'reactivate_user' : 'deactivate_user';
    await client.from('audit_logs').insert({
      user_id: auth.user.id,
      user_email: auth.user.email,
      user_role: auth.user.role,
      action,
      table_name: 'profiles',
      record_id: id,
      details: `Admin user mutation: ${target.email}`,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin user mutation failed:', error);
    return NextResponse.json({ error: 'Admin adatbázis-konfiguráció hiányzik.' }, { status: 500 });
  }
}
