'use client';

import { useEffect, useState } from 'react';
import { canPublish, canReview } from '@/lib/permissions';
import { supabase } from '../../lib/supabase';
import { useAuth } from '@/hooks/useAuth';

type Comparison = {
  id: number;
  slug: string;
  title: string;
  topic: string;
  status: 'draft' | 'review' | 'published' | 'rejected' | string;
  left_actor: string;
  left_headline: string | null;
  left_body: string | null;
  right_actor: string;
  right_headline: string | null;
  right_body: string | null;
  created_at?: string;
};

export default function ReviewList() {
  const { user } = useAuth();
  const [items, setItems] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(true);

  const [role, setRole] = useState('');

useEffect(() => {
  const loadRole = async () => {
    const { data } = await supabase.auth.getSession();
    const email = data?.session?.user?.email;

    if (!email) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', email)
      .single();

    if (profile?.role) {
      setRole(profile.role.toLowerCase().trim());
    }
  };

  loadRole();
}, []);

  const loadData = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('comparisons')
      .select('*')
      .in('status', ['draft', 'review', 'published', 'rejected'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      alert(`Betöltési hiba: ${error.message}`);
    } else {
      setItems(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (
    id: number,
    newStatus: 'draft' | 'review' | 'published' | 'rejected'
  ) => {
    const { error } = await supabase
      .from('comparisons')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error(error);
      alert(`Státusz hiba: ${error.message}`);
      return;
    }

    loadData();
  };

  const deleteItem = async (id: number) => {
    const confirmed = window.confirm('Biztosan törlöd ezt a témát?');
    if (!confirmed) return;

    const { error } = await supabase
      .from('comparisons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      alert(`Törlési hiba: ${error.message}`);
      return;
    }

    loadData();
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'review':
        return 'Review';
      case 'published':
        return 'Publikálva';
      case 'rejected':
        return 'Elutasítva';
      default:
        return status;
    }
  };

  const canSendToReview =
    role === 'editor' || role === 'admin' || role === 'superadmin';

  return (
    <section className="rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Workflow lista</h2>

      {loading && <div className="text-slate-500">Betöltés...</div>}

      {!loading && items.length === 0 && (
        <div className="text-slate-500">Nincs még tartalom.</div>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl bg-slate-50 border border-slate-200 p-5"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="font-bold">{item.title}</div>

                <div className="text-sm text-slate-500 mt-2">
                  {item.left_actor} vs {item.right_actor}
                </div>

                <div className="text-xs text-slate-400 mt-2">
                  Státusz: {getStatusLabel(item.status)}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {item.status === 'draft' && canSendToReview && (
                  <button
                    onClick={() => updateStatus(item.id, 'review')}
                    className="rounded-2xl bg-amber-500 text-white px-4 py-2 text-sm font-medium"
                  >
                    Küldés review-ra
                  </button>
                )}

                {item.status === 'review' && role && canReview(role as any) && (
                  <>
                    {canPublish(role as any) && (
                      <button
                        onClick={() => updateStatus(item.id, 'published')}
                        className="rounded-2xl bg-emerald-600 text-white px-4 py-2 text-sm font-medium"
                      >
                        Publish
                      </button>
                    )}

                    <button
                      onClick={() => updateStatus(item.id, 'rejected')}
                      className="rounded-2xl bg-red-500 text-white px-4 py-2 text-sm font-medium"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => updateStatus(item.id, 'draft')}
                      className="rounded-2xl bg-white border border-slate-200 px-4 py-2 text-sm font-medium"
                    >
                      Vissza draft
                    </button>
                  </>
                )}

                {item.status === 'published' && role && canPublish(role as any) && (
                  <>
                    <button
                      onClick={() => updateStatus(item.id, 'review')}
                      className="rounded-2xl bg-white border border-slate-200 px-4 py-2 text-sm font-medium"
                    >
                      Vissza review
                    </button>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="rounded-2xl bg-red-600 text-white px-4 py-2 text-sm font-medium"
                    >
                      Törlés
                    </button>
                  </>
                )}

                {item.status === 'rejected' && role && canReview(role as any) && (
                  <>
                    <button
                      onClick={() => updateStatus(item.id, 'draft')}
                      className="rounded-2xl bg-white border border-slate-200 px-4 py-2 text-sm font-medium"
                    >
                      Vissza draft
                    </button>

                    {canPublish(role as any) && (
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="rounded-2xl bg-red-600 text-white px-4 py-2 text-sm font-medium"
                      >
                        Törlés
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}