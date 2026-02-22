import express from 'express';
import tasks from './data/mock.js';

const app = express();

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

app.listen(3000, () => console.log('Server Started!'));
