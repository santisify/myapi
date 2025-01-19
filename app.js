const express = require('express');
const app = express();
const cors = require('cors');
const {MongoClient, ServerApiVersion} = require('mongodb');

app.use(cors());
app.use(express.json());
let client = null;

// 数据库连接函数
async function connectDB() {
    if (client && client.topology && client.topology.isConnected()) {
        return client;
    }

    const uri = "mongodb+srv://dbuser:jdj123456@list.wlxqf.mongodb.net/?retryWrites=true&w=majority&appName=list";
    client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1, strict: true, deprecationErrors: true,
        }
    });

    try {
        await client.connect();
        console.log("MongoDB connected successfully");
        return client;
    } catch (err) {
        console.error("MongoDB connection error:", err);
        throw err;
    }
}

// 健康检查路由
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString(),
        dbStatus: client && client.topology && client.topology.isConnected() ? 'connected' : 'disconnected'
    });
});

// API 路由
app.get('/api', async (req, res) => {
    try {
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('imgUrl');
        const items = await collection.find({}).toArray();
        res.json({
            success: true, count: items.length, data: items
        });
    } catch (err) {
        console.error("Error in /api route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
        });
    }
});

app.get('/api/:type', async (req, res) => {
    try {
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('imgUrl');
        const items = await collection.find({type: req.params.type}).toArray();

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
        console.error("Error in /api/:type route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
        });
    }
});

app.get('/api/:type/all', async (req, res) => {
    try {
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('imgUrl');
        const items = await collection.find({type: req.params.type}).toArray();
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
        console.error("Error in /api/:type route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
        });
    }
});

app.get('/api/:type/:name', async (req, res) => {
    try {
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('imgUrl');
        const item = await collection.findOne({type: req.params.type, name: req.params.name});
        if (item) {
            res.json({
                success: true, data: item
            })
        } else {
            res.status(404).json({
                success: false, message: '无该图片'
            });
        }
    } catch (err) {
        console.error("Error in /api/:type/:name route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
        });
    }
});

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