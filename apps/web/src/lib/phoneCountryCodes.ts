export const countryCallingCodes = [
  { country: 'India', code: '+91' },
  { country: 'Germany', code: '+49' },
  { country: 'United States', code: '+1' },
  { country: 'United Kingdom', code: '+44' },
  { country: 'Nepal', code: '+977' },
  { country: 'Bangladesh', code: '+880' },
  { country: 'United Arab Emirates', code: '+971' }
];

export function splitPhoneCountryCode(value?: string | null) {
  const phone = value?.trim() || '';
  if (!phone.startsWith('+')) return { countryCode: '+91', phone };

  const matchingCode = [...countryCallingCodes]
    .sort((a, b) => b.code.length - a.code.length)
    .find(({ code }) => phone === code || phone.startsWith(`${code} `) || phone.startsWith(`${code}-`) || (phone.startsWith(code) && phone.length > code.length));

  if (matchingCode) {
    return { countryCode: matchingCode.code, phone: phone.slice(matchingCode.code.length).trim().replace(/^[-\s]+/, '') };
  }

  const unknownCode = phone.match(/^(\+\d{1,4})[\s-]*(.*)$/);
  if (unknownCode) return { countryCode: unknownCode[1], phone: unknownCode[2].trim() };

  return { countryCode: '+91', phone };
}
