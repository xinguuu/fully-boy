import type { FrontendGameTypePlugin } from './types';

/**
 * Frontend Game Type Plugin Registry
 *
 * Manages frontend plugins for rendering game UI components
 */
export class FrontendGameTypeRegistry {
  private static instance: FrontendGameTypeRegistry;
  private plugins: Map<string, FrontendGameTypePlugin> = new Map();

  private constructor() {}

  public static getInstance(): FrontendGameTypeRegistry {
    if (!FrontendGameTypeRegistry.instance) {
      FrontendGameTypeRegistry.instance = new FrontendGameTypeRegistry();
    }
    return FrontendGameTypeRegistry.instance;
  }

  public register(plugin: FrontendGameTypePlugin): void {
    if (this.plugins.has(plugin.type)) {
      throw new Error(
        `Frontend plugin with type "${plugin.type}" is already registered`
      );
    }
    this.plugins.set(plugin.type, plugin);
  }

  public get(type: string): FrontendGameTypePlugin | undefined {
    return this.plugins.get(type);
  }

  public has(type: string): boolean {
    return this.plugins.has(type);
  }

  public getAll(): FrontendGameTypePlugin[] {
    return Array.from(this.plugins.values());
  }

  public getAllTypes(): string[] {
    return Array.from(this.plugins.keys());
  }

  public clear(): void {
    this.plugins.clear();
  }
}

export const frontendGameTypeRegistry = FrontendGameTypeRegistry.getInstance();
