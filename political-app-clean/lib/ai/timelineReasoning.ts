export type TimelineReasoningInput = {
  oldDate?: string | null;
  newDate?: string | null;
};

export type TimelineReasoningResult = {
  yearsBetween: number | null;
  timelineStrength: number;
  timelineCategory:
    | "recent"
    | "medium"
    | "long"
    | "unknown";
  reasoning: string;
};

export function analyzeTimelineReasoning(
  input: TimelineReasoningInput
): TimelineReasoningResult {
  if (!input.oldDate || !input.newDate) {
    return {
      yearsBetween: null,
      timelineStrength: 0,
      timelineCategory: "unknown",
      reasoning: "No timeline information available",
    };
  }

  const oldTime = new Date(input.oldDate).getTime();
  const newTime = new Date(input.newDate).getTime();

  if (Number.isNaN(oldTime) || Number.isNaN(newTime)) {
    return {
      yearsBetween: null,
      timelineStrength: 0,
      timelineCategory: "unknown",
      reasoning: "Invalid timeline dates",
    };
  }

  const diffYears = Math.abs(newTime - oldTime) /
    (1000 * 60 * 60 * 24 * 365);

  if (diffYears < 1) {
    return {
      yearsBetween: Number(diffYears.toFixed(1)),
      timelineStrength: 20,
      timelineCategory: "recent",
      reasoning: "Statements are very close in time",
    };
  }

  if (diffYears < 3) {
    return {
      yearsBetween: Number(diffYears.toFixed(1)),
      timelineStrength: 60,
      timelineCategory: "medium",
      reasoning: "Statements show medium-term evolution",
    };
  }

  return {
    yearsBetween: Number(diffYears.toFixed(1)),
    timelineStrength: 100,
    timelineCategory: "long",
    reasoning: "Statements show long-term political shift",
  };
}