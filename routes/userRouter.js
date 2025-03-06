const express = require('express');
const router = express.Router();
const connectDB = require('../db/db');

/**
 * 获取用户
 * @param {string} username - 用户名
 * @returns {Object} {success, data|| message || (message, error)}
 */
router.get('/:username', async (req, res) => {
    try {
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('user');
        const item = await collection.find({username: req.params.username}).toArray();
        if (item.length > 0) {
            res.status(200).json({
                success: true, data: item
            });
        } else {
            res.status(404).json({
                success: false, message: '用户不存在'
            });
        }
    } catch (err) {
        console.error("Error in /user/:username route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
        });
    }
});

module.exports = router;