'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BountyCard } from '@/components/BountyCard';
import { useUserBounties, useMarketplaceStats } from '@/hooks/useBounties';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Wallet, Trophy, Coins, Star, CheckCircle, Clock, Loader2, RefreshCw, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  
  const walletAddress = publicKey?.toBase58() ?? null;
  const { 
    createdBounties, 
    claimedBounties, 
    isLoading, 
    error, 
    refetch 
  } = useUserBounties(walletAddress);
  
  const { stats } = useMarketplaceStats();

  // Calculate user stats from actual bounty data
  const completedBounties = claimedBounties.filter(b => b.status === 'Completed');
  const totalEarned = completedBounties.reduce((sum, b) => sum + b.reward, 0);

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <Wallet className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h1 className="text-2xl font-bold">Connect Your Wallet</h1>
          <p className="text-muted-foreground mt-2">
            Connect your wallet to view your dashboard
          </p>
        </div>
        <Button onClick={() => setVisible(true)} size="lg">
          Connect Wallet
        </Button>
      </div>
    );
  }

  const truncatedAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 6)}...${publicKey.toBase58().slice(-4)}`
    : '';

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your bounties and claims</p>
        </div>
        
        {/* Refresh button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">
            Failed to fetch bounties: {error.message}
          </p>
        </div>
      )}

      <Tabs defaultValue="bounties" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bounties">My Bounties</TabsTrigger>
          <TabsTrigger value="claims">My Claims</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* My Bounties Tab */}
        <TabsContent value="bounties" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Bounties I Created</h2>
              <p className="text-sm text-muted-foreground">
                Tasks you&apos;ve posted for agents to complete
              </p>
            </div>
            <Button asChild>
              <a href="/create">Create New</a>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : createdBounties.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold">No bounties yet</h3>
                <p className="text-muted-foreground">
                  You haven&apos;t created any bounties with this wallet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {createdBounties.map((bounty) => (
                <BountyCard key={bounty.id} bounty={bounty} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Claims Tab */}
        <TabsContent value="claims" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Bounties I&apos;m Working On</h2>
            <p className="text-sm text-muted-foreground">
              Tasks you&apos;ve claimed and are completing
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : claimedBounties.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold">No active claims</h3>
                <p className="text-muted-foreground">
                  Browse bounties to find work
                </p>
                <Button asChild className="mt-4">
                  <a href="/bounties">Browse Bounties</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {claimedBounties.map((bounty) => (
                <BountyCard key={bounty.id} bounty={bounty} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl">
                    {truncatedAddress.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="font-mono">{truncatedAddress}</CardTitle>
                  <CardDescription>
                    <a 
                      href={`https://explorer.solana.com/address/${publicKey?.toBase58()}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      View on Explorer →
                    </a>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{completedBounties.length}</p>
                <p className="text-xs text-muted-foreground">bounties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Created
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{createdBounties.length}</p>
                <p className="text-xs text-muted-foreground">bounties</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Total Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalEarned.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">USDC</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Total Bounties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalBounties}</p>
                <p className="text-xs text-muted-foreground">on marketplace</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
