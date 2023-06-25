const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const adminUserId = new mongoose.Types.ObjectId();
const adminUser = {
  _id: adminUserId,
  name: 'admin',
  email: 'admin@gmail.com',
  password: '123123123',
  tokens: [
    {
      token: jwt.sign({ _id: adminUserId }, process.env.JWT_SECRET)  
    }
  ]
};

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'user 1',
  email: 'user1@gmail.com',
  password: '123123123',
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)  
    }
  ]
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: 'first task',
  completed: true,
  owner: userOneId
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: 'second task',
  completed: false,
  owner: userOneId
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: 'third task',
  completed: false,
  owner: adminUserId
};

const setupDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();

  await new User(adminUser).save();
  await new User(userOne).save();

  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  adminUserId,
  adminUser,
  userOneId,
  userOne,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase
}