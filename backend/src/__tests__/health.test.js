const request = require('supertest');

// Health route only touches connection status objects, not live connections,
// so it is safe to test without a running Mongo/Redis instance.
const app = require('../app');

describe('GET /api/v1/health', () => {
  it('returns 200 and a healthy payload shape', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.dependencies).toHaveProperty('mongo');
    expect(res.body.dependencies).toHaveProperty('redis');
  });

  it('returns a normalized 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
