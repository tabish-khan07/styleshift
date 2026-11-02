export type StyleId =
  | 'formal'
  | 'casual'
  | 'gen-z'
  | 'shakespearean'
  | 'linkedin'
  | 'funny'
  | 'hinglish'
  | 'storyteller'
  | 'concise'
  | 'my-voice';

export type IntensityLevel = 'subtle' | 'moderate' | 'heavy';

export interface FewShotExample {
  input: string;
  output: string;
}

export interface StyleDefinition {
  id: StyleId;
  label: string;
  emoji: string;
  description: string;
  systemPrompt: string;
  fewShotExamples: [FewShotExample, FewShotExample];
}

export interface VoiceProfile {
  avgSentenceLength: string;
  vocabularyLevel: string;
  tone: string;
  formality: string;
  favoritePhrases: string[];
  punctuationHabits: string;
  doRules: string[];
  dontRules: string[];
  summary: string;
  centroid?: number[];
}

export interface RewriteResultItem {
  styleId: StyleId;
  text: string;
  error?: string;
}

export interface RewriteResponse {
  results: RewriteResultItem[];
}

export interface ScoreResultItem {
  styleId: StyleId;
  meaning: number; // 0 - 100
  style: number; // 0 - 100
  reason: string;
  voiceMatch?: number; // 0 - 100
}

export interface ScoreResponse {
  scores: ScoreResultItem[];
}

export interface ProfileResponse {
  profile: VoiceProfile;
  summary: string;
  centroid: number[];
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  inputText: string;
  selectedStyles: StyleId[];
  intensity: IntensityLevel;
  results: RewriteResultItem[];
  scores?: Record<string, ScoreResultItem>;
}
