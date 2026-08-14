'use client';

import { supabase } from '@/lib/supabase';
import { Role, User } from '@/types/user';
import { createContext, useEffect, useMemo, useState } from 'react';

type LoginResult = { ok: boolean; message?: string };

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
};

type ProfileRow = {
  role: Role;
  full_name: string | null;
  is_active: boolean | null;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function buildDisplayName(email: string, fullName?: string | null) {
  if (fullName && fullName.trim()) return fullName.trim();
  const localPart = email.split('@')[0] ?? 'Felhasználó';
  return localPart.replace(/[._-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const authUser = session?.user;

    if (!authUser?.email) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, full_name, is_active')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile load error:', profileError.message);
    }

    if (profile && profile.is_active === false) {
      await supabase.auth.signOut();
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (!profile) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const role = profile.role;
    const fullName = profile.full_name;

    setUser({
      id: authUser.id,
      email: authUser.email,
      role,
      name: buildDisplayName(authUser.email, fullName),
    });

    setIsLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;
      await refreshUser();
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refreshUser();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      refreshUser,
      login: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { ok: false, message: error.message };
        }

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          return { ok: false, message: 'Nem sikerült bejelentkezni.' };
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_active')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profile?.is_active === false) {
          await supabase.auth.signOut();
          setUser(null);

          return {
            ok: false,
            message: 'A fiókod le van tiltva. Kérlek vedd fel a kapcsolatot az adminnal.',
          };
        }

        await refreshUser();
        return { ok: true };
      },
      logout,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
