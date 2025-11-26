# 🎮 Xingu 게임 아이디어 & 구현 가이드

> 기존 인프라를 활용한 재미있는 게임 확장 아이디어

---

## 📊 현재 상태

### 구현 완료된 게임
| 게임 타입 | 플러그인 | 질문 유형 | 미디어 지원 |
|----------|---------|----------|------------|
| OX 퀴즈 | `true-false` | O/X 선택 | ✅ 이미지/오디오/비디오 |
| 4지선다 | `multiple-choice` | 2-6개 선택지 | ✅ 이미지/오디오/비디오 |
| 초성 퀴즈 | `short-answer` | 텍스트 입력 | ✅ 이미지/오디오/비디오 |
| 라이어 게임 | `liar-game` | 파티 게임 | ❌ |

### 활용 가능한 기능
- **이미지 마스킹**: blur, mosaic, spotlight (특정 영역만 보이기/숨기기)
- **이미지 크롭**: 원하는 영역만 표시
- **오디오/비디오 구간 재생**: startTime ~ endTime 설정
- **실시간 점수 계산**: 빠른 정답 = 높은 점수 (카훗 스타일)
- **WebSocket 실시간 통신**: 참가자 간 동기화

---

## 🌟 추천 게임 아이디어

### 난이도 범례
- ⭐ 쉬움: 기존 플러그인 활용, 콘텐츠만 제작
- ⭐⭐ 중간: 새 플러그인 필요, 비교적 단순한 로직
- ⭐⭐⭐ 어려움: 복잡한 세션 관리, 새 UI 컴포넌트 필요

---

## 1. 밸런스 게임 ⭐⭐

### 개요
> "삼겹살 vs 치킨, 당신의 선택은?"

2가지 선택지 중 하나를 고르고, 다른 참가자들의 선택 비율을 확인하는 게임.

### 게임 플로우
```
1. 질문 표시: "연봉 1억 백수 vs 연봉 5천만 워커홀릭"
2. 참가자 투표 (10-30초)
3. 결과 표시: "A: 65% vs B: 35%"
4. 소수파 탈락 또는 다음 질문
```

### 예시 질문들
```
- 평생 여름 vs 평생 겨울
- 투명인간 능력 vs 순간이동 능력
- 100억 받고 달 1년 살기 vs 지구에서 평범하게 살기
- 모든 언어 마스터 vs 모든 악기 마스터
- 과거로 10년 vs 미래로 10년
```

### 구현 방식

#### A. 간단 버전 (기존 multiple-choice 활용)
```typescript
// 별도 플러그인 없이 4지선다로 구현 가능
const questionData = {
  type: 'multiple-choice',
  options: ['삼겹살', '치킨'],
  correctAnswer: null,  // 정답 없음 (투표형)
  showResults: true,    // 결과 비율 표시
};
```
- **장점**: 빠른 구현
- **단점**: 정답 없는 투표형 처리 로직 추가 필요

#### B. 전용 플러그인 (추천)
```typescript
// packages/shared/src/plugins/game-types/balance-game.plugin.ts

export interface BalanceQuestionData extends QuestionData {
  type: 'balance-game';
  optionA: string;
  optionB: string;
  imageA?: string;  // 선택지 A 이미지
  imageB?: string;  // 선택지 B 이미지
  eliminateMinority?: boolean;  // 소수파 탈락 모드
}

export class BalanceGamePlugin extends BaseGameTypePlugin {
  public readonly type = 'balance-game';
  public readonly name = '밸런스 게임';
  public readonly category = PluginCategory.QUIZ;

  // 정답 체크 없음 (투표형)
  public checkAnswer(): boolean {
    return true;  // 모든 답변 유효
  }

  // 점수 계산: 다수파에 속하면 점수
  public calculateScore(options: ScoreCalculationOptions): ScoreResult {
    const { isCorrect, responseTimeMs, questionDuration } = options;
    // isCorrect = 다수파 여부 (ws-service에서 계산 후 전달)

    if (!isCorrect) {
      return { points: 0, isCorrect: false, responseTimeMs, breakdown: {...} };
    }

    // 다수파: 기본 점수 + 빠른 응답 보너스
    return this.calculateBaseScore(options);
  }
}
```

#### 프론트엔드 UI
```tsx
// 밸런스 게임 전용 컴포넌트
function BalanceGameQuestion({ optionA, optionB, imageA, imageB }) {
  return (
    <div className="flex gap-4">
      <BalanceOption
        label={optionA}
        image={imageA}
        side="left"
        color="bg-red-500"
      />
      <div className="text-4xl font-bold">VS</div>
      <BalanceOption
        label={optionB}
        image={imageB}
        side="right"
        color="bg-blue-500"
      />
    </div>
  );
}
```

### 예상 작업량
- 플러그인: 50줄
- 프론트엔드 컴포넌트: 100줄
- **총 예상 시간: 2-3시간**

---

## 2. 아이돌/연예인 얼굴 맞추기 ⭐

### 개요
> 점점 공개되는 얼굴을 보고 누구인지 맞추기

이미지 마스킹 기능을 활용해 얼굴을 점진적으로 공개하는 퀴즈.

### 게임 플로우
```
Round 1: 5% 공개 (눈만) → 맞추면 1500점
Round 2: 30% 공개 (얼굴 일부) → 맞추면 1000점
Round 3: 70% 공개 (대부분) → 맞추면 500점
Round 4: 100% 공개 → 맞추면 200점
```

### 마스킹 활용 방식

#### Spotlight 마스크 (추천)
```typescript
const question = {
  content: "이 아이돌은 누구일까요?",
  imageUrl: "/images/idol.jpg",
  mediaSettings: {
    image: {
      maskType: 'spotlight',  // 지정 영역만 밝게
      maskIntensity: 90,      // 90% 어둡게
      cropArea: {
        x: 40,   // 눈 부분만
        y: 30,
        width: 20,
        height: 10,
      }
    }
  },
  data: {
    type: 'multiple-choice',
    options: ['아이유', '태연', '제니', '카리나'],
    correctAnswer: '아이유',
  }
};
```

#### Blur 마스크
```typescript
mediaSettings: {
  image: {
    maskType: 'blur',
    maskIntensity: 80,  // 80% 블러
    cropArea: { /* 선명하게 보일 영역 */ }
  }
}
```

### 콘텐츠 아이디어
```
- K-pop 아이돌 (BTS, 블랙핑크, 뉴진스 등)
- 배우 (송강호, 전지현, 이정재 등)
- 유튜버/스트리머
- 스포츠 스타
- 역사 인물
```

### 구현 방식
**새 플러그인 불필요!** 기존 `multiple-choice` + `mediaSettings` 조합으로 구현 가능.

게임 편집 UI에서:
1. 같은 이미지로 4개 질문 생성
2. 각 질문마다 다른 `cropArea`와 `maskIntensity` 설정
3. 점수는 질문 순서에 따라 자동 감소 (또는 수동 설정)

### 예상 작업량
- 플러그인: 불필요
- 편집 UI 개선: 50줄 (프리셋 버튼 추가)
- **총 예상 시간: 1시간** (콘텐츠 제작 별도)

---

## 3. 노래 맞추기 (1초/3초/5초) ⭐

### 개요
> 짧은 오디오 클립을 듣고 노래 제목 맞추기

### 게임 플로우
```
Round 1: 1초만 재생 → 맞추면 1500점
Round 2: 3초 재생 → 맞추면 1000점
Round 3: 전체 재생 → 맞추면 500점
```

### 오디오 구간 설정
```typescript
const question = {
  content: "이 노래는?",
  audioUrl: "/audio/song.mp3",
  mediaSettings: {
    audio: {
      startTime: 45,   // 45초부터
      endTime: 46,     // 46초까지 (1초)
    }
  },
  data: {
    type: 'multiple-choice',
    options: ['Ditto', 'OMG', 'Super Shy', 'ETA'],
    correctAnswer: 'Ditto',
  }
};
```

### 콘텐츠 아이디어
```
- K-pop 히트곡 (하이라이트 구간)
- 드라마 OST
- 광고 CM송
- 게임 BGM
- 클래식 명곡
- 효과음 (카톡 알림, 지하철 안내 등)
```

### 구현 방식
**새 플러그인 불필요!** 기존 시스템 그대로 활용.

### 예상 작업량
- **총 예상 시간: 0시간** (콘텐츠 제작만 필요)

---

## 4. 영상 맞추기 ⭐

### 개요
> 짧은 영상 클립을 보고 어떤 콘텐츠인지 맞추기

### 게임 플로우
```
1. 3-5초 영상 클립 재생
2. 4지선다 중 정답 선택
3. 빠른 정답 = 높은 점수
```

### 비디오 구간 설정
```typescript
const question = {
  content: "이 장면은 어떤 드라마?",
  videoUrl: "/video/scene.mp4",
  mediaSettings: {
    video: {
      startTime: 120,  // 2분부터
      endTime: 125,    // 2분 5초까지
    }
  },
  data: {
    type: 'multiple-choice',
    options: ['오징어 게임', '더 글로리', '이상한 변호사 우영우', '재벌집 막내아들'],
    correctAnswer: '오징어 게임',
  }
};
```

### 콘텐츠 아이디어
```
- K-드라마 명장면
- 예능 레전드 장면 (무한도전, 런닝맨 등)
- 영화 명장면
- 뮤직비디오
- 유튜브 밈 영상
```

### 구현 방식
**새 플러그인 불필요!**

### 예상 작업량
- **총 예상 시간: 0시간** (콘텐츠 제작만 필요)

---

## 5. 순서 맞추기 (Ranking Quiz) ⭐⭐

### 개요
> 주어진 항목들을 올바른 순서로 배열하기

### 게임 플로우
```
질문: "BTS 앨범을 발매 순서대로 나열하세요"
항목: [Proof, BE, Wings, Dark & Wild]
정답: [Dark & Wild, Wings, BE, Proof]
```

### 예시 질문들
```
- 역대 대통령 취임 순서
- 아이폰 출시 순서
- 월드컵 개최국 순서
- 올림픽 개최 순서
- K-pop 그룹 데뷔 순서
- 역사적 사건 발생 순서
```

### 구현 방식

#### 플러그인
```typescript
// packages/shared/src/plugins/game-types/ranking-quiz.plugin.ts

export interface RankingQuestionData extends QuestionData {
  type: 'ranking-quiz';
  items: string[];           // 섞인 항목들
  correctOrder: string[];    // 정답 순서
  imageUrls?: string[];      // 각 항목 이미지 (선택)
  partialScoring?: boolean;  // 부분 점수 허용
}

export class RankingQuizPlugin extends BaseGameTypePlugin {
  public readonly type = 'ranking-quiz';
  public readonly name = '순서 맞추기';
  public readonly category = PluginCategory.QUIZ;

  public checkAnswer(
    questionData: QuestionData,
    userAnswer: unknown
  ): boolean {
    if (!Array.isArray(userAnswer)) return false;
    const data = questionData as RankingQuestionData;

    // 완전 일치 체크
    return JSON.stringify(userAnswer) === JSON.stringify(data.correctOrder);
  }

  // 부분 점수 계산 (선택적)
  public calculatePartialScore(
    userOrder: string[],
    correctOrder: string[]
  ): number {
    let correctPositions = 0;
    for (let i = 0; i < userOrder.length; i++) {
      if (userOrder[i] === correctOrder[i]) {
        correctPositions++;
      }
    }
    return correctPositions / correctOrder.length;  // 0~1 비율
  }
}
```

#### 프론트엔드 (드래그 앤 드롭)
```tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function RankingQuestion({ items, onSubmit }) {
  const [orderedItems, setOrderedItems] = useState(shuffle(items));

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedItems} strategy={verticalListSortingStrategy}>
        {orderedItems.map((item, index) => (
          <SortableItem key={item} id={item} index={index + 1} />
        ))}
      </SortableContext>
      <Button onClick={() => onSubmit(orderedItems)}>제출</Button>
    </DndContext>
  );
}
```

### 필요 패키지
```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 예상 작업량
- 플러그인: 80줄
- 프론트엔드 컴포넌트: 150줄
- **총 예상 시간: 4-5시간**

---

## 6. 매칭 게임 ⭐⭐

### 개요
> 왼쪽과 오른쪽 항목을 올바르게 연결하기

### 게임 플로우
```
왼쪽: [BTS, 블랙핑크, 뉴진스, 에스파]
오른쪽: [하이브, YG, 어도어, SM]

연결: BTS ↔ 하이브, 블랙핑크 ↔ YG, ...
```

### 예시 질문들
```
- 아이돌 ↔ 소속사
- 드라마 ↔ 주연 배우
- 국가 ↔ 수도
- 유행어 ↔ 의미
- 브랜드 ↔ 로고
- 노래 ↔ 가수
```

### 구현 방식

#### 플러그인
```typescript
export interface MatchingQuestionData extends QuestionData {
  type: 'matching-quiz';
  leftItems: string[];
  rightItems: string[];  // 섞여서 표시됨
  correctPairs: [string, string][];  // [left, right] 쌍
  imageLeft?: string[];   // 왼쪽 항목 이미지
  imageRight?: string[];  // 오른쪽 항목 이미지
}

export class MatchingQuizPlugin extends BaseGameTypePlugin {
  public readonly type = 'matching-quiz';
  public readonly name = '매칭 게임';

  public checkAnswer(
    questionData: QuestionData,
    userAnswer: unknown
  ): boolean {
    const data = questionData as MatchingQuestionData;
    const userPairs = userAnswer as [string, string][];

    // 모든 쌍이 일치하는지 확인
    const correctSet = new Set(data.correctPairs.map(p => `${p[0]}:${p[1]}`));
    const userSet = new Set(userPairs.map(p => `${p[0]}:${p[1]}`));

    return correctSet.size === userSet.size &&
           [...correctSet].every(p => userSet.has(p));
  }
}
```

#### 프론트엔드 (선 연결 UI)
```tsx
function MatchingQuestion({ leftItems, rightItems, onSubmit }) {
  const [connections, setConnections] = useState<Map<string, string>>(new Map());
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const handleLeftClick = (item: string) => {
    setSelectedLeft(item);
  };

  const handleRightClick = (item: string) => {
    if (selectedLeft) {
      setConnections(prev => new Map(prev).set(selectedLeft, item));
      setSelectedLeft(null);
    }
  };

  return (
    <div className="flex justify-between">
      <div className="flex flex-col gap-2">
        {leftItems.map(item => (
          <MatchItem
            key={item}
            label={item}
            selected={selectedLeft === item}
            connected={connections.has(item)}
            onClick={() => handleLeftClick(item)}
          />
        ))}
      </div>

      <ConnectionLines connections={connections} />

      <div className="flex flex-col gap-2">
        {rightItems.map(item => (
          <MatchItem
            key={item}
            label={item}
            connected={[...connections.values()].includes(item)}
            onClick={() => handleRightClick(item)}
          />
        ))}
      </div>
    </div>
  );
}
```

### 예상 작업량
- 플러그인: 80줄
- 프론트엔드 컴포넌트: 200줄
- **총 예상 시간: 5-6시간**

---

## 7. 빈칸 채우기 (고급 주관식) ⭐⭐

### 개요
> 문장의 빈칸에 알맞은 단어 입력하기

### 게임 플로우
```
질문: "BTS의 데뷔곡은 '____'이다"
정답: "No More Dream" 또는 "노모어드림"
```

### 개선된 주관식 플러그인
```typescript
export interface FillBlankQuestionData extends QuestionData {
  type: 'fill-blank';
  sentence: string;           // "BTS의 데뷔곡은 '____'이다"
  blankPosition: number;      // 빈칸 위치 (문자 인덱스)
  correctAnswers: string[];   // 허용되는 정답들
  hints?: string[];           // 힌트 (시간 지나면 공개)
  caseSensitive?: boolean;
  allowTypos?: number;        // 허용 오타 수 (Levenshtein distance)
}
```

### 유사도 매칭 (오타 허용)
```typescript
import { distance } from 'fastest-levenshtein';

public checkAnswer(questionData: QuestionData, userAnswer: unknown): boolean {
  const data = questionData as FillBlankQuestionData;
  const answer = String(userAnswer).trim().toLowerCase();

  for (const correct of data.correctAnswers) {
    const correctLower = correct.toLowerCase();

    // 정확히 일치
    if (answer === correctLower) return true;

    // 오타 허용
    if (data.allowTypos && distance(answer, correctLower) <= data.allowTypos) {
      return true;
    }
  }

  return false;
}
```

### 예상 작업량
- 플러그인: 60줄
- **총 예상 시간: 2시간**

---

## 8. 스피드 퀴즈 (설명 게임) ⭐⭐⭐

### 개요
> 한 사람이 단어를 설명하고, 다른 사람들이 맞추기

### 게임 플로우
```
1. 설명자 선정 (랜덤 또는 순서대로)
2. 설명자에게만 단어 표시: "김치찌개"
3. 설명자가 음성/텍스트로 설명 (단어 직접 언급 금지)
4. 다른 참가자들이 실시간으로 정답 입력
5. 먼저 맞춘 사람 + 설명자 점수 획득
6. 제한 시간 내 최대한 많은 단어 맞추기
```

### 세션 상태
```typescript
interface SpeedQuizSessionData {
  currentExplainer: string;     // 현재 설명자 ID
  currentWord: string;          // 현재 단어
  wordIndex: number;            // 현재 단어 인덱스
  words: string[];              // 전체 단어 목록
  scores: Record<string, number>;
  roundTimeLimit: number;       // 라운드 제한 시간
  skipCount: number;            // 남은 패스 횟수
}

type SpeedQuizPhase = 'waiting' | 'explaining' | 'result' | 'next-explainer';
```

### 액션 타입
```typescript
type SpeedQuizAction =
  | { type: 'start-round' }
  | { type: 'submit-guess'; guess: string }
  | { type: 'skip-word' }
  | { type: 'correct' }  // 설명자가 정답 확인
  | { type: 'end-round' };
```

### 구현 복잡도
- 실시간 텍스트 입력 처리
- 설명자/참가자 분리된 화면
- 타이머 동기화
- 패스 기능

### 예상 작업량
- 플러그인: 200줄
- 프론트엔드: 400줄
- WebSocket 핸들러: 150줄
- **총 예상 시간: 8-10시간**

---

## 9. 그림 퀴즈 (캐치마인드) ⭐⭐⭐

### 개요
> 한 사람이 그림을 그리고, 다른 사람들이 맞추기

### 필요 기능
- 실시간 캔버스 드로잉 (Socket.io로 좌표 전송)
- 그리기 도구 (펜, 지우개, 색상, 굵기)
- 추측 입력
- 힌트 시스템

### 기술 스택
```typescript
// Canvas 데이터 전송
interface DrawEvent {
  type: 'start' | 'move' | 'end' | 'clear';
  x: number;
  y: number;
  color: string;
  size: number;
}

// Socket 이벤트
socket.emit('draw', drawEvent);
socket.on('draw', (event) => renderToCanvas(event));
```

### 예상 작업량
- 플러그인: 150줄
- 캔버스 컴포넌트: 300줄
- WebSocket 핸들러: 200줄
- **총 예상 시간: 12-15시간**

---

## 10. 몸으로 말해요 ⭐⭐⭐

### 개요
> 화면에 나온 단어를 몸으로 표현, 다른 사람이 맞추기

### 게임 플로우
```
1. 출제자 선정
2. 출제자 화면에 단어 표시 (다른 사람 안 보임)
3. 출제자가 몸으로 표현 (실제 대면 또는 화상)
4. 맞추는 사람이 정답 입력
5. 점수 획득
```

### 특징
- 모바일 필수 (출제자 화면)
- MC 모드와 잘 어울림
- 대면 파티에 적합

### 구현
스피드 퀴즈와 유사하지만 더 단순 (설명 없이 화면 표시만)

### 예상 작업량
- 플러그인: 100줄
- 프론트엔드: 200줄
- **총 예상 시간: 4-5시간**

---

## 11. 공통점 찾기 ⭐⭐

### 개요
> 여러 이미지/단어의 공통점 맞추기

### 게임 플로우
```
이미지: [김치, 불고기, 비빔밥, 삼겹살]
질문: "이것들의 공통점은?"
정답: "한국 음식" 또는 "Korean food"
```

### 구현
기존 `short-answer` 플러그인에 다중 이미지 표시 UI 추가

### 예상 작업량
- UI 컴포넌트: 80줄
- **총 예상 시간: 2시간**

---

## 12. 업다운 게임 ⭐⭐

### 개요
> 숫자를 맞추는 게임, "업" 또는 "다운" 힌트 제공

### 게임 플로우
```
질문: "서울의 인구는 몇 명일까요? (만 단위)"
참가자: "500"
힌트: "UP! ⬆️"
참가자: "800"
힌트: "DOWN! ⬇️"
참가자: "650"
정답!
```

### 세션 상태
```typescript
interface UpDownSessionData {
  targetNumber: number;
  minRange: number;
  maxRange: number;
  guesses: { playerId: string; guess: number; hint: 'up' | 'down' | 'correct' }[];
  currentTurn: string;
}
```

### 예상 작업량
- 플러그인: 100줄
- 프론트엔드: 150줄
- **총 예상 시간: 4시간**

---

## 📊 우선순위 추천

### 즉시 가능 (콘텐츠만 제작)
| 순위 | 게임 | 이유 |
|------|------|------|
| 1 | 노래 맞추기 | 플러그인 불필요, 인기 보장 |
| 2 | 영상 맞추기 | 플러그인 불필요, 트렌디 |
| 3 | 얼굴 맞추기 | 마스킹 기능 활용 |

### 단기 개발 (1-2일)
| 순위 | 게임 | 예상 시간 | ROI |
|------|------|----------|-----|
| 1 | 밸런스 게임 | 2-3시간 | ⭐⭐⭐⭐⭐ |
| 2 | 빈칸 채우기 | 2시간 | ⭐⭐⭐⭐ |
| 3 | 공통점 찾기 | 2시간 | ⭐⭐⭐ |

### 중기 개발 (3-5일)
| 순위 | 게임 | 예상 시간 | ROI |
|------|------|----------|-----|
| 1 | 순서 맞추기 | 4-5시간 | ⭐⭐⭐⭐ |
| 2 | 매칭 게임 | 5-6시간 | ⭐⭐⭐⭐ |
| 3 | 몸으로 말해요 | 4-5시간 | ⭐⭐⭐ |

### 장기 개발 (1주+)
| 순위 | 게임 | 예상 시간 | ROI |
|------|------|----------|-----|
| 1 | 스피드 퀴즈 | 8-10시간 | ⭐⭐⭐⭐⭐ |
| 2 | 그림 퀴즈 | 12-15시간 | ⭐⭐⭐⭐ |

---

## 🛠️ 구현 시 공통 작업

### 새 플러그인 추가 체크리스트
```
□ packages/shared/src/plugins/game-types/[name].plugin.ts 생성
□ packages/shared/src/plugins/game-types/index.ts에 export 추가
□ packages/shared/src/types/game.types.ts GameType enum 추가
□ packages/database/prisma/schema.prisma GameType enum 추가
□ prisma migrate 실행
□ 프론트엔드 컴포넌트 생성
□ 테스트 작성
□ 문서 업데이트
```

### 테스트 템플릿
```typescript
describe('NewGamePlugin', () => {
  let plugin: NewGamePlugin;

  beforeEach(() => {
    plugin = new NewGamePlugin();
  });

  describe('checkAnswer', () => {
    it('should return true for correct answer', () => {
      // ...
    });

    it('should return false for incorrect answer', () => {
      // ...
    });
  });

  describe('validateQuestionData', () => {
    it('should validate correct data', () => {
      // ...
    });
  });
});
```

---

## 💡 콘텐츠 아이디어

### K-pop
- 아이돌 얼굴 맞추기
- 노래 1초 듣고 맞추기
- 뮤비 장면 맞추기
- 앨범 발매 순서
- 아이돌-그룹 매칭

### K-드라마
- 명대사 누가 말했나
- 장면 어떤 드라마
- 드라마-배우 매칭
- OST 맞추기

### 예능
- 레전드 장면
- 유행어 퀴즈
- 멤버 맞추기

### 트렌드/밈
- 밈 의미 맞추기
- 유행어 빈칸 채우기
- SNS 트렌드 퀴즈

### 일반 상식
- 역사 순서
- 지리 퀴즈
- 과학 상식

---

## 📝 결론

**즉시 시작 추천:**
1. 기존 플러그인으로 콘텐츠 제작 (노래/영상/얼굴 맞추기)
2. 밸런스 게임 플러그인 개발 (2-3시간)
3. 순서 맞추기 개발 (4-5시간)

이 순서로 진행하면 최소 노력으로 최대 게임 다양성을 확보할 수 있습니다!