const express = require('express');
const router = express.Router();
const axios = require('axios');




router.get('/contributions/:username', async (req, res) => {
    const username = req.params.username;

    try {
        const token = process.env.GITHUB_TOKEN;
        const contributions = await getGithubUserContribution(username, token);
        res.status(200).json(contributions);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

/**
 * 获取 GitHub 用户的贡献日历数据
 *
 * @param {string} userName - GitHub 用户名
 * @param {string} githubToken - GitHub Token
 * @returns {Promise<Array>} - 贡献日历数据
 */
const getGithubUserContribution = async (userName, githubToken) => {
    // GraphQL 查询
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

    const variables = {
        login: userName,
    };

    try {
        const res = await axios.post(
            'https://api.github.com/graphql',
            {query, variables},
            {
                headers: {
                    Authorization: `bearer ${githubToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (res.data.errors) {
            new Error(res.data.errors[0].message);
        }

        const {data} = res.data;

        // 格式化数据
        return data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
            ({contributionDays}, x) =>
                contributionDays.map((d) => ({
                    x,
                    y: d.weekday,
                    date: d.date,
                    count: d.contributionCount,
                    level:
                        (d.contributionLevel === 'FOURTH_QUARTILE' && 4) ||
                        (d.contributionLevel === 'THIRD_QUARTILE' && 3) ||
                        (d.contributionLevel === 'SECOND_QUARTILE' && 2) ||
                        (d.contributionLevel === 'FIRST_QUARTILE' && 1) ||
                        0,
                }))
        );
    } catch (error) {
        console.error('Error details:', error.message || error.response?.data);
        throw new Error('Failed to fetch contributions');
    }
};

module.exports = router;