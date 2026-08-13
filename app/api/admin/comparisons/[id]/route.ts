import { NextResponse } from 'next/server';
import { authenticateRequest, type AppRole } from '@/lib/serverAuth';
import { getServerAdminClient } from '@/lib/serverSupabase';

const EDITORIAL_ROLES: AppRole[] = ['superadmin', 'admin', 'reviewer', 'editor'];
const FIELDS = ['title', 'topic', 'slug', 'left_actor', 'right_actor', 'left_headline', 'right_headline', 'left_body', 'right_body', 'status'] as const;
const STATUSES = ['draft', 'review', 'published', 'rejected'] as const;

function validateFields(input: unknown) {
  if (!input || typeof input !== 'object') return null;
  const value = input as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const field of FIELDS) {
    if (value[field] === undefined) continue;
    if (typeof value[field] !== 'string' || value[field].length > 20000) return null;
    result[field] = value[field].trim();
  }
  if (!Object.keys(result).length || (result.status && !STATUSES.includes(result.status as typeof STATUSES[number]))) return null;
  return result;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request, EDITORIAL_ROLES);
  if ('failure' in auth) return NextResponse.json({ error: auth.failure.message }, { status: auth.failure.status });
  const { id } = await params;
  const fields = validateFields(await request.json().catch(() => null));
  if (!fields) return NextResponse.json({ error: 'Érvénytelen comparison módosítás.' }, { status: 400 });
  if (fields.status === 'published' && !['admin', 'superadmin'].includes(auth.user.role)) return NextResponse.json({ error: 'Publikálni csak admin jogosultsággal lehet.' }, { status: 403 });
  try {
    const client = getServerAdminClient();
    const { data, error } = await client.from('comparisons').update(fields).eq('id', id).select().single();
    if (error || !data) return NextResponse.json({ error: 'A comparison nem található vagy nem módosítható.' }, { status: error ? 502 : 404 });
    const action = fields.status === 'published' ? 'publish_comparison' : 'update_comparison';
    await writeAudit(client, auth.user, id, action, `Comparison módosítva: ${data.slug || id}`);
    return NextResponse.json({ comparison: data });
  } catch (error) {
    console.error('Admin comparison update failed:', error);
    return NextResponse.json({ error: 'Admin adatbázis-művelet sikertelen.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request, ['superadmin', 'admin']);
  if ('failure' in auth) return NextResponse.json({ error: auth.failure.message }, { status: auth.failure.status });
  const { id } = await params;
  try {
    const client = getServerAdminClient();
    const { data, error } = await client.from('comparisons').delete().eq('id', id).select('id, slug').single();
    if (error || !data) return NextResponse.json({ error: 'A comparison nem található vagy nem törölhető.' }, { status: error ? 502 : 404 });
    await writeAudit(client, auth.user, id, 'delete_comparison', `Comparison törölve: ${data.slug || id}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin comparison deletion failed:', error);
    return NextResponse.json({ error: 'Admin adatbázis-művelet sikertelen.' }, { status: 500 });
  }
}

async function writeAudit(client: ReturnType<typeof getServerAdminClient>, user: { id: string; email: string | null; role: AppRole }, recordId: string, action: string, details: string) {
  const { error } = await client.from('audit_logs').insert({ user_id: user.id, user_email: user.email, user_role: user.role, action, table_name: 'comparisons', record_id: recordId, details });
  if (error) console.error('Comparison audit log failed:', error.message);
}
