const express = require('express');
const {MongoClient, ServerApiVersion} = require('mongodb');
const app = express();
const routes = require('./routes');
const cors = require('cors');

// 添加中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

// MongoDB 连接字符串
const uri = process.env.MONGODB_URI || "mongodb+srv://dbuser:jdj123456@list.wlxqf.mongodb.net/?retryWrites=true&w=majority&appName=list";

// 创建 MongoDB 客户端
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1, strict: true, deprecationErrors: true,
    }, tls: true, // 启用 TLS
    tlsAllowInvalidCertificates: false, // 不允许无效证书
});

// 连接到 MongoDB
async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ping: 1});
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // 将 client 传递给路由
        routes(app, client);
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    }
}

run().catch(console.dir);

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;