import { NextResponse } from 'next/server';
import { authenticateRequest, type AppRole } from '@/lib/serverAuth';
import { getServerAdminClient } from '@/lib/serverSupabase';

const EDITORIAL_ROLES: AppRole[] = ['superadmin', 'admin', 'reviewer', 'editor'];

function makeSlug(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request, EDITORIAL_ROLES);
  if ('failure' in auth) return NextResponse.json({ error: auth.failure.message }, { status: auth.failure.status });
  const body = await request.json().catch(() => null) as { old_source_id?: unknown; new_source_id?: unknown } | null;
  if (typeof body?.old_source_id !== 'string' || typeof body.new_source_id !== 'string' || body.old_source_id === body.new_source_id) {
    return NextResponse.json({ error: 'Két különböző source szükséges.' }, { status: 400 });
  }

  try {
    const client = getServerAdminClient();
    const { data: sources, error: sourceError } = await client
      .from('sources')
      .select('*')
      .in('id', [body.old_source_id, body.new_source_id])
      .eq('status', 'published')
      .is('deleted_at', null);
    if (sourceError || !sources || sources.length !== 2) return NextResponse.json({ error: 'A kiválasztott published source-ok nem találhatók.' }, { status: 400 });
    const oldS = sources.find((source) => source.id === body.old_source_id);
    const newS = sources.find((source) => source.id === body.new_source_id);
    if (!oldS || !newS) return NextResponse.json({ error: 'A kiválasztott source-ok nem találhatók.' }, { status: 400 });

    const { data: duplicate } = await client.from('contradictions').select('id').eq('old_source_id', oldS.id).eq('new_source_id', newS.id).is('deleted_at', null).maybeSingle();
    if (duplicate) return NextResponse.json({ error: 'Ez az OLD + NEW source páros már létezik.' }, { status: 409 });

    const person = oldS.politician?.trim() || newS.politician?.trim() || 'ismeretlen';
    const topic = oldS.topic?.trim() || newS.topic?.trim() || 'tema';
    const slug = `${makeSlug(`${person}-${topic}-${oldS.source_date || 'regen'}-vs-${newS.source_date || 'most'}`)}-${Date.now()}`;
    const insert = {
      old_source_id: oldS.id,
      new_source_id: newS.id,
      politician: person,
      topic,
      topic_hu: topic,
      topic_de: null,
      topic_en: null,
      topic_fr: null,
      slug,
      language: oldS.language || newS.language || 'hu',
      old_statement: oldS.quote_text || oldS.title || null,
      old_date: oldS.source_date || null,
      old_source: oldS.article_url || oldS.video_url || oldS.url || null,
      old_video_url: oldS.video_url || null,
      new_statement: newS.quote_text || newS.title || null,
      new_date: newS.source_date || null,
      new_source: newS.article_url || newS.video_url || newS.url || null,
      new_video_url: newS.video_url || null,
      ai_summary: `Régi: ${oldS.ai_summary || oldS.summary || oldS.title || ''}\n\nÚj: ${newS.ai_summary || newS.summary || newS.title || ''}`,
    };
    const { data, error } = await client.from('contradictions').insert(insert).select('id, slug').single();
    if (error || !data) return NextResponse.json({ error: 'Contradiction mentése sikertelen.' }, { status: 502 });
    await client.from('audit_logs').insert({
      user_id: auth.user.id,
      user_email: auth.user.email,
      user_role: auth.user.role,
      action: 'create_contradiction',
      table_name: 'contradictions',
      record_id: data.id,
      details: `Új contradiction létrehozva draftként: ${data.slug || slug}`,
    });
    return NextResponse.json({ contradiction: data }, { status: 201 });
  } catch (error) {
    console.error('Admin contradiction creation failed:', error);
    return NextResponse.json({ error: 'Admin adatbázis-művelet sikertelen.' }, { status: 500 });
  }
}
