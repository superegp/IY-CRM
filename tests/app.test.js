const request = require('supertest');
const app = require('../src/index');

describe('IY-CRM API', () => {
  describe('Health Check', () => {
    test('GET /api/health should return status OK', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Authentication', () => {
    test('POST /api/auth/register should create a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User created successfully');
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    test('POST /api/auth/login should authenticate user', async () => {
      const loginData = {
        username: 'testuser',
        password: 'testpassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('username', 'testuser');
    });
  });

  describe('Customers API', () => {
    let authToken;

    beforeAll(async () => {
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpassword123'
        });
      authToken = loginResponse.body.token;
    });

    test('GET /api/customers should require authentication', async () => {
      await request(app)
        .get('/api/customers')
        .expect(401);
    });

    test('GET /api/customers should return customers with auth', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/customers should create a new customer', async () => {
      const customerData = {
        name: 'Test Customer',
        email: 'customer@example.com',
        phone: '123-456-7890',
        company: 'Test Company'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(customerData)
        .expect(201);

      expect(response.body.name).toBe('Test Customer');
      expect(response.body.email).toBe('customer@example.com');
    });
  });
});

// Cleanup database after tests
afterAll(async () => {
  // In a real scenario, you might want to clean up test data
  // For now, we'll let the test database persist
});