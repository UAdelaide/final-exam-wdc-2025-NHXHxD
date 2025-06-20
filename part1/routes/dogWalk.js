var express = require('express');
var router = express.Router();
var db = require('../db');

router.get('/dogs', async(req, res) => {
    const [rows] = await db.query(`
        SELECT d.name AS dog_name,
        d.size as size,
        u.username AS owner_username
        FROM 
        JOIN

        `)
})