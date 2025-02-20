const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/contributions/:username', async (req, res) => {
    const {username} = req.params;
    const token = process.env.GITHUB_TOKEN;

    try {
        // 获取用户的所有仓库
        const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos`, {
            headers: {
                Authorization: `token ${token}`,
            },
        });
        const repos = reposResponse.data;

        // 获取用户的提交
        let totalCommits = 0;
        for (const repo of repos) {
            const commitsResponse = await axios.get(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits`, {
                headers: {
                    Authorization: `token ${token}`,
                }, params: {
                    author: username,
                },
            });
            totalCommits += commitsResponse.data.length;
        }

        // 汇总贡献数据
        const contributions = {
            commits: totalCommits,
        };

        res.status(200).json(contributions);
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({error: 'Failed to fetch contributions'});
    }
});

module.exports = router;