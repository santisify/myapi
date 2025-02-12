const express = require('express');
const router = express.Router();
const connectDB = require('../db/db');

// 获取所有图片
router.get('/', async (req, res) => {
    try {
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('imgUrl');
        const items = await collection.find({}).toArray();
        res.json({
            success: true, count: items.length, data: items
        });
    } catch (err) {
        console.error("Error in /img route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
        });
    }
});

// 获取分类的随机图片
router.get('/:type', async (req, res) => {
    try {
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('imgUrl');
        const items = await collection.find({ type: req.params.type }).toArray();

        if (items.length > 0) {
            const index = Math.floor(Math.random() * items.length);
            res.json({
                success: true, data: items[index]
            });
        } else {
            res.status(404).json({
                success: false, message: '该分类无图片'
            });
        }
    } catch (err) {
        console.error("Error in /img/:type route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
        });
    }
});

// 获取所有同一分类的图片
router.get('/:type/all', async (req, res) => {
    try {
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('imgUrl');
        const items = await collection.find({ type: req.params.type }).toArray();
        if (items.length > 0) {
            res.json({
                success: true, data: items
            });
        } else {
            res.status(404).json({
                success: false, message: '该分类无图片'
            });
        }
    } catch (err) {
        console.error("Error in /img/:type/all route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
        });
    }
});

// 获取指定图片
router.get('/:type/:name', async (req, res) => {
    try {
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('imgUrl');
        const item = await collection.findOne({ type: req.params.type, name: req.params.name });
        if (item) {
            res.json({
                success: true, data: item
            });
        } else {
            res.status(404).json({
                success: false, message: '无该图片'
            });
        }
    } catch (err) {
        console.error("Error in /img/:type/:name route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
        });
    }
});

// 添加图片
router.post('/add/:type/:name', async (req, res) => {
    try {
        const { type, name } = req.params;
        if (typeof type !== 'string') {
            res.status(400).json({
                success: false, message: "Invalid format of type string"
            });
        }

        if (typeof name !== 'string') {
            res.status(400).json({
                success: false, message: "Invalid format of name string"
            });
        }
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('imgUrl');
        const imgUrl = "https://unpkg.com/picx-images/" + type + "/" + name + ".webp";
        const re = await collection.insertOne({ name: name, imgUrl: imgUrl, type: type });
        if (re) {
            res.status(201).json({
                success: true, data: re
            });
        } else {
            res.status(404).json({
                success: false, message: "添加失败"
            });
        }
    } catch (err) {
        console.error("Error in /add/:type/:name route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
        });
    }
});

module.exports = router;