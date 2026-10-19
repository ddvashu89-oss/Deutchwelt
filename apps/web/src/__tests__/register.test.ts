import { describe, it, expect } from 'vitest';
import React from 'react';
import { RegisterPage } from '../pages/auth/RegisterPage';

describe('RegisterPage Import and Sanity', () => {
  it('imports RegisterPage without throwing', () => {
    expect(RegisterPage).toBeDefined();
    expect(typeof RegisterPage).toBe('function');
  });
});
