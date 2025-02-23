const express = require('express');
const imgRoutes = require('./imgRouter');
const userRoutes = require('./userRouter');
const siteRoutes = require('./siteRouter');
const router = express.Router();

// 健康检查路由
router.get('/', (req, res) => {
    res.json({
        status: 'ok', time: new Date().toISOString(), notice: "/img 图片api \n" + "/site 网站api\n" + "/user 用户api\n" + ""
    });
});

router.use('/img', imgRoutes);
router.use('/user', userRoutes);
router.use('/site', siteRoutes);
module.exports = router;
module.exports = router;