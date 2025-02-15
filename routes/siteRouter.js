const express = require('express');
const router = express.Router();
const connectDB = require('../db/db');

//获取个人网站信息
router.get('/', async (req, res) => {
    try {
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('siteInfo');
        const items = await collection.find({}).toArray();
        res.json({
            success: true, count: items.length, data: items
        })
    } catch (err) {
        res.status(404).json({
            success: false, message: err.message
        })
    }
})

router.put('/put', async (req, res, param) => {
    try {
        const dbClient = await connectDB();
        console.log(param);
        // const collection = dbClient.db('lazyboy').collection('siteInfo').insertOne(param);
    } catch (err) {
        res.status(404).json({
            success: false, message: err.message
        })
    }
})

module.exports = router;