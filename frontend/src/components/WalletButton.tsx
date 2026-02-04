'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Wallet, LogOut, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function WalletButton() {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const truncatedAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : '';

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      toast.success('Address copied to clipboard');
    }
  };

  const viewOnExplorer = () => {
    if (publicKey) {
      window.open(
        `https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`,
        '_blank'
      );
    }
  };

  if (!connected) {
    return (
      <Button onClick={() => setVisible(true)} className="gap-2">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wallet className="h-4 w-4" />
          {truncatedAddress}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={copyAddress} className="gap-2 cursor-pointer">
          <Copy className="h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={viewOnExplorer} className="gap-2 cursor-pointer">
          <ExternalLink className="h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => disconnect()} className="gap-2 cursor-pointer text-red-600">
          <LogOut className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
