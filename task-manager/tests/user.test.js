const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { adminUserId, adminUser, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

// afterEach(() => {
//   console.log('after each');
// }); 

test('should sign up a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'Jiwoong',
      email: 'jiwoong@gmail.com',
      password: '123123123'
    })
    .expect(201);
  
  // assert that the database was changed correctly
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // assertion about the response
  // expect안에 있는 value는 extra를 가질수 있지만 다른값을 가지면안된다
  expect(response.body).toMatchObject({
    user: {
      name: 'Jiwoong',
      email: 'jiwoong@gmail.com'
    },
    token: user.tokens[0].token
  });

  // assert that the password saved encrypted
  expect(user.password).not.toBe('123123123')
});

test('login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: adminUser.email,
      password: adminUser.password
    })
    .expect(200);
  
  // newly created token match
  const user = await User.findById(adminUserId);
  expect(response.body.token).toBe(user.tokens[1].token);
});

test('should not login nonexisting user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: adminUser.email,
      password: 'thisisnotmypassword'
    })
    .expect(400);
});

test('shoud get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
    .send()
    .expect(200);
});

test('shoud not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401);
});

test('should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
    .send()
    .expect(200);
  
  // user deleted and no longer exist
  const user = await User.findById(adminUserId);
  expect(user).toBeNull();
});

test('should not delete account for unauthenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401);
});

//send file using supertest
test('should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/me.jpg')
    .expect(200);
  
  const user = await User.findById(adminUserId);
  
  // expect({}).toBe({});  //false because .toBe() use '==='
  // when we compare objects, we have to use toEqaul()
  expect({}).toEqual({}); //true

  //expect.any() => constructor function 
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('shoud update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
    .send({
      name: 'changed name'
    })
    .expect(200);
  
  const user = await User.findById(adminUserId);
  expect(user.name).toBe('changed name');
});

test('shoud not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .send({
      name: 'changed name'
    })
    .expect(401);
  
  const user = await User.findById(adminUserId);
  expect(user.name).not.toBe('changed name');
});