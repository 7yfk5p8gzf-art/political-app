import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/serverAuth';
import { getServerAdminClient } from '@/lib/serverSupabase';

const ADMIN_ROLES = ['superadmin', 'admin'] as const;
const SOURCE_STATUSES = ['draft', 'review', 'approved', 'published', 'archived'] as const;
const SOURCE_FIELDS = ['title', 'article_url', 'video_url', 'source_type', 'quote_text', 'ai_summary', 'url', 'type', 'summary', 'source_date', 'language', 'politician', 'topic', 'country', 'status'] as const;

function sourcePayload(body: unknown) {
  if (!body || typeof body !== 'object') return null;
  const value = body as Record<string, unknown>;
  const payload: Record<string, string | null> = {};
  for (const field of SOURCE_FIELDS) {
    if (value[field] === undefined) continue;
    if (value[field] !== null && typeof value[field] !== 'string') return null;
    payload[field] = typeof value[field] === 'string' ? value[field].trim() || null : null;
  }
  if (payload.title !== undefined && (!payload.title || payload.title.length > 500)) return null;
  if (payload.status !== undefined && !SOURCE_STATUSES.includes(payload.status as typeof SOURCE_STATUSES[number])) return null;
  return Object.keys(payload).length ? payload : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request, ADMIN_ROLES);
  if ('failure' in auth) return NextResponse.json({ error: auth.failure.message }, { status: auth.failure.status });
  const { id } = await params;
  const payload = sourcePayload(await request.json().catch(() => null));
  if (!payload) return NextResponse.json({ error: 'Érvénytelen forrásadat.' }, { status: 400 });
  try {
    const { data, error } = await getServerAdminClient().from('sources').update(payload).eq('id', id).select().single();
    if (error || !data) return NextResponse.json({ error: 'A forrás nem található vagy nem módosítható.' }, { status: error ? 502 : 404 });
    return NextResponse.json({ source: data });
  } catch (error) {
    console.error('Admin source update failed:', error);
    return NextResponse.json({ error: 'Admin adatbázis-konfiguráció hiányzik.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request, ADMIN_ROLES);
  if ('failure' in auth) return NextResponse.json({ error: auth.failure.message }, { status: auth.failure.status });
  const { id } = await params;
  try {
    const { error } = await getServerAdminClient().from('sources').delete().eq('id', id);
    if (error) return NextResponse.json({ error: 'Forrás törlése sikertelen.' }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin source deletion failed:', error);
    return NextResponse.json({ error: 'Admin adatbázis-konfiguráció hiányzik.' }, { status: 500 });
  }
}
