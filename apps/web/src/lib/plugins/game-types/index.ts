import { frontendGameTypeRegistry } from '../registry';
import { TrueFalseFrontendPlugin } from './TrueFalsePlugin';
import { MultipleChoiceFrontendPlugin } from './MultipleChoicePlugin';
import { ShortAnswerFrontendPlugin } from './ShortAnswerPlugin';
import { LiarGameFrontendPlugin } from './LiarGamePlugin';

// Export plugins
export { TrueFalseFrontendPlugin } from './TrueFalsePlugin';
export { MultipleChoiceFrontendPlugin } from './MultipleChoicePlugin';
export { ShortAnswerFrontendPlugin } from './ShortAnswerPlugin';
export { LiarGameFrontendPlugin } from './LiarGamePlugin';

/**
 * Register all built-in frontend game type plugins
 *
 * This function should be called once at application startup
 */
export function registerFrontendPlugins(): void {
  const registry = frontendGameTypeRegistry;

  // Register all built-in frontend plugins
  registry.register(new TrueFalseFrontendPlugin());
  registry.register(new MultipleChoiceFrontendPlugin());
  registry.register(new ShortAnswerFrontendPlugin());
  registry.register(new LiarGameFrontendPlugin());

  console.log('✅ Frontend game type plugins registered:', registry.getAllTypes());
}
