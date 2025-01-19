const express = require('express');
const {ObjectId} = require('mongodb');
const unpkgUrl = "https://unpkg.com/picx-images/"


module.exports = (client) => {
    let router = express.Router();

    router.get('/', async (req, res) => {
        try {
            if (!client) {
                return res.status(500).send({success: false, msg: "Database connection error"});
            }
            let collection = client.db('lazyboy').collection('imgUrl');
            const items = await collection.find({}).toArray();
            res.send(items);
        } catch (err) {
            console.log(err);
            res.status(404).send({success: false, msg: "Not Found Collection"});
        }
    })

    router.get('/:type/:name', async (req, res) => {
        try {
            if (!client) {
                return res.status(500).send({success: false, msg: "Database connection error"});
            }
            let collection = client.db('lazyboy').collection('imgUrl');
            const items = await collection.find({type: req.params.type, name: req.params.name}).toArray();
            if (items.length > 0) {
                res.send({success: true, data: items});
            } else {
                res.status(404).send({success: false, msg: "Not Found Img"});
            }
        } catch (err) {
            res.status(404).send({success: false, msg: "Internal Server Error"});
        }
    })

    router.post('/:name', async (req, res) => {
        res.send({success: false, msg: "URL格式错误，例如：/ACGN/1"});
    })

    router.post('/add/:type/:name', async (req, res) => {
        try {
            if (!client) {
                return res.status(500).send({success: false, msg: "Database connection error"});
            }
            let collection = client.db('lazyboy').collection('imgUrl');
            const type = req.params.type;
            const name = req.params.name;
            const imgUrl = unpkgUrl + req.params.type + "/" + req.params.name + ".webp";
            let item = await collection.findOne({imgUrl: imgUrl});
            if (item) {
                res.send({success: false, msg: "已存在该图片URL"});
            }
            console.log(type + name + imgUrl);
            const newItem = {
                type: type, name: name, imgUrl: imgUrl
            };
            const result = await collection.insertOne(newItem);
            if (result.acknowledged) {
                res.status(201).send({
                    success: true, msg: "Item added successfully", data: newItem
                });
            } else {
                res.status(500).send({success: false, msg: "Failed to add item"});
            }
        } catch (err) {
            console.error(err);
            res.status(500).send({success: false, msg: "Internal Server Error"});
        }
    });


    return router;
};