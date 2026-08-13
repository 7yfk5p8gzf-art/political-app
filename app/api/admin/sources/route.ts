import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/serverAuth';
import { getServerAdminClient } from '@/lib/serverSupabase';

const ADMIN_ROLES = ['superadmin', 'admin'] as const;
const SOURCE_STATUSES = ['draft', 'review', 'approved', 'published', 'archived'] as const;
const SOURCE_FIELDS = ['title', 'article_url', 'video_url', 'source_type', 'quote_text', 'ai_summary', 'url', 'type', 'summary', 'source_date', 'language', 'politician', 'topic', 'country', 'status'] as const;

function sourcePayload(body: unknown) {
  if (!body || typeof body !== 'object') return null;
  const value = body as Record<string, unknown>;
  if (typeof value.title !== 'string' || !value.title.trim() || value.title.length > 500) return null;
  if (value.status !== undefined && (typeof value.status !== 'string' || !SOURCE_STATUSES.includes(value.status as typeof SOURCE_STATUSES[number]))) return null;
  const payload: Record<string, string | null> = {};
  for (const field of SOURCE_FIELDS) {
    if (value[field] === undefined) continue;
    if (value[field] !== null && typeof value[field] !== 'string') return null;
    payload[field] = typeof value[field] === 'string' ? value[field].trim() || null : null;
  }
  payload.title = value.title.trim();
  return payload;
}

export async function GET(request: Request) {
  const auth = await authenticateRequest(request, ADMIN_ROLES);
  if ('failure' in auth) return NextResponse.json({ error: auth.failure.message }, { status: auth.failure.status });
  try {
    const { data, error } = await getServerAdminClient().from('sources').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: 'Források betöltése sikertelen.' }, { status: 502 });
    return NextResponse.json({ sources: data ?? [] });
  } catch (error) {
    console.error('Admin source list failed:', error);
    return NextResponse.json({ error: 'Admin adatbázis-konfiguráció hiányzik.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request, ADMIN_ROLES);
  if ('failure' in auth) return NextResponse.json({ error: auth.failure.message }, { status: auth.failure.status });
  const payload = sourcePayload(await request.json().catch(() => null));
  if (!payload) return NextResponse.json({ error: 'Érvénytelen forrásadat.' }, { status: 400 });
  try {
    const { data, error } = await getServerAdminClient().from('sources').insert(payload).select().single();
    if (error) return NextResponse.json({ error: 'Forrás mentése sikertelen.' }, { status: 502 });
    return NextResponse.json({ source: data }, { status: 201 });
  } catch (error) {
    console.error('Admin source creation failed:', error);
    return NextResponse.json({ error: 'Admin adatbázis-konfiguráció hiányzik.' }, { status: 500 });
  }
}
