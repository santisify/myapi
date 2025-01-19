const express = require('express');
const app = express();
const routes = require('./routes'); // 引入路由模块
const cors = require('cors');

// 添加中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const {MongoClient, ServerApiVersion} = require('mongodb');
const uri = process.env.MONGODB_URI || "mongodb+srv://dbuser:jdj123456@list.wlxqf.mongodb.net/?retryWrites=true&w=majority&appName=list";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1, strict: true, deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect(); // 连接到 MongoDB
        await client.db("admin").command({ping: 1}); // 测试连接
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // 将 client 传递给路由
        routes(app, client);
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    }
}

run().catch(console.dir);
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App listening on port ${port}`); // 启动 Express 服务器
});
module.exports = app;