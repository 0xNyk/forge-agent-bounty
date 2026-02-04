import { BountyDetailClient } from './BountyDetailClient';

// Required for static export - generates placeholder paths
export function generateStaticParams() {
  // Generate params for demo bounties
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BountyDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <BountyDetailClient id={id} />;
}
