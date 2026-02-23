import express from 'express';
import tasks from './data/mock.js';
import mongoose from 'mongoose';
import { DATABASE_URL } from './env.js';

const app = express();
app.use(express.json()); //app전체에서 express.json을 사용하겠다는 뜻
app.get('/tasks', (req, res) => {
  // 쿼리 파라미터
  /**
   * sort:'oldest'인 경우 오래된 테스크 기준, 나머지 겨우 새로운 테스크 기준
   * count:테스크 개수
   */

  const sort = req.query.sort;
  const count = Number(req.query.count);

  const compareFn =
    sort === 'oldest'
      ? (a, b) => a.createdAt - b.createdAt
      : (a, b) => b.createdAt - a.createdAt;

  let newTasks = tasks.sort(compareFn);

  if (count) {
    newTasks = newTasks.slice(0, count);
  }
  res.send(newTasks);
});

app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((task) => task.id === id);
  if (task) {
    res.send(task);
  } else {
    res.status(404).send({ message: 'Cannot find given id.' });
  }
});

app.post('/tasks', (req, res) => {
  const newTask = req.body;
  const ids = tasks.map((task) => task.id);
  newTask.id = Math.max(...ids) + 1;
  newTask.createdAt = new Date();
  newTask.updatedAt = new Date();
  tasks.push(newTask);
  res.status(201).send(newTask);
});

app.patch('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((task) => task.id === id);
  if (task) {
    Object.keys(req.body).forEach((key) => {
      task[key] = req.body[key];
    });
    task.updatedAt = new Date();
    res.send(task);
  } else {
    res.status(404).send({ message: 'Cannot find given id.' });
  }
});

app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = tasks.findIndex((task) => task.id === id);
  if (idx >= 0) {
    tasks.splice(idx, 1);
    res.sendStatus(204);
  } else {
    res.status(404).send({ message: 'Cannot find given id.' });
  }
});

app.listen(3000, () => console.log('Server Started!'));
mongoose.connect(DATABASE_URL).then(() => console.log('Connected to DB'));
