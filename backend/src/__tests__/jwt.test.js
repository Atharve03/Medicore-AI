const {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../utils/jwt');

describe('jwt utils', () => {
  const fakeUser = { _id: '64f1a2b3c4d5e6f7a8b9c0d1', role: 'patient' };

  it('signs and verifies an access token', () => {
    const token = signAccessToken(fakeUser);
    const payload = verifyAccessToken(token);

    expect(payload.sub).toBe(String(fakeUser._id));
    expect(payload.role).toBe('patient');
  });

  it('signs and verifies a refresh token with a jti', () => {
    const { token, jti } = signRefreshToken(fakeUser);
    const payload = verifyRefreshToken(token);

    expect(payload.sub).toBe(String(fakeUser._id));
    expect(payload.jti).toBe(jti);
  });

  it('rejects a tampered access token', () => {
    const token = signAccessToken(fakeUser);
    expect(() => verifyAccessToken(`${token}tampered`)).toThrow();
  });
});
