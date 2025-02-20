const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config(); // 加载环境变量

// 检查 GitHub Token 是否存在
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
    console.error('GitHub Token is missing in environment variables.');
    process.exit(1); // 如果缺少 Token，终止程序
}

/**
 * 获取 GitHub 用户贡献数据
 * @param {string} userName - GitHub 用户名
 * @param {string} githubToken - GitHub Personal Access Token
 * @returns {Promise<Array>} - 返回用户贡献数据数组
 */
const getGithubUserContribution = async (userName, githubToken) => {
    const query = `
        query ($login: String!) {
            user(login: $login) {
                contributionsCollection {
                    contributionCalendar {
                        weeks {
                            contributionDays {
                                contributionCount
                                contributionLevel
                                weekday
                                date
                            }
                        }
                    }
                }
            }
        }
    `;
    const variables = {login: userName};

    try {
        const response = await axios.post('https://api.github.com/graphql', {query, variables}, {
            headers: {
                Authorization: `bearer ${githubToken}`, 'Content-Type': 'application/json',
            },
        });

        // 检查 GraphQL 错误
        if (response.data.errors) {
            console.error('GitHub API Error:', response.data.errors);
            throw new Error(response.data.errors[0].message || 'Unknown GraphQL error');
        }

        // 解析贡献数据
        const {data} = response.data;
        return data.user.contributionsCollection.contributionCalendar.weeks.flatMap(({contributionDays}, weekIndex) => contributionDays.map((day) => ({
            x: weekIndex, // 周索引
            y: day.weekday, // 星期几
            date: day.date, // 日期
            count: day.contributionCount, // 贡献次数
            level: mapContributionLevel(day.contributionLevel), // 贡献等级
        })));
    } catch (error) {
        console.error('Request Failed:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
        throw new Error('Failed to fetch contributions');
    }
};

/**
 * 将贡献等级映射为数字
 * @param {string} level - 贡献等级字符串
 * @returns {number} - 对应的贡献等级数字
 */
const mapContributionLevel = (level) => {
    switch (level) {
        case 'FOURTH_QUARTILE':
            return 4;
        case 'THIRD_QUARTILE':
            return 3;
        case 'SECOND_QUARTILE':
            return 2;
        case 'FIRST_QUARTILE':
            return 1;
        default:
            return 0; // NONE 或其他情况
    }
};

/**
 * 获取指定用户的贡献数据
 */
router.get('/contributions/:username', async (req, res) => {
    const username = req.params.username;

    try {
        const contributions = await getGithubUserContribution(username, GITHUB_TOKEN);
        res.status(200).json(contributions);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

module.exports = router;