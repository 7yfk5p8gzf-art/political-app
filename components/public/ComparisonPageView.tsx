'use client';

import { useEffect, useState } from 'react';
import { Comparison } from '@/types/comparison';

type VoteState = {
  a: number;
  b: number;
  none: number;
};

export default function ComparisonPageView({ item }: { item: Comparison }) {
  const [votes, setVotes] = useState<VoteState>({ a: 0, b: 0, none: 0 });

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(`votes-${item.slug}`) || '{"a":0,"b":0,"none":0}');
    setVotes(stored);
  }, [item.slug]);

  const handleVote = (type: 'a' | 'b' | 'none') => {
    const updated = {
      ...votes,
      [type]: votes[type] + 1,
    };

    setVotes(updated);
    localStorage.setItem(`votes-${item.slug}`, JSON.stringify(updated));
  };

  const totalVotes = votes.a + votes.b + votes.none;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm">
          <div className="text-sm text-slate-500">{item.topic}</div>
          <h1 className="text-4xl font-bold mt-2">{item.title}</h1>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-[2rem] bg-white border border-blue-200 p-6 shadow-sm">
            <div className="text-xs uppercase text-blue-600 font-semibold">A oldal</div>
            <h2 className="text-2xl font-bold mt-3">{item.left.actor}</h2>

            {item.left.headline && (
              <div className="mt-4 text-lg font-semibold text-slate-800">
                {item.left.headline}
              </div>
            )}

            {item.left.body && (
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                {item.left.body}
              </p>
            )}
          </div>

          <div className="rounded-[2rem] bg-white border border-rose-200 p-6 shadow-sm">
            <div className="text-xs uppercase text-rose-600 font-semibold">B oldal</div>
            <h2 className="text-2xl font-bold mt-3">{item.right.actor}</h2>

            {item.right.headline && (
              <div className="mt-4 text-lg font-semibold text-slate-800">
                {item.right.headline}
              </div>
            )}

            {item.right.body && (
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                {item.right.body}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm">
          <h2 className="text-2xl font-bold">Közösségi szavazás</h2>
          <p className="mt-2 text-slate-600">
            Melyik álláspont volt meggyőzőbb?
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => handleVote('a')}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium"
            >
              A oldal
            </button>

            <button
              onClick={() => handleVote('b')}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium"
            >
              B oldal
            </button>

            <button
              onClick={() => handleVote('none')}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium"
            >
              Egyik sem
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-sm text-slate-500">A oldal</div>
              <div className="mt-2 text-2xl font-bold">{votes.a}</div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-sm text-slate-500">B oldal</div>
              <div className="mt-2 text-2xl font-bold">{votes.b}</div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-sm text-slate-500">Egyik sem</div>
              <div className="mt-2 text-2xl font-bold">{votes.none}</div>
            </div>

            <div className="rounded-2xl bg-slate-900 text-white p-4">
              <div className="text-sm text-slate-300">Összes szavazat</div>
              <div className="mt-2 text-2xl font-bold">{totalVotes}</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}