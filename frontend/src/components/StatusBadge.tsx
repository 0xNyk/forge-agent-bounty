import { Badge } from '@/components/ui/badge';
import { BountyStatus } from '@/types/bounty';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: BountyStatus;
  className?: string;
}

const statusConfig: Record<BountyStatus, { label: string; className: string }> = {
  Open: {
    label: 'Open',
    className: 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20',
  },
  InProgress: {
    label: 'In Progress',
    className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20',
  },
  PendingReview: {
    label: 'Pending Review',
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20',
  },
  Completed: {
    label: 'Completed',
    className: 'bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20',
  },
  Cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20 hover:bg-gray-500/20',
  },
  Expired: {
    label: 'Expired',
    className: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
