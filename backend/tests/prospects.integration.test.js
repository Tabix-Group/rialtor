const request = require('supertest');
const app = require('../src/server');

describe('Prospects API (integration)', () => {
  test('create prospect, mark WON and get stats', async () => {
    const unique = Date.now()
    const email = `test-prospects-${unique}@example.com`
    const password = 'Password123!'

    // Register
    const regRes = await request(app).post('/api/auth/register').send({ email, password, name: 'Test User' })
    expect([201,409]).toContain(regRes.statusCode) // allow 409 if already seeded

    // Login
    const loginRes = await request(app).post('/api/auth/login').send({ email, password })
    expect(loginRes.statusCode).toBe(200)
    const token = loginRes.body.token
    expect(token).toBeTruthy()

    const auth = { Authorization: `Bearer ${token}` }

    // Initial stats
    const stats0 = await request(app).get('/api/prospects/stats').set(auth)
    expect(stats0.statusCode).toBe(200)
    expect(stats0.body.stats).toHaveProperty('total')

    // Create prospect (tentative)
    const createRes = await request(app).post('/api/prospects').set(auth).send({ title: 'Test Prospect', estimatedValue: 50000, estimatedCommission: 5000, clientsProspected: 3, probability: 50, status: 'TENTATIVE' })
    expect(createRes.statusCode).toBe(201)
    const prospect = createRes.body.prospect
    expect(prospect).toHaveProperty('id')

    // Stats after creation
    const stats1 = await request(app).get('/api/prospects/stats').set(auth)
    expect(stats1.statusCode).toBe(200)
    expect(stats1.body.stats.total).toBeGreaterThanOrEqual(1)

    // Mark WON
    const updateRes = await request(app).put(`/api/prospects/${prospect.id}`).set(auth).send({ status: 'WON', closedValue: 60000 })
    expect(updateRes.statusCode).toBe(200)
    expect(updateRes.body.prospect.status).toBe('WON')

    // Stats after WON
    const stats2 = await request(app).get('/api/prospects/stats').set(auth)
    expect(stats2.statusCode).toBe(200)
    const s = stats2.body.stats
    expect(s.wonCount).toBeGreaterThanOrEqual(1)
    expect(s.avgSale).toBeGreaterThanOrEqual(60000)
    expect(s.conversionRate).toBeGreaterThanOrEqual(0)
  }, 20000)
})
