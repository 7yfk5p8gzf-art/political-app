import PublicCard from "./PublicCard";

type Props = {
  title: string;
  description?: string;
};

export default function PublicEmptyState({
  title,
  description,
}: Props) {
  return (
    <PublicCard className="p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl dark:bg-slate-800" aria-hidden="true">—</div>

      <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
        {title}
      </h2>

      {description && (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          {description}
        </p>
      )}
    </PublicCard>
  );
}
