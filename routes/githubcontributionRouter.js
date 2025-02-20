const express = require('express');
const router = express.Router();
const axios = require('axios');

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const token = process.env.GITHUB_TOKEN;

// GraphQL 查询
const GET_CONTRIBUTIONS_QUERY = `
  query ($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              contributionCount
              date
              weekday
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

router.get('/contributions/:username', async (req, res) => {
    const {username} = req.params;

    try {
        // 发送 GraphQL 请求
        const response = await axios.post(GITHUB_GRAPHQL_URL, {
            query: GET_CONTRIBUTIONS_QUERY, variables: {username},
        }, {
            headers: {
                Authorization: `Bearer ${token}`, 'Content-Type': 'application/json',
            },
        });
        // 检查 GraphQL 错误
        if (response.data.errors) {
            throw new Error(response.data.errors[0].message);
        }
        // 提取贡献日历数据
        const weeks = response.data.data.user.contributionsCollection.contributionCalendar.weeks;
        // 格式化数据
        const formattedData = weeks.flatMap(({contributionDays}, x) => contributionDays.map((d) => ({
            x,
            y: d.weekday,
            date: d.date,
            count: d.contributionCount,
            level: (d.contributionLevel === 'FOURTH_QUARTILE' && 4) || (d.contributionLevel === 'THIRD_QUARTILE' && 3) || (d.contributionLevel === 'SECOND_QUARTILE' && 2) || (d.contributionLevel === 'FIRST_QUARTILE' && 1) || 0,
        })));

        // 返回结果
        res.status(200).json(formattedData);
    } catch (error) {
        console.error('Error details:', error.message || error.response?.data);
        res.status(500).json({error: 'Failed to fetch contributions'});
    }
});

module.exports = router;