export type CourseFeedback = { rating: number; helpful: string; improvement: string };

export function feedbackInput(value: unknown): CourseFeedback {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid feedback');
  const input = value as Record<string, unknown>;
  if (!Number.isInteger(input.rating) || Number(input.rating) < 1 || Number(input.rating) > 5) {
    throw new Error('Choose a rating from 1 to 5.');
  }
  const text = (key: string) => {
    const field = input[key];
    if (typeof field !== 'string' || field.length > 2000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(field)) {
      throw new Error('Keep each answer within 2,000 characters.');
    }
    return field.trim();
  };
  return { rating: Number(input.rating), helpful: text('helpful'), improvement: text('improvement') };
}
