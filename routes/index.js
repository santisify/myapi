const express = require('express');
const imgRoutes = require('./imgRouter');
const userRoutes = require('./userRouter');
const siteRoutes = require('./siteRouter');

const router = express.Router();

// 健康检查路由
router.get('/', (req, res) => {
    res.json({
        status: 'ok', time: new Date().toISOString(), notice: "只支持访问后缀为.webp的图片，未来也不会添加其他后缀访问的图片"
    });
});

// 图片相关路由
router.use('/img', imgRoutes);
// 用户相关路由
router.use('/user', userRoutes);
router.use('/site', siteRoutes);
module.exports = router;