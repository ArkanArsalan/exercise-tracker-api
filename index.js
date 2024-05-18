import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Exercise from './models/Exercise.js';
import User from './models/User.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const port = 3000;

// Setup Database and Port
// app.listen(port, function () {
//   console.log(`Listening on port ${port}`);
// });

mongoose
  .connect(process.env.MONGODB_LINK)
  .then(() => {
    app.listen(port, function () {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(`${err} did not connect`);
  })


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

// API ENDPOINT
app.post("/api/users", async (req, res) => {
  const { username } = req.body;

  try {
    const isUserFound = await User.findOne({ username: username });

    if (!isUserFound) {
      const newUser = new User(
        {
          username: username
        }
      )

      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
    } else {
      res.status(200).json(isUserFound);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const { _id } = req.params;
  const { description, duration } = req.body;
  let { date } = req.body;

  try {
    if (!date) {
      date = new Date().toDateString();
    }

    const dateObj = new Date(date);
    const formattedDate = dateObj.toDateString();

    const newExercise = new Exercise(
      {
        user_id: _id,
        description: description,
        duration: parseInt(duration),
        date: formattedDate
      }
    )

    const savedExercise = await newExercise.save();

    const user = await User.findById(_id);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      date: savedExercise.date,
      duration: savedExercise.duration,
      description: savedExercise.description,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const { _id } = req.params;
  let { from, to, limit } = req.query;

  if (!from) {
    from = new Date(0);
  }
  if (!to) {
    to = new Date();
  }
  if (!limit) {
    limit = 0;
  }

  try {
    const user = await User.findById(_id);
    const logs = await Exercise.find({ user_id: _id }).limit(parseInt(limit));

    const formattedLogs = logs.map(obj => ({
      description: obj.description,
      duration: obj.duration,
      date: new Date(obj.date).toDateString()
    }));

    res.status(200).json({
      username: user.username,
      count: logs.length,
      _id: _id,
      log: formattedLogs
    })
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
