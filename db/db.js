const { MongoClient, ServerApiVersion } = require('mongodb');

let client = null;

async function connectDB() {
    if (client && client.topology && client.topology.isConnected()) {
        return client;
    }

    const uri = process.env.MONGODB_URI; // 在根目录下的.env文件中配置MONGO数据库的URI
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

module.exports = connectDB;