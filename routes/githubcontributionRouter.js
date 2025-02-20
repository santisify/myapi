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

        // 获取用户的问题和拉取请求
        const issuesAndPRsResponse = await axios.get(`https://api.github.com/search/issues`, {
            headers: {
                Authorization: `token ${token}`,
            }, params: {
                q: `author:${username}`,
            },
        });
        const issuesAndPRs = issuesAndPRsResponse.data.items;

        // 获取用户的代码审查
        const reviewsResponse = await axios.get(`https://api.github.com/search/issues`, {
            headers: {
                Authorization: `token ${token}`,
            }, params: {
                q: `commenter:${username}`,
            },
        });
        const reviews = reviewsResponse.data.items;

        // 汇总贡献数据
        const contributions = {
            commits: totalCommits,
            issues: issuesAndPRs.filter(item => !item.pull_request).length,
            pullRequests: issuesAndPRs.filter(item => item.pull_request).length,
            reviews: reviews.length,
        };

        res.status(200).json(contributions);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Failed to fetch contributions'});
    }
});

module.exports = router;