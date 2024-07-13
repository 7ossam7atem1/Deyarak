const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/userModel');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

describe('API Endpoints', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

  let authToken;
  let testUserId;
  const testPropertyId = '66868061e79db3c436837b50';

  beforeAll(async () => {
    const Database = process.env.DATABASE.replace(
      '<password>',
      process.env.DATABASE_PASSWORD
    );

    await mongoose.connect(Database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        email: 'test@example.com',
        password: 'password123',
        passwordConfirm: 'password123',
        phone: '1234567890',
        name: 'Test User',
      });
      console.log('Test user created');
    } else {
      console.log('Test user already exists');
    }

    console.log('Test user:', testUser);
    testUserId = testUser._id; // Store test user id for later use

    const loginResponse = await request(app).post('/api/v1/users/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    console.log('Login response:', loginResponse.body);
    console.log('Login status:', loginResponse.status);

    authToken = loginResponse.body.token;
    console.log('Auth Token:', authToken);

    if (!authToken) {
      throw new Error('Failed to obtain auth token');
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
    console.log('Database connection closed');
  });

  it('should log in a user with correct credentials', async () => {
    const response = await request(app).post('/api/v1/users/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    console.log('Response body:', response.body);
    console.log('Response status:', response.status);

    expect(response.status).toBe(200);
    expect(response.body).toBeTruthy();
    expect(response.body.token).toBeDefined();
  });

  it('should return 401 with incorrect credentials', async () => {
    const response = await request(app).post('/api/v1/users/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    console.log('Response body:', response.body);
    console.log('Response status:', response.status);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Incorrect Email or Password');
  });

  it('should return 404 if email or password is missing', async () => {
    const response = await request(app).post('/api/v1/users/login').send({});

    console.log('Response body:', response.body);
    console.log('Response status:', response.status);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Please provide email and password');
  });

  describe('PATCH /api/v1/users/updateMe', () => {
    it('should update user details when authenticated', async () => {
      const response = await request(app)
        .patch('/api/v1/users/updateMe')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Test User',
          email: 'updated@example.com',
          phone: '9876543210',
        });

      console.log('UpdateMe Response body:', response.body);
      console.log('UpdateMe Response status:', response.status);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.name).toBe('Updated Test User');
      expect(response.body.data.email).toBe('updated@example.com');
      expect(response.body.data.phone).toBe('9876543210');
    });

    it('should not update password via updateMe endpoint', async () => {
      const response = await request(app)
        .patch('/api/v1/users/updateMe')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'newpassword123',
          passwordConfirm: 'newpassword123',
        });

      console.log('UpdateMe Response body:', response.body);
      console.log('UpdateMe Response status:', response.status);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('Fail');
      expect(response.body.message).toBe(
        'This route is not for password updating, Please use /updateMyPassword'
      );
    });
  });

  describe('GET /api/v1/properties', () => {
    it('should get all properties', async () => {
      const response = await request(app)
        .get('/api/v1/properties')
        .set('Authorization', `Bearer ${authToken}`);

      console.log('GetAll Response body:', response.body);
      console.log('GetAll Response status:', response.status);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.data.length).toBeGreaterThan(0);
    });

    it('should get a single property by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${authToken}`);

      console.log('GetOne Response body:', response.body);
      console.log('GetOne Response status:', response.status);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.data._id).toBe(testPropertyId);
    });

    it('should get related property suggestions by property ID', async () => {
      const response = await request(app)
        .get(`/api/v1/properties/related-suggestions/${testPropertyId}`)
        .set('Authorization', `Bearer ${authToken}`);

      console.log('RelatedSuggestions Response body:', response.body);
      console.log('RelatedSuggestions Response status:', response.status);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.data.length).toBeGreaterThan(0);
    });
  });

  it('should query properties by address', async () => {
    const addressQuery = 'tanta';
    const response = await request(app)
      .get(`/api/v1/properties?address=${addressQuery}`)
      .set('Authorization', `Bearer ${authToken}`);

    console.log('Query by Address Response body:', response.body);
    console.log('Query by Address Response status:', response.status);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.data.length).toBeGreaterThan(0);
    response.body.data.data.forEach((property) => {
      if (property.address) {
        expect(property.address.toLowerCase()).toContain(addressQuery);
      } else {
        console.warn(
          `Property with ID ${property._id} does not have an address.`
        );
      }
    });
  });
});
