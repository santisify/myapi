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

    const uri = process.env.MONGODB_URI; //在根目录下的.env文件中配置MONGO数据库的URI
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
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString(),
        dbStatus: client && client.topology && client.topology.isConnected() ? 'connected' : 'disconnected',
        notice: "只支持访问后缀为.webp的图片，未来也不会添加其他后缀访问的图片"
    });
});

// img API路由
app.get('/img', async (req, res) => {
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

//一个分类的随机图片
app.get('/img/:type', async (req, res) => {
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
        console.error("Error in /img/:type route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
        });
    }
});

//所有同一分类的图片
app.get('/img/:type/all', async (req, res) => {
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
        console.error("Error in /img/:type route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
        });
    }
});

// 指定图片
app.get('/img/:type/:name', async (req, res) => {
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
        console.error("Error in /img/:type/:name route:", err);
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