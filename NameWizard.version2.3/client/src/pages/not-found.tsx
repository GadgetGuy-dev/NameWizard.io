import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-muted p-6">
            <FileQuestion className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-4 text-muted-foreground">
          We couldn't find the page you were looking for. The page may have been moved or deleted.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}