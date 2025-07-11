var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const db = require('./db');

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
    console.error('/api/dogs error:', err);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

// GET /api/walkrequests/open
app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT wr.request_id,
             d.name AS dog_name,
             wr.requested_time,
             wr.duration_minutes,
             wr.location,
             u.username AS owner_username
      FROM WalkRequests wr
      JOIN Dogs    d ON wr.dog_id  = d.dog_id
      JOIN Users   u ON d.owner_id = u.user_id
      WHERE wr.status = 'open'
    `);
    res.json(rows);
  } catch (err) {
    console.error('[/api/walkrequests/open] error:', err);
    res.status(500).json({ error: 'Failed to fetch open walk requests' });
  }
});

// GET /api/walkers/summary
app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.username           AS walker_username,
             COUNT(r.rating_id)   AS total_ratings,
             AVG(r.rating)        AS average_rating,
             COUNT(r.rating_id)   AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id
    `);
    res.json(rows);
  } catch (err) {
    console.error('[/api/walkers/summary] error:', err);
    res.status(500).json({ error: 'Failed to fetch walker summary' });
  }
});

module.exports = app;
