import express from 'express';
import mongoose from 'mongoose';
import { DATABASE_URL } from './env.js';
import Task from './models/Task.js';

const app = express();
app.use(express.json()); //app전체에서 express.json을 사용하겠다는 뜻

function asyncHandler(handler) {
  return async function (req, res) {
    try {
      await handler(req, res);
    } catch (e) {
      if (e.name === 'ValidationError') {
        res.status(400).send({ message: e.message });
      } else if (e.name === 'CastError') {
        res.status(404).send({ message: 'Cannot find given id.' });
      } else {
        res.status(500).send({ message: 'e.message' });
      }
    }
  };
}

app.get(
  '/tasks',
  asyncHandler(async (req, res) => {
    // 쿼리 파라미터
    /**
     * sort:'oldest'인 경우 오래된 테스크 기준, 나머지 겨우 새로운 테스크 기준
     * count:테스크 개수
     */

    const sort = req.query.sort;
    const count = Number(req.query.count) || 0;

    const sortOption = {
      createdAt: sort === 'oldest' ? 'asc' : 'desc',
    };
    const tasks = await Task.find().sort(sortOption).limit(count);

    // const compareFn =
    //   sort === 'oldest'
    //     ? (a, b) => a.createdAt - b.createdAt
    //     : (a, b) => b.createdAt - a.createdAt;

    // let newTasks = mockTasks.sort(compareFn);

    // if (count) {
    //   newTasks = newTasks.slice(0, count);
    // }
    res.send(tasks);
  }),
);

app.get(
  '/tasks/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    // const task = mockTasks.find((task) => task.id === id);
    const task = await Task.findById(id);
    if (task) {
      res.send(task);
    } else {
      res.status(404).send({ message: 'Cannot find given id.' });
    }
  }),
);

app.post(
  '/tasks',
  asyncHandler(async (req, res) => {
    const newTask = await Task.create(req.body);

    // req.body;
    // const ids = mockTasks.map((task) => task.id);
    // newTask.id = Math.max(...ids) + 1;
    // newTask.createdAt = new Date();
    // newTask.updatedAt = new Date();
    // mockTasks.push(newTask);
    res.status(201).send(newTask);
  }),
);

app.patch(
  '/tasks/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const task = await Task.findById(id);

    if (task) {
      Object.keys(req.body).forEach((key) => {
        task[key] = req.body[key];
      });
      // task.updatedAt = new Date(); 이제 mongoDB가 관리함
      await task.save();
      res.send(task);
    } else {
      res.status(404).send({ message: 'Cannot find given id.' });
    }
  }),
);

app.delete(
  '/tasks/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const task = await Task.findByIdAndDelete(id);
    if (task) {
      res.sendStatus(204);
    } else {
      res.status(404).send({ message: 'Cannot find given id.' });
    }
  }),
);

app.listen(3000, () => console.log('Server Started!'));
mongoose.connect(DATABASE_URL).then(() => console.log('Connected to DB'));
