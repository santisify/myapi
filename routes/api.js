const express = require('express');
const {ObjectId} = require('mongodb');
const unpkgUrl = "https://unpkg.com/picx-images/"


module.exports = (client) => {
    let router = express.Router();

    router.get('/', async (req, res) => {
        try {
            if (!client) {
                return res.status(500).send({success: false, msg: "服务器与数据库断开连接"});
            }
            let collection = client.db('lazyboy').collection('imgUrl');
            const items = await collection.find({}).toArray();
            return res.send({success: true, data: items});
        } catch (err) {
            return res.status(404).send({success: false, msg: "啊噢，与服务器断开连接，请重试"});
        }
    })

    router.get('/:type/:name', async (req, res) => {
        try {
            if (!client) {
                return res.status(500).send({success: false, msg: "服务器与数据库断开连接"});
            }
            let collection = client.db('lazyboy').collection('imgUrl');
            const item = await collection.find({type: req.params.type, name: req.params.name}).toArray();
            if (item.length > 0) {
                return res.send({success: true, data: item});
            } else {
                return res.status(404).send({success: false, msg: "无该图片"});
            }
        } catch (err) {
            return res.status(404).send({success: false, msg: "啊噢，与服务器断开连接，请重试"});
        }
    })

    router.get('/random', async (req, res) => {
        try {
            // 检查数据库连接是否正常
            if (!client) {
                return res.status(500).send({success: false, msg: "服务器与数据库断开连接"});
            }
            // 获取集合
            let collection = client.db('lazyboy').collection('imgUrl');
            // 查询所有符合条件的文档
            const items = await collection.find({}).toArray();
            // 检查是否有数据
            if (items.length === 0) {
                return res.status(404).send({success: false, msg: "加载失败"});
            }
            // 随机选择一个文档
            const randomIndex = Math.floor(Math.random() * items.length); // 生成随机索引
            const randomItem = items[randomIndex]; // 获取随机文档
            // 返回随机文档
            res.send({success: true, data: randomItem});
        } catch (err) {
            console.error(err); // 打印错误信息
            res.status(500).send({success: false, msg: "啊噢，与服务器断开连接，请重试"});
        }
    });

    router.get('/:type', async (req, res) => {
        try {
            if (!client) {
                return res.status(500).send({success: false, msg: "服务器与数据库断开连接"});
            }
            const collection = client.db('lazyboy').collection('imgUrl');
            const items = await collection.find({type: req.params.type}).toArray();
            if (items.length > 0) {
                const index = Math.floor(Math.random() * items.length);
                const item = items[index];
                return res.send({success: true, data: item});
            } else {
                return res.status(404).send({success: false, msg: "该分类无图片"})
            }
        } catch (err) {
            return res.status(404).send({success: false, msg: "啊噢，与服务器断开连接，请重试"});
        }
    })


    router.post('/add/:type/:name', async (req, res) => {
        try {
            if (!client) {
                return res.status(500).send({success: false, msg: "服务器与数据库断开连接"});
            }
            let collection = client.db('lazyboy').collection('imgUrl');
            const type = req.params.type;
            const name = req.params.name;
            const imgUrl = unpkgUrl + req.params.type + "/" + req.params.name + ".webp";
            let item = await collection.findOne({imgUrl: imgUrl});
            if (item) {
                return res.send({success: false, msg: "已存在该图片URL"});
            }
            console.log(type + name + imgUrl);
            const newItem = {
                type: type, name: name, imgUrl: imgUrl
            };
            const result = await collection.insertOne(newItem);
            if (result.acknowledged) {
                return res.status(201).send({
                    success: true, msg: "Item added successfully", data: newItem
                });
            } else {
                return res.status(500).send({success: false, msg: "添加失败"});
            }
        } catch (err) {
            console.error(err);
            return res.status(500).send({success: false, msg: "啊噢，与服务器断开连接，请重试"});
        }
    });
    return router;
};