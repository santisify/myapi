const express = require('express');
const cors = require('cors');
const connectDB = require('./db/db');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

// 使用路由
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        success: false, message: 'Internal Server Error', error: err.message
    });
});

// 404 handling
app.use((req, res) => {
    res.status(404).json({
        success: false, message: `Route not found: ${req.method} ${req.path}`
    });
});

// 初始化数据库连接
connectDB().catch(console.error);

module.exports = app;