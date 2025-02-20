const express = require('express');
const router = express.Router();
const connectDB = require('../db/db');
const axios = require('axios')
const GITHUB_API_URL = 'https://api.github.com';

router.get('/contributions/:username', async (req, res) => {
    const {username} = req.params;
    const token = process.env.GITHUB_TOKEN;

    try {
        const repos = await axios.get("https://api.github.com/users/santisify/repos");
        res.status(200).json(repos);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Failed to fetch contributions'});
    }
});

module.exports = router;