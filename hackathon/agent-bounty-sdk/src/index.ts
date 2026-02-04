import { Program, AnchorProvider, BN, Idl } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";

// Default program ID - update this after devnet deployment
export const PROGRAM_ID = new PublicKey("AgentBounty11111111111111111111111111111111");

export interface BountyInfo {
  id: number;
  creator: PublicKey;
  title: string;
  description: string;
  requirements: string;
  reward: BN;
  deadline: BN;
  status: BountyStatus;
  assignedAgent: PublicKey | null;
  createdAt: BN;
  submittedAt: BN | null;
  completedAt: BN | null;
  completionData: string | null;
  submissionUrl: string | null;
  rejectionReason: string | null;
}

export interface AgentProfileInfo {
  agent: PublicKey;
  reputationScore: number;
  completedBounties: number;
  totalEarned: BN;
}

export interface MarketplaceInfo {
  authority: PublicKey;
  totalBounties: BN;
  totalVolume: BN;
}

export enum BountyStatus {
  Open = "open",
  InProgress = "inProgress",
  PendingReview = "pendingReview",
  Completed = "completed",
  Expired = "expired",
}

export class AgentBountyClient {
  private program: Program;
  private connection: Connection;
  private provider: AnchorProvider;

  constructor(
    connection: Connection,
    wallet: { publicKey: PublicKey; signTransaction: any; signAllTransactions: any },
    programId: PublicKey = PROGRAM_ID
  ) {
    this.connection = connection;
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    // Note: In production, load IDL from chain or bundle it
    // this.program = new Program(idl as Idl, programId, this.provider);
  }

  // ==================== PDA Derivation ====================

  static getMarketplacePDA(programId: PublicKey = PROGRAM_ID): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace")],
      programId
    );
  }

  static getBountyPDA(
    creator: PublicKey,
    bountyId: number,
    programId: PublicKey = PROGRAM_ID
  ): [PublicKey, number] {
    const bountyIdBuffer = new BN(bountyId).toArrayLike(Buffer, "le", 8);
    return PublicKey.findProgramAddressSync(
      [Buffer.from("bounty"), creator.toBuffer(), bountyIdBuffer],
      programId
    );
  }

  static getEscrowPDA(
    creator: PublicKey,
    bountyId: number,
    programId: PublicKey = PROGRAM_ID
  ): [PublicKey, number] {
    const bountyIdBuffer = new BN(bountyId).toArrayLike(Buffer, "le", 8);
    return PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), creator.toBuffer(), bountyIdBuffer],
      programId
    );
  }

  static getAgentProfilePDA(
    agent: PublicKey,
    programId: PublicKey = PROGRAM_ID
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("agent"), agent.toBuffer()],
      programId
    );
  }

  // ==================== Read Operations ====================

  async getMarketplace(): Promise<MarketplaceInfo | null> {
    try {
      const [marketplacePda] = AgentBountyClient.getMarketplacePDA();
      const marketplace = await this.program.account.marketplace.fetch(marketplacePda);
      return marketplace as MarketplaceInfo;
    } catch (e) {
      return null;
    }
  }

  async getBounty(creator: PublicKey, bountyId: number): Promise<BountyInfo | null> {
    try {
      const [bountyPda] = AgentBountyClient.getBountyPDA(creator, bountyId);
      const bounty = await this.program.account.bounty.fetch(bountyPda);
      return bounty as BountyInfo;
    } catch (e) {
      return null;
    }
  }

  async getAgentProfile(agent: PublicKey): Promise<AgentProfileInfo | null> {
    try {
      const [agentProfilePda] = AgentBountyClient.getAgentProfilePDA(agent);
      const profile = await this.program.account.agentProfile.fetch(agentProfilePda);
      return profile as AgentProfileInfo;
    } catch (e) {
      return null;
    }
  }

  async getAllBounties(): Promise<BountyInfo[]> {
    const bounties = await this.program.account.bounty.all();
    return bounties.map((b) => b.account as BountyInfo);
  }

  async getOpenBounties(): Promise<BountyInfo[]> {
    const bounties = await this.getAllBounties();
    return bounties.filter((b) => "open" in b.status);
  }

  // ==================== Write Operations ====================

  async initialize(): Promise<string> {
    const [marketplacePda] = AgentBountyClient.getMarketplacePDA();

    const tx = await this.program.methods
      .initialize()
      .accounts({
        marketplace: marketplacePda,
        authority: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  async createBounty(
    title: string,
    description: string,
    requirements: string,
    reward: BN,
    deadline: BN,
    mint: PublicKey,
    creatorTokenAccount: PublicKey
  ): Promise<{ tx: string; bountyId: number }> {
    const marketplace = await this.getMarketplace();
    if (!marketplace) throw new Error("Marketplace not initialized");

    const bountyId = marketplace.totalBounties.toNumber();
    const [bountyPda] = AgentBountyClient.getBountyPDA(
      this.provider.wallet.publicKey,
      bountyId
    );
    const [escrowPda] = AgentBountyClient.getEscrowPDA(
      this.provider.wallet.publicKey,
      bountyId
    );
    const [marketplacePda] = AgentBountyClient.getMarketplacePDA();

    const tx = await this.program.methods
      .createBounty(title, description, requirements, reward, deadline)
      .accounts({
        bounty: bountyPda,
        escrowTokenAccount: escrowPda,
        marketplace: marketplacePda,
        creator: this.provider.wallet.publicKey,
        creatorTokenAccount,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return { tx, bountyId };
  }

  async claimBounty(bountyPda: PublicKey): Promise<string> {
    const [agentProfilePda] = AgentBountyClient.getAgentProfilePDA(
      this.provider.wallet.publicKey
    );

    const tx = await this.program.methods
      .claimBounty()
      .accounts({
        bounty: bountyPda,
        agentProfile: agentProfilePda,
        agent: this.provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  async submitCompletion(
    bountyPda: PublicKey,
    completionData: string,
    submissionUrl: string
  ): Promise<string> {
    const tx = await this.program.methods
      .submitCompletion(completionData, submissionUrl)
      .accounts({
        bounty: bountyPda,
        agent: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  async approveCompletion(
    bountyPda: PublicKey,
    escrowPda: PublicKey,
    agentProfilePda: PublicKey,
    agentTokenAccount: PublicKey
  ): Promise<string> {
    const tx = await this.program.methods
      .approveCompletion()
      .accounts({
        bounty: bountyPda,
        escrowTokenAccount: escrowPda,
        agentProfile: agentProfilePda,
        agentTokenAccount,
        creator: this.provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    return tx;
  }

  async rejectCompletion(bountyPda: PublicKey, reason: string): Promise<string> {
    const tx = await this.program.methods
      .rejectCompletion(reason)
      .accounts({
        bounty: bountyPda,
        creator: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }
}

// ==================== Helper Functions ====================

export function parseStatus(status: any): BountyStatus {
  if ("open" in status) return BountyStatus.Open;
  if ("inProgress" in status) return BountyStatus.InProgress;
  if ("pendingReview" in status) return BountyStatus.PendingReview;
  if ("completed" in status) return BountyStatus.Completed;
  if ("expired" in status) return BountyStatus.Expired;
  throw new Error("Unknown status");
}

export function formatReward(reward: BN, decimals: number = 9): string {
  const divisor = new BN(10).pow(new BN(decimals));
  const whole = reward.div(divisor);
  const fractional = reward.mod(divisor);
  return `${whole.toString()}.${fractional.toString().padStart(decimals, "0")}`;
}

export function isDeadlinePassed(deadline: BN): boolean {
  const now = Math.floor(Date.now() / 1000);
  return deadline.toNumber() < now;
}

export { BN } from "@coral-xyz/anchor";
export { PublicKey, Connection, Keypair } from "@solana/web3.js";
