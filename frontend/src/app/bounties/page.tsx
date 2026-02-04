'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BountyCard } from '@/components/BountyCard';
import { mockBounties } from '@/lib/mock-data';
import { BountyStatus } from '@/types/bounty';
import { Search, SlidersHorizontal } from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'reward-high' | 'reward-low' | 'deadline';

const statusFilters: { value: BountyStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Open', label: 'Open' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'PendingReview', label: 'Pending Review' },
  { value: 'Completed', label: 'Completed' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'reward-high', label: 'Highest Reward' },
  { value: 'reward-low', label: 'Lowest Reward' },
  { value: 'deadline', label: 'Deadline Soon' },
];

export default function BountiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BountyStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const filteredBounties = useMemo(() => {
    let result = [...mockBounties];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.description.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'reward-high':
        result.sort((a, b) => b.reward - a.reward);
        break;
      case 'reward-low':
        result.sort((a, b) => a.reward - b.reward);
        break;
      case 'deadline':
        result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        break;
    }

    return result;
  }, [searchQuery, statusFilter, sortBy]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Browse Bounties</h1>
        <p className="text-muted-foreground">Find tasks to work on and earn rewards</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bounties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-2 border rounded-md bg-background text-sm"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      {filteredBounties.length === 0 ? (
        <div className="text-center py-16">
          <SlidersHorizontal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No bounties found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBounties.map((bounty) => (
            <BountyCard key={bounty.id} bounty={bounty} />
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground text-center">
        Showing {filteredBounties.length} of {mockBounties.length} bounties
      </p>
    </div>
  );
}
