'use client';

import { useCurrentUser } from '@/lib/hooks';
import { Header } from '@/components/layout/header';

export default function DashboardPage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Welcome, {user.name || user.email}!</h1>
        <p className="mt-4 text-muted-foreground">
          This is your dashboard. Start creating games or browse templates.
        </p>
      </main>
    </div>
  );
}
