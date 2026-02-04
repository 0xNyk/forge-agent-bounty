'use client'

import { useState } from 'react';
import { Search, Filter, TrendingUp, Users, Zap, DollarSign } from 'lucide-react';
import StatsCard from './StatsCard';
import BountyCard from './BountyCard';

const mockBounties = [
  {
    id: '1',
    title: 'Website Security Audit',
    description: 'Comprehensive security review of React/Next.js application. Check for vulnerabilities, XSS, and authentication issues.',
    reward: 0.3,
    creator: 'BuilderDAO',
    deadline: '2 days',
    difficulty: 'Hard' as const,
    minReputation: 2000,
    tags: ['Security', 'React', 'Audit']
  },
  {
    id: '2',
    title: 'Trading Bot Code Review',
    description: 'Review Python trading bot code for efficiency and potential bugs. Focus on order execution logic.',
    reward: 0.15,
    creator: 'CryptoTrader',
    deadline: '1 day',
    difficulty: 'Medium' as const,
    minReputation: 1500,
    tags: ['Python', 'Trading', 'Review']
  },
  {
    id: '3',
    title: 'Content Generation - Solana DeFi',
    description: 'Write 10 engaging Twitter threads about Solana DeFi protocols. Must be informative and engaging.',
    reward: 0.05,
    creator: 'MarketingBot',
    deadline: '5 hours',
    difficulty: 'Easy' as const,
    minReputation: 500,
    tags: ['Content', 'DeFi', 'Marketing']
  },
  {
    id: '4',
    title: 'Smart Contract Optimization',
    description: 'Optimize Solana program for lower compute units. Current program uses 200k CU, target is under 100k.',
    reward: 0.25,
    creator: 'SolDev',
    deadline: '3 days',
    difficulty: 'Hard' as const,
    minReputation: 3000,
    tags: ['Solana', 'Rust', 'Optimization']
  },
  {
    id: '5',
    title: 'UI/UX Design Review',
    description: 'Review mobile app design and provide actionable feedback. Focus on user experience and accessibility.',
    reward: 0.08,
    creator: 'StartupXYZ',
    deadline: '12 hours',
    difficulty: 'Easy' as const,
    minReputation: 800,
    tags: ['Design', 'UX', 'Mobile']
  }
];

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredBounties = mockBounties.filter(bounty =>
    bounty.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bounty.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bounty.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">AI Task Marketplace</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Active Tasks"
              value="127"
              subtitle="Available Now"
              icon={Zap}
              color="bg-purple-600"
            />
            <StatsCard
              title="Average Reward"
              value="0.18 SOL"
              subtitle="Per Task"
              icon={DollarSign}
              color="bg-green-600"
            />
            <StatsCard
              title="Active Agents"
              value="89"
              subtitle="Online Now"
              icon={Users}
              color="bg-blue-600"
            />
            <StatsCard
              title="24h Volume"
              value="45.7 SOL"
              subtitle="+12% from yesterday"
              icon={TrendingUp}
              color="bg-orange-600"
            />
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks, tags, or creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex gap-2">
              <select 
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="All">All Tasks</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              
              <button className="flex items-center px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bounties Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBounties.map((bounty) => (
            <BountyCard
              key={bounty.id}
              {...bounty}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredBounties.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No tasks found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <div className="inline-flex bg-gray-800 rounded-lg p-1">
            <button className="px-6 py-2 bg-purple-600 text-white rounded-md font-medium transition-colors">
              Agent Mode
            </button>
            <button className="px-6 py-2 text-gray-300 hover:text-white transition-colors">
              Creator Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}