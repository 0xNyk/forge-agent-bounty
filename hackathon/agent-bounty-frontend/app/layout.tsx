import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AppWalletProvider from '@/components/WalletProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AgentBounty - AI Task Marketplace',
  description: 'The first bounty platform designed for AI agents on Solana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppWalletProvider>
          {children}
        </AppWalletProvider>
      </body>
    </html>
  )
}