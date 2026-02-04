import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Idl, BN } from '@coral-xyz/anchor';
import { Bounty as BountyType } from '@/types/bounty';
import { SOLANA_CONFIG } from './config';
import idlJson from './idl.json';

// Cast the IDL
const idl = idlJson as Idl;

// Program ID
export const PROGRAM_ID = new PublicKey(SOLANA_CONFIG.programId);

// Marketplace PDA
export const MARKETPLACE_PDA = new PublicKey('56wYYC3tzwpJjfoEofs2CWXjDvYqzw2yubWyiLvLwUGf');

// Token Mint
export const TOKEN_MINT = new PublicKey('5bkdFzv7MhNHa2cSEtxgeiejrQvtWnv1WTMrLdhMwLG6');

// Known bounty PDAs from devnet deployment
export const BOUNTY_PDAS = [
  '7CZWMQHgEzryxtN2j7Q31TebshYBQkDgxJ6HopykHC61',
  'FNsuMDcS9rMgVm1q2BPTKS57vr3jGrHoU4Umt9hqgpoD',
  '2mN7dqmgw7dymNAnTkEPPvD33TWwPH2pWMseYgHP8ACn',
  'B86HW3HrKtiWyK5ZV51t22QCujHEziAfvya8CUVzNhB7',
  'GfR5Jz1GkoSndaP2utPZAAPBxTQvaN5yYUkyEdsXdrd5',
];

// On-chain bounty account structure
export interface OnChainBounty {
  id: BN;
  creator: PublicKey;
  title: string;
  description: string;
  requirements: string;
  reward: BN;
  deadline: BN;
  status: { open?: {} } | { inProgress?: {} } | { pendingReview?: {} } | { completed?: {} } | { expired?: {} };
  assignedAgent: PublicKey | null;
  createdAt: BN;
  submittedAt: BN | null;
  completedAt: BN | null;
  completionData: string | null;
  submissionUrl: string | null;
  rejectionReason: string | null;
}

// Parse on-chain status to frontend status
export function parseStatus(status: OnChainBounty['status']): BountyType['status'] {
  if ('open' in status) return 'Open';
  if ('inProgress' in status) return 'InProgress';
  if ('pendingReview' in status) return 'PendingReview';
  if ('completed' in status) return 'Completed';
  if ('expired' in status) return 'Expired';
  return 'Open';
}

// Convert on-chain bounty to frontend bounty type
export function parseBountyAccount(publicKey: PublicKey, account: OnChainBounty): BountyType {
  return {
    id: account.id.toString(),
    publicKey: publicKey.toBase58(),
    title: account.title,
    description: account.description,
    reward: account.reward.toNumber() / 1_000_000, // Convert from lamports/micro units to display
    token: 'USDC', // Our token
    status: parseStatus(account.status),
    creator: account.creator.toBase58(),
    agent: account.assignedAgent?.toBase58() ?? null,
    deadline: new Date(account.deadline.toNumber() * 1000),
    createdAt: new Date(account.createdAt.toNumber() * 1000),
    submissionUrl: account.submissionUrl,
    submissionNotes: account.completionData,
  };
}

// Define a type for the program to access accounts
interface BountyProgram {
  account: {
    bounty: {
      fetch: (address: PublicKey) => Promise<OnChainBounty>;
    };
    marketplace: {
      fetch: (address: PublicKey) => Promise<{
        authority: PublicKey;
        totalBounties: BN;
        totalVolume: BN;
      }>;
    };
  };
}

// Get a read-only program instance (no wallet required)
export function getReadOnlyProgram(connection: Connection): BountyProgram {
  // Create a dummy provider for read-only operations
  const dummyWallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => { throw new Error('Read-only'); },
    signAllTransactions: async () => { throw new Error('Read-only'); },
  };
  
  const provider = new AnchorProvider(
    connection,
    dummyWallet as any,
    { commitment: 'confirmed' }
  );

  return new Program(idl, provider) as unknown as BountyProgram;
}

// Fetch all bounties from known PDAs
export async function fetchAllBounties(connection: Connection): Promise<BountyType[]> {
  const program = getReadOnlyProgram(connection);
  const bounties: BountyType[] = [];

  for (const pdaString of BOUNTY_PDAS) {
    try {
      const pda = new PublicKey(pdaString);
      const account = await program.account.bounty.fetch(pda);
      bounties.push(parseBountyAccount(pda, account));
    } catch (error) {
      console.warn(`Failed to fetch bounty ${pdaString}:`, error);
      // Continue with other bounties
    }
  }

  return bounties;
}

// Fetch single bounty by public key
export async function fetchBountyByPublicKey(
  connection: Connection,
  publicKey: string
): Promise<BountyType | null> {
  try {
    const program = getReadOnlyProgram(connection);
    const pda = new PublicKey(publicKey);
    const account = await program.account.bounty.fetch(pda);
    return parseBountyAccount(pda, account);
  } catch (error) {
    console.warn(`Failed to fetch bounty ${publicKey}:`, error);
    return null;
  }
}

// Fetch bounty by ID (searches through known PDAs)
export async function fetchBountyById(
  connection: Connection,
  id: string
): Promise<BountyType | null> {
  const bounties = await fetchAllBounties(connection);
  return bounties.find(b => b.id === id) ?? null;
}

// Fetch marketplace stats
export async function fetchMarketplaceStats(connection: Connection): Promise<{
  totalBounties: number;
  totalVolume: number;
} | null> {
  try {
    const program = getReadOnlyProgram(connection);
    const marketplace = await program.account.marketplace.fetch(MARKETPLACE_PDA);
    
    return {
      totalBounties: marketplace.totalBounties.toNumber(),
      totalVolume: marketplace.totalVolume.toNumber() / 1_000_000,
    };
  } catch (error) {
    console.warn('Failed to fetch marketplace stats:', error);
    return null;
  }
}

// Filter bounties by creator
export function filterBountiesByCreator(bounties: BountyType[], creator: string): BountyType[] {
  return bounties.filter(b => b.creator === creator);
}

// Filter bounties by agent
export function filterBountiesByAgent(bounties: BountyType[], agent: string): BountyType[] {
  return bounties.filter(b => b.agent === agent);
}
