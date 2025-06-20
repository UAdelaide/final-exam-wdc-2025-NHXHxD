var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dogWalkRouter = require('./routes/dogWalk');
var db = require('../db');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

async function addData() {
  try {
    await db.query(`
      INSERT IGNORE INTO Users (user_id, username, email, password_hash, role) VALUES
      (1,'alice123','alice@example.com','hashed123','owner'),
      (2,'bobwalker','bob@example.com','hashed456','walker'),
      (3,'carol123','carol@example.com','hashed789','owner'),
      (4,'johnwalker','john@example.com','hashed000','walker'),
      (5,'emily','emily@example.com','hashed111','owner');
    `);
    await db.query(`
      INSERT IGNORE INTO Dogs (dog_id, owner_id, name, size) VALUES
      (1,1,'Max','medium'),
      (2,3,'Bella','small'),
      (3,3,'Rocky','large'),
      (4,5,'Luna','medium'),
      (5,1,'Buddy','small');
    `);
    await db.query(`
      INSERT IGNORE INTO WalkRequests (request_id, dog_id, requested_time, duration_minutes, location, status) VALUES
      (1,1,'2025-06-10 08:00:00',30,'Parklands','open'),
      (2,2,'2025-06-10 09:30:00',45,'Beachside Ave','accepted'),
      (3,4,'2025-06-11 07:45:00',60,'Riverbank Trail','open'),
      (4,3,'2025-06-11 18:00:00',30,'City Center Park','cancelled'),
      (5,5,'2025-06-12 10:15:00',20,'Suburban Greenway','open');
    `);
    console.log('Added test data');
  } catch (err) {
    console.error('Fail to add data: ', err);
  }
}

// GET /api/dogs
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT d.name AS dog_name, d.size AS size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('[/api/dogs] error:', err);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

// GET /api/walkrequests/open


app.listen(8080, async () => {
  await addData();
});

module.exports = app;
