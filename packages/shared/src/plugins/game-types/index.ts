import { gameTypeRegistry } from '../registry';
import { TrueFalsePlugin } from './true-false.plugin';
import { MultipleChoicePlugin } from './multiple-choice.plugin';
import { ShortAnswerPlugin } from './short-answer.plugin';

// Export plugins
export { TrueFalsePlugin } from './true-false.plugin';
export { MultipleChoicePlugin } from './multiple-choice.plugin';
export { ShortAnswerPlugin } from './short-answer.plugin';

// Export types
export type { TrueFalseQuestionData } from './true-false.plugin';
export type { MultipleChoiceQuestionData } from './multiple-choice.plugin';
export type { ShortAnswerQuestionData } from './short-answer.plugin';

/**
 * Register all built-in game type plugins
 *
 * This function should be called once at application startup
 * to register all default game types.
 */
export function registerBuiltInPlugins(): void {
  const registry = gameTypeRegistry;

  // Register all built-in plugins
  registry.register(new TrueFalsePlugin());
  registry.register(new MultipleChoicePlugin());
  registry.register(new ShortAnswerPlugin());
}

/**
 * Get or create built-in plugins (for testing)
 */
export function getBuiltInPlugins() {
  return {
    trueFalse: new TrueFalsePlugin(),
    multipleChoice: new MultipleChoicePlugin(),
    shortAnswer: new ShortAnswerPlugin(),
  };
}
