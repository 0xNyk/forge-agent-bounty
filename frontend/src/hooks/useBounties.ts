"use client";

import { useState, useEffect, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { Bounty } from '@/types/bounty';
import { mockBounties, mockStats } from '@/lib/mock-data';
import { 
  fetchAllBounties, 
  fetchBountyById as fetchBountyByIdFromChain,
  fetchBountyByPublicKey,
  fetchMarketplaceStats,
  filterBountiesByCreator,
  filterBountiesByAgent
} from '@/lib/program';
import { SOLANA_CONFIG } from '@/lib/config';

export interface UseBountiesResult {
  bounties: Bounty[];
  isLoading: boolean;
  error: Error | null;
  isFromChain: boolean;
  refetch: () => Promise<void>;
}

export interface UseBountyResult {
  bounty: Bounty | null;
  isLoading: boolean;
  error: Error | null;
  isFromChain: boolean;
  refetch: () => Promise<void>;
}

export interface UseMarketplaceStatsResult {
  stats: {
    totalBounties: number;
    totalPaidOut: number;
    activeAgents: number;
    openBounties: number;
  };
  isLoading: boolean;
  error: Error | null;
  isFromChain: boolean;
}

// Hook to fetch all bounties with fallback to mock data
export function useBounties(): UseBountiesResult {
  const { connection } = useConnection();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromChain, setIsFromChain] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const chainBounties = await fetchAllBounties(connection);
      
      if (chainBounties.length > 0) {
        setBounties(chainBounties);
        setIsFromChain(true);
      } else {
        // Fallback to mock data if no bounties found
        console.log('No bounties on chain, using mock data');
        setBounties(mockBounties);
        setIsFromChain(false);
      }
    } catch (err) {
      console.error('Failed to fetch bounties from chain:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Fallback to mock data on error
      setBounties(mockBounties);
      setIsFromChain(false);
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
    isFromChain,
    refetch: fetchData,
  };
}

// Hook to fetch a single bounty by ID with fallback
export function useBounty(id: string): UseBountyResult {
  const { connection } = useConnection();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromChain, setIsFromChain] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First try to fetch by ID from chain
      const chainBounty = await fetchBountyByIdFromChain(connection, id);
      
      if (chainBounty) {
        setBounty(chainBounty);
        setIsFromChain(true);
      } else {
        // Fallback to mock data
        const mockBounty = mockBounties.find(b => b.id === id) || null;
        setBounty(mockBounty);
        setIsFromChain(false);
      }
    } catch (err) {
      console.error('Failed to fetch bounty from chain:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Fallback to mock data
      const mockBounty = mockBounties.find(b => b.id === id) || null;
      setBounty(mockBounty);
      setIsFromChain(false);
    } finally {
      setIsLoading(false);
    }
  }, [connection, id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [fetchData, id]);

  return {
    bounty,
    isLoading,
    error,
    isFromChain,
    refetch: fetchData,
  };
}

// Hook to fetch a bounty by public key
export function useBountyByPublicKey(publicKey: string): UseBountyResult {
  const { connection } = useConnection();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromChain, setIsFromChain] = useState(false);

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
      
      if (chainBounty) {
        setBounty(chainBounty);
        setIsFromChain(true);
      } else {
        // Fallback to mock data
        const mockBounty = mockBounties.find(b => b.publicKey === publicKey) || null;
        setBounty(mockBounty);
        setIsFromChain(false);
      }
    } catch (err) {
      console.error('Failed to fetch bounty from chain:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      const mockBounty = mockBounties.find(b => b.publicKey === publicKey) || null;
      setBounty(mockBounty);
      setIsFromChain(false);
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
    isFromChain,
    refetch: fetchData,
  };
}

// Hook for user's bounties (created + claimed)
export function useUserBounties(walletAddress: string | null): {
  createdBounties: Bounty[];
  claimedBounties: Bounty[];
  isLoading: boolean;
  error: Error | null;
  isFromChain: boolean;
  refetch: () => Promise<void>;
} {
  const { bounties, isLoading, error, isFromChain, refetch } = useBounties();

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
    isFromChain,
    refetch,
  };
}

// Hook for marketplace stats
export function useMarketplaceStats(): UseMarketplaceStatsResult {
  const { connection } = useConnection();
  const [stats, setStats] = useState(mockStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromChain, setIsFromChain] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const chainStats = await fetchMarketplaceStats(connection);
        
        if (chainStats) {
          // Merge with some mock data for stats we don't have on-chain
          setStats({
            totalBounties: chainStats.totalBounties,
            totalPaidOut: chainStats.totalVolume,
            activeAgents: mockStats.activeAgents, // Not tracked on-chain
            openBounties: mockStats.openBounties, // Would need to count
          });
          setIsFromChain(true);
        } else {
          setStats(mockStats);
          setIsFromChain(false);
        }
      } catch (err) {
        console.error('Failed to fetch marketplace stats:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setStats(mockStats);
        setIsFromChain(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [connection]);

  return {
    stats,
    isLoading,
    error,
    isFromChain,
  };
}
