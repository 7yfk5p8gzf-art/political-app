'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

type Comparison = {
  id: number;
  slug: string;
  title: string;
  left_actor: string;
  right_actor: string;
  status: string;
  topic: string;
};

type Vote = {
  comparison_id: number;
  vote_type: 'a' | 'b' | 'none';
};

type ComparisonWithVotes = Comparison & {
  totalVotes: number;
};

export default function PublicHomePage() {
  const [items, setItems] = useState<ComparisonWithVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'title' | 'votes'>('newest');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data: comparisons, error: comparisonsError } = await supabase
        .from('comparisons')
        .select('*')
        .eq('status', 'published')
        .order('id', { ascending: false });

      if (comparisonsError) {
        console.error(comparisonsError);
        alert(`Publikus betöltési hiba: ${comparisonsError.message}`);
        setLoading(false);
        return;
      }

      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('comparison_id, vote_type');

      if (votesError) {
        console.error(votesError);
      }

      const voteMap = new Map<number, number>();

      (votes as Vote[] | null)?.forEach((vote) => {
        voteMap.set(
          vote.comparison_id,
          (voteMap.get(vote.comparison_id) || 0) + 1
        );
      });

      const enriched: ComparisonWithVotes[] = (comparisons || []).map((item) => ({
        ...item,
        totalVotes: voteMap.get(item.id) || 0,
      }));

      setItems(enriched);
      setLoading(false);
    };

    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    let result = [...items];

    if (q) {
      result = result.filter((item) => {
        return (
          item.title?.toLowerCase().includes(q) ||
          item.topic?.toLowerCase().includes(q) ||
          item.left_actor?.toLowerCase().includes(q) ||
          item.right_actor?.toLowerCase().includes(q)
        );
      });
    }

    if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'hu'));
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id);
    }

    if (sortBy === 'votes') {
      result.sort((a, b) => b.totalVotes - a.totalVotes);
    }

    return result;
  }, [items, search, sortBy]);

  const topItems = [...items]
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 3)
    .filter((item) => item.totalVotes > 0);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12 md:px-10 md:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
              Politikai összehasonlító platform
            </div>

            <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight">
              Nézőpontok egymás mellett, egyszerűen és érthetően
            </h1>

            <p className="mt-5 text-base md:text-lg text-slate-600 leading-8">
              Ugyanarról a témáról két oldal egymás mellett. Gyors áttekintés,
              publikus összehasonlítások, és közösségi visszajelzés.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10 md:px-10 md:py-12">
        {topItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold">Felkapott témák</h2>
                <p className="mt-1 text-slate-500 text-sm">
                  A legtöbb szavazatot kapott összehasonlítások.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topItems.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/compare/${item.slug}`}
                  className="rounded-[1.5rem] bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700">
                      #{index + 1} trending
                    </div>

                    <div className="text-xs text-slate-400">
                      {item.totalVotes} szavazat
                    </div>
                  </div>

                  <h3 className="mt-4 text-lg font-bold leading-snug">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm text-slate-500">
                    {item.left_actor} vs {item.right_actor}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Publikus témák</h2>
            <p className="mt-2 text-slate-500">
              A már publikált összehasonlítások listája.
            </p>
          </div>

          <div className="hidden md:inline-flex rounded-full bg-white border border-slate-200 px-4 py-2 text-sm text-slate-600">
            {filteredItems.length} téma
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Keresés címre, témára, szereplőre..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as 'newest' | 'title' | 'votes')
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          >
            <option value="newest">Legújabb elöl</option>
            <option value="title">Cím szerint</option>
            <option value="votes">Legtöbb szavazat</option>
          </select>
        </div>

        {loading && (
          <div className="rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm text-slate-500">
            Betöltés...
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm text-slate-500">
            Nincs találat vagy nincs még publikált téma.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="group rounded-[2rem] bg-white border border-slate-200 p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex flex-col gap-5 h-full justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                      {item.topic || 'Téma'}
                    </div>

                    <div className="text-xs text-slate-400">#{item.id}</div>
                  </div>

                  <h3 className="text-xl font-bold leading-snug group-hover:text-slate-800">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-2">
                    <span className="font-medium">{item.left_actor}</span>
                    <span className="text-xs text-slate-400">VS</span>
                    <span className="font-medium">{item.right_actor}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <div className="text-xs text-slate-400">
                    {item.totalVotes} szavazat
                  </div>

                  <Link
                    href={`/compare/${item.slug}`}
                    className="inline-flex items-center rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-medium transition hover:bg-slate-800"
                  >
                    Megnyit →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}