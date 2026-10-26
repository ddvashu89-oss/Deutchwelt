import { Request, Response, NextFunction } from 'express';

/**
 * Deep sanitization function to neutralize XSS, script injection,
 * malicious HTML attributes, and prototype pollution attempts.
 */
function sanitizeString(val: string): string {
  if (typeof val !== 'string') return val;

  return val
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove full script blocks
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove inline scripts and dangerous pseudo-protocols
    .replace(/javascript\s*:/gi, 'blocked-scheme:')
    .replace(/data\s*:\s*text\/html/gi, 'blocked-data:')
    .replace(/vbscript\s*:/gi, 'blocked-scheme:')
    // Neutralize inline event handlers like onload=, onerror=, onclick=
    .replace(/\s+on\w+\s*=/gi, ' data-blocked-handler=');
}

function sanitizeValue(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (typeof value === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      // Prevent prototype pollution attacks
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      clean[key] = sanitizeValue(val);
    }
    return clean;
  }

  return value;
}

/**
 * Express middleware that recursively sanitizes req.body, req.query, and req.params
 */
export function sanitizeInputs(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeValue(req.body);
    }

    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeValue(req.query);
    }

    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeValue(req.params);
    }

    next();
  } catch (err) {
    console.error('[Sanitization Error]', err);
    next(err);
  }
}
