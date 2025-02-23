const express = require('express');
const router = express.Router();
const connectDB = require('../db/db');
const axios = require('axios');
const sizeOf = require('image-size'); // 用于获取图片尺寸和格式
const {URL} = require('url'); // 用于解析 URL
const {generateImageDescription} = require('../utils/imageDescription'); // 假设有一个工具函数用于生成图片描述
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
                success: true, data: images
            });
        } else {
            res.status(404).json({
                success: false, message: "No images found."
            });
        }
    } catch (err) {
        console.error("Error in GET /img route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
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
        const randomImage = await collection.aggregate([{$match: {type: type}}, {$sample: {size: 1}}]).toArray();

        if (randomImage.length > 0) {
            res.status(200).json({
                success: true, data: randomImage[0]
            });
        } else {
            res.status(404).json({
                success: false, message: `No images found for type: ${type}`
            });
        }
    } catch (err) {
        console.error("Error in GET /img/:type route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
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
                success: true, data: images
            });
        } else {
            res.status(404).json({
                success: false, message: `No images found for type: ${type}`
            });
        }
    } catch (err) {
        console.error("Error in GET /img/:type/all route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
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
            type: type, filename: {$regex: new RegExp(`^${name}\\.`, 'i')} // 匹配文件名（忽略后缀）
        });

        if (image) {
            res.status(200).json({
                success: true, data: image
            });
        } else {
            res.status(404).json({
                success: false, message: `Image not found for type: ${type} and name: ${name}`
            });
        }
    } catch (err) {
        console.error("Error in GET /img/:type/:name route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
        });
    }
});

/**
 * @POST https://api.lazy-boy-acmer.cn/img/add/:type/:name
 * 添加图片
 * @type 图片类型
 * @name 图片名称(无后缀)
 */
router.post('/add/:type/:name', async (req, res) => {
    try {
        const {type, name} = req.params;
        const {title, uploadedBy, tags, metadata, imageUrl} = req.body;

        // 验证必填字段
        if (!title || !uploadedBy || !imageUrl) {
            return res.status(400).json({
                success: false, message: "Missing required fields: title, uploadedBy, imageUrl."
            });
        }

        // 验证 imageUrl 是否合法
        try {
            new URL(imageUrl); // 如果 URL 不合法会抛出错误
        } catch (err) {
            return res.status(400).json({
                success: false, message: "Invalid image URL."
            });
        }

        // 下载图片并获取其信息
        let imageInfo;
        let buffer;
        try {
            const response = await axios.get(imageUrl, {responseType: 'arraybuffer'});
            buffer = Buffer.from(response.data, 'binary');
            imageInfo = sizeOf(buffer); // 获取图片尺寸和格式
        } catch (err) {
            console.error("Error fetching image:", err);
            return res.status(400).json({
                success: false, message: "Failed to fetch image from URL."
            });
        }

        const {width, height, type: imageFormat} = imageInfo;

        // 根据图片内容生成描述
        let description;
        try {
            description = await generateImageDescription(imageUrl); // 调用工具函数生成描述
        } catch (err) {
            console.error("Error generating image description:", err);
            description = "An image with no description available."; // 如果生成失败，使用默认描述
        }

        // 连接数据库
        const dbClient = await connectDB();
        const collection = dbClient.db('lazyboy').collection('img');

        // 检查是否已存在相同 type 和 name 的图片
        const existingImage = await collection.findOne({
            type: type, filename: {$regex: new RegExp(`^${name}\\.`, 'i')} // 匹配文件名（忽略后缀）
        });

        if (existingImage) {
            return res.status(409).json({
                success: false, message: `An image with type '${type}' and name '${name}' already exists.`
            });
        }

        // 构造图片 URL
        const url = `https://unpkg.com/picx-images/${type}/${name}.${imageFormat.toLowerCase()}`;

        // 插入新图片
        const result = await collection.insertOne({
            title,
            type,
            description,
            filename: `${name}.${imageFormat.toLowerCase()}`,
            url,
            size: buffer.length, // 使用 buffer.length 获取图片大小
            width,
            height,
            format: imageFormat,
            uploadedBy,
            uploadedAt: new Date(),
            tags: tags || [],
            metadata: metadata || {}
        });

        if (result.insertedId) {
            res.status(201).json({
                success: true, data: result
            });
        } else {
            res.status(500).json({
                success: false, message: "Failed to add image."
            });
        }
    } catch (err) {
        console.error("Error in POST /img/add/:type/:name route:", err);
        res.status(500).json({
            success: false, message: 'Database error', error: err.message
        });
    }
});

module.exports = router;