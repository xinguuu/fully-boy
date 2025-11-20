import type { GameTypePlugin } from '../types/plugin.types';

/**
 * Game Type Plugin Registry
 *
 * Centralized registry for managing game type plugins.
 * Provides thread-safe registration and retrieval of plugins.
 */
export class GameTypeRegistry {
  private static instance: GameTypeRegistry;
  private plugins: Map<string, GameTypePlugin> = new Map();

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): GameTypeRegistry {
    if (!GameTypeRegistry.instance) {
      GameTypeRegistry.instance = new GameTypeRegistry();
    }
    return GameTypeRegistry.instance;
  }

  /**
   * Register a new game type plugin
   *
   * @param plugin - Plugin to register
   * @throws Error if plugin type is already registered
   */
  public register(plugin: GameTypePlugin): void {
    if (this.plugins.has(plugin.type)) {
      throw new Error(
        `Plugin with type "${plugin.type}" is already registered. Use unregister() first if you want to replace it.`
      );
    }

    this.plugins.set(plugin.type, plugin);
  }

  /**
   * Unregister a plugin by type
   *
   * @param type - Plugin type to unregister
   * @returns true if plugin was found and removed, false otherwise
   */
  public unregister(type: string): boolean {
    return this.plugins.delete(type);
  }

  /**
   * Get a plugin by type
   *
   * @param type - Plugin type to retrieve
   * @returns Plugin instance or undefined if not found
   */
  public get(type: string): GameTypePlugin | undefined {
    return this.plugins.get(type);
  }

  /**
   * Check if a plugin type is registered
   *
   * @param type - Plugin type to check
   * @returns true if plugin is registered, false otherwise
   */
  public has(type: string): boolean {
    return this.plugins.has(type);
  }

  /**
   * Get all registered plugins
   *
   * @returns Array of all registered plugins
   */
  public getAll(): GameTypePlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get all registered plugin types
   *
   * @returns Array of all registered plugin type identifiers
   */
  public getAllTypes(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Clear all registered plugins (useful for testing)
   */
  public clear(): void {
    this.plugins.clear();
  }

  /**
   * Get number of registered plugins
   */
  public size(): number {
    return this.plugins.size;
  }
}

/**
 * Export singleton instance for convenience
 */
export const gameTypeRegistry = GameTypeRegistry.getInstance();
