import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/serverAuth';
import { getServerAdminClient } from '@/lib/serverSupabase';

const ADMIN_ROLES = ['superadmin', 'admin'] as const;

export async function GET(request: Request) {
  const auth = await authenticateRequest(request, ADMIN_ROLES);
  if ('failure' in auth) return NextResponse.json({ error: auth.failure.message }, { status: auth.failure.status });

  try {
    const client = getServerAdminClient();
    const { data, error } = await client
      .from('profiles')
      .select('id, email, role, full_name, created_at, is_active')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: 'Felhasználók betöltése sikertelen.' }, { status: 502 });
    return NextResponse.json({ users: data ?? [] });
  } catch (error) {
    console.error('Admin user list failed:', error);
    return NextResponse.json({ error: 'Admin adatbázis-konfiguráció hiányzik.' }, { status: 500 });
  }
}
