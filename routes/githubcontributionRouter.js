const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/contributions/:username', async (req, res) => {
    const { username } = req.params;
    const token = process.env.GITHUB_TOKEN;

    try {
        const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
            headers: {
                Authorization: token ? `token ${token}` : '', // 如果有 token 就加上，没有就不加
            },
        });
        const repos = response.data;
        res.status(200).json(repos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch contributions' });
    }
});

module.exports = router;