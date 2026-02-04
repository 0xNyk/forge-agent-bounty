import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { Bounty } from '@/types/bounty';
import { Clock, Coins } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/date-utils';

interface BountyCardProps {
  bounty: Bounty;
}

export function BountyCard({ bounty }: BountyCardProps) {
  const isExpired = new Date(bounty.deadline) < new Date();
  const deadlineText = isExpired
    ? 'Expired'
    : `${formatDistanceToNow(bounty.deadline)} left`;

  return (
    <Link href={`/bounties/${bounty.id}`}>
      <Card className="h-full hover:border-primary/50 transition-all cursor-pointer card-hover">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2">{bounty.title}</CardTitle>
            <StatusBadge status={bounty.status} />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {bounty.description}
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 font-semibold">
            <Coins className="h-4 w-4 text-primary" />
            <span>{bounty.reward} {bounty.token}</span>
          </div>
          <div className={`flex items-center gap-1 ${isExpired ? 'text-red-500' : 'text-muted-foreground'}`}>
            <Clock className="h-4 w-4" />
            <span>{deadlineText}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
