const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { adminUserId, adminUser, userOneId, userOne, taskOne, taskTwo, taskThree, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
    .send({
      description: 'testing task'
    })
    .expect(201);
  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toBe(false);
});

test('get users tasks', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  const tasks = await Task.find({ owner: userOneId });
  expect(response.body.length).toEqual(tasks.length);
});

test('get only completed tasks', async () => {
  const response = await request(app)
    .get('/tasks?completed=true')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  const completedTasks = await Task.find({ owner: userOneId, completed: true });
  
  expect(response.body.length).toBe(completedTasks.length);
});

test('should not delete other users tasks', async () => {
  const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${adminUser.tokens[0].token}`)
    .send()
    .expect(404);
  
  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});