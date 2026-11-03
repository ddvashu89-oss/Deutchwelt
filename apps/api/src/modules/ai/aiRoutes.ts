import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import { AppError } from '../../middleware/errorHandler.js';
import { env } from '../../config/env.js';
import { generateGeminiText } from '../../services/gemini.js';

const router = Router();

router.get('/status', requireAuth, (_req, res) => {
  res.json({ success: true, configured: Boolean(env.GEMINI_API_KEY) });
});

router.post('/chat', requireAuth, authRateLimiter, async (req, res, next) => {
  try {
    if (!env.GEMINI_API_KEY) return next(new AppError('The AI tutor is not configured yet. Please ask the academy administrator.', 503, 'AI_NOT_CONFIGURED'));
    const rawTurns = Array.isArray(req.body?.messages) ? req.body.messages.slice(-12) : [];
    const messages = rawTurns
      .filter((turn: any) => ['user', 'model'].includes(turn?.role) && typeof turn?.text === 'string')
      .map((turn: any) => ({ role: turn.role as 'user' | 'model', text: turn.text.trim().slice(0, 700) }))
      .filter((turn: any) => turn.text.length > 0);

    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return next(new AppError('Send a German question or sentence to start practicing.', 400));
    }

    const reply = await generateGeminiText(messages, [
      'You are DeutschWelt, a patient German language tutor for learners from CEFR A1 to B2.',
      'Answer primarily in simple German at the learner level, then give a concise English or Hindi explanation when useful.',
      'Correct the learner gently: show the corrected German sentence and explain one key grammar or vocabulary point.',
      'Ask one short follow-up question to keep conversation practice going. Keep replies under 130 words.',
      'Do not claim to be a certified human teacher and do not invent learner grades or progress.'
    ].join(' '));

    return res.json({ success: true, reply });
  } catch (error) {
    next(error);
  }
});

router.post('/speaking-feedback', requireAuth, authRateLimiter, async (req, res, next) => {
  try {
    if (!env.GEMINI_API_KEY) return next(new AppError('AI pronunciation feedback is not configured yet.', 503, 'AI_NOT_CONFIGURED'));
    const transcript = typeof req.body?.transcript === 'string' ? req.body.transcript.trim().slice(0, 1200) : '';
    const target = typeof req.body?.target === 'string' ? req.body.target.trim().slice(0, 500) : '';
    if (!transcript || !target) return next(new AppError('Include your spoken transcript and the target phrase.', 400));

    const raw = await generateGeminiText([{ role: 'user', text: `Target phrase: ${target}\nLearner transcript: ${transcript}` }], [
      'Assess German speaking practice from a target phrase and speech-to-text transcript.',
      'You cannot hear the audio; do not claim to measure actual pronunciation or accent acoustically.',
      'Return JSON only with keys: overallScore (0-100 integer for transcript match and language accuracy),',
      'correctedTranscript (string), strengths (array of short strings), practiceTips (array of short strings),',
      'nextPhrase (string). Be kind and keep feedback suitable for A1-B2 students.'
    ].join(' '), true);

    let feedback: any;
    try { feedback = JSON.parse(raw); } catch { throw new Error('The AI feedback could not be formatted. Please try again.'); }
    const overallScore = Number(feedback.overallScore);
    return res.json({
      success: true,
      analysis: {
        overallScore: Number.isFinite(overallScore) ? Math.max(0, Math.min(100, Math.round(overallScore))) : null,
        targetPhrase: target,
        detectedSpeech: transcript,
        correctedTranscript: String(feedback.correctedTranscript || transcript).slice(0, 1200),
        strengths: Array.isArray(feedback.strengths) ? feedback.strengths.slice(0, 4) : [],
        practiceTips: Array.isArray(feedback.practiceTips) ? feedback.practiceTips.slice(0, 4) : [],
        nextPhrase: String(feedback.nextPhrase || '').slice(0, 300),
        evaluationType: 'transcript-based; acoustic pronunciation was not measured',
        evaluatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
