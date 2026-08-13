import { NextResponse } from 'next/server';
import { authenticateRequest, type AppRole } from '@/lib/serverAuth';
import { getServerAdminClient } from '@/lib/serverSupabase';

const WORKFLOW_ROLES: AppRole[] = ['superadmin', 'admin', 'reviewer'];
const REVIEW_STATUSES = ['draft', 'review', 'approved', 'rejected'] as const;
const CONTENT_STATUSES = ['draft', 'review', 'approved', 'published', 'rejected'] as const;

function makeSlug(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request, WORKFLOW_ROLES);
  if ('failure' in auth) return NextResponse.json({ error: auth.failure.message }, { status: auth.failure.status });
  const { id } = await params;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const client = getServerAdminClient();

  try {
    const { data: current, error: lookupError } = await client
      .from('contradictions')
      .select('id, status, review_status, slug, politician, topic')
      .eq('id', id)
      .maybeSingle();
    if (lookupError || !current) return NextResponse.json({ error: 'Az ellentmondás nem található.' }, { status: 404 });

    if (typeof body?.ai_summary === 'string') {
      if (body.ai_summary.length > 20000) return NextResponse.json({ error: 'Az AI összefoglaló túl hosszú.' }, { status: 400 });
      const { error } = await client.from('contradictions').update({ ai_summary: body.ai_summary }).eq('id', id);
      if (error) return NextResponse.json({ error: 'AI összefoglaló mentése sikertelen.' }, { status: 502 });
      await writeAudit(client, auth.user, id, 'update_contradiction_ai_summary', `AI összefoglaló frissítve: ${current.slug || id}`);
      return NextResponse.json({ ok: true });
    }

    const status = typeof body?.status === 'string' ? body.status : null;
    const reviewStatus = typeof body?.review_status === 'string' ? body.review_status : null;
    if (!status || !CONTENT_STATUSES.includes(status as typeof CONTENT_STATUSES[number]) || (reviewStatus && !REVIEW_STATUSES.includes(reviewStatus as typeof REVIEW_STATUSES[number]))) {
      return NextResponse.json({ error: 'Érvénytelen workflow státusz.' }, { status: 400 });
    }
    if (status === 'published' && !['admin', 'superadmin'].includes(auth.user.role)) {
      return NextResponse.json({ error: 'Publikálni csak admin jogosultsággal lehet.' }, { status: 403 });
    }
    const now = new Date().toISOString();
    const update: Record<string, string | null> = { status };
    if (reviewStatus) {
      update.review_status = reviewStatus;
      update.reviewed_at = now;
    }
    update.published_at = status === 'published' ? now : null;
    if (status === 'published' && !current.slug) {
      update.slug = makeSlug(`${current.politician || 'politician'}-${current.topic || 'contradiction'}-${id}`);
    }

    const { error } = await client.from('contradictions').update(update).eq('id', id);
    if (error) return NextResponse.json({ error: 'Workflow státusz mentése sikertelen.' }, { status: 502 });
    const action = status === 'published' ? 'publish_contradiction' : 'update_contradiction_workflow';
    await writeAudit(client, auth.user, id, action, `Workflow: ${current.status || 'draft'} → ${status}${reviewStatus ? `; review: ${reviewStatus}` : ''}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Contradiction workflow failed:', error);
    return NextResponse.json({ error: 'Workflow adatbázis-művelet sikertelen.' }, { status: 500 });
  }
}

async function writeAudit(client: ReturnType<typeof getServerAdminClient>, user: { id: string; email: string | null; role: AppRole }, recordId: string, action: string, details: string) {
  const { error } = await client.from('audit_logs').insert({
    user_id: user.id,
    user_email: user.email,
    user_role: user.role,
    action,
    table_name: 'contradictions',
    record_id: recordId,
    details,
  });
  if (error) console.error('Workflow audit log failed:', error.message);
}
