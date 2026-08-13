import { createClient } from '@supabase/supabase-js';

export type AppRole = 'superadmin' | 'admin' | 'reviewer' | 'editor';

type AuthenticatedUser = {
  id: string;
  email: string | null;
  role: AppRole;
  isActive: boolean;
};

export async function authenticateRequest(
  request: Request,
  allowedRoles?: readonly AppRole[],
): Promise<{ user: AuthenticatedUser } | { failure: { status: 401 | 403 | 500; message: string } }> {
  const authorization = request.headers.get('authorization');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!authorization?.startsWith('Bearer ') || !supabaseUrl || !supabaseAnonKey) {
    return { failure: { status: 401, message: 'Bejelentkezés szükséges.' } };
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
  });

  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user) {
    return { failure: { status: 401, message: 'Érvénytelen munkamenet.' } };
  }

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Request profile lookup failed:', profileError.message);
    return { failure: { status: 500, message: 'Profil ellenőrzése sikertelen.' } };
  }
  if (!profile || profile.is_active === false) {
    return { failure: { status: 403, message: 'A fiók nem aktív.' } };
  }

  const role = profile.role as AppRole;
  if (!['superadmin', 'admin', 'reviewer', 'editor'].includes(role)) {
    return { failure: { status: 403, message: 'Ismeretlen felhasználói szerepkör.' } };
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    return { failure: { status: 403, message: 'Nincs jogosultságod ehhez a művelethez.' } };
  }

  return { user: { id: user.id, email: user.email ?? null, role, isActive: true } };
}
