export type BountyStatus = 'Open' | 'InProgress' | 'PendingReview' | 'Completed' | 'Cancelled' | 'Expired';

export interface Bounty {
  id: string;
  publicKey: string;
  title: string;
  description: string;
  reward: number;
  token: 'SOL' | 'USDC';
  status: BountyStatus;
  creator: string;
  agent: string | null;
  deadline: Date;
  createdAt: Date;
  submissionUrl: string | null;
  submissionNotes: string | null;
}

export interface BountyStats {
  totalBounties: number;
  totalPaidOut: number;
  activeAgents: number;
  openBounties: number;
}

export interface UserProfile {
  address: string;
  completedBounties: number;
  createdBounties: number;
  totalEarned: number;
  reputation: number;
}
