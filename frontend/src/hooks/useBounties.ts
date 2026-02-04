"use client";

import { useState, useEffect, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Bounty } from '@/types/bounty';
import { 
  fetchAllBounties, 
  fetchBountyById as fetchBountyByIdFromChain,
  fetchBountyByPublicKey,
  fetchMarketplaceStats,
  filterBountiesByCreator,
  filterBountiesByAgent
} from '@/lib/program';

export interface UseBountiesResult {
  bounties: Bounty[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseBountyResult {
  bounty: Bounty | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface MarketplaceStats {
  totalBounties: number;
  totalPaidOut: number;
  activeAgents: number;
  openBounties: number;
}

export interface UseMarketplaceStatsResult {
  stats: MarketplaceStats;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Hook to fetch all bounties - NO MOCK DATA FALLBACK
export function useBounties(): UseBountiesResult {
  const { connection } = useConnection();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const chainBounties = await fetchAllBounties(connection);
      setBounties(chainBounties);
    } catch (err) {
      console.error('Failed to fetch bounties from chain:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch bounties'));
      setBounties([]);
    } finally {
      setIsLoading(false);
    }
  }, [connection]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    bounties,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// Hook to fetch a single bounty by ID - NO MOCK DATA FALLBACK
export function useBounty(id: string): UseBountyResult {
  const { connection } = useConnection();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) {
      setBounty(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const chainBounty = await fetchBountyByIdFromChain(connection, id);
      setBounty(chainBounty);
    } catch (err) {
      console.error('Failed to fetch bounty from chain:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch bounty'));
      setBounty(null);
    } finally {
      setIsLoading(false);
    }
  }, [connection, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    bounty,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// Hook to fetch a bounty by public key - NO MOCK DATA FALLBACK
export function useBountyByPublicKey(publicKey: string): UseBountyResult {
  const { connection } = useConnection();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!publicKey) {
      setBounty(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const chainBounty = await fetchBountyByPublicKey(connection, publicKey);
      setBounty(chainBounty);
    } catch (err) {
      console.error('Failed to fetch bounty from chain:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch bounty'));
      setBounty(null);
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    bounty,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// Hook for user's bounties (created + claimed) - NO MOCK DATA FALLBACK
export function useUserBounties(walletAddress: string | null): {
  createdBounties: Bounty[];
  claimedBounties: Bounty[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const { bounties, isLoading, error, refetch } = useBounties();

  const createdBounties = walletAddress 
    ? filterBountiesByCreator(bounties, walletAddress)
    : [];
    
  const claimedBounties = walletAddress
    ? filterBountiesByAgent(bounties, walletAddress)
    : [];

  return {
    createdBounties,
    claimedBounties,
    isLoading,
    error,
    refetch,
  };
}

// Hook for marketplace stats - NO MOCK DATA FALLBACK
// Calculates stats from bounties array + marketplace PDA
export function useMarketplaceStats(): UseMarketplaceStatsResult {
  const { connection } = useConnection();
  const { bounties } = useBounties();
  const [stats, setStats] = useState<MarketplaceStats>({
    totalBounties: 0,
    totalPaidOut: 0,
    activeAgents: 0,
    openBounties: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch marketplace PDA stats
      const chainStats = await fetchMarketplaceStats(connection);
      
      // Calculate stats from bounties array
      const openBounties = bounties.filter(b => b.status === 'Open').length;
      
      // Count unique agents from in-progress and completed bounties
      const uniqueAgents = new Set(
        bounties
          .filter(b => b.agent && (b.status === 'InProgress' || b.status === 'Completed' || b.status === 'PendingReview'))
          .map(b => b.agent)
      );
      
      // Sum rewards from completed bounties
      const totalPaidFromBounties = bounties
        .filter(b => b.status === 'Completed')
        .reduce((sum, b) => sum + b.reward, 0);

      setStats({
        totalBounties: chainStats?.totalBounties ?? bounties.length,
        totalPaidOut: chainStats?.totalVolume ?? totalPaidFromBounties,
        activeAgents: uniqueAgents.size,
        openBounties,
      });
    } catch (err) {
      console.error('Failed to fetch marketplace stats:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
      
      // Still calculate what we can from bounties
      const openBounties = bounties.filter(b => b.status === 'Open').length;
      const uniqueAgents = new Set(
        bounties
          .filter(b => b.agent && (b.status === 'InProgress' || b.status === 'Completed' || b.status === 'PendingReview'))
          .map(b => b.agent)
      );
      const totalPaidFromBounties = bounties
        .filter(b => b.status === 'Completed')
        .reduce((sum, b) => sum + b.reward, 0);
        
      setStats({
        totalBounties: bounties.length,
        totalPaidOut: totalPaidFromBounties,
        activeAgents: uniqueAgents.size,
        openBounties,
      });
    } finally {
      setIsLoading(false);
    }
  }, [connection, bounties]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
