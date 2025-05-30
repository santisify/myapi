const OpenAI = require("openai");

// 初始化 OpenAI 客户端
const client = new OpenAI({
  apiKey: process.env.DOUBAO_APIKEY,
  baseURL: "https://ark.cn-beijing.volces.com/api/v3",
});

/**
 * 生成图片描述
 * @param {string} imgUrl - 图片的 URL
 * @returns {string} - 生成的图片描述文本
 */
async function generateImageDescription(imgUrl) {
  try {
    const response = await client.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imgUrl,
              },
            },
            {
              type: 'text',
              text: '生成该图片的详细描述'
            },
          ],
        },
      ],
      model: 'doubao-1.5-vision-lite',
    });

    // 直接返回描述文本
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('生成图片描述时出错:', error);

    // 根据错误类型返回不同的错误信息
    if (error instanceof OpenAI.APIError) {
      return `API 错误 (${error.status}): ${error.message}`;
    } else {
      return '生成描述时发生未知错误';
    }
  }
}

module.exports = {generateImageDescription};
