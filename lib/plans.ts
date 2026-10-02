// ONE place that defines what each plan can do. Change limits here, nowhere else.
export type Plan = "free" | "premium";

export type Feature =
  | "notes" | "qna" | "flashcards" | "test" | "visualMap" | "presentation"
  | "studyPlan" | "career" | "grammar" | "paraphrase" | "citations";

export type Rule = {
  label: string;
  premiumOnly: boolean;
  freePerDay: number;      // ignored when premiumOnly
  premiumPerDay: number;   // hidden fair-use cap so "unlimited" cannot burn the OpenAI budget
  maxInputChars: number;   // max length of the user's main input
  maxTokens: number;       // max AI output tokens
};

export const RULES: Record<Feature, Rule> = {
  notes:        { label: "Notes",        premiumOnly: false, freePerDay: 2, premiumPerDay: 100, maxInputChars: 8000, maxTokens: 900 },
  qna:          { label: "Q&A",          premiumOnly: false, freePerDay: 1, premiumPerDay: 100, maxInputChars: 300,  maxTokens: 1800 },
  studyPlan:    { label: "Study Plan",   premiumOnly: false, freePerDay: 2, premiumPerDay: 40,  maxInputChars: 300,  maxTokens: 2500 },
  career:       { label: "Career Help",  premiumOnly: false, freePerDay: 3, premiumPerDay: 40,  maxInputChars: 4000, maxTokens: 1500 },
  flashcards:   { label: "Flashcards",   premiumOnly: true,  freePerDay: 0, premiumPerDay: 60,  maxInputChars: 300,  maxTokens: 900 },
  test:         { label: "Tests",        premiumOnly: true,  freePerDay: 0, premiumPerDay: 30,  maxInputChars: 300,  maxTokens: 2400 },
  visualMap:    { label: "Visual Map",   premiumOnly: true,  freePerDay: 0, premiumPerDay: 40,  maxInputChars: 300,  maxTokens: 1500 },
  presentation: { label: "Presentations",premiumOnly: true,  freePerDay: 0, premiumPerDay: 20,  maxInputChars: 300,  maxTokens: 2500 },
  grammar:      { label: "Grammar",      premiumOnly: true,  freePerDay: 0, premiumPerDay: 100, maxInputChars: 6000, maxTokens: 2000 },
  paraphrase:   { label: "Paraphrase",   premiumOnly: true,  freePerDay: 0, premiumPerDay: 100, maxInputChars: 6000, maxTokens: 1500 },
  citations:    { label: "Citations",    premiumOnly: true,  freePerDay: 0, premiumPerDay: 60,  maxInputChars: 300,  maxTokens: 1200 },
};
