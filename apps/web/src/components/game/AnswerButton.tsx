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
  const colorIndex = index % 4;

  const getButtonClass = () => {
    // Correct answer state
    if (isCorrect) {
      return 'bg-success text-white ring-4 ring-success/30 scale-105';
    }
    // Wrong answer state
    if (isWrong) {
      return 'bg-error text-white ring-4 ring-error/30';
    }

    // Selected state - Xingu brand colors
    if (isSelected) {
      if (colorIndex === 0) return 'bg-primary-500 text-white ring-4 ring-offset-2 ring-primary-500/50 scale-105';
      if (colorIndex === 1) return 'bg-secondary-500 text-white ring-4 ring-offset-2 ring-secondary-500/50 scale-105';
      if (colorIndex === 2) return 'bg-accent-500 text-white ring-4 ring-offset-2 ring-accent-500/50 scale-105';
      return 'bg-purple-500 text-white ring-4 ring-offset-2 ring-purple-500/50 scale-105';
    }

    // Default state - Xingu brand colors with hover effects
    if (colorIndex === 0) return 'bg-primary-500 hover:bg-primary-600 text-white hover:scale-105 hover:ring-4 ring-primary-500/30';
    if (colorIndex === 1) return 'bg-secondary-500 hover:bg-secondary-600 text-white hover:scale-105 hover:ring-4 ring-secondary-500/30';
    if (colorIndex === 2) return 'bg-accent-500 hover:bg-accent-600 text-white hover:scale-105 hover:ring-4 ring-accent-500/30';
    return 'bg-purple-500 hover:bg-purple-600 text-white hover:scale-105 hover:ring-4 ring-purple-500/30';
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
