const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config(); // 确保已安装 dotenv

const token = process.env.GITHUB_TOKEN;

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

    const variables = { login: userName };

    try {
        const res = await axios.post(
            'https://api.github.com/graphql',
            { query, variables },
            {
                headers: {
                    Authorization: `bearer ${githubToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (res.data.errors) {
            console.error('GitHub API Error:', res.data.errors);
            throw new Error(res.data.errors[0].message);
        }

        const { data } = res.data;
        return data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
            ({ contributionDays }, x) => contributionDays.map((d) => ({
                x,
                y: d.weekday,
                date: d.date,
                count: d.contributionCount,
                level: (d.contributionLevel === 'FOURTH_QUARTILE' ? 4 :
                    d.contributionLevel === 'THIRD_QUARTILE' ? 3 :
                        d.contributionLevel === 'SECOND_QUARTILE' ? 2 :
                            d.contributionLevel === 'FIRST_QUARTILE' ? 1 : 0),
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
        const contributions = await getGithubUserContribution(username, token);
        res.status(200).json(contributions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;