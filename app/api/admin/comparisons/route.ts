import { NextResponse } from 'next/server';
import { authenticateRequest, type AppRole } from '@/lib/serverAuth';
import { getServerAdminClient } from '@/lib/serverSupabase';

const EDITORIAL_ROLES: AppRole[] = ['superadmin', 'admin', 'reviewer', 'editor'];
const FIELDS = ['title', 'topic', 'slug', 'left_actor', 'right_actor', 'left_headline', 'right_headline', 'left_body', 'right_body', 'status'] as const;
const STATUSES = ['draft', 'review', 'published', 'rejected'] as const;

function makeSlug(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function validateFields(input: unknown) {
  if (!input || typeof input !== 'object') return null;
  const value = input as Record<string, unknown>;
  if (typeof value.title !== 'string' || !value.title.trim() || value.title.length > 500) return null;
  const result: Record<string, string> = {};
  for (const field of FIELDS) {
    if (value[field] === undefined) continue;
    if (typeof value[field] !== 'string' || value[field].length > 20000) return null;
    result[field] = value[field].trim();
  }
  if (result.status && !STATUSES.includes(result.status as typeof STATUSES[number])) return null;
  return result;
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request, EDITORIAL_ROLES);
  if ('failure' in auth) return NextResponse.json({ error: auth.failure.message }, { status: auth.failure.status });
  const fields = validateFields(await request.json().catch(() => null));
  if (!fields) return NextResponse.json({ error: 'Érvénytelen comparison adatok.' }, { status: 400 });
  if (fields.status === 'published' && !['admin', 'superadmin'].includes(auth.user.role)) return NextResponse.json({ error: 'Publikálni csak admin jogosultsággal lehet.' }, { status: 403 });
  try {
    const client = getServerAdminClient();
    const insert = { ...fields, topic: fields.topic || fields.title, slug: fields.slug || `${makeSlug(fields.title)}-${Date.now()}`, status: fields.status || 'draft' };
    const { data, error } = await client.from('comparisons').insert(insert).select().single();
    if (error || !data) return NextResponse.json({ error: 'Comparison mentése sikertelen.' }, { status: 502 });
    await writeAudit(client, auth.user, String(data.id), 'create_comparison', `Comparison létrehozva: ${data.slug || data.id}`);
    return NextResponse.json({ comparison: data }, { status: 201 });
  } catch (error) {
    console.error('Admin comparison creation failed:', error);
    return NextResponse.json({ error: 'Admin adatbázis-művelet sikertelen.' }, { status: 500 });
  }
}

async function writeAudit(client: ReturnType<typeof getServerAdminClient>, user: { id: string; email: string | null; role: AppRole }, recordId: string, action: string, details: string) {
  const { error } = await client.from('audit_logs').insert({ user_id: user.id, user_email: user.email, user_role: user.role, action, table_name: 'comparisons', record_id: recordId, details });
  if (error) console.error('Comparison audit log failed:', error.message);
}
