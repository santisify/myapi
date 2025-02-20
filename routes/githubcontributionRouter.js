const express = require('express');
const router = express.Router();
const axios = require('axios');

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const token = process.env.GITHUB_TOKEN;

// GraphQL 查询
const GET_USER_COMMITS_QUERY = `
  query ($username: String!, $cursor: String) {
    user(login: $username) {
      repositories(first: 100, after: $cursor, ownerAffiliations: OWNER) {
        nodes {
          name
          owner {
            login
          }
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 100, author: { id: $userId }) {
                  nodes {
                    oid
                    message
                    committedDate
                    author {
                      name
                      email
                    }
                    url
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

router.get('/contributions/:username', async (req, res) => {
    const {username} = req.params;

    try {
        // 获取用户的 ID
        const userId = await getUserId(username);

        // 获取所有提交记录
        let allCommits = [];
        let cursor = null;
        let hasMore = true;

        while (hasMore) {
            const response = await axios.post(GITHUB_GRAPHQL_URL, {
                query: GET_USER_COMMITS_QUERY, variables: {
                    username, cursor, userId,
                },
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const repositories = response.data.data.user.repositories;
            for (const repo of repositories.nodes) {
                if (repo.defaultBranchRef) {
                    const commits = repo.defaultBranchRef.target.history.nodes;
                    allCommits = allCommits.concat(commits);
                }
            }

            // 检查是否有更多数据
            hasMore = repositories.pageInfo.hasNextPage;
            cursor = repositories.pageInfo.endCursor;
        }

        res.status(200).json(allCommits);
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.status(500).json({error: 'Failed to fetch contributions'});
    }
});

// 获取用户的 ID
async function getUserId(username) {
    const response = await axios.post(GITHUB_GRAPHQL_URL, {
        query: `
                query ($username: String!) {
                    user(login: $username) {
                        id
                    }
                }
            `, variables: {
            username,
        },
    }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.data.user.id;
}

module.exports = router;