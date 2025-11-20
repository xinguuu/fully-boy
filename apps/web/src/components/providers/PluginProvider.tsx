'use client';

import { useEffect, useState } from 'react';
import { registerFrontendPlugins } from '@/lib/plugins/game-types';

/**
 * Plugin Provider Component
 *
 * Ensures frontend game type plugins are registered once globally
 * before any components try to use them.
 *
 * This prevents race conditions and ensures consistent plugin availability.
 */
export function PluginProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      registerFrontendPlugins();
      setIsReady(true);
    } catch (error) {
      console.error('Failed to register frontend plugins:', error);
      // Still set ready to prevent infinite loading, but log error
      setIsReady(true);
    }
  }, []);

  // Prevent rendering until plugins are registered
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
}
