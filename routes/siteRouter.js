const express = require('express');
const router = express.Router();
const connectDB = require('../db/db');
const {ObjectId} = require("mongodb");

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

router.post('/add', async (req, res) => {
    try {
        const params = req.body;
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('siteInfo');
        const result = await collection.insertOne(params);

        res.status(200).json({
            success: true, data: result // 返回插入的数据
        });
    } catch (err) {
        res.status(500).json({
            success: false, message: err.message
        });
    }
});

router.delete('/delete/:siteId', async (req, res) => {
    try {
        const siteId = req.params.siteId; // 从 URL 参数中获取 siteId
        console.log('要删除的 siteId:', siteId);

        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('siteInfo');

        // 将 siteId 转换为 ObjectId
        const result = await collection.deleteOne({_id: ObjectId(siteId)});

        if (result.deletedCount === 1) {
            res.status(200).json({
                success: true, message: '删除成功', data: result,
            });
        } else {
            res.status(404).json({
                success: false, message: '未找到对应的文档',
            });
        }
    } catch (err) {
        console.error('删除失败:', err);
        res.status(500).json({
            success: false, message: err.message,
        });
    }
});

module.exports = router;