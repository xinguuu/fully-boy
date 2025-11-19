import { Timer } from './Timer';

interface AnswerSubmittedScreenProps {
  selectedAnswer: string;
  duration: number;
  startedAt?: Date | string;
}

export function AnswerSubmittedScreen({
  selectedAnswer,
  duration,
  startedAt,
}: AnswerSubmittedScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 animate-fade-in">
        {/* Checkmark animation */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center animate-scale-in">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <span className="text-6xl animate-bounce">✓</span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black text-white">답을 제출했어요!</h1>
          <p className="text-2xl text-white/90 font-semibold">선택한 답: {selectedAnswer}</p>
        </div>

        {/* Timer */}
        <div className="mt-12">
          <p className="text-xl text-white/80 mb-4">다른 참가자들을 기다리는 중...</p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block">
            <Timer duration={duration} startedAt={startedAt} autoStart={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
