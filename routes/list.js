const express = require('express');
const {ObjectId} = require('mongodb'); // 引入 ObjectId，用于处理 MongoDB 的 _id 字段

module.exports = (client) => {
    let router = express.Router(); // 创建 Express 路由

    // 获取所有待办事项
    router.get('/', async (req, res) => {
        try {
            const collection = client.db('lazyboy').collection('list'); // 获取集合
            const items = await collection.find({}).toArray(); // 查询所有文档
            res.send(items); // 返回查询结果
        } catch (err) {
            console.error("Error fetching items:", err); // 打印错误日志
            res.status(500).send({error: "Failed to fetch items"}); // 返回错误信息
        }
    });

    router.get('/:name', async (req, res) => {
        try {
            const collection = client.db('lazyboy').collection('list');
            const result = await collection.findOne({name: req.params.name});
            res.send(result);
        } catch (err) {
            console.error("Error deleting item:", err);
            res.status(500).send({error: "Failed to get item"});
        }
    })

    // 添加新的待办事项
    router.post('/', async (req, res) => {
        try {
            const collection = client.db('lazyboy').collection('list'); // 获取集合
            const result = await collection.insertOne(req.body); // 插入新文档
            res.status(201).send(result); // 返回插入结果
        } catch (err) {
            console.error("Error adding item:", err); // 打印错误日志
            res.status(500).send({error: "Failed to add item"}); // 返回错误信息
        }
    });

    // 更新待办事项
    router.put('/:id', async (req, res) => {
        try {
            const collection = client.db('lazyboy').collection('list'); // 获取集合
            const result = await collection.updateOne({_id: new ObjectId(req.params.id)}, // 将字符串 id 转换为 ObjectId
                {$set: req.body} // 更新文档内容
            );
            res.send(result); // 返回更新结果
        } catch (err) {
            console.error("Error updating item:", err); // 打印错误日志
            res.status(500).send({error: "Failed to update item"}); // 返回错误信息
        }
    });

    // 删除待办事项
    router.delete('/:id', async (req, res) => {
        try {
            const collection = client.db('lazyboy').collection('list'); // 获取集合
            const result = await collection.deleteOne({_id: new ObjectId(req.params.id)}); // 删除文档
            res.status(204).send(result); // 返回删除结果
        } catch (err) {
            console.error("Error deleting item:", err); // 打印错误日志
            res.status(500).send({error: "Failed to delete item"}); // 返回错误信息
        }
    });

    return router;
};