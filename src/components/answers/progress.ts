/** localStorage keys for answer-writing progress (the future-DB swap point). */
export const ANSWER_TEXT_PREFIX = "answer:";
export const ANSWERS_ATTEMPTED_KEY = "answers-attempted";

export const answerKey = (questionId: string) => `${ANSWER_TEXT_PREFIX}${questionId}`;
