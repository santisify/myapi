const express = require('express');
const router = express.Router();
const connectDB = require('../db/db');

/**
 * @GET https://api.lazy-boy-acmer.cn/img/
 * 获取所有图片信息
 */
router.get('/', async (req, res) => {
    try {
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('img');
        const images = await collection.find({}).toArray();

        if (images.length > 0) {
            res.status(200).json({
                success: true,
                data: images
            });
        } else {
            res.status(404).json({
                success: false,
                message: "No images found."
            });
        }
    } catch (err) {
        console.error("Error in GET /img route:", err);
        res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
        });
    }
});

/**
 * @GET https://api.lazy-boy-acmer.cn/img/:type
 * 获取分类图库随机信息
 * @type 图片类型
 */
router.get('/:type', async (req, res) => {
    try {
        const {type} = req.params;
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('img');

        // 获取指定类型的随机一张图片
        const randomImage = await collection.aggregate([
            {$match: {type: type}},
            {$sample: {size: 1}}
        ]).toArray();

        if (randomImage.length > 0) {
            res.status(200).json({
                success: true,
                data: randomImage[0]
            });
        } else {
            res.status(404).json({
                success: false,
                message: `No images found for type: ${type}`
            });
        }
    } catch (err) {
        console.error("Error in GET /img/:type route:", err);
        res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
        });
    }
});

/**
 * @GET https://api.lazy-boy-acmer.cn/img/:type/all
 * 获取所有同一分类的图片
 * @type 图片类型
 */
router.get('/:type/all', async (req, res) => {
    try {
        const {type} = req.params;
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('img');
        const images = await collection.find({type: type}).toArray();

        if (images.length > 0) {
            res.status(200).json({
                success: true,
                data: images
            });
        } else {
            res.status(404).json({
                success: false,
                message: `No images found for type: ${type}`
            });
        }
    } catch (err) {
        console.error("Error in GET /img/:type/all route:", err);
        res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
        });
    }
});

/**
 * @GET https://api.lazy-boy-acmer.cn/img/:type/:name
 * 获取指定类型图片的所有信息
 * @type 图片类型
 * @name 图片名称(无后缀)
 */
router.get('/:type/:name', async (req, res) => {
    try {
        const {type, name} = req.params;
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('img');

        // 查找指定类型和名称的图片
        const image = await collection.findOne({
            type: type,
            filename: {$regex: new RegExp(`^${name}\\.`, 'i')} // 匹配文件名（忽略后缀）
        });

        if (image) {
            res.status(200).json({
                success: true,
                data: image
            });
        } else {
            res.status(404).json({
                success: false,
                message: `Image not found for type: ${type} and name: ${name}`
            });
        }
    } catch (err) {
        console.error("Error in GET /img/:type/:name route:", err);
        res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
        });
    }
});

/**
 * @POST https://api.lazy-boy-acmer.cn/img/add/
 * 添加图片
 * @type 图片类型
 * @name 图片名称(无后缀)
 */
router.post('/add/:type/:name', async (req, res) => {
    try {
        const {type, name} = req.params;
        const {title, description, size, width, height, format, uploadedBy, tags, metadata} = req.body;

        // 验证必填字段
        if (!title || !description || !size || !width || !height || !format || !uploadedBy) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields."
            });
        }

        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('img');

        // 构造图片 URL
        const url = `https://unpkg.com/picx-images/${type}/${name}.${format.toLowerCase()}`;

        // 插入新图片
        const result = await collection.insertOne({
            title,
            type,
            description,
            filename: `${name}.${format.toLowerCase()}`,
            url,
            size,
            width,
            height,
            format,
            uploadedBy,
            uploadedAt: new Date(),
            tags: tags || [],
            metadata: metadata || {}
        });

        if (result.insertedId) {
            res.status(201).json({
                success: true,
                data: result
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Failed to add image."
            });
        }
    } catch (err) {
        console.error("Error in POST /img/add/:type/:name route:", err);
        res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
        });
    }
});

module.exports = router;