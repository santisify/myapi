const express = require('express');
const router = express.Router();
const axios = require('axios');

const token = process.env.GITHUB_TOKEN;

router.get('/contributions/:username', (req, res) => {
    const username = req.params.username;
    const GithubUserContribution = getGithubUserContribution(username, token);

});

/**
 * 获取 GitHub 用户的贡献网格数据
 *
 * 使用 options.from=YYYY-MM-DD 和 options.to=YYYY-MM-DD 来获取特定时间范围的贡献网格数据，
 * 或者使用 year=2019 作为 from=2019-01-01 和 to=2019-12-31 的别名。
 *
 * 如果未指定时间范围，则返回从今天往前一年的数据（类似于 GitHub 个人主页上的显示）。
 *
 * @param {string} userName - GitHub 用户名
 * @param token - GitHub 个人访问令牌
 *
 * @example
 *  getGithubUserContribution("platane", { from: "2019-01-01", to: "2019-12-31" });
 *  getGithubUserContribution("platane", { year: 2019 });
 */
const getGithubUserContribution = async (userName, token) => {
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

    const res = await fetch("https://api.github.com/graphql", {
        headers: {
            Authorization: `bearer ${token}`, "Content-Type": "application/json",
        }, method: "POST", body: JSON.stringify({variables, query}),
    });

    if (!res.ok) throw new Error(res.statusText);

    const {data, errors} = await res.json();
    if (errors?.[0]) throw new Error(errors[0].message);
    console.log(data.user);
    return data.user.contributionsCollection.contributionCalendar.weeks.flatMap(({contributionDays}, x) => contributionDays.map((d) => ({
        x,
        y: d.weekday,
        date: d.date,
        count: d.contributionCount,
        level: (d.contributionLevel === "FOURTH_QUARTILE" && 4) || (d.contributionLevel === "THIRD_QUARTILE" && 3) || (d.contributionLevel === "SECOND_QUARTILE" && 2) || (d.contributionLevel === "FIRST_QUARTILE" && 1) || 0,
    })),);
};

module.exports = router;