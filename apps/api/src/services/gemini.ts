import { env } from '../config/env.js';

type TutorTurn = { role: 'user' | 'model'; text: string };

export async function generateGeminiText(
  turns: TutorTurn[],
  systemInstruction: string,
  jsonResponse = false
): Promise<string> {
  if (!env.GEMINI_API_KEY) throw new Error('AI tutor is not configured. Add GEMINI_API_KEY to the API environment.');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: turns.map(turn => ({ role: turn.role, parts: [{ text: turn.text }] })),
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 700,
        ...(jsonResponse ? { responseMimeType: 'application/json' } : {})
      }
    }),
    signal: AbortSignal.timeout(25000)
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('[AI tutor] Gemini request failed:', response.status, detail.slice(0, 400));
    throw new Error('AI practice is temporarily unavailable. Please try again shortly.');
  }

  const payload = await response.json() as any;
  const text = payload?.candidates?.[0]?.content?.parts?.map((part: any) => part.text || '').join('').trim();
  if (!text) throw new Error('The AI tutor returned an empty response. Please try again.');
  return text;
}
