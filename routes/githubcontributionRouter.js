const express = require('express');
const router = express.Router();
const axios = require('axios');

// 调试：打印所有环境变量
console.log('Loaded environment variables:', process.env);

// 检查 GitHub Token 是否存在
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
    console.error('GitHub Token is missing in environment variables.');
    process.exit(1); // 如果缺少 Token，终止程序
}

/**
 * 获取 GitHub 用户贡献数据
 */
const getGithubUserContribution = async (userName, githubToken) => {
    const query = `
        query ($login: String!) {
            user(login: $login) {
                contributionsCollection {
                    contributionCalendar {
                        weeks {
                            contributionDays {
                                date
                                contributionCount
                            }
                        }
                    }
                }
            }
        }
    `;
    const variables = { login: userName };

    try {
        const response = await axios.post(
            'https://api.github.com/graphql',
            { query, variables },
            {
                headers: {
                    Authorization: `bearer ${githubToken}`, // 确保格式正确
                    'Content-Type': 'application/json',     // 确保 Content-Type 正确
                },
            }
        );

        if (response.data.errors) {
            console.error('GitHub API Error:', response.data.errors);
            throw new Error(response.data.errors[0].message || 'Unknown GraphQL error');
        }

        const { data } = response.data;
        return data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
            ({ contributionDays }, weekIndex) =>
                contributionDays.map((day) => ({
                    x: weekIndex,
                    y: new Date(day.date).getDay(), // 星期几 (0-6)
                    date: day.date,
                    count: day.contributionCount,
                }))
        );
    } catch (error) {
        console.error('Request Failed:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
        throw new Error('Failed to fetch contributions');
    }
};

router.get('/contributions/:username', async (req, res) => {
    const username = req.params.username;

    try {
        const contributions = await getGithubUserContribution(username, GITHUB_TOKEN);
        res.status(200).json(contributions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;