import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-6">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <div className="text-center">
        <h1 className="text-2xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground mt-2">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
