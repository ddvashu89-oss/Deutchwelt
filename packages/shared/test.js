import assert from 'node:assert';
import {
  registerSchema,
  loginSchema,
  contactEnquirySchema,
  createVocabularySchema,
  GermanLevel,
  UserRole,
  GermanArticle,
  PartOfSpeech,
  LEITNER_INTERVALS_DAYS,
} from './dist/index.js';

console.log('--- Testing @deutschwelt/shared ---');

// 1. Enums test
assert.strictEqual(UserRole.STUDENT, 'STUDENT');
assert.strictEqual(UserRole.TEACHER, 'TEACHER');
assert.strictEqual(UserRole.ADMIN, 'ADMIN');

assert.strictEqual(GermanLevel.A1, 'A1');
assert.strictEqual(GermanLevel.B2, 'B2');
console.log('✓ Roles and German Levels enum verified');

// 2. Leitner Constants
assert.strictEqual(LEITNER_INTERVALS_DAYS[1], 1);
assert.strictEqual(LEITNER_INTERVALS_DAYS[5], 30);
console.log('✓ SRS Leitner intervals verified');

// 3. Register Schema
const validReg = registerSchema.safeParse({
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max@example.com',
  password: 'Password123!',
  currentLevel: GermanLevel.A1,
  learningGoal: 'Prepare for Goethe A1 Exam',
  preferredLanguage: 'en',
  consentToTerms: true,
});
assert.strictEqual(validReg.success, true, 'Valid registration payload should pass');

const invalidReg = registerSchema.safeParse({
  firstName: 'M',
  email: 'invalid-email',
  password: '123',
});
assert.strictEqual(invalidReg.success, false, 'Invalid registration payload should fail');
console.log('✓ Register schema validation verified');

// 4. Login Schema
const validLogin = loginSchema.safeParse({
  email: 'test@deutschwelt.de',
  password: 'SecurePassword123',
});
assert.strictEqual(validLogin.success, true);
console.log('✓ Login schema validation verified');

// 5. Contact Enquiry Schema
const validContact = contactEnquirySchema.safeParse({
  name: 'Anna Schmidt',
  email: 'anna@example.com',
  level: GermanLevel.B1,
  message: 'Hello, I would like to know when the next evening batch begins.',
  consentToContact: true,
});
assert.strictEqual(validContact.success, true);
console.log('✓ Contact enquiry schema validation verified');

// 6. Vocabulary Schema
const validVocab = createVocabularySchema.safeParse({
  german: 'Apfel',
  article: GermanArticle.DER,
  plural: 'Äpfel',
  english: 'apple',
  partOfSpeech: PartOfSpeech.NOUN,
  level: GermanLevel.A1,
  category: 'Food & Drink',
  exampleSentenceDe: 'Ich esse einen roten Apfel.',
  exampleSentenceEn: 'I eat a red apple.',
});
assert.strictEqual(validVocab.success, true);
console.log('✓ Vocabulary schema validation verified');

console.log('All @deutschwelt/shared tests passed cleanly!\n');
