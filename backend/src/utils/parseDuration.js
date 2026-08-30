const UNIT_TO_SECONDS = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 60 * 60 * 24,
};

/**
 * Parses simple durations like '15m', '7d', '1h', '30s' into seconds.
 * Matches the subset of jsonwebtoken's `expiresIn` string format we use.
 */
function parseDurationToSeconds(duration) {
  const match = /^(\d+)([smhd])$/.exec(String(duration).trim());
  if (!match) {
    throw new Error(`Unsupported duration format: ${duration}`);
  }
  const [, amount, unit] = match;
  return Number(amount) * UNIT_TO_SECONDS[unit];
}

module.exports = parseDurationToSeconds;
