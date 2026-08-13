import { NextResponse } from 'next/server';
import { authenticateRequest, type AppRole } from '@/lib/serverAuth';
import { getServerAdminClient } from '@/lib/serverSupabase';

const EDITORIAL_ROLES: AppRole[] = ['superadmin', 'admin', 'reviewer'];
const STATUS_VALUES = ['draft', 'review', 'approved', 'published'] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateRequest(request, EDITORIAL_ROLES);
  if ('failure' in auth) return NextResponse.json({ error: auth.failure.message }, { status: auth.failure.status });
  const { id } = await params;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const action = body?.action;
  const client = getServerAdminClient();

  try {
    const { data: current, error: lookupError } = await client
      .from('contradictions')
      .select('id, status, slug, deleted_at, politician')
      .eq('id', id)
      .maybeSingle();
    if (lookupError || !current) return NextResponse.json({ error: 'Az ellentmondás nem található.' }, { status: 404 });

    let update: Record<string, string | null>;
    let auditAction: string;
    let details: string;
    if (action === 'soft_delete' || action === 'restore') {
      if (!['admin', 'superadmin'].includes(auth.user.role)) return NextResponse.json({ error: 'Ehhez admin jogosultság szükséges.' }, { status: 403 });
      const deleting = action === 'soft_delete';
      update = { deleted_at: deleting ? new Date().toISOString() : null, deleted_by: deleting ? auth.user.email || auth.user.role : null };
      auditAction = deleting ? 'soft_delete_contradiction' : 'restore_contradiction';
      details = deleting ? `Contradiction lomtárba helyezve: ${current.slug || id}` : `Contradiction visszaállítva: ${current.slug || id}`;
    } else if (action === 'status') {
      const status = typeof body?.status === 'string' ? body.status : null;
      if (!status || !STATUS_VALUES.includes(status as typeof STATUS_VALUES[number])) return NextResponse.json({ error: 'Érvénytelen contradiction státusz.' }, { status: 400 });
      if (status === 'published' && !['admin', 'superadmin'].includes(auth.user.role)) return NextResponse.json({ error: 'Publikálni csak admin jogosultsággal lehet.' }, { status: 403 });
      if (current.deleted_at) return NextResponse.json({ error: 'Törölt elemet előbb vissza kell állítani.' }, { status: 409 });
      update = { status, published_at: status === 'published' ? new Date().toISOString() : null };
      auditAction = 'update_contradiction_status';
      details = `Status módosítva: ${current.status || 'draft'} → ${status}. Slug: ${current.slug || id}`;
    } else if (action === 'ai_summary') {
      if (typeof body?.ai_summary !== 'string' || body.ai_summary.length > 20000) return NextResponse.json({ error: 'Érvénytelen AI összefoglaló.' }, { status: 400 });
      if (current.deleted_at) return NextResponse.json({ error: 'Törölt elemhez előbb restore kell.' }, { status: 409 });
      update = { ai_summary: body.ai_summary };
      auditAction = 'generate_ai_summary';
      details = `AI összefoglaló generálva. Politikus: ${current.politician || '-'}`;
    } else {
      return NextResponse.json({ error: 'Ismeretlen contradiction művelet.' }, { status: 400 });
    }

    const { error } = await client.from('contradictions').update(update).eq('id', id);
    if (error) return NextResponse.json({ error: 'Contradiction módosítása sikertelen.' }, { status: 502 });
    await writeAudit(client, auth.user, id, auditAction, details);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin contradiction mutation failed:', error);
    return NextResponse.json({ error: 'Admin adatbázis-művelet sikertelen.' }, { status: 500 });
  }
}

async function writeAudit(client: ReturnType<typeof getServerAdminClient>, user: { id: string; email: string | null; role: AppRole }, recordId: string, action: string, details: string) {
  const { error } = await client.from('audit_logs').insert({ user_id: user.id, user_email: user.email, user_role: user.role, action, table_name: 'contradictions', record_id: recordId, details });
  if (error) console.error('Admin contradiction audit log failed:', error.message);
}
