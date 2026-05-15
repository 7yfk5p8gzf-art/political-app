"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { detectBrowserLang, saveLang, type Lang } from "@/lib/i18n";
import PublicPageShell from "@/components/public/PublicPageShell";
import PublicCard from "../../components/public/ui/PublicCard";
import PublicButton from "../../components/public/ui/PublicButton";
import PublicTag from "../../components/public/ui/PublicTag";

type Item = {
  id: string;
  politician: string | null;
  country?: string | null;
  topic: string | null;
  topic_hu?: string | null;
  topic_de?: string | null;
  topic_en?: string | null;
  topic_fr?: string | null;
};

type Vote = {
  id: string;
  contradiction_id: string;
};

type PoliticianCard = {
  slug: string;
  name: string;
  country: string | null;
  count: number;
  votes: number;
  topTopic: string | null;
};

const labels = {
  hu: {
    badge: "👤 Political Actors",
    title: "Politikusok",
    lead: "Fedezd fel a politikusokat, témáikat, ellentmondásaikat és a közösségi szavazatokat.",
    search: "Keresés politikus, ország vagy téma szerint...",
    contradictions: "ellentmondás",
    votes: "szavazat",
    topTopic: "fő téma",
    open: "Profil",
    noCountry: "Nincs ország",
    noTopic: "Nincs téma",
  },
  de: {
    badge: "👤 Political Actors",
    title: "Politiker",
    lead: "Entdecke Politiker, ihre Themen, Widersprüche und Community-Stimmen.",
    search: "Suche nach Politiker, Land oder Thema...",
    contradictions: "Widersprüche",
    votes: "Stimmen",
    topTopic: "Top-Thema",
    open: "Profil",
    noCountry: "Kein Land",
    noTopic: "Kein Thema",
  },
  en: {
    badge: "👤 Political Actors",
    title: "Politicians",
    lead: "Explore politicians, their topics, contradictions and community voting.",
    search: "Search politician, country or topic...",
    contradictions: "contradictions",
    votes: "votes",
    topTopic: "top topic",
    open: "Profile",
    noCountry: "No country",
    noTopic: "No topic",
  },
  fr: {
    badge: "👤 Political Actors",
    title: "Politiciens",
    lead: "Explorez les politiciens, leurs sujets, contradictions et votes communautaires.",
    search: "Rechercher politicien, pays ou sujet...",
    contradictions: "contradictions",
    votes: "votes",
    topTopic: "sujet principal",
    open: "Profil",
    noCountry: "Aucun pays",
    noTopic: "Aucun sujet",
  },
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getTopic(item: Item, lang: Lang) {
  if (lang === "de") return item.topic_de || item.topic;
  if (lang === "en") return item.topic_en || item.topic;
  if (lang === "fr") return item.topic_fr || item.topic;
  return item.topic_hu || item.topic;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PoliticiansPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState<Lang>("hu");

  useEffect(() => {
    setLang(detectBrowserLang());
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("contradictions")
      .select("*")
      .eq("status", "published");

    setItems((data || []) as Item[]);

    const { data: voteData } = await supabase
      .from("contradiction_votes")
      .select("*");

    setVotes((voteData || []) as Vote[]);
  }

  const politicians = useMemo(() => {
    const map = new Map<string, PoliticianCard>();

    items.forEach((item) => {
      if (!item.politician) return;

      const slug = slugify(item.politician);

      const current = map.get(slug) || {
        slug,
        name: item.politician,
        country: item.country || null,
        count: 0,
        votes: 0,
        topTopic: null,
      };

      current.count += 1;
      current.votes += votes.filter((v) => v.contradiction_id === item.id).length;

      if (!current.country && item.country) current.country = item.country;

      map.set(slug, current);
    });

    map.forEach((politician) => {
      const related = items.filter(
        (item) => item.politician && slugify(item.politician) === politician.slug
      );

      const topicCount = new Map<string, number>();

      related.forEach((item) => {
        const topic = getTopic(item, lang);
        if (!topic) return;
        topicCount.set(topic, (topicCount.get(topic) || 0) + 1);
      });

      politician.topTopic =
        Array.from(topicCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        null;
    });

    return Array.from(map.values()).sort(
      (a, b) => b.count - a.count || b.votes - a.votes
    );
  }, [items, votes, lang]);

  const filteredPoliticians = politicians.filter((p) =>
    [p.name, p.country, p.topTopic]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <PublicPageShell>
      <section className="mx-auto max-w-7xl">
        <PublicCard className="mb-8 p-8 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <PublicTag>{labels[lang].badge}</PublicTag>

              <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-950 dark:text-white md:text-7xl">
                {labels[lang].title}
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                {labels[lang].lead}
              </p>
            </div>

            <div className="flex gap-2">
              {(["hu", "de", "en", "fr"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    saveLang(l);
                  }}
                  className={`rounded-xl px-4 py-2 text-sm font-black transition-all ${
                    lang === l
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-white/70 text-slate-800 ring-1 ring-slate-200 hover:bg-white"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={labels[lang].search}
            className="mt-8 w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 text-base outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-950/50 dark:text-white"
          />
        </PublicCard>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPoliticians.map((p) => (
            <PublicCard
              key={p.slug}
              className="min-h-[280px] border-white/5 bg-slate-900/95 text-white hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-xl font-black text-white ring-1 ring-white/10">
                    {getInitials(p.name)}
                  </div>

                  <div>
                    <PublicTag>{p.country || labels[lang].noCountry}</PublicTag>

                    <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                      {p.name}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="text-sm font-bold text-slate-400">
                  {labels[lang].topTopic}:
                </span>{" "}
                {p.topTopic ? (
                  <a
                    href={`/topics/${slugify(p.topTopic)}`}
                    className="font-black text-white underline decoration-2 underline-offset-4"
                  >
                    {p.topTopic} →
                  </a>
                ) : (
                  <strong>{labels[lang].noTopic}</strong>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                  <strong className="block text-2xl text-white">{p.count}</strong>
                  <span className="text-sm text-slate-400">
                    {labels[lang].contradictions}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                  <strong className="block text-2xl text-white">{p.votes}</strong>
                  <span className="text-sm text-slate-400">
                    {labels[lang].votes}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <PublicButton href={`/politicians/${p.slug}`}>
                  {labels[lang].open} →
                </PublicButton>
              </div>
            </PublicCard>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}