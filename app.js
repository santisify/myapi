const express = require('express');
const app = express();
const routes = require('./routes'); // 引入路由模块
app.use(express.static('public'));

const {MongoClient, ServerApiVersion} = require('mongodb');
const uri = process.env.MONGODB_URI;
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