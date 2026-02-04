import { Bounty, BountyStats, UserProfile } from '@/types/bounty';

export const mockBounties: Bounty[] = [
  {
    id: '1',
    publicKey: 'BntyX1234567890abcdefghijklmnopqrstuvwxyz123',
    title: 'Build Twitter Sentiment Analysis Agent',
    description: 'Create an AI agent that monitors Twitter for crypto mentions and provides real-time sentiment analysis. Should integrate with Twitter API and output sentiment scores for specified tokens.',
    reward: 5.0,
    token: 'SOL',
    status: 'Open',
    creator: 'CrtrA1234567890abcdefghijklmnopqrstuvwxyz123',
    agent: null,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    submissionUrl: null,
    submissionNotes: null,
  },
  {
    id: '2',
    publicKey: 'BntyY9876543210zyxwvutsrqponmlkjihgfedcba987',
    title: 'NFT Collection Generator Agent',
    description: 'Build an agent that generates unique NFT artwork based on trait parameters. Should output metadata-ready JSON and images compatible with Metaplex standards.',
    reward: 250,
    token: 'USDC',
    status: 'InProgress',
    creator: 'CrtrB9876543210zyxwvutsrqponmlkjihgfedcba987',
    agent: 'AgntC5555555555abcdefghijklmnopqrstuvwxyz555',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    submissionUrl: null,
    submissionNotes: null,
  },
  {
    id: '3',
    publicKey: 'BntyZ1111111111abcdefghijklmnopqrstuvwxyz111',
    title: 'DeFi Arbitrage Alert Bot',
    description: 'Create an agent that monitors DEX prices across Solana protocols and alerts when arbitrage opportunities exceed 0.5%. Should support Jupiter, Raydium, and Orca.',
    reward: 10.0,
    token: 'SOL',
    status: 'PendingReview',
    creator: 'CrtrC1111111111abcdefghijklmnopqrstuvwxyz111',
    agent: 'AgntD2222222222abcdefghijklmnopqrstuvwxyz222',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    submissionUrl: 'https://github.com/agent/defi-arb-bot',
    submissionNotes: 'Implemented full monitoring for all three DEXs with configurable thresholds.',
  },
  {
    id: '4',
    publicKey: 'BntyW3333333333abcdefghijklmnopqrstuvwxyz333',
    title: 'Discord Community Manager Agent',
    description: 'Build an AI agent that can moderate Discord servers, answer FAQs, and engage with community members. Should integrate with Discord.js and support custom command configuration.',
    reward: 150,
    token: 'USDC',
    status: 'Completed',
    creator: 'CrtrD3333333333abcdefghijklmnopqrstuvwxyz333',
    agent: 'AgntE4444444444abcdefghijklmnopqrstuvwxyz444',
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    submissionUrl: 'https://github.com/agent/discord-manager',
    submissionNotes: 'Full-featured bot with moderation, FAQ, and engagement features.',
  },
  {
    id: '5',
    publicKey: 'BntyV5555555555abcdefghijklmnopqrstuvwxyz555',
    title: 'Solana Transaction Analyzer',
    description: 'Create an agent that analyzes Solana transactions and provides human-readable summaries. Should detect swaps, NFT trades, staking actions, and more.',
    reward: 3.5,
    token: 'SOL',
    status: 'Open',
    creator: 'CrtrE5555555555abcdefghijklmnopqrstuvwxyz555',
    agent: null,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    submissionUrl: null,
    submissionNotes: null,
  },
  {
    id: '6',
    publicKey: 'BntyU6666666666abcdefghijklmnopqrstuvwxyz666',
    title: 'Price Prediction Model Agent',
    description: 'Build an ML-powered agent that predicts short-term price movements for SOL and major Solana tokens. Should provide confidence scores and backtesting results.',
    reward: 500,
    token: 'USDC',
    status: 'Open',
    creator: 'CrtrF6666666666abcdefghijklmnopqrstuvwxyz666',
    agent: null,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    submissionUrl: null,
    submissionNotes: null,
  },
];

export const mockStats: BountyStats = {
  totalBounties: 156,
  totalPaidOut: 12450,
  activeAgents: 89,
  openBounties: 42,
};

export const mockUserProfile: UserProfile = {
  address: 'UserX7777777777abcdefghijklmnopqrstuvwxyz777',
  completedBounties: 12,
  createdBounties: 5,
  totalEarned: 2350,
  reputation: 4.8,
};

export function getBountyById(id: string): Bounty | undefined {
  return mockBounties.find(b => b.id === id);
}

export function getBountiesByStatus(status: Bounty['status']): Bounty[] {
  return mockBounties.filter(b => b.status === status);
}

export function getBountiesByCreator(creator: string): Bounty[] {
  return mockBounties.filter(b => b.creator === creator);
}

export function getBountiesByAgent(agent: string): Bounty[] {
  return mockBounties.filter(b => b.agent === agent);
}
