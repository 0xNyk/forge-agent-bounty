'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bounty } from '@/types/bounty';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface BountyActionsProps {
  bounty: Bounty;
}

export function BountyActions({ bounty }: BountyActionsProps) {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [isLoading, setIsLoading] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  const isCreator = connected && publicKey?.toBase58() === bounty.creator;
  const isAgent = connected && publicKey?.toBase58() === bounty.agent;

  const handleAction = async (action: string, callback: () => Promise<void>) => {
    if (!connected) {
      setVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      await callback();
      toast.success(`${action} successful!`);
    } catch (error) {
      toast.error(`Failed to ${action.toLowerCase()}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const claimBounty = async () => {
    await handleAction('Claim', async () => {
      // Mock: would call Anchor program
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
  };

  const submitWork = async () => {
    await handleAction('Submit', async () => {
      // Mock: would call Anchor program with submissionUrl
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitDialogOpen(false);
      setSubmissionUrl('');
      setSubmissionNotes('');
    });
  };

  const approveSubmission = async () => {
    await handleAction('Approve', async () => {
      // Mock: would call Anchor program
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
  };

  const rejectSubmission = async () => {
    await handleAction('Reject', async () => {
      // Mock: would call Anchor program
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
  };

  const cancelBounty = async () => {
    await handleAction('Cancel', async () => {
      // Mock: would call Anchor program
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
  };

  // Open bounty - anyone can claim
  if (bounty.status === 'Open') {
    return (
      <div className="flex flex-col gap-2">
        <Button onClick={claimBounty} disabled={isLoading} size="lg" className="w-full">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {connected ? 'Claim Bounty' : 'Connect Wallet to Claim'}
        </Button>
        {isCreator && (
          <Button variant="outline" onClick={cancelBounty} disabled={isLoading}>
            Cancel Bounty
          </Button>
        )}
      </div>
    );
  }

  // In Progress - agent can submit
  if (bounty.status === 'InProgress') {
    if (isAgent) {
      return (
        <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full">Submit Work</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Your Work</DialogTitle>
              <DialogDescription>
                Provide a link to your completed work and any notes for the bounty creator.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Submission URL *</label>
                <Input
                  placeholder="https://github.com/your/repo"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Describe what you built and any special instructions..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitWork} disabled={!submissionUrl || isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <div className="text-center text-muted-foreground py-4">
        This bounty is being worked on by another agent.
      </div>
    );
  }

  // Pending Review - creator can approve/reject
  if (bounty.status === 'PendingReview') {
    if (isCreator) {
      return (
        <div className="flex gap-2">
          <Button onClick={approveSubmission} disabled={isLoading} className="flex-1">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Approve & Pay
          </Button>
          <Button variant="destructive" onClick={rejectSubmission} disabled={isLoading} className="flex-1">
            Reject
          </Button>
        </div>
      );
    }

    if (isAgent) {
      return (
        <div className="text-center text-muted-foreground py-4">
          Your submission is being reviewed by the bounty creator.
        </div>
      );
    }

    return (
      <div className="text-center text-muted-foreground py-4">
        This bounty is pending review.
      </div>
    );
  }

  // Completed or Cancelled
  if (bounty.status === 'Completed') {
    return (
      <div className="text-center text-green-500 py-4 font-medium">
        ✓ This bounty has been completed and paid out.
      </div>
    );
  }

  if (bounty.status === 'Cancelled') {
    return (
      <div className="text-center text-muted-foreground py-4">
        This bounty has been cancelled.
      </div>
    );
  }

  return null;
}
