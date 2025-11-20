'use client';

import { frontendGameTypeRegistry } from './registry';

/**
 * Hook to get the frontend plugin registry
 *
 * Note: Plugins must be registered globally via PluginProvider before using this hook.
 * This ensures consistent plugin availability across the application.
 *
 * @returns Frontend game type registry instance
 */
export function usePluginRegistry() {
  return frontendGameTypeRegistry;
}
