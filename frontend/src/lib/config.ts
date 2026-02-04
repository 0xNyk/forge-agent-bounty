// Solana Program Configuration
export const SOLANA_CONFIG = {
  programId: process.env.NEXT_PUBLIC_PROGRAM_ID || '14tt9AGQcHeA9znF7YkDMJtaW2xZej2MVtASTEJEdExE',
  network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
} as const;

// Validate config at runtime
export function validateConfig() {
  if (!SOLANA_CONFIG.programId) {
    throw new Error('NEXT_PUBLIC_PROGRAM_ID is required');
  }
  return true;
}
