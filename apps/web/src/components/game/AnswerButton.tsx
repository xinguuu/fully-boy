import { KAHOOT_COLORS } from '@/types/game.types';

interface AnswerButtonProps {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean;
  isWrong?: boolean;
  isDisabled: boolean;
  showLabel?: boolean; // Show A, B, C, D labels
  onClick: () => void;
}

export function AnswerButton({
  option,
  index,
  isSelected,
  isCorrect,
  isWrong,
  isDisabled,
  showLabel = true,
  onClick,
}: AnswerButtonProps) {
  const color = KAHOOT_COLORS[index % KAHOOT_COLORS.length];

  const getButtonClass = () => {
    // Correct answer state
    if (isCorrect) {
      return 'bg-success text-white ring-4 ring-success/30 scale-105';
    }
    // Wrong answer state
    if (isWrong) {
      return 'bg-error text-white ring-4 ring-error/30';
    }
    // Selected state
    if (isSelected) {
      return `${color.bg} text-white ring-4 ring-offset-2 ${color.bg.replace('bg-', 'ring-')}/50 scale-105`;
    }
    // Default state
    return `${color.bg} ${color.hover} text-white hover:scale-105 hover:ring-4 ${color.bg.replace('bg-', 'ring-')}/30`;
  };

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative p-6 rounded-2xl font-bold text-lg
        transition-all duration-300 ease-out
        ${getButtonClass()}
        ${isDisabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer shadow-lg hover:shadow-xl'}
      `}
    >
      <div className="flex items-center gap-3">
        {showLabel && (
          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm text-white">
            {String.fromCharCode(65 + index)}
          </span>
        )}
        <span className={`flex-1 font-bold ${showLabel ? 'text-left text-lg' : 'text-center text-4xl'} text-white`}>
          {option}
        </span>
        {isCorrect && <span className="text-2xl text-white">✓</span>}
        {isWrong && <span className="text-2xl text-white">✗</span>}
      </div>
    </button>
  );
}
