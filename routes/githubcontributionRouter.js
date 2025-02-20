const express = require('express');
const router = express.Router();
const axios = require('axios');

const token = process.env.GITHUB_TOKEN;

router.get('/contributions/:username', (req, res) => {
    const username = req.params.username;
    const UserContribution = getGithubUserContribution(username);
    res.status(200).send(UserContribution)
});

async function getGithubUserContribution(username) {
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
    const variables = {login: username};

    const res = await fetch("https://api.github.com/graphql", {
        headers: {
            Authorization: `bearer ${token}`, "Content-Type": "application/json",
        }, method: "POST", body: JSON.stringify({variables, query}),
    });
    if (!res.ok) throw new Error(res.statusText);

    const {data, errors} = await res.json();
    if (errors?.[0]) throw new Error(errors[0].message);

    return data.user.contributionsCollection.contributionCalendar.weeks.flatMap(({contributionDays}, x) => contributionDays.map((d) => ({
        x,
        y: d.weekday,
        date: d.date,
        count: d.contributionCount,
        level: (d.contributionLevel === "FOURTH_QUARTILE" && 4) || (d.contributionLevel === "THIRD_QUARTILE" && 3) || (d.contributionLevel === "SECOND_QUARTILE" && 2) || (d.contributionLevel === "FIRST_QUARTILE" && 1) || 0,
    })),);
}

module.exports = router;