'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const demoAccounts = [
  'foadmin@app.hu — superadmin',
  'admin2@app.hu — admin',
  'reviewer@app.hu — reviewer',
  'editor@app.hu — editor',
];

export default function LoginPageView() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const [email, setEmail] = useState('foadmin@app.hu');
  const [password, setPassword] = useState('demo123');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/admin');
    }
  }, [isLoading, router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    const result = await login(email, password);

    if (!result.ok) {
      setMessage(result.message ?? 'Sikertelen belépés.');
      setSubmitting(false);
      return;
    }

    router.push('/admin');
    setSubmitting(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
        <div className="flex flex-col justify-between bg-slate-900 p-8 text-white md:p-10">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Politikai App</div>
            <h1 className="mt-4 text-4xl font-bold">Admin belépés</h1>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Supabase auth alapú belépés, szerepkörök, review és admin felület egy helyen.
            </p>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <div>Demo fiókok:</div>
            {demoAccounts.map((item) => (
              <div key={item} className="rounded-2xl bg-white/5 px-4 py-3">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center p-8 md:p-10">
          <form onSubmit={handleSubmit} className="w-full space-y-5">
            <div>
              <div className="text-sm text-slate-500">Belépés</div>
              <h2 className="mt-1 text-3xl font-bold">Üdv újra</h2>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Jelszó</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none"
              />
            </div>
            {message ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
            ) : null}
            <button
              disabled={submitting}
              className="w-full rounded-2xl bg-slate-900 py-4 font-medium text-white disabled:opacity-50"
            >
              {submitting ? 'Belépés...' : 'Belépés'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
