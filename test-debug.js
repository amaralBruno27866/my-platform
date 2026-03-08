const request = require('supertest');
const {app} = require('./apps/api/src/app.ts');

async function test() {
  const res1 = await request(app).post('/public/auth/signup').send({
    firstName: 'First',
    lastName: 'User',
    email: 'test@test.com',
    password: '12345678',
    acceptanceTerm: true,
    accountGroup: 1,
    organizationId: 'org-1',
  });
  
  console.log('Signup 1:', res1.status);
  
  const res2 = await request(app).post('/public/auth/signup').send({
    firstName: 'Second',
    lastName: 'User',
    email: 'test@test.com',
    password: 'password',
    acceptanceTerm: true,
    accountGroup: 1,
    organizationId: 'org-1',
  });
  
  console.log('Signup 2 status:', res2.status);
  console.log('Signup 2 body:', JSON.stringify(res2.body, null, 2));
}

test().catch(console.error);
