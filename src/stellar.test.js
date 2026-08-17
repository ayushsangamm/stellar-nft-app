import { truncateAddress, shortAddress } from './stellar';

describe('Stellar address truncation helpers', () => {
  const samplePublicKey = 'GA2C5RFPE6GCKMYYLHSI6AWBXPXR6O54VUUBM3CUS5W27EWBXRXGWXY7';

  test('truncateAddress formats address as first 4 chars + ... + last 4 chars', () => {
    expect(truncateAddress(samplePublicKey)).toBe('GA2C...WXY7');
  });

  test('shortAddress formats address as first 4 chars + ... + last 4 chars', () => {
    expect(shortAddress(samplePublicKey)).toBe('GA2C...WXY7');
  });

  test('returns empty string for null, undefined or empty input', () => {
    expect(truncateAddress('')).toBe('');
    expect(truncateAddress(null)).toBe('');
    expect(truncateAddress(undefined)).toBe('');
    expect(shortAddress('')).toBe('');
    expect(shortAddress(null)).toBe('');
    expect(shortAddress(undefined)).toBe('');
  });

  test('returns the original address if 8 characters or shorter', () => {
    expect(truncateAddress('GABC1234')).toBe('GABC1234');
    expect(truncateAddress('GABC')).toBe('GABC');
  });
});
