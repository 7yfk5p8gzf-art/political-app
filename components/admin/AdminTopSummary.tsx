import Badge from '@/components/shared/Badge';
import { roleLabels } from '@/lib/constants';
import { canManageUsers, canPublish } from '@/lib/permissions';
import { User } from '@/types/user';

export default function AdminTopSummary({ user }: { user: User }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-sm text-slate-500">Szerepkör alapú admin</div>
        <h2 className="text-3xl font-bold">Áttekintés</h2>
      </div>
      <div className="flex flex-wrap gap-3">
        <Badge tone="blue">{roleLabels[user.role]}</Badge>
        {canPublish(user.role) ? <Badge tone="green">Publikálhat</Badge> : <Badge tone="amber">Nem publikálhat</Badge>}
        {canManageUsers(user.role) ? <Badge tone="green">Felhasználókezelés</Badge> : <Badge tone="slate">Korlátozott user jog</Badge>}
      </div>
    </div>
  );
}
