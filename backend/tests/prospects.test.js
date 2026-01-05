const request = require('supertest');
const app = require('../src/server');

describe('Prospects API (auth)', () => {
  test('GET /api/prospects without token should return 401', async () => {
    const res = await request(app).get('/api/prospects');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
