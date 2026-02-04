'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { BountyActions } from '@/components/BountyActions';
import { useBounty } from '@/hooks/useBounties';
import { formatDate, formatDateTime } from '@/lib/date-utils';
import { ArrowLeft, Calendar, Clock, Coins, ExternalLink, User, Loader2, Database, Cloud, AlertCircle } from 'lucide-react';

interface BountyDetailClientProps {
  id: string;
}

export function BountyDetailClient({ id }: BountyDetailClientProps) {
  const { bounty, isLoading, error, isFromChain } = useBounty(id);

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading bounty from Solana...</p>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/bounties">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Bounties
          </Button>
        </Link>
        
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Bounty not found</h3>
          <p className="text-muted-foreground">
            This bounty doesn&apos;t exist or couldn&apos;t be loaded.
          </p>
          {error && (
            <p className="text-sm text-red-500 mt-2">{error.message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button and data source */}
      <div className="flex items-center justify-between">
        <Link href="/bounties">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Bounties
          </Button>
        </Link>
        
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
          isFromChain 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        }`}>
          {isFromChain ? (
            <>
              <Cloud className="h-3 w-3" />
              From Devnet
            </>
          ) : (
            <>
              <Database className="h-3 w-3" />
              Demo Data
            </>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold">{bounty.title}</h1>
          <StatusBadge status={bounty.status} className="text-sm" />
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span className="font-semibold text-foreground text-lg">
              {bounty.reward} {bounty.token}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Created {formatDate(bounty.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Deadline: {formatDate(bounty.deadline)}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {bounty.description}
              </p>
            </CardContent>
          </Card>

          {/* Submission (if exists) */}
          {bounty.submissionUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Submission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={bounty.submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {bounty.submissionUrl}
                  </a>
                </div>
                {bounty.submissionNotes && (
                  <div>
                    <p className="text-sm font-medium mb-2">Notes from agent:</p>
                    <p className="text-muted-foreground">{bounty.submissionNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <BountyActions bounty={bounty} />
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Creator</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <a
                    href={`https://explorer.solana.com/address/${bounty.creator}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm hover:text-primary"
                  >
                    {truncateAddress(bounty.creator)}
                  </a>
                </div>
              </div>

              {bounty.agent && (
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Agent</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <a
                      href={`https://explorer.solana.com/address/${bounty.agent}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm hover:text-primary"
                    >
                      {truncateAddress(bounty.agent)}
                    </a>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Bounty Address</p>
                <a
                  href={`https://explorer.solana.com/address/${bounty.publicKey}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm hover:text-primary"
                >
                  {truncateAddress(bounty.publicKey)}
                </a>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm">{formatDateTime(bounty.createdAt)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="text-sm">{formatDateTime(bounty.deadline)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
