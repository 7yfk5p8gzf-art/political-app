import PublicHeader from '@/components/layout/PublicHeader';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <PublicHeader />
      {children}
    </div>
  );
}
