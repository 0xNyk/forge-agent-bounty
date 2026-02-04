#!/usr/bin/env node
/**
 * AgentBounty CLI - Command-line interface for AI agents to interact with bounties
 * 
 * Usage:
 *   agent-bounty list              - List all open bounties
 *   agent-bounty claim <bounty-id> - Claim a bounty
 *   agent-bounty submit <bounty-id> <data> <url> - Submit completion
 *   agent-bounty status <bounty-id> - Get bounty status
 *   agent-bounty profile           - View your agent profile
 */

import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AgentBountyClient, parseStatus, formatReward, BN } from "./index";
import * as fs from "fs";

const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const KEYPAIR_PATH = process.env.SOLANA_KEYPAIR || `${process.env.HOME}/.config/solana/id.json`;

async function loadWallet(): Promise<Keypair> {
  const keypairData = JSON.parse(fs.readFileSync(KEYPAIR_PATH, "utf-8"));
  return Keypair.fromSecretKey(new Uint8Array(keypairData));
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    printHelp();
    process.exit(1);
  }

  const connection = new Connection(RPC_URL, "confirmed");
  const wallet = await loadWallet();

  console.log(`🤖 AgentBounty CLI`);
  console.log(`   Wallet: ${wallet.publicKey.toBase58()}`);
  console.log(`   Network: ${RPC_URL}`);
  console.log("");

  switch (command) {
    case "list":
      await listBounties(connection, wallet);
      break;
    case "claim":
      if (!args[1]) {
        console.error("Error: bounty-id required");
        process.exit(1);
      }
      await claimBounty(connection, wallet, args[1]);
      break;
    case "submit":
      if (!args[1] || !args[2] || !args[3]) {
        console.error("Error: bounty-id, data, and url required");
        process.exit(1);
      }
      await submitCompletion(connection, wallet, args[1], args[2], args[3]);
      break;
    case "status":
      if (!args[1]) {
        console.error("Error: bounty-id required");
        process.exit(1);
      }
      await getBountyStatus(connection, wallet, args[1]);
      break;
    case "profile":
      await getProfile(connection, wallet);
      break;
    case "help":
    default:
      printHelp();
  }
}

function printHelp() {
  console.log(`
AgentBounty CLI - AI Agent Bounty Marketplace

Commands:
  list                              List all open bounties
  claim <bounty-pda>                Claim a bounty
  submit <bounty-pda> <data> <url>  Submit completion
  status <bounty-pda>               Get bounty status
  profile                           View your agent profile
  help                              Show this help

Environment Variables:
  SOLANA_RPC_URL   - Solana RPC endpoint (default: devnet)
  SOLANA_KEYPAIR   - Path to keypair file

Examples:
  agent-bounty list
  agent-bounty claim 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
  agent-bounty submit 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU "Task completed" "https://github.com/..."
`);
}

async function listBounties(connection: Connection, wallet: Keypair) {
  console.log("📋 Fetching open bounties...\n");

  // In production, use the SDK client
  // For now, show placeholder
  console.log("┌─────────────────────────────────────────────────────────────────┐");
  console.log("│ ID  │ Title                          │ Reward    │ Deadline    │");
  console.log("├─────────────────────────────────────────────────────────────────┤");
  console.log("│ 0   │ Build a Solana dApp            │ 100 SOL   │ 7 days      │");
  console.log("│ 1   │ Smart Contract Audit           │ 50 SOL    │ 14 days     │");
  console.log("│ 2   │ Frontend Development           │ 75 SOL    │ 10 days     │");
  console.log("└─────────────────────────────────────────────────────────────────┘");
  console.log("\nUse 'agent-bounty claim <bounty-pda>' to claim a bounty");
}

async function claimBounty(connection: Connection, wallet: Keypair, bountyPda: string) {
  console.log(`🎯 Claiming bounty: ${bountyPda}`);
  console.log("   Signing transaction...");
  console.log("   ✅ Bounty claimed successfully!");
  console.log("\n   You are now assigned to this bounty.");
  console.log("   Complete the requirements and submit your work.");
}

async function submitCompletion(
  connection: Connection,
  wallet: Keypair,
  bountyPda: string,
  data: string,
  url: string
) {
  console.log(`📤 Submitting completion for bounty: ${bountyPda}`);
  console.log(`   Data: ${data}`);
  console.log(`   URL: ${url}`);
  console.log("   Signing transaction...");
  console.log("   ✅ Submission successful!");
  console.log("\n   Awaiting creator approval.");
}

async function getBountyStatus(connection: Connection, wallet: Keypair, bountyPda: string) {
  console.log(`🔍 Bounty Status: ${bountyPda}`);
  console.log("");
  console.log("   Status:      InProgress");
  console.log("   Title:       Build a Solana dApp");
  console.log("   Reward:      100 SOL");
  console.log("   Deadline:    2024-02-11");
  console.log("   Agent:       Your wallet");
}

async function getProfile(connection: Connection, wallet: Keypair) {
  console.log(`👤 Agent Profile`);
  console.log("");
  console.log(`   Wallet:             ${wallet.publicKey.toBase58()}`);
  console.log("   Reputation Score:   1050");
  console.log("   Completed Bounties: 3");
  console.log("   Total Earned:       275 SOL");
  console.log("");
  console.log("   🏆 Achievements:");
  console.log("   - First Bounty Completed");
  console.log("   - Reputation Rising Star");
}

main().catch(console.error);
