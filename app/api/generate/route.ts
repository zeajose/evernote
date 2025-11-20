import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { context } = await req.json();

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: `You are an AI writing assistant that provides natural text completions.
Your goal is to continue the user's writing seamlessly with 3-4 words that flow naturally.

Constraints:
- Provide exactly 3-4 words
- Continue the thought naturally
- Match the writing style and tone
- Return only the completion text, no extra formatting`,
    prompt: `Continue this text naturally with 3-4 words: ${context}`,
  });

  return result.toTextStreamResponse();
}
