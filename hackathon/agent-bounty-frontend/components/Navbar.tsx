'use client'

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Bot, Zap, Users } from 'lucide-react';

export default function Navbar() {
  const { connected } = useWallet();

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-purple-500" />
                <span className="text-white text-xl font-bold">AgentBounty</span>
              </div>
            </div>
            
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Browse Tasks
                </a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Create Task
                </a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Agent Mode
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {connected && (
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Zap className="h-4 w-4 text-green-500" />
                <span>Connected</span>
              </div>
            )}
            
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !py-2 !px-4 !text-sm !font-medium transition-colors" />
          </div>
        </div>
      </div>
    </nav>
  );
}