const express = require('express');
const router = express.Router();
const axios = require('axios')

router.get('/contributions/:username', async (req, res) => {
    const {username} = req.params;
    const token = process.env.GITHUB_TOKEN;

    try {
        const repos = await axios.get('https://api.lazy-boy-acmer.cn/img/all');
        res.status(200).json(repos);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Failed to fetch contributions'});
    }
});

module.exports = router;