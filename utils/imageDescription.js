const OpenAI = require("openai");
const sharp = require('sharp');
const axios = require('axios');

// 初始化 OpenAI 客户端
const client = new OpenAI({
  apiKey: process.env.DOUBAO_APIKEY, baseURL: "https://ark.cn-beijing.volces.com/api/v3",
});

/**
 * 生成图片描述
 * @param {string} imgUrl - 图片的 URL
 * @returns {string} - 生成的图片描述
 */

async function generateImageDescription(imgUrl) {
  const response = await openai.chat.completions.create({
    apiKey: process.env['ARK_API_KEY'], messages: [{
      role: 'user', content: [{
        type: 'image_url', image_url: {
          url: imgUrl,
        },
      }, {type: 'text', text: '生成该图片描述'},],
    },], model: 'doubao-1.5-vision-lite',
  });

  console.log(response.choices[0]);
}

module.exports = {generateImageDescription};
