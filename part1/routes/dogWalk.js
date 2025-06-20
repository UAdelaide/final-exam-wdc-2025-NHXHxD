var express = require('express');
var router = express.Router();
var db = require('../db');

router.get('/dogs', async(req, res) => {
    const [rows] = await db.query(`
        SE

        `)
})