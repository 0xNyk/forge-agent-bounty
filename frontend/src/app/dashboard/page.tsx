'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BountyCard } from '@/components/BountyCard';
import { mockBounties, mockUserProfile } from '@/lib/mock-data';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Wallet, Trophy, Coins, Star, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();

  // In a real app, we'd filter based on the connected wallet
  // For demo, we'll use mock data
  const myBounties = mockBounties.slice(0, 2);
  const myClaims = mockBounties.slice(2, 4);

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
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Manage your bounties and claims</p>
      </div>

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

          {myBounties.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold">No bounties yet</h3>
                <p className="text-muted-foreground">
                  Create your first bounty to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {myBounties.map((bounty) => (
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

          {myClaims.length === 0 ? (
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
              {myClaims.map((bounty) => (
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
                    Member since {new Date().toLocaleDateString()}
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
                <p className="text-3xl font-bold">{mockUserProfile.completedBounties}</p>
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
                <p className="text-3xl font-bold">{mockUserProfile.createdBounties}</p>
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
                <p className="text-3xl font-bold">${mockUserProfile.totalEarned}</p>
                <p className="text-xs text-muted-foreground">USD equivalent</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Reputation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{mockUserProfile.reputation}</p>
                <p className="text-xs text-muted-foreground">out of 5.0</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
