const parseDurationToSeconds = require('../utils/parseDuration');

describe('parseDurationToSeconds', () => {
  it('parses minutes', () => {
    expect(parseDurationToSeconds('15m')).toBe(15 * 60);
  });

  it('parses days', () => {
    expect(parseDurationToSeconds('7d')).toBe(7 * 60 * 60 * 24);
  });

  it('parses hours and seconds', () => {
    expect(parseDurationToSeconds('1h')).toBe(3600);
    expect(parseDurationToSeconds('30s')).toBe(30);
  });

  it('throws on an unsupported format', () => {
    expect(() => parseDurationToSeconds('7 days')).toThrow();
  });
});
